'use client';

import { useRef, useState } from 'react';
import { useStore } from '@/lib/store';

const INPUT: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  border: '1px solid #D8D6CF', borderRadius: 10,
  fontSize: 14, fontFamily: 'inherit',
  background: '#FFFFFF', color: '#22302C',
  boxSizing: 'border-box',
};

const LABEL: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block',
};

const SECTION: React.CSSProperties = {
  background: '#FFFFFF', border: '1px solid #E5E3DD',
  borderRadius: 14, padding: '24px 28px',
  display: 'flex', flexDirection: 'column', gap: 16,
};

export default function Configuracoes() {
  const { settings, updateSettings, logAction, showToast } = useStore();

  const sigFileInputRef = useRef<HTMLInputElement>(null);

  // Local drafts (only saved on explicit action)
  const [syncInterval, setSyncInterval]     = useState(String(settings.syncIntervalMinutes));
  const [feegowKey, setFeegowKey]           = useState(settings.feegowApiKey);
  const [topsaudeUser, setTopsaudeUser]     = useState(settings.topsaudeUser);
  const [topsaudePass, setTopsaudePass]     = useState(settings.topsaudePassword);
  const [showFeegowKey, setShowFeegowKey]   = useState(false);
  const [showTopsaudePass, setShowTopsaudePass] = useState(false);

  function handleRtSignatureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.png')) {
      showToast('A assinatura do responsável técnico deve ser um arquivo PNG');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateSettings({ rtSignatureDataUrl: dataUrl });
      logAction('Assinatura do responsável técnico atualizada');
      showToast('Assinatura do responsável técnico carregada');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function saveSync() {
    const n = parseInt(syncInterval, 10);
    if (isNaN(n) || n < 1) { showToast('Informe um intervalo válido (mínimo 1 minuto)'); return; }
    updateSettings({ syncIntervalMinutes: n });
    logAction(`Configurações salvas: tempo de sincronização FeeGow alterado para ${n} min`);
    showToast('Intervalo de sincronização salvo');
  }

  function saveIntegrations() {
    updateSettings({ feegowApiKey: feegowKey, topsaudeUser, topsaudePassword: topsaudePass });
    logAction('Configurações de integração (FeeGow / TopSaúde) salvas');
    showToast('Configurações de integração salvas');
  }

  return (
    <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>Configurações do Sistema</div>
          <div style={{ color: '#6B7A75', fontSize: 14, marginTop: 4 }}>
            Parâmetros de integração e configurações globais do portal
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, background: '#EFE6F5', color: '#6B3E8F', border: '1px solid #D4BFE8', borderRadius: 8, padding: '6px 12px' }}>
          🔒 Acesso restrito — faturamento
        </div>
      </div>

      {/* CAMPO-01: Assinatura do Responsável Técnico */}
      <div style={SECTION}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>Assinatura do Responsável Técnico</div>
        <div style={{ color: '#6B7A75', fontSize: 13, lineHeight: 1.5 }}>
          Imagem PNG que será inserida automaticamente no campo de assinatura do RT na guia após o paciente assinar digitalmente.
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          {/* Preview */}
          <div style={{
            width: 260, height: 120, borderRadius: 10,
            border: `2px dashed ${settings.rtSignatureDataUrl ? '#0E6B5B' : '#C9D6D0'}`,
            background: settings.rtSignatureDataUrl ? '#F0F7F5' : '#FAFAF7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {settings.rtSignatureDataUrl ? (
              <img
                src={settings.rtSignatureDataUrl}
                alt="Assinatura do RT"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#9AA6A1', fontSize: 13, padding: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>✍️</div>
                <div>Nenhuma assinatura carregada</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              ref={sigFileInputRef}
              type="file"
              accept=".png"
              onChange={handleRtSignatureUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => sigFileInputRef.current?.click()}
              style={{ padding: '11px 20px', border: '1.5px dashed #0E6B5B', borderRadius: 10, background: '#E7F1EE', color: '#0E6B5B', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#D4EAE2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#E7F1EE')}
            >
              ⬆ Carregar assinatura PNG
            </button>
            {settings.rtSignatureDataUrl && (
              <button
                onClick={() => { updateSettings({ rtSignatureDataUrl: null }); logAction('Assinatura do responsável técnico removida'); showToast('Assinatura removida'); }}
                style={{ padding: '9px 16px', border: '1px solid #E8D5D1', borderRadius: 10, background: '#FFFFFF', color: '#A33B2E', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F7E4E1')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
              >
                Remover assinatura
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CAMPO-02: Tempo de Sincronização FeeGow */}
      <div style={SECTION}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>Sincronização com FeeGow</div>
        <div>
          <label style={LABEL}>Intervalo de sincronização (minutos)</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', maxWidth: 320 }}>
            <input
              type="number"
              min={1}
              max={1440}
              value={syncInterval}
              onChange={(e) => setSyncInterval(e.target.value)}
              style={{ ...INPUT, maxWidth: 120 }}
            />
            <button
              onClick={saveSync}
              style={{ padding: '11px 20px', border: 'none', borderRadius: 10, background: '#0E6B5B', color: '#FFFFFF', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
            >
              Salvar
            </button>
          </div>
          <div style={{ fontSize: 12, color: '#9AA6A1', marginTop: 6 }}>
            Atual: {settings.syncIntervalMinutes} min — próxima sincronização automática na abertura do portal
          </div>
        </div>
      </div>

      {/* CAMPO-03 e 04: Integrações */}
      <div style={SECTION}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>Credenciais de Integração</div>

        {/* FeeGow API Key */}
        <div>
          <label style={LABEL}>Chave de API do FeeGow</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={showFeegowKey ? 'text' : 'password'}
              value={feegowKey}
              onChange={(e) => setFeegowKey(e.target.value)}
              placeholder="Cole a chave de API aqui…"
              style={INPUT}
            />
            <button
              onClick={() => setShowFeegowKey((v) => !v)}
              title={showFeegowKey ? 'Ocultar' : 'Exibir'}
              style={{ width: 44, flexShrink: 0, border: '1px solid #D8D6CF', borderRadius: 10, background: '#FFFFFF', color: '#6B7A75', fontSize: 16, cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
            >
              {showFeegowKey ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {/* TopSaude credentials */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={LABEL}>Usuário TopSaúde</label>
            <input type="text" value={topsaudeUser} onChange={(e) => setTopsaudeUser(e.target.value)} placeholder="Usuário de acesso…" style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>Senha TopSaúde</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type={showTopsaudePass ? 'text' : 'password'}
                value={topsaudePass}
                onChange={(e) => setTopsaudePass(e.target.value)}
                placeholder="Senha de acesso…"
                style={INPUT}
              />
              <button
                onClick={() => setShowTopsaudePass((v) => !v)}
                title={showTopsaudePass ? 'Ocultar' : 'Exibir'}
                style={{ width: 44, flexShrink: 0, border: '1px solid #D8D6CF', borderRadius: 10, background: '#FFFFFF', color: '#6B7A75', fontSize: 16, cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
              >
                {showTopsaudePass ? '🙈' : '👁'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={saveIntegrations}
            style={{ padding: '11px 24px', border: 'none', borderRadius: 10, background: '#0E6B5B', color: '#FFFFFF', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
          >
            Salvar credenciais
          </button>
        </div>

        <div style={{ background: '#FBF0DC', border: '1px solid #E0C97E', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#8A5A12' }}>
          ⚠ Em produção, as credenciais devem ser armazenadas em variáveis de ambiente no servidor (nunca no cliente). Esta tela é para configuração administrativa inicial.
        </div>
      </div>
    </div>
  );
}
