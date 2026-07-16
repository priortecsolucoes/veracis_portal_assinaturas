'use client';

import { useStore } from '@/lib/store';
import { ST } from '@/lib/types';
import StatusPill from './StatusPill';

export default function GuiaDetail() {
  const {
    consultas, selectedId, selectedRep,
    setTab, selectConsulta, selectRep,
    patchConsulta, saveAssinatura, assinaturas,
    setTabletMode,
    novoPacoteQtd, setNovoPacoteQtd,
    showToast, role,
  } = useStore();

  const cRaw = selectedId ? consultas.find(x => x.id === selectedId) : selectedRep;
  if (!cRaw) return null;
  const c = cRaw;

  const isHoje = !!selectedId;
  const ass = assinaturas[c.id];
  const enc = c.enc;
  const encEsgotado = !!(enc && enc.total > 1 && enc.usadas >= enc.total);
  const guiaDisponivel = ['autorizado','assinado','papel'].includes(c.status);

  const primeiroNome = c.paciente.split(' ')[0];

  function goBack() {
    if (isHoje) { selectConsulta(null); setTab('dashboard'); }
    else { selectRep(null); setTab('relatorio'); }
  }

  function handleBaixar() {
    if (!c.pedido) { showToast('Sem nº do pedido — aguarde a pré-autorização (Beth)'); return; }
    if (encEsgotado) { showToast('Pacote de sessões esgotado — anexe um novo encaminhamento'); return; }
    patchConsulta(c.id, { status:'autorizado' });
    showToast('Guia do pedido ' + c.pedido + ' baixada do TopSaúde — disponível para assinatura');
  }

  function handleMarcarPapel() {
    patchConsulta(c.id, { status:'papel' });
    showToast('Assinatura em papel registrada para ' + c.paciente);
  }

  function handleMarcarRealizada() {
    patchConsulta(c.id, { realizada:true });
    showToast('Consulta de ' + c.paciente + ' marcada como realizada');
  }

  function handleCancelar() {
    patchConsulta(c.id, { status:'cancelado' });
    showToast('Não comparecimento registrado para ' + c.paciente);
    goBack();
  }

  function handleAnexarNovoEnc() {
    if (!enc) return;
    patchConsulta(c.id, { enc:{ ...enc, usadas:0, total:novoPacoteQtd } });
    showToast('Novo pacote de ' + novoPacoteQtd + ' sessões criado para ' + c.paciente);
  }

  const podeBaixar = c.status === 'facial' && !!c.pedido && !encEsgotado && isHoje;
  const aguardaPedido = c.status === 'facial' && !c.pedido && isHoje;
  const podeAssinar = c.status === 'autorizado' && isHoje;
  const temAssinatura = !!(ass) || c.status === 'papel';
  const podePresenca = (c.status === 'assinado' || c.status === 'papel') && isHoje;
  const podeRealizada = podePresenca && !c.realizada;
  const podeNoShow = podePresenca && !c.realizada;

  const encPct = enc && enc.total > 0
    ? Math.round((enc.usadas / enc.total) * 100) + '%'
    : '0%';
  const encColor = encEsgotado ? '#A33B2E' : (enc && enc.usadas / enc.total > 0.8 ? '#C9A24B' : '#0E6B5B');

  return (
    <div style={{ padding:'28px 36px', display:'flex', flexDirection:'column', gap:20, minHeight:'100vh' }}>
      {/* Back + title */}
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <button
          onClick={goBack}
          style={{ width:38, height:38, border:'1px solid #D8D6CF', borderRadius:10, background:'#FFFFFF', cursor:'pointer', fontSize:16, color:'#6B7A75' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F2ED')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
        >
          ←
        </button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:800 }}>Guia de {c.tipo} — {c.paciente}</div>
          <div style={{ color:'#6B7A75', fontSize:13, marginTop:2 }}>{c.medico} · {c.especialidade} · {c.hora}</div>
        </div>
        {c.realizada && (
          <span style={{ padding:'6px 14px', borderRadius:999, background:'#E3F2E8', color:'#1D6B3C', fontSize:13, fontWeight:800 }}>✓ Consulta realizada</span>
        )}
        <StatusPill status={c.status} />
      </div>

      {/* Two-column layout */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 350px', gap:20, flex:1, minHeight:0 }}>
        {/* Left: document panel */}
        <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, overflow:'hidden', display:'flex', flexDirection:'column', minHeight:400 }}>
          <div style={{ padding:'12px 18px', borderBottom:'1px solid #EEEDE8', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:13, fontWeight:800, color:'#6B7A75' }}>DOCUMENTO</div>
            <div style={{ fontSize:12, color:'#9AA6A1' }}>Unimed / TopSaúde</div>
          </div>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'repeating-linear-gradient(45deg,#F3F2ED,#F3F2ED 14px,#EEEDE8 14px,#EEEDE8 28px)', padding:30 }}>
            <div style={{ textAlign:'center', maxWidth:380, background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, padding:28 }}>
              <div style={{ fontSize:30 }}>⤓</div>
              <div style={{ fontSize:16, fontWeight:800, marginTop:8 }}>
                {guiaDisponivel ? 'Guia disponível' : 'Guia ainda não disponível'}
              </div>
              <div style={{ fontSize:13.5, color:'#6B7A75', marginTop:8, lineHeight:1.55 }}>
                {guiaDisponivel
                  ? 'Em produção, a guia do TopSaúde será exibida aqui como imagem ou PDF após o download.'
                  : c.status === 'facial'
                    ? c.pedido
                      ? 'Guia ficará disponível após o reconhecimento facial do paciente no sistema do TopSaúde.'
                      : 'Aguardando nº do pedido de pré-autorização para baixar a guia.'
                    : 'Guia cancelada ou não disponível.'}
              </div>
              {ass && (
                <div style={{ marginTop:16, padding:'10px 14px', background:'#E3F2E8', borderRadius:10, fontSize:13, color:'#1D6B3C', fontWeight:700 }}>
                  ✓ Assinatura coletada e anexada
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: action panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:14, overflowY:'auto' }}>
          {/* Dados do atendimento */}
          <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, padding:'18px 20px' }}>
            <div style={{ fontSize:13, fontWeight:800, color:'#6B7A75', marginBottom:12 }}>DADOS DO ATENDIMENTO</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, fontSize:14 }}>
              {[
                ['Paciente',    c.paciente],
                ['Carteirinha', c.carteira],
                ['Nº do pedido', c.pedido || '—'],
                ['Tipo de guia', c.tipo],
              ].map(([label, value]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', gap:10 }}>
                  <span style={{ color:'#9AA6A1' }}>{label}</span>
                  <span style={{ fontWeight:700, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Encaminhamento */}
          {enc && (
            <div style={{ background:'#FFFFFF', border:`1px solid ${encEsgotado ? '#E8D5D1' : '#E5E3DD'}`, borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#6B7A75', marginBottom:10 }}>ENCAMINHAMENTO (PEDIDO MÉDICO)</div>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'#FAFAF7', border:'1px dashed #D8D6CF', borderRadius:10, padding:'10px 12px' }}>
                <span style={{ fontSize:16 }}>📎</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{enc.arquivo}</div>
                  <div style={{ fontSize:11.5, color:'#9AA6A1' }}>anexado uma vez · vale para todo o pacote</div>
                </div>
              </div>

              {enc.total > 1 && (
                <div style={{ marginTop:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:700, marginBottom:6 }}>
                    <span style={{ color:'#6B7A75' }}>Pacote de sessões</span>
                    <span style={{ color:encColor }}>{enc.usadas} de {enc.total} usadas</span>
                  </div>
                  <div style={{ height:8, borderRadius:999, background:'#EEEDE8', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:encPct, background:encColor, borderRadius:999 }} />
                  </div>
                </div>
              )}

              {encEsgotado && isHoje && (
                <>
                  <div style={{ marginTop:12, background:'#F7E4E1', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#A33B2E', fontWeight:700, lineHeight:1.45 }}>
                    Pacote esgotado — é necessário anexar um novo encaminhamento para autorizar novas sessões.
                  </div>
                  <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:10 }}>
                    <label style={{ fontSize:13, fontWeight:700, color:'#6B7A75' }}>Sessões do novo pacote</label>
                    <input
                      type="number" min={1}
                      value={novoPacoteQtd}
                      onChange={(e) => setNovoPacoteQtd(Number(e.target.value))}
                      style={{ width:72, padding:'9px 10px', border:'1px solid #D8D6CF', borderRadius:9, fontSize:13, fontFamily:'inherit', fontWeight:700, textAlign:'center' }}
                    />
                  </div>
                  <button
                    onClick={handleAnexarNovoEnc}
                    style={{ marginTop:10, width:'100%', padding:11, border:'1.5px dashed #A33B2E', borderRadius:10, background:'none', color:'#A33B2E', fontFamily:'inherit', fontSize:13, fontWeight:800, cursor:'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F7E4E1')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    📎 Anexar novo encaminhamento
                  </button>
                </>
              )}
            </div>
          )}

          {/* Baixar guia */}
          {podeBaixar && (
            <div style={{ background:'#0A4A40', borderRadius:14, padding:'18px 20px', color:'#DFF1EA' }}>
              <div style={{ fontSize:15, fontWeight:800, color:'#FFFFFF' }}>Baixar guia do TopSaúde</div>
              <div style={{ fontSize:13, lineHeight:1.5, marginTop:6, opacity:0.8 }}>
                Confirme que o paciente realizou o reconhecimento facial e clique para baixar a guia.
              </div>
              <button
                onClick={handleBaixar}
                style={{ marginTop:14, width:'100%', padding:13, border:'none', borderRadius:10, background:'#1E6EA7', color:'#FFFFFF', fontFamily:'inherit', fontSize:14, fontWeight:800, cursor:'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#175A8A')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#1E6EA7')}
              >
                Baixar guia — pedido {c.pedido} ↓
              </button>
            </div>
          )}

          {/* Aguarda pedido */}
          {aguardaPedido && (
            <div style={{ background:'#FBF0DC', borderRadius:14, padding:'16px 18px', fontSize:13, color:'#8A5A12', fontWeight:700, lineHeight:1.5 }}>
              Aguardando nº do pedido da pré-autorização (time de autorização — Beth). Sem esse número não é possível baixar a guia.
            </div>
          )}

          {/* Coletar assinatura */}
          {podeAssinar && !temAssinatura && (
            <div style={{ background:'#0A4A40', borderRadius:14, padding:'18px 20px', color:'#DFF1EA' }}>
              <div style={{ fontSize:15, fontWeight:800, color:'#FFFFFF' }}>Coletar assinatura</div>
              <div style={{ fontSize:13, lineHeight:1.5, marginTop:6, opacity:0.8 }}>Confira os dados e entregue o tablet ao paciente. A tela entrará no modo de assinatura.</div>
              <button
                onClick={() => setTabletMode('signing')}
                style={{ marginTop:14, width:'100%', padding:13, border:'none', borderRadius:10, background:'#2FA184', color:'#FFFFFF', fontFamily:'inherit', fontSize:14, fontWeight:800, cursor:'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#3BB795')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#2FA184')}
              >
                Passar tablet ao paciente →
              </button>
              <button
                onClick={handleMarcarPapel}
                style={{ marginTop:10, width:'100%', padding:10, border:'1px solid rgba(255,255,255,0.25)', borderRadius:10, background:'none', color:'#A8CFC3', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                Assinada em papel (exceção)
              </button>
            </div>
          )}

          {/* Assinatura coletada */}
          {temAssinatura && (
            <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#6B7A75', marginBottom:10 }}>ASSINATURA COLETADA</div>
              {ass ? (
                <img src={ass} alt="Assinatura" style={{ width:'100%', borderRadius:8, border:'1px solid #E5E3DD' }} />
              ) : (
                <div style={{ padding:'14px', background:'#E3F2E8', borderRadius:8, fontSize:13, color:'#1D6B3C', fontWeight:700, textAlign:'center' }}>
                  ✓ Assinada em papel
                </div>
              )}
              <div style={{ fontSize:12, color:'#9AA6A1', marginTop:8 }}>Coletada hoje · anexada à guia</div>
            </div>
          )}

          {/* Presença e baixa */}
          {podePresenca && (
            <div style={{ background:'#FFFFFF', border:'1px solid #E5E3DD', borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#6B7A75', marginBottom:6 }}>PRESENÇA E BAIXA</div>
              <div style={{ fontSize:12.5, color:'#9AA6A1', lineHeight:1.5, marginBottom:12 }}>
                Assinatura e realização da consulta são eventos independentes — o faturamento depende dos dois registros.
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {podeRealizada && (
                  <button
                    onClick={handleMarcarRealizada}
                    style={{ width:'100%', padding:11, border:'1px solid #BFDCC9', borderRadius:10, background:'#F2F9F4', color:'#1D6B3C', fontFamily:'inherit', fontSize:13, fontWeight:800, cursor:'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#E3F2E8')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#F2F9F4')}
                  >
                    ✓ Marcar consulta como realizada
                  </button>
                )}
                {podeNoShow && (
                  <button
                    onClick={handleCancelar}
                    style={{ width:'100%', padding:11, border:'1px solid #E8D5D1', borderRadius:10, background:'#FFFFFF', color:'#A33B2E', fontFamily:'inherit', fontSize:13, fontWeight:800, cursor:'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F7E4E1')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  >
                    ✕ Não compareceu — cancelar pré-autorização
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
