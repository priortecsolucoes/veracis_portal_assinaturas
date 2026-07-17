'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import LoginPage from './LoginPage';
import AppShell from './AppShell';
import TabletMode from './TabletMode';
import Toast from './Toast';

export default function PortalApp() {
  const {
    isLoggedIn, userId, tabletMode,
    consultas, remoteSignConsultaId,
    setDevicesOnline, saveAssinatura, patchConsulta,
    selectConsulta, setTabletMode,
    startRemoteSigning, clearRemoteSigning,
    showToast,
  } = useStore();

  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Connect/disconnect socket on login state change
  useEffect(() => {
    if (!isLoggedIn || !userId) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(userId);

    socket.on('presence', ({ devices }: { devices: number }) => {
      useStore.getState().setDevicesOnline(devices);
    });

    socket.on('sign:request', ({ consultaId }: { consultaId: number }) => {
      // Another device is asking this device to show the signing screen
      useStore.getState().selectConsulta(consultaId);
      useStore.getState().setTabletMode('signing');
    });

    socket.on('sign:done', ({ consultaId, assinaturaPngBase64 }: { consultaId: number; assinaturaPngBase64: string; hora: string }) => {
      const state = useStore.getState();
      state.saveAssinatura(consultaId, assinaturaPngBase64);
      state.patchConsulta(consultaId, { status: 'assinado' });

      if (state.tabletMode === 'remote' && state.remoteSignConsultaId === consultaId) {
        const paciente = state.consultas.find((c) => c.id === consultaId)?.paciente || '';
        state.showToast(`Assinatura de ${paciente} recebida do tablet ✓`);
        state.clearRemoteSigning();
      }
    });

    socket.on('sign:cancel', ({ consultaId }: { consultaId?: number }) => {
      const state = useStore.getState();
      if (state.tabletMode === 'remote' && (!consultaId || state.remoteSignConsultaId === consultaId)) {
        state.showToast('Coleta de assinatura cancelada');
        state.clearRemoteSigning();
      } else if (state.tabletMode === 'signing') {
        state.setTabletMode('off');
        state.showToast('Coleta de assinatura cancelada');
      }
    });

    // Emit first heartbeat immediately on connect
    socket.on('connect', () => {
      socket.emit('heartbeat');
    });

    return () => {
      socket.off('presence');
      socket.off('sign:request');
      socket.off('sign:done');
      socket.off('sign:cancel');
      socket.off('connect');
      disconnectSocket();
    };
  }, [isLoggedIn, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Heartbeat: emit every 3s while tab is visible
  useEffect(() => {
    if (!isLoggedIn) return;

    function sendBeat() {
      if (document.visibilityState === 'visible') {
        getSocket()?.emit('heartbeat');
      }
    }

    heartbeatRef.current = setInterval(sendBeat, 3000);
    document.addEventListener('visibilitychange', sendBeat);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      document.removeEventListener('visibilitychange', sendBeat);
    };
  }, [isLoggedIn]);

  function handleCancelRemote() {
    const consultaId = useStore.getState().remoteSignConsultaId;
    if (consultaId !== null) {
      getSocket()?.emit('sign:cancel', { consultaId });
    }
    useStore.getState().showToast('Coleta de assinatura cancelada');
    useStore.getState().clearRemoteSigning();
  }

  // Patient name for the remote overlay
  const remoteConsulta = remoteSignConsultaId !== null
    ? consultas.find((c) => c.id === remoteSignConsultaId)
    : null;

  const showTabletMode = isLoggedIn && (tabletMode === 'signing' || tabletMode === 'done');
  const showAppShell = isLoggedIn && (tabletMode === 'off' || tabletMode === 'remote');
  const showRemoteOverlay = isLoggedIn && tabletMode === 'remote';

  return (
    <>
      {!isLoggedIn && <LoginPage />}
      {showTabletMode && <TabletMode />}
      {showAppShell && <AppShell />}

      {/* Remote-signing overlay: desktop waits while patient signs on tablet */}
      {showRemoteOverlay && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(10,74,64,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              background: '#FFFFFF', borderRadius: 18, padding: '44px 36px',
              maxWidth: 440, width: '100%', textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 18, animation: 'pulseDot 1.6s ease infinite' }}>✍️</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#22302C' }}>
              Aguardando assinatura no tablet…
            </div>
            {remoteConsulta && (
              <div style={{ marginTop: 12, fontSize: 15, color: '#6B7A75', lineHeight: 1.5 }}>
                O tablet deve mostrar a tela de assinatura para{' '}
                <strong style={{ color: '#22302C' }}>{remoteConsulta.paciente}</strong>.
                <br />Aguarde enquanto o paciente assina.
              </div>
            )}
            <button
              onClick={handleCancelRemote}
              style={{
                marginTop: 28, padding: '13px 22px',
                border: '1px solid #D8D6CF', borderRadius: 10,
                background: '#FFFFFF', color: '#22302C',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
            >
              Cancelar e retomar o tablet
            </button>
          </div>
        </div>
      )}

      <Toast />

      {/* Keyframe for pulsing icon in overlay */}
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </>
  );
}
