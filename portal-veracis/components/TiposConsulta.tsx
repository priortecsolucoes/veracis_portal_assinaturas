'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { brl } from '@/lib/types';

export default function TiposConsulta() {
  const { appointmentTypes, addAppointmentType, updateAppointmentType, removeAppointmentType, showToast } = useStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ name:'', cbo:'', tus:'', rate:0 });

  const newNameRef  = useRef<HTMLInputElement>(null);
  const newCboRef   = useRef<HTMLInputElement>(null);
  const newTusRef   = useRef<HTMLInputElement>(null);
  const newRateRef  = useRef<HTMLInputElement>(null);

  function startEdit(id: number) {
    const t = appointmentTypes.find(x => x.id === id)!;
    setDraft({ name:t.name, cbo:t.cbo, tus:t.tus, rate:t.rate });
    setEditingId(id);
  }

  function saveEdit() {
    if (!editingId) return;
    updateAppointmentType(editingId, draft);
    setEditingId(null);
    showToast('Tipo de consulta atualizado');
  }

  function handleAdd() {
    const name = newNameRef.current?.value.trim() || '';
    const cbo  = newCboRef.current?.value.trim()  || '';
    const tus  = newTusRef.current?.value.trim()  || '';
    const rate = parseFloat(newRateRef.current?.value.replace(',','.') || '0') || 0;
    if (!name) return;
    addAppointmentType({ name, cbo, tus, rate });
    if (newNameRef.current)  newNameRef.current.value  = '';
    if (newCboRef.current)   newCboRef.current.value   = '';
    if (newTusRef.current)   newTusRef.current.value   = '';
    if (newRateRef.current)  newRateRef.current.value  = '';
    showToast('Tipo de consulta adicionado');
  }

  const GRID = '1.6fr 1fr 1fr 120px 88px';

  return (
    <div style={{ padding:'32px 36px', display:'flex', flexDirection:'column', gap:20, maxWidth:1000 }}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontSize:24, fontWeight:800 }}>Tipos de Consulta</div>
          <span style={{ padding:'5px 12px', borderRadius:999, background:'#EFE6F5', color:'#6B3E8F', fontSize:12, fontWeight:800 }}>🔒 Acesso restrito — faturamento</span>
        </div>
        <div style={{ color:'#6B7A75', fontSize:14, marginTop:4 }}>Cadastro usado pelo faturamento: tipo, código CBO, código TUS e valor. Não visível para recepção/secretaria.</div>
      </div>

      <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, overflow:'hidden' }}>
        {/* Column headers */}
        <div style={{ display:'grid', gridTemplateColumns:GRID, gap:12, padding:'12px 20px', fontSize:11, fontWeight:800, color:'#9AA6A1', letterSpacing:'0.06em', borderBottom:'1px solid #EEEDE8' }}>
          <div>TIPO DE CONSULTA</div><div>CÓDIGO CBO</div><div>CÓDIGO TUS</div><div style={{ textAlign:'right' }}>VALOR</div><div></div>
        </div>

        {/* Rows */}
        {appointmentTypes.map((t) => (
          <div key={t.id} style={{ display:'grid', gridTemplateColumns:GRID, gap:12, padding:'13px 20px', alignItems:'center', borderBottom:'1px solid #F3F2ED', fontSize:14 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAF7')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          >
            {editingId === t.id ? (
              <>
                <input value={draft.name} onChange={(e) => setDraft(d => ({ ...d, name:e.target.value }))} style={{ padding:'8px 10px', border:'1px solid #0E6B5B', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF', fontWeight:700 }} />
                <input value={draft.cbo}  onChange={(e) => setDraft(d => ({ ...d, cbo:e.target.value }))}  style={{ padding:'8px 10px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF' }} />
                <input value={draft.tus}  onChange={(e) => setDraft(d => ({ ...d, tus:e.target.value }))}  style={{ padding:'8px 10px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF' }} />
                <input value={draft.rate} onChange={(e) => setDraft(d => ({ ...d, rate:Number(e.target.value) }))} type="number" style={{ padding:'8px 10px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF', textAlign:'right' }} />
                <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
                  <button onClick={saveEdit} title="Salvar" style={{ width:30, height:30, border:'none', borderRadius:8, background:'#0E6B5B', color:'#FFFFFF', cursor:'pointer', fontSize:13, fontWeight:800 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
                  >✓</button>
                  <button onClick={() => setEditingId(null)} title="Cancelar" style={{ width:30, height:30, border:'1px solid #E5E3DD', borderRadius:8, background:'#FFFFFF', color:'#9AA6A1', cursor:'pointer', fontSize:12 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  >✕</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight:700 }}>{t.name}</div>
                <div style={{ color:'#6B7A75', fontVariantNumeric:'tabular-nums' }}>{t.cbo}</div>
                <div style={{ color:'#6B7A75', fontVariantNumeric:'tabular-nums' }}>{t.tus}</div>
                <div style={{ textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{brl(t.rate)}</div>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
                  <button onClick={() => startEdit(t.id)} title="Editar" style={{ width:30, height:30, border:'1px solid #E5E3DD', borderRadius:8, background:'#FFFFFF', color:'#9AA6A1', cursor:'pointer', fontSize:13 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#EAF3F0')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  >✎</button>
                  <button onClick={() => { removeAppointmentType(t.id); showToast('Tipo removido'); }} title="Remover" style={{ width:30, height:30, border:'1px solid #E5E3DD', borderRadius:8, background:'#FFFFFF', color:'#9AA6A1', cursor:'pointer', fontSize:13 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F7E4E1')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  >🗑</button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add row */}
        <div style={{ display:'grid', gridTemplateColumns:GRID, gap:12, padding:'13px 20px', alignItems:'center', background:'#FAFAF7' }}>
          <input ref={newNameRef} placeholder="Novo tipo (ex.: Psicologia — sessão)" style={{ padding:'9px 11px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF' }} />
          <input ref={newCboRef}  placeholder="CBO"     style={{ padding:'9px 11px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF' }} />
          <input ref={newTusRef}  placeholder="TUS"     style={{ padding:'9px 11px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF' }} />
          <input ref={newRateRef} placeholder="R$ 0,00" style={{ padding:'9px 11px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF', textAlign:'right' }} />
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button onClick={handleAdd} title="Adicionar" style={{ width:30, height:30, border:'none', borderRadius:8, background:'#0E6B5B', color:'#FFFFFF', cursor:'pointer', fontSize:15, fontWeight:800 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
            >+</button>
          </div>
        </div>
      </div>

      <div style={{ fontSize:12.5, color:'#9AA6A1' }}>Valores ilustrativos — a tabela oficial de valores será enviada pela Laila.</div>
    </div>
  );
}
