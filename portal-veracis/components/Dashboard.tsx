'use client';

import { useStore } from '@/lib/store';
import { ST, VALOR, brl } from '@/lib/types';
import type { Filter } from '@/lib/types';
import StatusPill from './StatusPill';

const GRID = '58px 1.25fr 1.1fr 118px 0.8fr 1.2fr 86px 168px';

export default function Dashboard() {
  const {
    consultas, filter, setFilter,
    patchConsulta, selectConsulta,
    showToast, role,
  } = useStore();

  const today = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' });
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1);

  const visible = consultas.filter(c => {
    if (filter === 'baixar') return c.status === 'facial';
    if (filter === 'assinar') return c.status === 'autorizado';
    if (filter === 'concluidas') return ['assinado','papel','cancelado'].includes(c.status);
    return true;
  });

  // Summary card stats
  const total    = consultas.length;
  const pendFace = consultas.filter(c => c.status === 'facial').length;
  const autori   = consultas.filter(c => c.status === 'autorizado').length;
  const assina   = consultas.filter(c => c.status === 'assinado' || c.status === 'papel').length;
  const realiz   = consultas.filter(c => c.realizada).length;

  const cards = [
    { label:'Consultas de hoje',     value:total,    icon:'📅', tint:'#E7F1EE', accent:'#0E6B5B', sub:'importadas do FeeGow' },
    { label:'Pend. reconhec. facial', value:pendFace, icon:'👤', tint:'#FBF0DC', accent:'#8A5A12', sub:'aguardando paciente' },
    { label:'Autorizadas',           value:autori,   icon:'✓',  tint:'#DDEEF9', accent:'#1E6EA7', sub:'prontas para assinar' },
    { label:'Assinadas',             value:assina,   icon:'✍️', tint:'#E3F2E8', accent:'#1D6B3C', sub:'assinatura coletada' },
    { label:'Realizadas',            value:realiz,   icon:'🩺', tint:'#EAF3F0', accent:'#0E6B5B', sub:'consulta confirmada' },
  ];

  const filters: { key: Filter; label: string }[] = [
    { key:'todas',     label:'Todas' },
    { key:'baixar',    label:'A baixar guia' },
    { key:'assinar',   label:'P/ assinar' },
    { key:'concluidas', label:'Concluídas' },
  ];

  function handleBaixar(c: (typeof consultas)[0]) {
    if (!c.pedido) { showToast('Sem nº do pedido — aguarde a pré-autorização (Beth)'); return; }
    if (c.enc && c.enc.usadas >= c.enc.total && c.enc.total > 1) { showToast('Pacote de sessões esgotado — anexe um novo encaminhamento'); return; }
    patchConsulta(c.id, { status:'autorizado' });
    showToast('Guia do pedido ' + c.pedido + ' baixada do TopSaúde — disponível para assinatura');
  }

  function handleCancelar(c: (typeof consultas)[0]) {
    patchConsulta(c.id, { status:'cancelado' });
    showToast('Guia de ' + c.paciente + ' cancelada — não comparecimento registrado');
  }

  function savePedido(id: number, paciente: string, val: string) {
    const v = val.trim();
    if (!v) return;
    patchConsulta(id, { pedido: v, status:'facial' });
    showToast('Pedido ' + v + ' vinculado a ' + paciente);
  }

  return (
    <div style={{ padding:'32px 36px', display:'flex', flexDirection:'column', gap:24 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:24, fontWeight:800 }}>Início</div>
          <div style={{ color:'#6B7A75', fontSize:14, marginTop:4 }}>{todayLabel} · Convênio Unimed</div>
        </div>
        <div style={{ fontSize:13, color:'#6B7A75', background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:9, padding:'9px 14px' }}>
          Última sincronização FeeGow: hoje às 07:02
        </div>
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
          <div style={{ fontSize:16, fontWeight:800 }}>Consultas de hoje</div>
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

        {/* Rows */}
        {visible.map((c) => {
          const pacoteEsg = !!(c.enc && c.enc.total > 1 && c.enc.usadas >= c.enc.total);
          const podeBaixar = c.status === 'facial' && !!c.pedido && !pacoteEsg;
          const podeAssinar = c.status === 'autorizado';
          const podeCancelar = !['assinado','papel','cancelado'].includes(c.status) && !c.realizada;
          const temPacote = !!(c.enc && c.enc.total > 1);

          return (
            <div
              key={c.id}
              style={{
                display:'grid', gridTemplateColumns:GRID, gap:12,
                padding:'13px 20px', alignItems:'center',
                borderBottom:'1px solid #F3F2ED', fontSize:14,
                opacity: c.status === 'cancelado' ? 0.55 : 1,
                cursor:'default',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAF7')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              {/* Hora */}
              <div style={{ fontWeight:700, color:'#6B7A75' }}>{c.hora}</div>

              {/* Paciente */}
              <div>
                <div style={{ fontWeight:700 }}>{c.paciente}</div>
                <div style={{ fontSize:12, color:'#9AA6A1' }}>Unimed · {c.carteira}</div>
              </div>

              {/* Profissional */}
              <div>
                <div style={{ fontWeight:600 }}>{c.medico}</div>
                <div style={{ fontSize:12, color:'#9AA6A1' }}>{c.especialidade}</div>
              </div>

              {/* Nº Pedido */}
              <div>
                {c.pedido ? (
                  <div style={{ fontWeight:700, fontSize:13, color:'#22302C', fontVariantNumeric:'tabular-nums' }}>{c.pedido}</div>
                ) : c.status !== 'cancelado' ? (
                  <input
                    onKeyDown={(e) => { if (e.key === 'Enter') { savePedido(c.id, c.paciente, e.currentTarget.value); e.currentTarget.value = ''; } }}
                    onBlur={(e) => { savePedido(c.id, c.paciente, e.currentTarget.value); }}
                    placeholder="Digitar nº"
                    title="Nº do pedido gerado na pré-autorização do TopSaúde — Enter para salvar"
                    style={{ width:'100%', padding:'7px 9px', border:'1.5px dashed #C9A24B', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFBF2', outline:'none' }}
                  />
                ) : (
                  <span style={{ fontSize:12, color:'#B0873A', fontWeight:700, background:'#FBF0DC', padding:'4px 9px', borderRadius:999, whiteSpace:'nowrap' }}>aguarda pedido</span>
                )}
              </div>

              {/* Guia */}
              <div>
                <div style={{ fontSize:13, color:'#6B7A75', fontWeight:600 }}>{c.tipo}</div>
                {temPacote && (
                  <div style={{ fontSize:11.5, fontWeight:800, color: pacoteEsg ? '#A33B2E' : '#0E6B5B', marginTop:2 }}>
                    Sessão {c.enc!.usadas} de {c.enc!.total}
                  </div>
                )}
              </div>

              {/* Status */}
              <div><StatusPill status={c.status} /></div>

              {/* Realizada */}
              <div>
                {c.realizada
                  ? <span style={{ fontSize:12, fontWeight:800, color:'#1D6B3C' }}>✓ Sim</span>
                  : <span style={{ fontSize:12, color:'#B9C6C1', fontWeight:700 }}>—</span>
                }
              </div>

              {/* Ações */}
              <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:6 }}>
                {podeBaixar && (
                  <button
                    onClick={() => handleBaixar(c)}
                    title="Confirme que o paciente fez o reconhecimento facial e baixe a guia do TopSaúde"
                    style={{ flex:'0 0 160px', width:160, minWidth:160, padding:'9px 0', border:'none', borderRadius:9, background:'#1E6EA7', color:'#FFFFFF', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#175A8A')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#1E6EA7')}
                  >
                    Baixar guia ↓
                  </button>
                )}
                {podeAssinar && (
                  <button
                    onClick={() => selectConsulta(c.id)}
                    style={{ flex:'0 0 160px', width:160, minWidth:160, padding:'9px 0', border:'none', borderRadius:9, background:'#0E6B5B', color:'#FFFFFF', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
                  >
                    Coletar assinatura
                  </button>
                )}
                <button
                  onClick={() => selectConsulta(c.id)}
                  title="Ver detalhes da guia"
                  style={{ width:32, height:32, border:'1px solid #D8D6CF', borderRadius:8, background:'#FFFFFF', color:'#6B7A75', fontSize:14, cursor:'pointer', flexShrink:0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                >
                  👁
                </button>
                {podeCancelar && (
                  <button
                    onClick={() => handleCancelar(c)}
                    title="Não compareceu — cancelar pré-autorização"
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

      <div style={{ fontSize:12.5, color:'#9AA6A1', lineHeight:1.5 }}>
        O nº do pedido é gerado pelo time de autorização (Beth) na pré-autorização do TopSaúde. Guias de consultas/terapias só ficam disponíveis após o reconhecimento facial do paciente no local — exames não exigem facial. A baixa por não comparecimento será automatizada via status do FeeGow.
      </div>
    </div>
  );
}
