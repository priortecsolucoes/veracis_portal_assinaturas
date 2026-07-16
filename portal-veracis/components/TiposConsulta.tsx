'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { brl } from '@/lib/types';

export default function TiposConsulta() {
  const { tipos, addTipo, updateTipo, removeTipo, showToast } = useStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ nome:'', cbo:'', tus:'', valor:0 });

  const novoNomeRef = useRef<HTMLInputElement>(null);
  const novoCboRef  = useRef<HTMLInputElement>(null);
  const novoTusRef  = useRef<HTMLInputElement>(null);
  const novoValorRef = useRef<HTMLInputElement>(null);

  function startEdit(id: number) {
    const t = tipos.find(x => x.id === id)!;
    setDraft({ nome:t.nome, cbo:t.cbo, tus:t.tus, valor:t.valor });
    setEditingId(id);
  }

  function saveEdit() {
    if (!editingId) return;
    updateTipo(editingId, draft);
    setEditingId(null);
    showToast('Tipo de consulta atualizado');
  }

  function handleAdd() {
    const nome  = novoNomeRef.current?.value.trim() || '';
    const cbo   = novoCboRef.current?.value.trim()  || '';
    const tus   = novoTusRef.current?.value.trim()  || '';
    const valor = parseFloat(novoValorRef.current?.value.replace(',','.') || '0') || 0;
    if (!nome) return;
    addTipo({ nome, cbo, tus, valor });
    if (novoNomeRef.current)  novoNomeRef.current.value  = '';
    if (novoCboRef.current)   novoCboRef.current.value   = '';
    if (novoTusRef.current)   novoTusRef.current.value   = '';
    if (novoValorRef.current) novoValorRef.current.value = '';
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
        {tipos.map((t) => (
          <div key={t.id} style={{ display:'grid', gridTemplateColumns:GRID, gap:12, padding:'13px 20px', alignItems:'center', borderBottom:'1px solid #F3F2ED', fontSize:14 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAF7')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          >
            {editingId === t.id ? (
              <>
                <input value={draft.nome}  onChange={(e) => setDraft(d => ({ ...d, nome:e.target.value }))}  style={{ padding:'8px 10px', border:'1px solid #0E6B5B', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF', fontWeight:700 }} />
                <input value={draft.cbo}   onChange={(e) => setDraft(d => ({ ...d, cbo:e.target.value }))}   style={{ padding:'8px 10px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF' }} />
                <input value={draft.tus}   onChange={(e) => setDraft(d => ({ ...d, tus:e.target.value }))}   style={{ padding:'8px 10px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF' }} />
                <input value={draft.valor} onChange={(e) => setDraft(d => ({ ...d, valor:Number(e.target.value) }))} type="number" style={{ padding:'8px 10px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF', textAlign:'right' }} />
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
                <div style={{ fontWeight:700 }}>{t.nome}</div>
                <div style={{ color:'#6B7A75', fontVariantNumeric:'tabular-nums' }}>{t.cbo}</div>
                <div style={{ color:'#6B7A75', fontVariantNumeric:'tabular-nums' }}>{t.tus}</div>
                <div style={{ textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{brl(t.valor)}</div>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
                  <button onClick={() => startEdit(t.id)} title="Editar" style={{ width:30, height:30, border:'1px solid #E5E3DD', borderRadius:8, background:'#FFFFFF', color:'#9AA6A1', cursor:'pointer', fontSize:13 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#EAF3F0')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  >✎</button>
                  <button onClick={() => { removeTipo(t.id); showToast('Tipo removido'); }} title="Remover" style={{ width:30, height:30, border:'1px solid #E5E3DD', borderRadius:8, background:'#FFFFFF', color:'#9AA6A1', cursor:'pointer', fontSize:13 }}
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
          <input ref={novoNomeRef} placeholder="Novo tipo (ex.: Psicologia — sessão)" style={{ padding:'9px 11px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF' }} />
          <input ref={novoCboRef}   placeholder="CBO"    style={{ padding:'9px 11px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF' }} />
          <input ref={novoTusRef}   placeholder="TUS"    style={{ padding:'9px 11px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF' }} />
          <input ref={novoValorRef} placeholder="R$ 0,00" style={{ padding:'9px 11px', border:'1px solid #D8D6CF', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#FFFFFF', textAlign:'right' }} />
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
