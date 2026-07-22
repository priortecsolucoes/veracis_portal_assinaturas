'use client';

import { useStore } from '@/lib/store';
import type { Filter, Appointment } from '@/lib/types';
import StatusPill from './StatusPill';
import { HISTORY, SPECIALTY_CODES } from '@/lib/mock-data';

const GRID = '58px 1.25fr 1.1fr 118px 0.95fr 1.2fr 86px 168px';

// Appointments from history that are still pending (Pendentes do Passado)
const PENDING_HISTORY = HISTORY.filter((h) => h.status === 'facial' || h.status === 'authorized');

// Build a set of "patient|specialty" present in history for RN-05 duplicate check
const HISTORY_PATIENT_SPECIALTY = new Set(
  HISTORY.map((h) => `${h.patient}|${h.specialty}`)
);

export default function Dashboard() {
  const {
    appointments, filter, setFilter,
    patchAppointment, selectAppointment,
    showToast, logAction, devicesOnline,
  } = useStore();

  const peerOnline = devicesOnline >= 2;

  const today = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' });
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1);

  const isPastFilter = filter === 'past';
  const sourceRows: Appointment[] = isPastFilter
    ? PENDING_HISTORY
    : appointments.filter((c) => {
        if (filter === 'download') return c.status === 'facial';
        if (filter === 'sign')     return c.status === 'authorized';
        if (filter === 'completed') return ['signed', 'paper', 'cancelled', 'atendido'].includes(c.status);
        return true;
      });

  // Summary card stats (always from today's appointments)
  const total      = appointments.length;
  const pendFace   = appointments.filter((c) => c.status === 'facial').length;
  const pendSign   = appointments.filter((c) => c.status === 'authorized').length;
  const signed     = appointments.filter((c) => c.status === 'signed' || c.status === 'paper').length;
  const attended   = appointments.filter((c) => c.status === 'atendido').length;

  const cards = [
    { label:'Consultas de hoje',      value:total,    icon:'📅', tint:'#E7F1EE', accent:'#0E6B5B', sub:'importadas do FeeGow' },
    { label:'Pend. reconhec. facial', value:pendFace, icon:'👤', tint:'#FBF0DC', accent:'#8A5A12', sub:'aguardando paciente' },
    { label:'Pendente Assinatura',    value:pendSign, icon:'✓',  tint:'#DDEEF9', accent:'#1E6EA7', sub:'prontas para assinar' },
    { label:'Assinadas',              value:signed,   icon:'✍️', tint:'#E3F2E8', accent:'#1D6B3C', sub:'assinatura coletada' },
    { label:'Atendidas',              value:attended, icon:'🩺', tint:'#EAF3F0', accent:'#0E6B5B', sub:'consulta confirmada' },
  ];

  const filters: { key: Filter; label: string }[] = [
    { key:'all',       label:'Todas' },
    { key:'download',  label:'A baixar guia' },
    { key:'sign',      label:'P/ assinar' },
    { key:'completed', label:'Concluídas' },
    { key:'past',      label:'Pendentes do Passado' },
  ];

  function handleDownload(c: Appointment) {
    if (!c.authorizationNumber) { showToast('Sem nº do pedido — aguarde a pré-autorização (Beth)'); return; }
    if (c.referral && c.referral.used >= c.referral.total && c.referral.total > 1) { showToast('Pacote de sessões esgotado — anexe um novo encaminhamento'); return; }
    patchAppointment(c.id, { status:'authorized' });
    logAction(`Guia ${c.authorizationNumber} baixada do TopSaúde (${c.patient})`);
    showToast('Guia do pedido ' + c.authorizationNumber + ' baixada do TopSaúde — disponível para assinatura');
  }

  function handleCancel(c: Appointment) {
    patchAppointment(c.id, { status:'cancelled' });
    logAction(`Guia de ${c.patient} cancelada`);
    showToast('Guia de ' + c.patient + ' cancelada');
  }

  function saveAuthorizationNumber(id: number, patient: string, val: string) {
    const v = val.trim();
    if (!v) return;
    patchAppointment(id, { authorizationNumber: v, status:'facial' });
    logAction(`Nº pedido ${v} vinculado a ${patient}`);
    showToast('Pedido ' + v + ' vinculado a ' + patient);
  }

  async function syncFeeGow() {
    // TODO: integrar com API do FeeGow
  }

  return (
    <div style={{ padding:'32px 36px', display:'flex', flexDirection:'column', gap:24 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:24, fontWeight:800 }}>Início</div>
          <div style={{ color:'#6B7A75', fontSize:14, marginTop:4 }}>{todayLabel} · Convênio Unimed</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          {peerOnline && (
            <div style={{
              display:'flex', alignItems:'center', gap:7,
              background:'#E3F2E8', border:'1px solid #BFDECB',
              color:'#1D6B3C', borderRadius:9, padding:'7px 12px',
              fontSize:13, fontWeight:700,
            }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#1D6B3C', display:'inline-block', animation:'pulseDot 1.6s ease infinite' }} />
              Tablet conectado
            </div>
          )}
          <button
            onClick={syncFeeGow}
            style={{
              display:'flex', alignItems:'center', gap:7,
              padding:'9px 14px', border:'1px solid #C8D9D5', borderRadius:9,
              background:'#FFFFFF', color:'#0A4A40', fontSize:13, fontWeight:700,
              fontFamily:'inherit', cursor:'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F7F5'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
            title="Sincronizar agendamentos do FeeGow"
          >
            ↻ Sincronizar FeeGow
          </button>
          <div style={{ fontSize:13, color:'#6B7A75', background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:9, padding:'9px 14px' }}>
            Última sincronização FeeGow: hoje às 07:02
          </div>
        </div>
        <style>{`
          @keyframes pulseDot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.25; }
          }
        `}</style>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:14 }}>
        {cards.map((card) => (
          <div key={card.label} style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#6B7A75' }}>{card.label}</div>
              <div style={{ width:30, height:30, borderRadius:8, background:card.tint, color:card.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{card.icon}</div>
            </div>
            <div style={{ fontSize:32, fontWeight:800, marginTop:8, color:card.accent }}>{card.value}</div>
            <div style={{ fontSize:12, color:'#9AA6A1', marginTop:2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, overflow:'hidden' }}>
        {/* Table header bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px', borderBottom:'1px solid #EEEDE8', flexWrap:'wrap', gap:10 }}>
          <div style={{ fontSize:16, fontWeight:800 }}>
            {isPastFilter ? 'Pendentes dos últimos 30 dias' : 'Consultas de hoje'}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {filters.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding:'7px 14px', borderRadius:999,
                    border: `1px solid ${active ? '#0E6B5B' : '#E5E3DD'}`,
                    background: active ? '#E7F1EE' : '#FFFFFF',
                    color: active ? '#0E6B5B' : '#6B7A75',
                    fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display:'grid', gridTemplateColumns:GRID, gap:12, padding:'10px 20px', fontSize:11, fontWeight:800, color:'#9AA6A1', letterSpacing:'0.06em', borderBottom:'1px solid #EEEDE8' }}>
          <div>HORA</div><div>PACIENTE</div><div>PROFISSIONAL</div><div>Nº PEDIDO</div>
          <div>GUIA</div><div>STATUS</div><div>REALIZADA</div><div></div>
        </div>

        {/* Empty state */}
        {sourceRows.length === 0 && (
          <div style={{ padding:'36px 20px', textAlign:'center', color:'#9AA6A1', fontSize:14 }}>
            {isPastFilter
              ? 'Nenhuma consulta pendente nos últimos 30 dias.'
              : 'Nenhuma consulta corresponde ao filtro selecionado.'}
          </div>
        )}

        {/* Rows */}
        {sourceRows.map((c) => {
          const referralExhausted = !!(c.referral && c.referral.total > 1 && c.referral.used >= c.referral.total);
          const canDownload = c.status === 'facial' && !!c.authorizationNumber && !referralExhausted;
          const canSign     = c.status === 'authorized';
          const canCancel   = !['cancelled', 'atendido'].includes(c.status);
          const hasPackage  = !!(c.referral && c.referral.total > 1);

          // RN-05: same patient + same specialty in history within 30 days
          const isDuplicate = !isPastFilter && HISTORY_PATIENT_SPECIALTY.has(`${c.patient}|${c.specialty}`);

          // D-07: procedure code display
          const codes = SPECIALTY_CODES[c.specialty];
          const procedureCode = codes
            ? (c.serviceType === 'Consulta' ? `CBO ${codes.cbo}` : `TUS ${codes.tus}`)
            : null;

          return (
            <div
              key={c.id}
              title={isDuplicate ? `⚠ ${c.patient} já teve consulta de ${c.specialty} nos últimos 30 dias` : undefined}
              style={{
                display:'grid', gridTemplateColumns:GRID, gap:12,
                padding:'13px 20px', alignItems:'center',
                borderBottom:'1px solid #F3F2ED', fontSize:14,
                opacity: c.status === 'cancelled' ? 0.55 : 1,
                background: isDuplicate ? '#FFFBF2' : undefined,
                cursor:'default',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = isDuplicate ? '#FFF5E0' : '#FAFAF7')}
              onMouseLeave={(e) => (e.currentTarget.style.background = isDuplicate ? '#FFFBF2' : '')}
            >
              {/* Time */}
              <div style={{ fontWeight:700, color:'#6B7A75' }}>
                {isPastFilter && c.date ? (
                  <>
                    <div style={{ fontSize:11, color:'#B9C6C1', fontWeight:700 }}>{c.date}</div>
                    <div>{c.time}</div>
                  </>
                ) : c.time}
              </div>

              {/* Patient */}
              <div>
                <div style={{ fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                  {c.patient}
                  {isDuplicate && (
                    <span title={`${c.patient} já teve consulta de ${c.specialty} nos últimos 30 dias`} style={{ fontSize:13, cursor:'help' }}>⚠️</span>
                  )}
                </div>
                <div style={{ fontSize:12, color:'#9AA6A1' }}>Unimed · {c.insuranceCard}</div>
              </div>

              {/* Doctor */}
              <div>
                <div style={{ fontWeight:600 }}>{c.doctor}</div>
                <div style={{ fontSize:12, color:'#9AA6A1' }}>{c.specialty}</div>
              </div>

              {/* Authorization number */}
              <div>
                {c.authorizationNumber ? (
                  <div style={{ fontWeight:700, fontSize:13, color:'#22302C', fontVariantNumeric:'tabular-nums' }}>{c.authorizationNumber}</div>
                ) : c.status !== 'cancelled' ? (
                  <input
                    onKeyDown={(e) => { if (e.key === 'Enter') { saveAuthorizationNumber(c.id, c.patient, e.currentTarget.value); e.currentTarget.value = ''; } }}
                    onBlur={(e) => { saveAuthorizationNumber(c.id, c.patient, e.currentTarget.value); }}
                    placeholder="Digitar nº"
                    title="Nº do pedido gerado na pré-autorização do TopSaúde — Enter para salvar"
                    style={{ width:'100%', padding:'7px 9px', border:'1.5px dashed #C9A24B', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFBF2', outline:'none' }}
                  />
                ) : (
                  <span style={{ fontSize:12, color:'#B0873A', fontWeight:700, background:'#FBF0DC', padding:'4px 9px', borderRadius:999, whiteSpace:'nowrap' }}>aguarda pedido</span>
                )}
              </div>

              {/* Service type + CBO/TUS + session package */}
              <div>
                <div style={{ fontSize:13, color:'#6B7A75', fontWeight:600 }}>{c.serviceType}</div>
                {procedureCode && (
                  <div style={{ fontSize:11, color:'#9AA6A1', marginTop:1, fontVariantNumeric:'tabular-nums' }}>{procedureCode}</div>
                )}
                {hasPackage && (
                  <div style={{ fontSize:11.5, fontWeight:800, color: referralExhausted ? '#A33B2E' : '#0E6B5B', marginTop:2 }}>
                    Sessão {c.referral!.used} de {c.referral!.total}
                  </div>
                )}
              </div>

              {/* Status */}
              <div><StatusPill status={c.status} /></div>

              {/* Atendido */}
              <div>
                {c.status === 'atendido'
                  ? <span style={{ fontSize:12, fontWeight:800, color:'#1D6B3C' }}>✓ Sim</span>
                  : <span style={{ fontSize:12, color:'#B9C6C1', fontWeight:700 }}>—</span>
                }
              </div>

              {/* Actions */}
              <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:6 }}>
                {canDownload && (
                  <button
                    onClick={() => handleDownload(c)}
                    title="Confirme que o paciente fez o reconhecimento facial e baixe a guia do TopSaúde"
                    style={{ flex:'0 0 160px', width:160, minWidth:160, padding:'9px 0', border:'none', borderRadius:9, background:'#1E6EA7', color:'#FFFFFF', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#175A8A')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#1E6EA7')}
                  >
                    Baixar guia ↓
                  </button>
                )}
                {canSign && (
                  <button
                    onClick={() => selectAppointment(c.id)}
                    style={{ flex:'0 0 160px', width:160, minWidth:160, padding:'9px 0', border:'none', borderRadius:9, background:'#0E6B5B', color:'#FFFFFF', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
                  >
                    Coletar assinatura
                  </button>
                )}
                <button
                  onClick={() => selectAppointment(c.id)}
                  title="Ver detalhes da guia"
                  style={{ width:32, height:32, border:'1px solid #D8D6CF', borderRadius:8, background:'#FFFFFF', color:'#6B7A75', fontSize:14, cursor:'pointer', flexShrink:0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                >
                  👁
                </button>
                {canCancel && (
                  <button
                    onClick={() => handleCancel(c)}
                    title="Cancelar guia"
                    style={{ width:32, height:32, border:'1px solid #E8D5D1', borderRadius:8, background:'#FFFFFF', color:'#A33B2E', fontSize:13, cursor:'pointer', flexShrink:0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F7E4E1')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* RN-05 legend */}
      <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12.5, color:'#9AA6A1' }}>
        <span style={{ background:'#FFFBF2', border:'1px solid #E0C97E', borderRadius:6, padding:'3px 9px', fontWeight:700, color:'#8A5A12', whiteSpace:'nowrap' }}>⚠️ fundo amarelo</span>
        <span>= paciente com consulta da mesma especialidade nos últimos 30 dias (RN-05)</span>
      </div>

      <div style={{ fontSize:12.5, color:'#9AA6A1', lineHeight:1.5 }}>
        O nº do pedido é gerado pelo time de autorização (Beth) na pré-autorização do TopSaúde. Guias de consultas/terapias só ficam disponíveis após o reconhecimento facial do paciente no local — exames não exigem facial. A baixa por não comparecimento será automatizada via status do FeeGow.
      </div>
    </div>
  );
}
