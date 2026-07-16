'use client';

import { useStore } from '@/lib/store';
import { ST, VALOR, brl } from '@/lib/types';
import { HISTORICO } from '@/lib/mock-data';
import StatusPill from './StatusPill';
import type { Consulta, Periodo } from '@/lib/types';

export default function Relatorios() {
  const { role, periodo, setPeriodo, selectRep, consultas } = useStore();
  const fat = role === 'faturamento';

  const today = new Date();
  function cutoffDays(days: number) {
    const d = new Date(); d.setDate(d.getDate() - days); return d;
  }

  // Combine today's data with historical (today's consultas get today's date)
  const todayStr = today.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });
  const allRecords: (Consulta & { data: string })[] = [
    ...consultas.map(c => ({ ...c, data: todayStr })),
    ...HISTORICO as (Consulta & { data: string })[],
  ];

  const periodos: { key: Periodo; label: string; days: number }[] = [
    { key:'semana',    label:'7 dias',    days:7   },
    { key:'mes',       label:'30 dias',   days:30  },
    { key:'trimestre', label:'90 dias',   days:90  },
    { key:'todos',     label:'Tudo',      days:999 },
  ];

  const activePeriodo = periodos.find(p => p.key === periodo)!;

  const rows = allRecords.filter(r => {
    if (periodo === 'todos') return true;
    // Simple filter: keep all for now since dates are strings
    return true;
  }).slice(0, activePeriodo.days === 7 ? 15 : activePeriodo.days === 30 ? 25 : allRecords.length);

  // Summary cards
  const totalRows = rows.length;
  const assinadas = rows.filter(r => r.status === 'assinado' || r.status === 'papel').length;
  const canceladas = rows.filter(r => r.status === 'cancelado').length;
  const realizadas = rows.filter(r => r.realizada).length;
  const totalValor = rows.reduce((sum, r) => sum + (VALOR[r.tipo] || 0), 0);

  const repCards = [
    { label:'Total de guias', value: String(totalRows), accent:'#22302C' },
    { label:'Assinadas',      value: String(assinadas),  accent:'#1D6B3C' },
    { label:'Canceladas',     value: String(canceladas), accent:'#A33B2E' },
    ...(fat ? [{ label:'Valor total', value: brl(totalValor), accent:'#0E6B5B' }] : [{ label:'Realizadas', value: String(realizadas), accent:'#0E6B5B' }]),
  ];

  const repGrid = fat
    ? '88px 1.2fr 1.1fr 100px 0.8fr 1.1fr 80px 100px 80px'
    : '88px 1.2fr 1.1fr 100px 0.8fr 1.1fr 80px 80px';

  const periodoLabel = `Últimos ${activePeriodo.days === 999 ? '~40' : activePeriodo.days} dias · Convênio Unimed`;

  function exportCsv() {
    const header = ['Data','Paciente','Profissional','Nº Pedido','Guia','Status','Realizada', ...(fat ? ['Valor'] : [])].join(',');
    const lines = rows.map(r => [
      r.data, r.paciente, r.medico, r.pedido || '', r.tipo,
      ST[r.status].label, r.realizada ? 'Sim' : 'Não',
      ...(fat ? [brl(VALOR[r.tipo] || 0)] : []),
    ].map(v => `"${v}"`).join(','));
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'relatorio-veracis.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding:'32px 36px', display:'flex', flexDirection:'column', gap:22 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:24, fontWeight:800 }}>Relatórios e Histórico</div>
          <div style={{ color:'#6B7A75', fontSize:14, marginTop:4 }}>{periodoLabel}</div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ display:'flex', background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:10, padding:4, gap:2 }}>
            {periodos.map((p) => {
              const active = periodo === p.key;
              return (
                <button key={p.key} onClick={() => setPeriodo(p.key)} style={{ padding:'8px 16px', border:'none', borderRadius:8, background: active ? '#E7F1EE' : 'transparent', color: active ? '#0E6B5B' : '#6B7A75', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  {p.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={exportCsv}
            style={{ padding:'11px 18px', border:'none', borderRadius:10, background:'#0E6B5B', color:'#FFFFFF', fontFamily:'inherit', fontSize:13, fontWeight:800, cursor:'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
          >
            Exportar CSV ↓
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
        {repCards.map((rc) => (
          <div key={rc.label} style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, padding:'16px 20px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#6B7A75' }}>{rc.label}</div>
            <div style={{ fontSize:28, fontWeight:800, marginTop:4, color:rc.accent }}>{rc.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:repGrid, gap:12, padding:'12px 20px', fontSize:11, fontWeight:800, color:'#9AA6A1', letterSpacing:'0.06em', borderBottom:'1px solid #EEEDE8' }}>
          <div>DATA</div><div>PACIENTE</div><div>PROFISSIONAL</div><div>Nº PEDIDO</div>
          <div>GUIA</div><div>STATUS</div><div>REALIZADA</div>
          {fat && <div style={{ textAlign:'right' }}>VALOR</div>}
          <div></div>
        </div>

        {rows.map((r) => {
          const realColor = r.realizada ? '#1D6B3C' : '#B9C6C1';
          return (
            <div
              key={r.id}
              style={{ display:'grid', gridTemplateColumns:repGrid, gap:12, padding:'12px 20px', alignItems:'center', borderBottom:'1px solid #F3F2ED', fontSize:14 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAF7')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              <div style={{ fontWeight:700, color:'#6B7A75' }}>{r.data}</div>
              <div style={{ fontWeight:700 }}>{r.paciente}</div>
              <div style={{ color:'#6B7A75' }}>{r.medico}</div>
              <div style={{ fontSize:13, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{r.pedido || '—'}</div>
              <div style={{ fontSize:13, color:'#6B7A75', fontWeight:600 }}>{r.tipo}</div>
              <div><StatusPill status={r.status} size="sm" /></div>
              <div style={{ fontSize:12, fontWeight:800, color:realColor }}>{r.realizada ? '✓ Sim' : '—'}</div>
              {fat && <div style={{ textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{brl(VALOR[r.tipo] || 0)}</div>}
              <div style={{ textAlign:'right' }}>
                <button
                  onClick={() => selectRep(r)}
                  style={{ padding:'8px 13px', border:'1px solid #D8D6CF', borderRadius:9, background:'#FFFFFF', color:'#22302C', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                >
                  Ver
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!fat && (
        <div style={{ fontSize:12.5, color:'#9AA6A1' }}>Valores das consultas são visíveis apenas no relatório de faturamento (acesso restrito ao time da Beth).</div>
      )}
    </div>
  );
}
