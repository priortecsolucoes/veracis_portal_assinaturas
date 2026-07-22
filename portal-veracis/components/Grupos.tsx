'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { MENU_TABS } from '@/lib/types';
import type { Group, Tab } from '@/lib/types';

const INPUT: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: '1px solid #D8D6CF', borderRadius: 9,
  fontSize: 13, fontFamily: 'inherit',
  background: '#FFFFFF', color: '#22302C',
  boxSizing: 'border-box',
};

const SECTION: React.CSSProperties = {
  background: '#FFFFFF', border: '1px solid #E5E3DD',
  borderRadius: 14, padding: '24px 28px',
  display: 'flex', flexDirection: 'column', gap: 16,
};

function TabCheckboxes({ value, onChange }: { value: Tab[]; onChange: (tabs: Tab[]) => void }) {
  function toggle(tab: Tab) {
    onChange(value.includes(tab) ? value.filter((t) => t !== tab) : [...value, tab]);
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {MENU_TABS.map(({ tab, label, icon }) => {
        const checked = value.includes(tab);
        return (
          <label
            key={tab}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 9, cursor: 'pointer',
              border: `1.5px solid ${checked ? '#0E6B5B' : '#D8D6CF'}`,
              background: checked ? '#E7F1EE' : '#FFFFFF',
              color: checked ? '#0E6B5B' : '#6B7A75',
              fontSize: 13, fontWeight: 700, userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(tab)}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: 14 }}>{icon}</span>
            {label}
          </label>
        );
      })}
    </div>
  );
}

export default function Grupos() {
  const { groups, addGroup, updateGroup, removeGroup, logAction, showToast } = useStore();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Group>>({});

  const [newName, setNewName]             = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTabs, setNewTabs]             = useState<Tab[]>(['dashboard']);

  function startEdit(g: Group) {
    setEditingId(g.id);
    setEditDraft({ name: g.name, description: g.description, allowedTabs: [...g.allowedTabs] });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft({});
  }

  function saveEdit(id: number) {
    if (!editDraft.name?.trim()) { showToast('O nome do grupo é obrigatório'); return; }
    updateGroup(id, editDraft);
    logAction(`Grupo de acesso editado: ${editDraft.name}`);
    showToast('Grupo atualizado com sucesso');
    cancelEdit();
  }

  function handleAdd() {
    if (!newName.trim()) { showToast('O nome do grupo é obrigatório'); return; }
    addGroup({ name: newName.trim(), description: newDescription.trim(), allowedTabs: newTabs });
    logAction(`Grupo de acesso criado: ${newName.trim()}`);
    showToast(`Grupo "${newName.trim()}" criado com sucesso`);
    setNewName(''); setNewDescription(''); setNewTabs(['dashboard']);
  }

  function handleRemove(g: Group) {
    removeGroup(g.id);
    logAction(`Grupo de acesso removido: ${g.name}`);
    showToast(`Grupo "${g.name}" removido`);
  }

  return (
    <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>Grupos de Acesso</div>
          <div style={{ color: '#6B7A75', fontSize: 14, marginTop: 4 }}>
            Defina quais telas cada grupo de usuários pode acessar
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, background: '#EFE6F5', color: '#6B3E8F', border: '1px solid #D4BFE8', borderRadius: 8, padding: '6px 12px' }}>
          🔒 Acesso restrito — faturamento
        </div>
      </div>

      {/* New group form */}
      <div style={SECTION}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>Novo Grupo</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Nome do grupo</div>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex.: Recepção, Faturamento…" style={INPUT} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Descrição (opcional)</div>
            <input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Descreva as responsabilidades deste grupo…" style={INPUT} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Telas permitidas</div>
          <TabCheckboxes value={newTabs} onChange={setNewTabs} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleAdd}
            style={{ padding: '11px 24px', border: 'none', borderRadius: 10, background: '#0E6B5B', color: '#FFFFFF', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
          >
            + Criar grupo
          </button>
        </div>
      </div>

      {/* Existing groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {groups.map((g) => {
          const isEditing = editingId === g.id;
          return (
            <div key={g.id} style={{ ...SECTION, gap: 14 }}>
              {isEditing ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Nome do grupo</div>
                      <input
                        value={editDraft.name ?? ''}
                        onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                        style={{ ...INPUT, borderColor: '#0E6B5B' }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Descrição</div>
                      <input
                        value={editDraft.description ?? ''}
                        onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                        style={INPUT}
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Telas permitidas</div>
                    <TabCheckboxes
                      value={editDraft.allowedTabs ?? []}
                      onChange={(tabs) => setEditDraft((d) => ({ ...d, allowedTabs: tabs }))}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      onClick={cancelEdit}
                      style={{ padding: '9px 18px', border: '1px solid #D8D6CF', borderRadius: 9, background: '#FFFFFF', color: '#6B7A75', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveEdit(g.id)}
                      style={{ padding: '9px 20px', border: 'none', borderRadius: 9, background: '#0E6B5B', color: '#FFFFFF', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
                    >
                      Salvar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{g.name}</div>
                      {g.description && (
                        <div style={{ fontSize: 13, color: '#6B7A75', marginTop: 3 }}>{g.description}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => startEdit(g)}
                        title="Editar grupo"
                        style={{ width: 32, height: 32, border: '1px solid #D8D6CF', borderRadius: 8, background: '#FFFFFF', color: '#6B7A75', fontSize: 14, cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#EAF3F0')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleRemove(g)}
                        title="Remover grupo"
                        style={{ width: 32, height: 32, border: '1px solid #E8D5D1', borderRadius: 8, background: '#FFFFFF', color: '#A33B2E', fontSize: 13, cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#F7E4E1')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#9AA6A1', marginBottom: 8, letterSpacing: '0.05em' }}>TELAS PERMITIDAS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {MENU_TABS.map(({ tab, label, icon }) => {
                        const allowed = g.allowedTabs.includes(tab);
                        return (
                          <span
                            key={tab}
                            style={{
                              padding: '5px 11px', borderRadius: 9, fontSize: 12, fontWeight: 700,
                              background: allowed ? '#E7F1EE' : '#F3F2ED',
                              color: allowed ? '#0E6B5B' : '#B9C6C1',
                              border: `1px solid ${allowed ? '#BFDECB' : '#E5E3DD'}`,
                              display: 'flex', alignItems: 'center', gap: 5,
                            }}
                          >
                            <span style={{ fontSize: 13 }}>{icon}</span>
                            {label}
                            {!allowed && <span style={{ fontSize: 10, opacity: 0.7 }}>✕</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
