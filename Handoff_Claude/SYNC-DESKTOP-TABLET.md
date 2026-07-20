# Sync Desktop ↔ Tablet — Instruções de implementação

> Contexto: o Portal de Assinatura Veracis (fluxo de guias TopSaúde) já está implementado a partir do handoff em `design_handoff_portal_assinatura/`. Este documento descreve a NOVA funcionalidade validada no protótipo: **pareamento desktop ↔ tablet pelo mesmo login**, para que a recepção inicie o fluxo no desktop e a tela de assinatura abra automaticamente no tablet.

## Objetivo (comportamento final)

1. O tablet fica logado no **mesmo usuário** que o desktop da recepção. Nenhum pareamento manual (sem QR code): a simples existência de duas sessões ativas do mesmo login cria o vínculo.
2. Quando há outro dispositivo conectado no mesmo login, o desktop mostra um selo verde **"● Tablet conectado"** (dot pulsante) no cabeçalho do Início, e o card "Coletar assinatura" muda o texto auxiliar para: *"Tablet conectado neste login — ao clicar, a tela de assinatura abrirá no tablet automaticamente."*
3. Ao clicar **"Passar o tablet ao paciente"** no desktop:
   - O tablet (outra sessão do mesmo login) muda **imediatamente** para a tela de assinatura da guia selecionada (paciente, carteirinha, canvas de assinatura).
   - O desktop mostra um overlay modal: fundo `rgba(10,74,64,0.88)`, cartão branco radius 18px com ícone ✍️ pulsante, título "Aguardando assinatura no tablet…", texto com o nome do paciente e botão "Cancelar e retomar o tablet".
4. Quando o paciente assina no tablet:
   - O tablet mostra "Assinatura registrada!" e volta ao portal normal.
   - O desktop fecha o overlay automaticamente, mostra toast *"Assinatura de {paciente} recebida do tablet ✓"* e o status da guia muda para **Assinado** em todas as sessões.
5. **Cancelamento bidirecional**: "Cancelar e retomar o tablet" (desktop) fecha a tela de assinatura no tablet; "Cancelar" no tablet fecha o overlay do desktop. Toast "Coleta de assinatura cancelada".
6. **Fallback local**: se NÃO houver outro dispositivo conectado (selo "Tablet conectado" ausente), o clique em "Passar o tablet ao paciente" abre o modo de assinatura **na própria tela atual** — vale tanto para desktop quanto para tablet. O tablet é um portal completo — a recepção pode fazer todo o fluxo (pedido, baixar guia, assinar) diretamente nele.

## Backend

### Canal em tempo real
Use **WebSocket (Socket.IO)** — roda bem no Railway num serviço Node. Alternativa aceitável: SSE + POST.

- Autenticar o socket com a mesma sessão/JWT do portal.
- Ao conectar, entrar numa **room por usuário**: `user:{userId}`.
- Manter presença: contar sockets ativos na room; ao mudar (connect/disconnect), emitir `presence` para a room com `{devices: n}`.
- **Só contam como presentes sessões autenticadas e ativas** (aba visível / app em primeiro plano — o cliente só emite heartbeat quando `document.visibilityState === 'visible'` e o usuário está logado; expirar peer sem heartbeat há > 9s). Uma única aba aberta NUNCA deve mostrar "Tablet conectado" — pré-visualizações, iframes ou abas em segundo plano não contam.

### Eventos (room `user:{userId}`, sempre ecoando para os demais sockets, nunca para o emissor)

| Evento | Payload | Efeito nos outros dispositivos |
|---|---|---|
| `sign:request` | `{consultaId}` | Abrir tela de assinatura da guia |
| `sign:done` | `{consultaId, assinaturaPngBase64, hora}` | Fechar overlay/tela, aplicar status assinado |
| `sign:cancel` | `{consultaId}` | Fechar overlay/tela de assinatura |
| `presence` | `{devices}` | Atualizar selo "Tablet conectado" (`devices >= 2`) |

### Persistência
- `sign:done` deve, **no servidor**, salvar a assinatura (PNG base64 → storage/coluna bytea ou arquivo) vinculada à consulta, gravar hora e atualizar o status da guia para `assinado`. Só então retransmitir o evento. A mudança de status NÃO pode depender só do cliente.
- Validar no servidor: consulta existe, pertence à clínica do usuário, status atual = `autorizado`.
- Timeout de segurança: se um `sign:request` não receber `sign:done`/`sign:cancel` em 5 min, emitir `sign:cancel` automático.

## Frontend

### Estado novo
- `devicesOnline` (da presence) → `peerOnline = devicesOnline >= 2`.
- `tabletState: null | 'signing' | 'done' | 'remote'` — `'remote'` = este dispositivo está aguardando assinatura em outro.

### Comportamentos
- **Botão "Passar o tablet ao paciente"** (`startTablet`):
  - `peerOnline` → emitir `sign:request {consultaId}` e setar `tabletState='remote'` (mostra overlay de espera).
  - Senão → `tabletState='signing'` local (comportamento atual).
- **Ao receber `sign:request`**: se logado e no app, setar consulta selecionada = `consultaId`, navegar para o detalhe e `tabletState='signing'` (tela de assinatura em fullscreen, mesmo layout atual).
- **Confirmar assinatura** (`confirmSig`): além do fluxo atual (canvas → PNG, status local), enviar `sign:done` ao servidor.
- **Ao receber `sign:done`**: aplicar assinatura + status `assinado` no estado local; se `tabletState==='remote'`, fechar overlay + toast de recebida.
- **Cancelar** (qualquer lado): emitir `sign:cancel`; ao receber, limpar `tabletState` + toast.
- **Selo "Tablet conectado"**: no header do Início, pill verde (#E3F2E8 fundo, #1D6B3C texto, borda #BFDECB, radius 9px, dot 8px com `animation: pulseDot 1.6s ease infinite` — `@keyframes pulseDot {0%,100%{opacity:1} 50%{opacity:.25}}`), ao lado do box "Última sincronização FeeGow".

### Referência visual
O protótipo `Portal de Assinatura Veracis v2.dc.html` (handoff) contém o markup/estilos exatos do overlay de espera, do selo e da tela de assinatura do tablet — busque por `tabletRemote`, `peerOnline`, `MODO TABLET`. No protótipo o transporte é `BroadcastChannel` (janelas do mesmo navegador) com heartbeat de 3s; em produção substitua pelo WebSocket descrito acima — a lógica de estados é a mesma.

## Critérios de aceite
1. Duas sessões do mesmo login (desktop + tablet) → ambas mostram "Tablet conectado" em ≤ 5s; com apenas UMA sessão aberta o selo nunca aparece.
2. Clique no desktop → tela de assinatura abre no tablet em < 1s; desktop mostra overlay de espera.
3. Assinatura no tablet → desktop fecha overlay, toast, status Assinado persistido no banco (sobrevive a refresh).
4. Cancelamento por qualquer lado limpa os dois em < 1s.
5. Sem segundo dispositivo → assinatura local funciona como antes; fluxo completo executável 100% no tablet.
6. Sockets de usuários diferentes nunca recebem eventos uns dos outros.
