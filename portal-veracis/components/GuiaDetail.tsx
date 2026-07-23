'use client';

import { useStore } from '@/lib/store';
import { ST } from '@/lib/types';
import { getSocket } from '@/lib/socket';
import StatusPill from './StatusPill';

export default function GuiaDetail() {
  const {
    appointments, selectedId, selectedRep,
    setTab, selectAppointment, selectRep,
    patchAppointment, saveSignature, signatures,
    setTabletMode, startRemoteSigning,
    devicesOnline,
    newPackageCount, setNewPackageCount,
    showToast, role,
  } = useStore();

  const peerOnline = devicesOnline >= 2;

  const cRaw = selectedId ? appointments.find(x => x.id === selectedId) : selectedRep;
  if (!cRaw) return null;
  const c = cRaw;

  const isToday = !!selectedId;
  const signature = signatures[c.id];
  const referral = c.referral;
  const referralExhausted = !!(referral && referral.total > 1 && referral.used >= referral.total);
  const authAvailable = ['authorized', 'signed', 'paper'].includes(c.status);

  const firstName = c.patient.split(' ')[0];

  function goBack() {
    if (isToday) { selectAppointment(null); setTab('dashboard'); }
    else { selectRep(null); setTab('reports'); }
  }

  function handleDownload() {
    if (!c.authorizationNumber) { showToast('Sem nº do pedido — aguarde a pré-autorização (Beth)'); return; }
    if (referralExhausted) { showToast('Pacote de sessões esgotado — anexe um novo encaminhamento'); return; }
    patchAppointment(c.id, { status:'authorized' });
    showToast('Guia do pedido ' + c.authorizationNumber + ' baixada do TopSaúde — disponível para assinatura');
  }

  function handleMarkPaper() {
    patchAppointment(c.id, { status:'paper' });
    showToast('Assinatura em papel registrada para ' + c.patient);
  }

  function handleMarkAtendido() {
    patchAppointment(c.id, { status:'atendido' });
    showToast('Consulta de ' + c.patient + ' marcada como atendida');
  }

  function handleCancel() {
    patchAppointment(c.id, { status:'cancelled' });
    showToast('Guia de ' + c.patient + ' cancelada');
    goBack();
  }

  function handleAttachNewReferral() {
    if (!referral) return;
    patchAppointment(c.id, { referral:{ ...referral, used:0, total:newPackageCount } });
    showToast('Novo pacote de ' + newPackageCount + ' sessões criado para ' + c.patient);
  }

  const canDownload = c.status === 'facial' && !!c.authorizationNumber && !referralExhausted && isToday;
  const awaitingAuthorization = c.status === 'facial' && !c.authorizationNumber && isToday;
  const canSign = c.status === 'authorized' && isToday;
  const hasSignature = !!(signature) || c.status === 'paper';
  const canMarkAtendido = (c.status === 'signed' || c.status === 'paper') && isToday;
  const canCancel = !['cancelled', 'atendido'].includes(c.status) && isToday;

  const referralPct = referral && referral.total > 0
    ? Math.round((referral.used / referral.total) * 100) + '%'
    : '0%';
  const referralColor = referralExhausted ? '#A33B2E' : (referral && referral.used / referral.total > 0.8 ? '#C9A24B' : '#0E6B5B');

  return (
    <div style={{ padding:'28px 36px', display:'flex', flexDirection:'column', gap:20, minHeight:'100vh' }}>
      {/* Back + title */}
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <button
          onClick={goBack}
          style={{ width:38, height:38, border:'1px solid #D8D6CF', borderRadius:10, background:'#FFFFFF', cursor:'pointer', fontSize:16, color:'#6B7A75' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
        >
          ←
        </button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:800 }}>Guia de {c.serviceType} — {c.patient}</div>
          <div style={{ color:'#6B7A75', fontSize:13, marginTop:2 }}>{c.doctor} · {c.specialty} · {c.time}</div>
        </div>
        {c.status === 'atendido' && (
          <span style={{ padding:'6px 14px', borderRadius:999, background:'#E3F2E8', color:'#1D6B3C', fontSize:13, fontWeight:800 }}>✓ Atendido</span>
        )}
        <StatusPill status={c.status} />
      </div>

      {/* Two-column layout */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 350px', gap:20, flex:1, minHeight:0 }}>
        {/* Left: document panel */}
        <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, overflow:'hidden', display:'flex', flexDirection:'column', minHeight:400 }}>
          <div style={{ padding:'12px 18px', borderBottom:'1px solid #EEEDE8', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:13, fontWeight:800, color:'#6B7A75' }}>DOCUMENTO</div>
            <div style={{ fontSize:12, color:'#9AA6A1' }}>Unimed / TopSaúde</div>
          </div>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'repeating-linear-gradient(45deg,#F3F2ED,#F3F2ED 14px,#EEEDE8 14px,#EEEDE8 28px)', padding:30 }}>
            <div style={{ textAlign:'center', maxWidth:380, background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, padding:28 }}>
              <div style={{ fontSize:30 }}>⤓</div>
              <div style={{ fontSize:16, fontWeight:800, marginTop:8 }}>
                {authAvailable ? 'Guia disponível' : 'Guia ainda não disponível'}
              </div>
              <div style={{ fontSize:13.5, color:'#6B7A75', marginTop:8, lineHeight:1.55 }}>
                {authAvailable
                  ? 'Em produção, a guia do TopSaúde será exibida aqui como imagem ou PDF após o download.'
                  : c.status === 'facial'
                    ? c.authorizationNumber
                      ? 'Guia ficará disponível após o reconhecimento facial do paciente no sistema do TopSaúde.'
                      : 'Aguardando nº do pedido de pré-autorização para baixar a guia.'
                    : 'Guia cancelada ou não disponível.'}
              </div>
              {signature && (
                <div style={{ marginTop:16, padding:'10px 14px', background:'#E3F2E8', borderRadius:10, fontSize:13, color:'#1D6B3C', fontWeight:700 }}>
                  ✓ Assinatura coletada e anexada
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: action panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:14, overflowY:'auto' }}>
          {/* Appointment data */}
          <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, padding:'18px 20px' }}>
            <div style={{ fontSize:13, fontWeight:800, color:'#6B7A75', marginBottom:12 }}>DADOS DO ATENDIMENTO</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, fontSize:14 }}>
              {[
                ['Paciente',    c.patient],
                ['Carteirinha', c.insuranceCard],
                [c.authType === 'token' ? 'Nº Token' : 'Nº do pedido', c.authorizationNumber || '—'],
                ['Tipo de guia', c.serviceType],
              ].map(([label, value]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', gap:10 }}>
                  <span style={{ color:'#9AA6A1' }}>{label}</span>
                  <span style={{ fontWeight:700, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Referral */}
          {referral && (
            <div style={{ background:'#FFFFFF', border:`1px solid ${referralExhausted ? '#E8D5D1' : '#E5E3DD'}`, borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#6B7A75', marginBottom:10 }}>ENCAMINHAMENTO (PEDIDO MÉDICO)</div>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'#FAFAF7', border:'1px dashed #D8D6CF', borderRadius:10, padding:'10px 12px' }}>
                <span style={{ fontSize:16 }}>📎</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{referral.fileName}</div>
                  <div style={{ fontSize:11.5, color:'#9AA6A1' }}>anexado uma vez · vale para todo o pacote</div>
                </div>
              </div>

              {referral.total > 1 && (
                <div style={{ marginTop:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:700, marginBottom:6 }}>
                    <span style={{ color:'#6B7A75' }}>Pacote de sessões</span>
                    <span style={{ color:referralColor }}>{referral.used} de {referral.total} usadas</span>
                  </div>
                  <div style={{ height:8, borderRadius:999, background:'#EEEDE8', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:referralPct, background:referralColor, borderRadius:999 }} />
                  </div>
                </div>
              )}

              {referralExhausted && isToday && (
                <>
                  <div style={{ marginTop:12, background:'#F7E4E1', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#A33B2E', fontWeight:700, lineHeight:1.45 }}>
                    Pacote esgotado — é necessário anexar um novo encaminhamento para autorizar novas sessões.
                  </div>
                  <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:10 }}>
                    <label style={{ fontSize:13, fontWeight:700, color:'#6B7A75' }}>Sessões do novo pacote</label>
                    <input
                      type="number" min={1}
                      value={newPackageCount}
                      onChange={(e) => setNewPackageCount(Number(e.target.value))}
                      style={{ width:72, padding:'9px 10px', border:'1px solid #D8D6CF', borderRadius:9, fontSize:13, fontFamily:'inherit', fontWeight:700, textAlign:'center' }}
                    />
                  </div>
                  <button
                    onClick={handleAttachNewReferral}
                    style={{ marginTop:10, width:'100%', padding:11, border:'1.5px dashed #A33B2E', borderRadius:10, background:'none', color:'#A33B2E', fontFamily:'inherit', fontSize:13, fontWeight:800, cursor:'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F7E4E1')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    📎 Anexar novo encaminhamento
                  </button>
                </>
              )}
            </div>
          )}

          {/* Download authorization */}
          {canDownload && (
            <div style={{ background:'#0A4A40', borderRadius:14, padding:'18px 20px', color:'#DFF1EA' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ fontSize:15, fontWeight:800, color:'#FFFFFF' }}>Baixar guia do TopSaúde</div>
                <span style={{
                  fontSize:11, fontWeight:800, padding:'3px 9px', borderRadius:5,
                  background: c.authType === 'token' ? '#FBF0DC' : '#DDEEF9',
                  color: c.authType === 'token' ? '#8A5A12' : '#1E6EA7',
                }}>
                  {c.authType === 'token' ? 'TOKEN' : 'PEDIDO'}
                </span>
              </div>
              <div style={{ fontSize:13, lineHeight:1.5, marginTop:8, opacity:0.85 }}>
                {c.authType === 'token'
                  ? <>Confirme o facial e acesse <strong>Autorização → Pesquisar Token</strong> no TopSaúde.</>
                  : <>Confirme o facial e acesse <strong>Autorização → Pesquisar Pedido</strong> no TopSaúde.</>
                }
              </div>
              <button
                onClick={handleDownload}
                style={{ marginTop:14, width:'100%', padding:13, border:'none', borderRadius:10, background:'#1E6EA7', color:'#FFFFFF', fontFamily:'inherit', fontSize:14, fontWeight:800, cursor:'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#175A8A')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#1E6EA7')}
              >
                {c.authType === 'token' ? 'Baixar via Token' : 'Baixar via Pedido'} — {c.authorizationNumber} ↓
              </button>
            </div>
          )}

          {/* Awaiting authorization number */}
          {awaitingAuthorization && (
            <div style={{ background:'#FBF0DC', borderRadius:14, padding:'16px 18px', fontSize:13, color:'#8A5A12', fontWeight:700, lineHeight:1.5 }}>
              Aguardando nº do pedido da pré-autorização (time de autorização — Beth). Sem esse número não é possível baixar a guia.
            </div>
          )}

          {/* Collect signature */}
          {canSign && !hasSignature && (
            <div style={{ background:'#0A4A40', borderRadius:14, padding:'18px 20px', color:'#DFF1EA' }}>
              <div style={{ fontSize:15, fontWeight:800, color:'#FFFFFF' }}>Coletar assinatura</div>
              <div style={{ fontSize:13, lineHeight:1.5, marginTop:6, opacity:0.8 }}>
                {peerOnline
                  ? 'Tablet conectado neste login — ao clicar, a tela de assinatura abrirá no tablet automaticamente.'
                  : 'Confira os dados e entregue o tablet ao paciente. A tela entrará no modo de assinatura.'}
              </div>
              <button
                onClick={() => {
                  if (peerOnline) {
                    getSocket()?.emit('sign:request', { consultaId: c.id });
                    startRemoteSigning(c.id);
                  } else {
                    setTabletMode('signing');
                  }
                }}
                style={{ marginTop:14, width:'100%', padding:13, border:'none', borderRadius:10, background:'#2FA184', color:'#FFFFFF', fontFamily:'inherit', fontSize:14, fontWeight:800, cursor:'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#3BB795')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#2FA184')}
              >
                Passar tablet ao paciente →
              </button>
              <button
                onClick={handleMarkPaper}
                style={{ marginTop:10, width:'100%', padding:10, border:'1px solid rgba(255,255,255,0.25)', borderRadius:10, background:'none', color:'#A8CFC3', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                Assinada em papel (exceção)
              </button>
            </div>
          )}

          {/* Signature collected */}
          {hasSignature && (
            <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#6B7A75', marginBottom:10 }}>ASSINATURA COLETADA</div>
              {signature ? (
                <img src={signature} alt="Assinatura" style={{ width:'100%', borderRadius:8, border:'1px solid #E5E3DD' }} />
              ) : (
                <div style={{ padding:'14px', background:'#E3F2E8', borderRadius:8, fontSize:13, color:'#1D6B3C', fontWeight:700, textAlign:'center' }}>
                  ✓ Assinada em papel
                </div>
              )}
              <div style={{ fontSize:12, color:'#9AA6A1', marginTop:8 }}>Coletada hoje · anexada à guia</div>
            </div>
          )}

          {/* Presence and cancellation */}
          {(canMarkAtendido || canCancel) && (
            <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#6B7A75', marginBottom:12 }}>AÇÕES</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {canMarkAtendido && (
                  <button
                    onClick={handleMarkAtendido}
                    style={{ width:'100%', padding:11, border:'1px solid #BFDCC9', borderRadius:10, background:'#F2F9F4', color:'#1D6B3C', fontFamily:'inherit', fontSize:13, fontWeight:800, cursor:'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#E3F2E8')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#F2F9F4')}
                  >
                    ✓ Marcar como Atendido
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={handleCancel}
                    style={{ width:'100%', padding:11, border:'1px solid #E8D5D1', borderRadius:10, background:'#FFFFFF', color:'#A33B2E', fontFamily:'inherit', fontSize:13, fontWeight:800, cursor:'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F7E4E1')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  >
                    ✕ Cancelar guia
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
