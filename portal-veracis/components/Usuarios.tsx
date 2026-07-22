'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { User } from '@/lib/types';

const GRID = '1.4fr 1.8fr 1fr 1fr 100px';

const STATUS_LABELS: Record<User['status'], string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

const INPUT: React.CSSProperties = {
  width: '100%', padding: '8px 10px',
  border: '1px solid #D8D6CF', borderRadius: 8,
  fontSize: 13, fontFamily: 'inherit',
  background: '#FFFFFF', color: '#22302C',
  boxSizing: 'border-box',
};

export default function Usuarios() {
  const { users, addUser, updateUser, removeUser, groups, logAction, showToast } = useStore();

  const defaultGroupId = groups[0]?.id ?? 0;

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<User>>({});

  const [newName, setNewName]         = useState('');
  const [newLogin, setNewLogin]       = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newGroupId, setNewGroupId]   = useState<number>(defaultGroupId);
  const [newStatus, setNewStatus]     = useState<User['status']>('active');

  function startEdit(u: User) {
    setEditingId(u.id);
    setEditDraft({ name: u.name, login: u.login, password: u.password, groupId: u.groupId, status: u.status });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft({});
  }

  function saveEdit(id: number) {
    if (!editDraft.name?.trim()) { showToast('O campo Nome é obrigatório'); return; }
    if (!editDraft.login?.trim()) { showToast('O campo Login é obrigatório'); return; }
    updateUser(id, editDraft);
    logAction(`Usuário editado: ${editDraft.login}`);
    showToast('Usuário atualizado com sucesso');
    cancelEdit();
  }

  function handleRemove(u: User) {
    removeUser(u.id);
    logAction(`Usuário removido: ${u.login}`);
    showToast(`Usuário ${u.name} removido`);
  }

  function handleAdd() {
    if (!newName.trim()) { showToast('O campo Nome é obrigatório'); return; }
    if (!newLogin.trim()) { showToast('O campo Login é obrigatório'); return; }
    addUser({ name: newName.trim(), login: newLogin.trim(), password: newPassword || '••••••••', groupId: newGroupId, status: newStatus });
    logAction(`Usuário criado: ${newLogin.trim()}`);
    showToast(`Usuário ${newName.trim()} criado com sucesso`);
    setNewName(''); setNewLogin(''); setNewPassword('');
    setNewGroupId(defaultGroupId); setNewStatus('active');
  }

  function groupName(groupId: number) {
    return groups.find((g) => g.id === groupId)?.name ?? '—';
  }

  return (
    <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>Gerenciamento de Usuários</div>
          <div style={{ color: '#6B7A75', fontSize: 14, marginTop: 4 }}>
            Criação, edição e desativação de usuários do portal
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, background: '#EFE6F5', color: '#6B3E8F', border: '1px solid #D4BFE8', borderRadius: 8, padding: '6px 12px' }}>
          🔒 Acesso restrito — faturamento
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E3DD', borderRadius: 14, overflow: 'hidden' }}>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '12px 20px', fontSize: 11, fontWeight: 800, color: '#9AA6A1', letterSpacing: '0.06em', borderBottom: '1px solid #EEEDE8' }}>
          <div>NOME</div>
          <div>LOGIN</div>
          <div>GRUPO DE ACESSO</div>
          <div>STATUS</div>
          <div />
        </div>

        {/* Insert row */}
        <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 10, padding: '13px 20px', alignItems: 'center', background: '#F7FAF9', borderBottom: '2px solid #E5E3DD' }}>
          <input value={newName}  onChange={(e) => setNewName(e.target.value)}  placeholder="Nome completo…"   style={INPUT} />
          <input value={newLogin} onChange={(e) => setNewLogin(e.target.value)} placeholder="e-mail de acesso…" type="email" style={INPUT} />
          <select value={newGroupId} onChange={(e) => setNewGroupId(Number(e.target.value))} style={{ ...INPUT, cursor: 'pointer' }}>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as User['status'])} style={{ ...INPUT, cursor: 'pointer' }}>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleAdd}
              style={{ padding: '8px 16px', border: 'none', borderRadius: 9, background: '#0E6B5B', color: '#FFFFFF', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
            >
              + Adicionar
            </button>
          </div>
        </div>

        {/* Data rows */}
        {users.map((u) => {
          const isEditing = editingId === u.id;
          return (
            <div
              key={u.id}
              style={{
                display: 'grid', gridTemplateColumns: GRID, gap: 12,
                padding: '13px 20px', alignItems: 'center',
                borderBottom: '1px solid #F3F2ED', fontSize: 14,
                opacity: u.status === 'inactive' ? 0.6 : 1,
                background: isEditing ? '#F7FAF9' : undefined,
              }}
              onMouseEnter={(e) => { if (!isEditing) e.currentTarget.style.background = '#FAFAF7'; }}
              onMouseLeave={(e) => { if (!isEditing) e.currentTarget.style.background = ''; }}
            >
              {isEditing ? (
                <>
                  <input value={editDraft.name ?? ''} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} style={{ ...INPUT, borderColor: '#0E6B5B' }} />
                  <input value={editDraft.login ?? ''} onChange={(e) => setEditDraft((d) => ({ ...d, login: e.target.value }))} type="email" style={INPUT} />
                  <select value={editDraft.groupId ?? defaultGroupId} onChange={(e) => setEditDraft((d) => ({ ...d, groupId: Number(e.target.value) }))} style={{ ...INPUT, cursor: 'pointer' }}>
                    {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  <select value={editDraft.status ?? 'active'} onChange={(e) => setEditDraft((d) => ({ ...d, status: e.target.value as User['status'] }))} style={{ ...INPUT, cursor: 'pointer' }}>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    <button onClick={() => saveEdit(u.id)} title="Salvar"    style={{ width: 32, height: 32, border: 'none', borderRadius: 8, background: '#0E6B5B', color: '#FFFFFF', fontSize: 15, cursor: 'pointer' }}>✓</button>
                    <button onClick={cancelEdit}           title="Cancelar"  style={{ width: 32, height: 32, border: '1px solid #D8D6CF', borderRadius: 8, background: '#FFFFFF', color: '#6B7A75', fontSize: 14, cursor: 'pointer' }}>✕</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700 }}>{u.name}</div>
                  <div style={{ fontSize: 13, color: '#6B7A75' }}>{u.login}</div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: '#E7F1EE', color: '#0E6B5B' }}>
                      {groupName(u.groupId)}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                      background: u.status === 'active' ? '#E3F2E8' : '#F3F2ED',
                      color: u.status === 'active' ? '#1D6B3C' : '#9AA6A1',
                    }}>
                      {STATUS_LABELS[u.status]}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    <button
                      onClick={() => startEdit(u)}
                      title="Editar usuário"
                      style={{ width: 32, height: 32, border: '1px solid #D8D6CF', borderRadius: 8, background: '#FFFFFF', color: '#6B7A75', fontSize: 14, cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#EAF3F0')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleRemove(u)}
                      title="Remover usuário"
                      style={{ width: 32, height: 32, border: '1px solid #E8D5D1', borderRadius: 8, background: '#FFFFFF', color: '#A33B2E', fontSize: 13, cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F7E4E1')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                    >
                      🗑
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 12.5, color: '#9AA6A1', lineHeight: 1.5 }}>
        Usuários inativos não conseguem acessar o portal. Em produção, a senha deve ser gerenciada por fluxo seguro de redefinição — nunca armazenada em texto plano.
      </div>
    </div>
  );
}
