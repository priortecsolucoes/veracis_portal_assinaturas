'use client';

import { useRef, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { getSocket } from '@/lib/socket';

export default function TabletMode() {
  const {
    tabletMode, setTabletMode,
    appointments, selectedId,
    patchAppointment, saveSignature,
    showToast,
  } = useStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(false);

  const appointment = appointments.find(x => x.id === selectedId);
  const firstName = appointment ? appointment.patient.split(' ')[0] : '';

  const setupCanvas = useCallback((el: HTMLCanvasElement | null) => {
    if (!el) return;
    const dpr = window.devicePixelRatio || 1;
    const w = el.clientWidth || 760;
    const h = el.clientHeight || 280;
    el.width = w * dpr;
    el.height = h * dpr;
    const ctx = el.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1B2B52';
    ctx.lineWidth = 2.5;
    ctxRef.current = ctx;
  }, []);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left), y: (e.clientY - r.top) };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!ctxRef.current) return;
    e.preventDefault();
    canvasRef.current!.setPointerCapture(e.pointerId);
    setDrawing(true);
    const p = getPos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(p.x, p.y);
    ctxRef.current.lineTo(p.x + 0.1, p.y + 0.1);
    ctxRef.current.stroke();
    if (!hasInk) setHasInk(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing || !ctxRef.current) return;
    const p = getPos(e);
    ctxRef.current.lineTo(p.x, p.y);
    ctxRef.current.stroke();
  }

  function onPointerUp() { setDrawing(false); }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  }

  function confirmSignature() {
    if (!hasInk || !canvasRef.current || !appointment) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    saveSignature(appointment.id, dataUrl);
    patchAppointment(appointment.id, { status: 'signed' });
    getSocket()?.emit('sign:done', {
      consultaId: appointment.id,
      assinaturaPngBase64: dataUrl,
      hora: new Date().toISOString(),
    });
    setTabletMode('done');
  }

  function finishTablet() {
    setTabletMode('off');
    showToast('Assinatura de ' + (appointment?.patient || '') + ' registrada com sucesso');
  }

  function cancelTablet() {
    if (appointment) {
      getSocket()?.emit('sign:cancel', { consultaId: appointment.id });
    }
    setTabletMode('off');
  }

  return (
    <div
      className="fade-in"
      style={{ position:'fixed', inset:0, background:'#F6F5F2', zIndex:50, display:'flex', flexDirection:'column' }}
    >
      {/* Header bar */}
      <div style={{ background:'#0A4A40', color:'#DFF1EA', padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'#0E6B5B', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:15 }}>V</div>
          <div style={{ fontWeight:800, letterSpacing:'0.03em' }}>VERACIS <span style={{ fontWeight:500, opacity:0.7 }}>Clínica Integrada</span></div>
        </div>
        <button
          onClick={cancelTablet}
          style={{ border:'1px solid rgba(255,255,255,0.25)', background:'none', color:'#A8CFC3', fontFamily:'inherit', fontSize:12, fontWeight:700, padding:'8px 14px', borderRadius:8, cursor:'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          Cancelar (recepção)
        </button>
      </div>

      {/* Signing screen */}
      {tabletMode === 'signing' && (
        <div style={{ flex:1, overflow:'auto', display:'flex', justifyContent:'center', padding:'32px 24px' }}>
          <div style={{ width:'100%', maxWidth:820, display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <div style={{ fontSize:28, fontWeight:800 }}>Olá, {firstName} 👋</div>
              <div style={{ fontSize:16, color:'#6B7A75', marginTop:6, lineHeight:1.5 }}>
                Confira os dados do seu atendimento e assine no quadro abaixo para autorizar a guia do convênio.
              </div>
            </div>

            {/* Patient data */}
            {appointment && (
              <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:16, padding:'22px 26px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }}>
                {[
                  ['PACIENTE', appointment.patient],
                  ['ATENDIMENTO', `${appointment.serviceType} · ${appointment.specialty}`],
                  ['PROFISSIONAL', appointment.doctor],
                  ['CONVÊNIO', `Unimed · ${appointment.insuranceCard}`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize:12, fontWeight:800, color:'#9AA6A1' }}>{label}</div>
                    <div style={{ fontSize:15, fontWeight:700, marginTop:4 }}>{value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Canvas */}
            <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:16, padding:'22px 26px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontSize:14, fontWeight:800 }}>Assine aqui com o dedo ou caneta</div>
                <button
                  onClick={clearCanvas}
                  style={{ border:'1px solid #D8D6CF', background:'#FFFFFF', color:'#6B7A75', fontFamily:'inherit', fontSize:13, fontWeight:700, padding:'8px 14px', borderRadius:8, cursor:'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                >
                  Limpar ✕
                </button>
              </div>

              <div style={{ position:'relative', border:'2px dashed #C9D6D0', borderRadius:12, background:'#FBFBF9', overflow:'hidden' }}>
                <canvas
                  ref={(el) => { if (el) { setupCanvas(el); (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el; } }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                  style={{ display:'block', width:'100%', height:280, touchAction:'none', cursor:'crosshair' }}
                />
                <div style={{ position:'absolute', left:40, right:40, bottom:56, borderBottom:'1.5px solid #C9D6D0', pointerEvents:'none' }} />
                <div style={{ position:'absolute', left:40, bottom:30, fontSize:13, color:'#9AA6A1', pointerEvents:'none' }}>✕  Assinatura do beneficiário</div>
              </div>

              <div style={{ fontSize:12, color:'#9AA6A1', marginTop:10, lineHeight:1.5 }}>
                Ao assinar, você autoriza a guia do convênio referente ao atendimento acima. A assinatura será anexada digitalmente à guia Unimed.
              </div>
            </div>

            <button
              onClick={confirmSignature}
              disabled={!hasInk}
              style={{ padding:18, border:'none', borderRadius:12, background: hasInk ? '#0E6B5B' : '#C5D6D2', color:'#FFFFFF', fontFamily:'inherit', fontSize:17, fontWeight:800, cursor: hasInk ? 'pointer' : 'not-allowed' }}
              onMouseEnter={(e) => { if (hasInk) e.currentTarget.style.background = '#0A4A40'; }}
              onMouseLeave={(e) => { if (hasInk) e.currentTarget.style.background = '#0E6B5B'; }}
            >
              Confirmar assinatura ✓
            </button>
          </div>
        </div>
      )}

      {/* Done screen */}
      {tabletMode === 'done' && (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ textAlign:'center', maxWidth:460 }}>
            <div style={{ width:84, height:84, borderRadius:'50%', background:'#E3F2E8', color:'#1D6B3C', fontSize:38, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 22px' }}>✓</div>
            <div style={{ fontSize:28, fontWeight:800 }}>Assinatura registrada!</div>
            <div style={{ fontSize:16, color:'#6B7A75', marginTop:10, lineHeight:1.5 }}>
              Obrigado, {firstName}. Por favor, devolva o tablet à recepção.
            </div>
            <button
              onClick={finishTablet}
              style={{ marginTop:28, padding:'13px 22px', border:'1px solid #D8D6CF', borderRadius:10, background:'#FFFFFF', color:'#22302C', fontFamily:'inherit', fontSize:14, fontWeight:800, cursor:'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
            >
              Concluir (recepção) →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
