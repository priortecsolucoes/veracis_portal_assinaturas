import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import next from 'next';
import { Server } from 'socket.io';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';

const __dirname = dirname(fileURLToPath(import.meta.url));
const signaturesDir = join(__dirname, 'signatures');

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// sign:request pending timeouts: `${userId}:${consultaId}` -> TimeoutId
const signTimeouts = new Map();

// Per-socket last-heartbeat tracking
const heartbeats = new Map(); // socketId -> { userId, lastBeat }

app.prepare().then(async () => {
  await mkdir(signaturesDir, { recursive: true });

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // Auth middleware: require userId in handshake
  io.use((socket, next) => {
    const userId = socket.handshake.auth?.userId;
    if (!userId || typeof userId !== 'string') {
      return next(new Error('Unauthorized'));
    }
    socket.userId = userId;
    next();
  });

  function getActiveCount(userId) {
    const room = `user:${userId}`;
    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (!roomSockets) return 0;
    const now = Date.now();
    let count = 0;
    for (const sid of roomSockets) {
      const hb = heartbeats.get(sid);
      if (hb && now - hb.lastBeat < 9000) count++;
    }
    return count;
  }

  function broadcastPresence(userId) {
    const room = `user:${userId}`;
    const count = getActiveCount(userId);
    io.to(room).emit('presence', { devices: count });
  }

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const room = `user:${userId}`;
    socket.join(room);

    heartbeats.set(socket.id, { userId, lastBeat: Date.now() });
    broadcastPresence(userId);

    socket.on('heartbeat', () => {
      const hb = heartbeats.get(socket.id);
      if (hb) hb.lastBeat = Date.now();
      broadcastPresence(userId);
    });

    socket.on('sign:request', ({ consultaId }) => {
      if (!consultaId) return;

      // Relay to other devices in the same user room (not back to emitter)
      socket.to(room).emit('sign:request', { consultaId });

      // Auto-cancel after 5 minutes if not resolved
      const key = `${userId}:${consultaId}`;
      if (signTimeouts.has(key)) clearTimeout(signTimeouts.get(key));
      const t = setTimeout(() => {
        io.to(room).emit('sign:cancel', { consultaId, reason: 'timeout' });
        signTimeouts.delete(key);
        console.log(`[sign] timeout auto-cancel for ${key}`);
      }, 5 * 60 * 1000);
      signTimeouts.set(key, t);
    });

    socket.on('sign:done', async ({ consultaId, assinaturaPngBase64, hora }) => {
      if (!consultaId || !assinaturaPngBase64) return;

      // Persist signature to disk before relaying
      try {
        const b64 = assinaturaPngBase64.replace(/^data:image\/png;base64,/, '');
        const buf = Buffer.from(b64, 'base64');
        const filename = `${userId}_${consultaId}_${Date.now()}.png`;
        await writeFile(join(signaturesDir, filename), buf);
        console.log(`[sign] saved ${filename}`);
      } catch (err) {
        console.error('[sign] failed to save signature:', err);
      }

      // Clear pending timeout
      const key = `${userId}:${consultaId}`;
      if (signTimeouts.has(key)) {
        clearTimeout(signTimeouts.get(key));
        signTimeouts.delete(key);
      }

      // Relay to other devices
      socket.to(room).emit('sign:done', { consultaId, assinaturaPngBase64, hora });
    });

    socket.on('sign:cancel', ({ consultaId }) => {
      const key = `${userId}:${consultaId}`;
      if (signTimeouts.has(key)) {
        clearTimeout(signTimeouts.get(key));
        signTimeouts.delete(key);
      }
      socket.to(room).emit('sign:cancel', { consultaId });
    });

    socket.on('disconnect', () => {
      heartbeats.delete(socket.id);
      // Small delay so reconnects don't flicker presence
      setTimeout(() => broadcastPresence(userId), 200);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`);
  });
});
