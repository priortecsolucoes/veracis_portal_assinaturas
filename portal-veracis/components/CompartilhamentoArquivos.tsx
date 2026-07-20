'use client';

import { useRef, useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useStore } from '@/lib/store';
import { HISTORY } from '@/lib/mock-data';
import type { SharedFile } from '@/lib/types';

// ---------------------------------------------------------------------------
// Shared style tokens (inline — same approach as the rest of the project)
// ---------------------------------------------------------------------------
const SEL: CSSProperties = {
  width: '100%', padding: '9px 11px',
  border: '1px solid #D8D6CF', borderRadius: 9,
  fontSize: 13, fontFamily: 'inherit',
  background: '#FFFFFF', color: '#22302C',
  cursor: 'pointer', appearance: 'auto',
};

const DATE_INPUT: CSSProperties = {
  width: '100%', padding: '9px 11px',
  border: '1px solid #D8D6CF', borderRadius: 9,
  fontSize: 13, fontFamily: 'inherit',
  background: '#FFFFFF', color: '#22302C',
};

const FILTER_LABEL: CSSProperties = {
  fontSize: 11, fontWeight: 800, color: '#9AA6A1', letterSpacing: '0.05em',
};

const ICON_BTN: CSSProperties = {
  width: 30, height: 30, border: '1px solid #E5E3DD',
  borderRadius: 8, background: '#FFFFFF', color: '#6B7A75',
  fontSize: 13, cursor: 'pointer', flexShrink: 0,
};

// ---------------------------------------------------------------------------

const TABLE_GRID = '1.4fr 2fr 120px 1.3fr 100px';

export default function CompartilhamentoArquivos() {
  const { appointments, sharedFiles, addSharedFile, removeSharedFile, showToast } = useStore();

  // --- filters ---
  const [filterProvider, setFilterProvider]       = useState('');
  const [filterAppointment, setFilterAppointment] = useState('');
  const [filterDateStart, setFilterDateStart]     = useState('');
  const [filterDateEnd, setFilterDateEnd]         = useState('');

  // --- new file post ---
  const [newProvider, setNewProvider]           = useState('');
  const [newAppointmentLabel, setNewAppointmentLabel] = useState('');
  const [newFile, setNewFile] = useState<{ name: string; type: 'pdf' | 'png'; dataUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- preview modal ---
  const [preview, setPreview] = useState<SharedFile | null>(null);

  // RN-18: automatically remove posts older than 30 days on mount
  useEffect(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffIso = cutoff.toISOString().split('T')[0];
    sharedFiles
      .filter((f) => f.postedAt < cutoffIso)
      .forEach((f) => removeSharedFile(f.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- derived data for combos ----
  const todayLabel = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const allAppointments = [
    ...appointments.map((c) => ({
      key: `h-${c.id}`,
      label: `${todayLabel} · ${c.patient} · ${c.specialty}`,
      provider: c.doctor,
    })),
    ...HISTORY.map((c) => ({
      key: `r-${c.id}`,
      label: `${c.date ?? '?'} · ${c.patient} · ${c.specialty}`,
      provider: c.doctor,
    })),
  ];

  // unique providers (from all appointments, for the insert combo)
  const insertProviders = Array.from(
    new Set([...appointments.map((c) => c.doctor), ...HISTORY.map((c) => c.doctor)])
  ).sort();

  // for filters: only providers/appointments that appear in existing posts
  const filterProviders     = Array.from(new Set(sharedFiles.map((f) => f.provider))).sort();
  const filterAppointments  = Array.from(new Set(sharedFiles.map((f) => f.appointmentLabel))).sort();

  // appointments for the insert combo filtered by selected provider
  const insertAppointments = newProvider
    ? allAppointments.filter((c) => c.provider === newProvider)
    : allAppointments;

  // ---- filtered and sorted posts ----
  const filtered = [...sharedFiles]
    .filter((f) => !filterProvider    || f.provider         === filterProvider)
    .filter((f) => !filterAppointment || f.appointmentLabel === filterAppointment)
    .filter((f) => !filterDateStart   || f.postedAt         >= filterDateStart)
    .filter((f) => !filterDateEnd     || f.postedAt         <= filterDateEnd)
    .sort((a, b) => {
      if (a.postedAt !== b.postedAt) return b.postedAt.localeCompare(a.postedAt); // date DESC
      if (a.provider !== b.provider) return a.provider.localeCompare(b.provider);
      return a.appointmentLabel.localeCompare(b.appointmentLabel);
    });

  // ---- handlers ----
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileType: 'pdf' | 'png' = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'png';
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewFile({ name: file.name, type: fileType, dataUrl: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleAdd() {
    if (!newProvider || !newAppointmentLabel || !newFile) {
      showToast('Preencha profissional, consulta e selecione um arquivo');
      return;
    }
    const now = new Date();
    addSharedFile({
      provider: newProvider,
      appointmentLabel: newAppointmentLabel,
      postedAt: now.toISOString().split('T')[0],
      postedAtLabel: now.toLocaleDateString('pt-BR'),
      fileName: newFile.name,
      fileType: newFile.type,
      fileDataUrl: newFile.dataUrl,
    });
    setNewProvider('');
    setNewAppointmentLabel('');
    setNewFile(null);
    showToast('Arquivo postado com sucesso');
  }

  function handleDownload(f: SharedFile) {
    if (!f.fileDataUrl) {
      showToast('Arquivo de demonstração — download não disponível');
      return;
    }
    const a = document.createElement('a');
    a.href = f.fileDataUrl;
    a.download = f.fileName;
    a.click();
  }

  function handleRemove(id: number) {
    removeSharedFile(id);
    if (preview?.id === id) setPreview(null);
    showToast('Postagem removida');
  }

  function clearFilters() {
    setFilterProvider('');
    setFilterAppointment('');
    setFilterDateStart('');
    setFilterDateEnd('');
  }

  const canAdd = !!newProvider && !!newAppointmentLabel && !!newFile;
  const hasFilters = filterProvider || filterAppointment || filterDateStart || filterDateEnd;

  // Split appointment label: "19/07 · Patient · Specialty"
  function splitLabel(label: string) {
    const parts = label.split(' · ');
    return { date: parts[0] ?? '', rest: parts.slice(1).join(' · ') };
  }

  return (
    <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>Compartilhamento de Arquivos</div>
          <div style={{ color: '#6B7A75', fontSize: 14, marginTop: 4 }}>
            Arquivos PDF e PNG compartilhados entre a equipe · removidos automaticamente após 30 dias (RN-18)
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#6B7A75', background: '#FFFFFF', border: '1px solid #E5E3DD', borderRadius: 9, padding: '9px 14px' }}>
          {sharedFiles.length} arquivo{sharedFiles.length !== 1 ? 's' : ''} postado{sharedFiles.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E3DD', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#9AA6A1', letterSpacing: '0.06em', marginBottom: 12 }}>FILTROS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>

          {/* FILTER-01 Provider */}
          <div>
            <div style={{ ...FILTER_LABEL, marginBottom: 5 }}>PROFISSIONAL</div>
            <select value={filterProvider} onChange={(e) => setFilterProvider(e.target.value)} style={SEL}>
              <option value="">Todos</option>
              {filterProviders.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* FILTER-02 Appointment */}
          <div>
            <div style={{ ...FILTER_LABEL, marginBottom: 5 }}>CONSULTA (DATA · PACIENTE · ESPECIALIDADE)</div>
            <select value={filterAppointment} onChange={(e) => setFilterAppointment(e.target.value)} style={SEL}>
              <option value="">Todas</option>
              {filterAppointments.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* FILTER-03 Start date */}
          <div>
            <div style={{ ...FILTER_LABEL, marginBottom: 5 }}>DATA POSTAGEM INÍCIO</div>
            <input type="date" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} style={DATE_INPUT} />
          </div>

          {/* FILTER-04 End date */}
          <div>
            <div style={{ ...FILTER_LABEL, marginBottom: 5 }}>DATA POSTAGEM FIM</div>
            <input type="date" value={filterDateEnd} onChange={(e) => setFilterDateEnd(e.target.value)} style={DATE_INPUT} />
          </div>

          {/* Clear */}
          <button
            onClick={clearFilters}
            disabled={!hasFilters}
            style={{ padding: '9px 16px', border: '1px solid #D8D6CF', borderRadius: 9, background: '#FFFFFF', color: hasFilters ? '#22302C' : '#B9C6C1', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: hasFilters ? 'pointer' : 'default', whiteSpace: 'nowrap', alignSelf: 'flex-end' }}
            onMouseEnter={(e) => { if (hasFilters) e.currentTarget.style.background = '#F3F2ED'; }}
            onMouseLeave={(e) => { if (hasFilters) e.currentTarget.style.background = '#FFFFFF'; }}
          >
            Limpar
          </button>
        </div>
      </div>

      {/* ── Table with insert row ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E3DD', borderRadius: 14, overflow: 'hidden' }}>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: TABLE_GRID, gap: 12, padding: '12px 20px', fontSize: 11, fontWeight: 800, color: '#9AA6A1', letterSpacing: '0.06em', borderBottom: '1px solid #EEEDE8' }}>
          <div>PROFISSIONAL</div>
          <div>CONSULTA · PACIENTE · ESPECIALIDADE</div>
          <div>DATA POSTAGEM</div>
          <div>ARQUIVO</div>
          <div />
        </div>

        {/* ── Insert row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: TABLE_GRID, gap: 10, padding: '13px 20px', alignItems: 'center', background: '#F7FAF9', borderBottom: '2px solid #E5E3DD' }}>

          {/* FIELD-01 Provider */}
          <select
            value={newProvider}
            onChange={(e) => { setNewProvider(e.target.value); setNewAppointmentLabel(''); }}
            style={SEL}
          >
            <option value="">Profissional…</option>
            {insertProviders.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* FIELD-02 Appointment — free text + suggestions */}
          <input
            list="appointments-datalist"
            value={newAppointmentLabel}
            onChange={(e) => setNewAppointmentLabel(e.target.value)}
            placeholder="Consulta ou descrição livre…"
            style={{ ...DATE_INPUT, width: '100%' }}
          />
          <datalist id="appointments-datalist">
            {insertAppointments.map((c) => (
              <option key={c.key} value={c.label} />
            ))}
          </datalist>

          {/* FIELD-03 Date (auto = today) */}
          <div style={{ fontSize: 13, color: '#6B7A75', fontWeight: 700, paddingLeft: 4 }}>
            {new Date().toLocaleDateString('pt-BR')}
          </div>

          {/* FIELD-04 Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Selecionar arquivo PDF ou PNG"
              style={{
                width: '100%', padding: '8px 10px',
                border: `1.5px dashed ${newFile ? '#0E6B5B' : '#C9D6D0'}`,
                borderRadius: 9,
                background: newFile ? '#EAF3F0' : '#FFFFFF',
                color: newFile ? '#0E6B5B' : '#9AA6A1',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', textAlign: 'left',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = newFile ? '#D9EDE6' : '#F3F2ED')}
              onMouseLeave={(e) => (e.currentTarget.style.background = newFile ? '#EAF3F0' : '#FFFFFF')}
            >
              {newFile
                ? `${newFile.type === 'pdf' ? '📄' : '🖼'} ${newFile.name}`
                : '⬆ Selecionar (PDF / PNG)'}
            </button>
          </div>

          {/* FIELD-05 Add button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              title="Adicionar postagem"
              style={{
                padding: '9px 16px', border: 'none', borderRadius: 9,
                background: canAdd ? '#0E6B5B' : '#C5D6D2',
                color: '#FFFFFF', fontFamily: 'inherit', fontSize: 13,
                fontWeight: 800, cursor: canAdd ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { if (canAdd) e.currentTarget.style.background = '#0A4A40'; }}
              onMouseLeave={(e) => { if (canAdd) e.currentTarget.style.background = canAdd ? '#0E6B5B' : '#C5D6D2'; }}
            >
              + Adicionar
            </button>
          </div>
        </div>

        {/* ── Data rows ── */}
        {filtered.length === 0 && (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: '#9AA6A1', fontSize: 14 }}>
            {hasFilters ? 'Nenhuma postagem corresponde aos filtros aplicados.' : 'Nenhuma postagem ainda. Use a linha acima para adicionar.'}
          </div>
        )}

        {filtered.map((f) => {
          const { date, rest } = splitLabel(f.appointmentLabel);
          return (
            <div
              key={f.id}
              style={{ display: 'grid', gridTemplateColumns: TABLE_GRID, gap: 12, padding: '12px 20px', alignItems: 'center', borderBottom: '1px solid #F3F2ED', fontSize: 14 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAF7')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              {/* COL-01 Provider */}
              <div style={{ fontWeight: 700 }}>{f.provider}</div>

              {/* COL-02 Appointment */}
              <div>
                <div style={{ fontWeight: 600 }}>{rest || date}</div>
                {rest && <div style={{ fontSize: 12, color: '#9AA6A1', marginTop: 2 }}>{date}</div>}
              </div>

              {/* COL-03 Posted date */}
              <div style={{ fontSize: 13, color: '#6B7A75', fontWeight: 700 }}>{f.postedAtLabel}</div>

              {/* COL-04 File */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{f.fileType === 'pdf' ? '📄' : '🖼'}</span>
                <span style={{ fontSize: 12.5, color: '#6B7A75', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.fileName}>
                  {f.fileName}
                </span>
              </div>

              {/* COL-05 Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => setPreview(f)}
                  title="Visualizar arquivo"
                  style={ICON_BTN}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#EAF3F0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                >
                  👁
                </button>
                <button
                  onClick={() => handleDownload(f)}
                  title="Baixar arquivo"
                  style={ICON_BTN}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#EAF3F0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                >
                  ⬇
                </button>
                <button
                  onClick={() => handleRemove(f.id)}
                  title="Remover postagem"
                  style={{ ...ICON_BTN, color: '#A33B2E' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F7E4E1')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{ fontSize: 12.5, color: '#9AA6A1', lineHeight: 1.6 }}>
        Formatos aceitos: PDF e PNG · Acesso disponível para todos os perfis (RN-17) · Armazenamento em sessão — avaliar integração com Google Drive ou storage em nuvem para persistência (RN-19).
      </div>

      {/* ── Preview modal ── */}
      {preview && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,74,64,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) setPreview(null); }}
        >
          <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '28px 30px', maxWidth: 780, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 24px 64px rgba(0,0,0,0.32)' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800 }}>
                  {preview.fileType === 'pdf' ? '📄' : '🖼'} {preview.fileName}
                </div>
                <div style={{ fontSize: 13, color: '#6B7A75', marginTop: 5, lineHeight: 1.5 }}>
                  {preview.provider} · {preview.appointmentLabel}<br />
                  <span style={{ fontSize: 12 }}>Postado em {preview.postedAtLabel}</span>
                </div>
              </div>
              <button
                onClick={() => setPreview(null)}
                style={{ width: 34, height: 34, border: '1px solid #D8D6CF', borderRadius: 9, background: '#FFFFFF', cursor: 'pointer', fontSize: 16, color: '#6B7A75', flexShrink: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
              >
                ✕
              </button>
            </div>

            {/* Preview area */}
            <div style={{ flex: 1, minHeight: 300, borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E3DD', background: '#FAFAF7' }}>
              {preview.fileDataUrl ? (
                preview.fileType === 'pdf' ? (
                  <iframe
                    src={preview.fileDataUrl}
                    style={{ width: '100%', height: 480, border: 'none' }}
                    title={preview.fileName}
                  />
                ) : (
                  <img
                    src={preview.fileDataUrl}
                    alt={preview.fileName}
                    style={{ width: '100%', height: 'auto', maxHeight: 480, objectFit: 'contain', display: 'block' }}
                  />
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: '#9AA6A1', textAlign: 'center', padding: 28, gap: 10 }}>
                  <div style={{ fontSize: 44 }}>{preview.fileType === 'pdf' ? '📄' : '🖼'}</div>
                  <div style={{ fontWeight: 700, color: '#22302C', fontSize: 15 }}>{preview.fileName}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    Arquivo de demonstração — pré-visualização não disponível.<br />
                    Em produção, o conteúdo será exibido aqui após o upload.
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => handleDownload(preview)}
                style={{ padding: '10px 20px', border: 'none', borderRadius: 9, background: '#0E6B5B', color: '#FFFFFF', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
              >
                ⬇ Baixar arquivo
              </button>
              <button
                onClick={() => setPreview(null)}
                style={{ padding: '10px 20px', border: '1px solid #D8D6CF', borderRadius: 9, background: '#FFFFFF', color: '#22302C', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
