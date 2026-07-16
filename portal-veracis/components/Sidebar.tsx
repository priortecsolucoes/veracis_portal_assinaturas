'use client';

import { useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function Sidebar() {
  const {
    role, tab, setTab,
    logout,
    chat, chatBusy, addChatMessage, setChatBusy,
    showToast,
    consultas,
  } = useStore();

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const userName = role === 'recepcao' ? 'Recepção' : 'Faturamento';
  const userInitials = role === 'recepcao' ? 'RC' : 'FB';
  const userRoleLabel = role === 'recepcao' ? 'Recepção' : 'Faturamento — Beth';

  const navItems = [
    { icon:'⊞', label:'Início', tab:'dashboard' as const },
    { icon:'☰', label:'Relatórios', tab:'relatorio' as const },
    ...(role === 'faturamento' ? [{ icon:'⚙', label:'Tipos de Consulta', tab:'tipos' as const }] : []),
  ];

  const scrollChat = () => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  };

  useEffect(() => { scrollChat(); }, [chat]);

  function buildContext() {
    const hoje = consultas.map(c =>
      [c.hora, c.paciente, c.medico, c.especialidade, c.tipo, c.pedido || 'sem pedido', c.status, c.realizada ? 'realizada' : 'não realizada'].join(';')
    ).join('\n');

    return `Você é a Vera, assistente de dados do Portal de Assinatura de Guias da Clínica Veracis (Conceição do Mato Dentro, MG). Convênio: Unimed.\n\nResponda SEMPRE em português do Brasil, de forma curta e direta (poucas linhas), com números exatos calculados a partir dos dados abaixo. Sem markdown. Se a pergunta fugir dos dados da clínica, diga educadamente que só responde sobre os dados do portal.\n\nFluxo/status: facial = aguardando reconhecimento facial do paciente; autorizado = guia baixada do TopSaúde, disponível para assinatura; assinado = assinatura coletada; cancelado = paciente não compareceu.\n\nCONSULTAS DE HOJE (hora;paciente;profissional;especialidade;tipo;pedido;status;realizada):\n${hoje}`;
  }

  async function sendChat(text: string) {
    const q = text.trim();
    if (!q || chatBusy) return;
    if (chatInputRef.current) chatInputRef.current.value = '';
    addChatMessage({ role: 'user', text: q });
    setChatBusy(true);
    try {
      const messages = [...chat, { role: 'user' as const, text: q }].map(m => ({
        role: m.role,
        content: m.text,
      }));
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: buildContext(), messages }),
      });
      const data = await resp.json();
      addChatMessage({ role: 'assistant', text: data.text || 'Sem resposta.' });
    } catch {
      addChatMessage({ role: 'assistant', text: 'Não consegui consultar a base agora. Tente novamente.' });
    } finally {
      setChatBusy(false);
    }
  }

  return (
    <div style={{ width:304, flexShrink:0, background:'#0A4A40', color:'#DFF1EA', display:'flex', flexDirection:'column', padding:'20px 14px', position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 10px 22px' }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'#0E6B5B', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:17 }}>V</div>
        <div style={{ fontWeight:800, fontSize:15, letterSpacing:'0.03em' }}>VERACIS</div>
      </div>

      {/* Nav */}
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        {navItems.map((nav) => {
          const active = tab === nav.tab;
          return (
            <button
              key={nav.tab}
              onClick={() => setTab(nav.tab)}
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'11px 12px', border:'none', borderRadius:9,
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: active ? '#FFFFFF' : '#A8CFC3',
                fontFamily:'inherit', fontSize:14, fontWeight:700,
                cursor:'pointer', textAlign:'left',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize:16, width:20, textAlign:'center' }}>{nav.icon}</span>
              {nav.label}
            </button>
          );
        })}
      </div>

      {/* Vera chat */}
      <div style={{ marginTop:16, flex:1, minHeight:0, display:'flex', flexDirection:'column', border:'1px solid rgba(255,255,255,0.14)', borderRadius:12, overflow:'hidden', background:'rgba(255,255,255,0.05)' }}>
        <div style={{ padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.12)', fontSize:11, fontWeight:800, letterSpacing:'0.06em', color:'#6FA396' }}>✦ VERA — Assistente IA</div>
        <div ref={chatBoxRef} style={{ flex:1, minHeight:90, overflow:'auto', padding:12, display:'flex', flexDirection:'column', gap:8 }}>
          {chat.map((m, i) => {
            const isAssistant = m.role === 'assistant';
            return (
              <div
                key={i}
                style={{
                  alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                  maxWidth:'92%', padding:'8px 12px',
                  borderRadius: isAssistant ? '10px 10px 10px 3px' : '10px 10px 3px 10px',
                  background: isAssistant ? 'rgba(255,255,255,0.10)' : 'rgba(47,161,132,0.35)',
                  color: isAssistant ? '#DFF1EA' : '#FFFFFF',
                  fontSize:12.5, lineHeight:1.5, whiteSpace:'pre-wrap',
                  border: isAssistant ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
              >
                {m.text}
              </div>
            );
          })}
          {chatBusy && (
            <div style={{ alignSelf:'flex-start', padding:'8px 12px', borderRadius:'10px 10px 10px 3px', background:'rgba(255,255,255,0.10)', color:'#A8CFC3', fontSize:12 }}>
              Consultando a base de dados…
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:7, padding:'10px 11px', borderTop:'1px solid rgba(255,255,255,0.12)' }}>
          <input
            ref={chatInputRef}
            onKeyDown={(e) => { if (e.key === 'Enter') { sendChat(e.currentTarget.value); } }}
            placeholder="Quantas guias faltam assinar?"
            style={{ flex:1, minWidth:0, padding:'9px 11px', border:'1px solid rgba(255,255,255,0.2)', borderRadius:9, fontSize:12.5, fontFamily:'inherit', background:'rgba(255,255,255,0.08)', color:'#FFFFFF', outline:'none' }}
          />
          <button
            onClick={() => { if (chatInputRef.current) sendChat(chatInputRef.current.value); }}
            style={{ width:38, flexShrink:0, border:'none', borderRadius:9, background:'#2FA184', color:'#FFFFFF', fontSize:14, cursor:'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#3BB795')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2FA184')}
          >
            ➤
          </button>
        </div>
      </div>

      {/* User info */}
      <div style={{ marginTop:14, borderTop:'1px solid rgba(255,255,255,0.12)', paddingTop:14, display:'flex', alignItems:'center', gap:10, paddingLeft:10 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'#1C7A66', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13 }}>
          {userInitials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700 }}>{userName}</div>
          <div style={{ fontSize:11, opacity:0.65 }}>{userRoleLabel}</div>
        </div>
        <button
          onClick={logout}
          title="Sair"
          style={{ border:'none', background:'none', color:'#A8CFC3', cursor:'pointer', fontSize:15, padding:6 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#A8CFC3')}
        >
          ⎋
        </button>
      </div>
    </div>
  );
}
