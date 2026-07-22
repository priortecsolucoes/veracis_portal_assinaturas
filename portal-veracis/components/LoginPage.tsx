'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/types';

export default function LoginPage() {
  const { loginRole, setLoginRole, login } = useStore();
  const [showForgotModal, setShowForgotModal] = useState(false);

  const roles: { value: Role; label: string }[] = [
    { value: 'reception', label: 'Recepção' },
    { value: 'billing', label: 'Faturamento' },
  ];

  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', fontFamily:"'Manrope',Helvetica,Arial,sans-serif", color:'#22302C' }}>
      {/* Left panel */}
      <div style={{ background:'#0A4A40', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'56px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'#0E6B5B', display:'flex', alignItems:'center', justifyContent:'center', color:'#DFF1EA', fontWeight:800, fontSize:20 }}>V</div>
          <div style={{ color:'#DFF1EA', fontWeight:800, fontSize:18, letterSpacing:'0.04em' }}>VERACIS <span style={{ fontWeight:500, opacity:0.7 }}>Clínica Integrada</span></div>
        </div>
        <div>
          <div style={{ color:'#FFFFFF', fontSize:40, fontWeight:800, lineHeight:1.15, maxWidth:420 }}>Portal de Assinatura de Guias</div>
          <div style={{ color:'#A8CFC3', fontSize:17, marginTop:16, maxWidth:420, lineHeight:1.5 }}>Pré-autorização, download da guia no TopSaúde e assinatura no tablet — sem impressão nem planilhas.</div>
        </div>
        <div style={{ color:'#6FA396', fontSize:13 }}>FeeGow → Pré-autorização TopSaúde → Assinatura em tablet</div>
      </div>

      {/* Right panel */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div style={{ width:380 }}>
          <div style={{ fontSize:26, fontWeight:800 }}>Entrar</div>
          <div style={{ color:'#6B7A75', fontSize:14, marginTop:6, marginBottom:24 }}>Acesso da recepção e do faturamento</div>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Role selector */}
            <div>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>Perfil de acesso</div>
              <div style={{ display:'flex', gap:8 }}>
                {roles.map((r) => {
                  const active = loginRole === r.value;
                  return (
                    <button
                      key={r.value}
                      onClick={() => setLoginRole(r.value)}
                      style={{
                        flex:1, padding:'11px 8px',
                        border: `1.5px solid ${active ? '#0E6B5B' : '#E5E3DD'}`,
                        borderRadius:10,
                        background: active ? '#E7F1EE' : '#FFFFFF',
                        color: active ? '#0E6B5B' : '#6B7A75',
                        fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer',
                      }}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email */}
            <div>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>E-mail</div>
              <input
                type="email"
                defaultValue={loginRole === 'reception' ? 'recepcao@clinicaveracis.com.br' : 'faturamento@clinicaveracis.com.br'}
                style={{ width:'100%', padding:'13px 14px', border:'1px solid #D8D6CF', borderRadius:10, fontSize:15, fontFamily:'inherit', background:'#FFFFFF', boxSizing:'border-box' }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>Senha</div>
              <input
                type="password"
                defaultValue="••••••••"
                style={{ width:'100%', padding:'13px 14px', border:'1px solid #D8D6CF', borderRadius:10, fontSize:15, fontFamily:'inherit', background:'#FFFFFF', boxSizing:'border-box' }}
              />
            </div>

            <button
              onClick={login}
              style={{ marginTop:8, padding:14, border:'none', borderRadius:10, background:'#0E6B5B', color:'#FFFFFF', fontSize:15, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
            >
              Entrar no portal
            </button>

            <div style={{ textAlign:'center', fontSize:13 }}>
              <button
                onClick={() => setShowForgotModal(true)}
                style={{ background:'none', border:'none', color:'#0E6B5B', fontFamily:'inherit', fontSize:13, cursor:'pointer', textDecoration:'underline', padding:0 }}
              >
                Esqueci minha senha
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgotModal && (
        <div
          style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(10,74,64,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForgotModal(false); }}
        >
          <div style={{ background:'#FFFFFF', borderRadius:18, padding:'36px 40px', maxWidth:440, width:'100%', boxShadow:'0 24px 64px rgba(0,0,0,0.24)' }}>
            <div style={{ fontSize:20, fontWeight:800, marginBottom:12 }}>Recuperação de senha</div>
            <div style={{ fontSize:14, color:'#6B7A75', lineHeight:1.6, marginBottom:24 }}>
              Para redefinir sua senha, entre em contato com o administrador do sistema:<br /><br />
              <strong style={{ color:'#22302C' }}>Priortec Soluções em Tecnologia</strong><br />
              <span>suporte@priortec.com.br</span>
            </div>
            <div style={{ background:'#FBF0DC', border:'1px solid #E0C97E', borderRadius:10, padding:'12px 16px', fontSize:13, color:'#8A5A12', marginBottom:24 }}>
              Em produção, o link de recuperação será enviado automaticamente para o e-mail cadastrado.
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{ width:'100%', padding:'13px 0', border:'none', borderRadius:10, background:'#0E6B5B', color:'#FFFFFF', fontSize:14, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0A4A40')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0E6B5B')}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
