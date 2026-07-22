'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function HistoricoAcoes() {
  const { actionLogs } = useStore();
  const [search, setSearch] = useState('');

  function formatTimestamp(iso: string): string {
    const d = new Date(iso);
    const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `${date} ${time}`;
  }

  const filtered = actionLogs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return log.login.toLowerCase().includes(q) || log.action.toLowerCase().includes(q);
  });

  return (
    <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>Histórico de Ações</div>
          <div style={{ color: '#6B7A75', fontSize: 14, marginTop: 4 }}>
            Registro de todas as ações realizadas no sistema por usuário
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, background: '#EFE6F5', color: '#6B3E8F', border: '1px solid #D4BFE8', borderRadius: 8, padding: '6px 12px' }}>
            🔒 Acesso restrito — faturamento
          </div>
          <div style={{ fontSize: 13, color: '#6B7A75', background: '#FFFFFF', border: '1px solid #E5E3DD', borderRadius: 9, padding: '9px 14px' }}>
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E3DD', borderRadius: 14, padding: '16px 20px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por login ou ação…"
          style={{
            width: '100%', padding: '10px 14px',
            border: '1px solid #D8D6CF', borderRadius: 9,
            fontSize: 14, fontFamily: 'inherit',
            background: '#FAFAF7', color: '#22302C',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E3DD', borderRadius: 14, overflow: 'hidden' }}>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 3fr 180px', gap: 12, padding: '12px 20px', fontSize: 11, fontWeight: 800, color: '#9AA6A1', letterSpacing: '0.06em', borderBottom: '1px solid #EEEDE8' }}>
          <div>LOGIN</div>
          <div>AÇÃO</div>
          <div>DATA / HORA</div>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: '#9AA6A1', fontSize: 14 }}>
            {search ? 'Nenhum registro corresponde à busca.' : 'Nenhuma ação registrada ainda.'}
          </div>
        )}

        {filtered.map((log) => (
          <div
            key={log.id}
            style={{
              display: 'grid', gridTemplateColumns: '1.6fr 3fr 180px', gap: 12,
              padding: '12px 20px', alignItems: 'center',
              borderBottom: '1px solid #F3F2ED', fontSize: 13,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAF7')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          >
            <div style={{ color: '#6B7A75', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.login}>
              {log.login}
            </div>
            <div style={{ color: '#22302C' }}>{log.action}</div>
            <div style={{ fontSize: 12, color: '#9AA6A1', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {formatTimestamp(log.timestamp)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12.5, color: '#9AA6A1', lineHeight: 1.5 }}>
        Registros ordenados do mais recente para o mais antigo. Em produção, este histórico será persistido em banco de dados e não poderá ser apagado.
      </div>
    </div>
  );
}
