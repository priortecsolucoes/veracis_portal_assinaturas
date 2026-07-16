# Handoff: Portal de Assinatura Veracis

## Overview
Portal web interno da clínica Veracis para gestão do fluxo de guias TopSaúde: a recepção acompanha a agenda do dia importada do FeeGow, registra o nº do pedido da pré-autorização, baixa a guia após o reconhecimento facial do paciente, coleta a assinatura digital no tablet e controla pacotes de sessões (terapias). O perfil Faturamento vê relatórios com valores e mantém a tabela de Tipos de Consulta (CBO/TUS/valor). Há uma assistente de IA ("Vera") que responde perguntas sobre os dados da clínica.

## About the Design Files
Os arquivos deste pacote são **referências de design criadas em HTML** — protótipos que mostram aparência e comportamento pretendidos, **não código de produção para copiar diretamente**. A tarefa é **recriar estas telas no ambiente do codebase de destino** (React, Vue, etc.) usando seus padrões e bibliotecas existentes — ou, se ainda não existe codebase, escolher o framework mais adequado (sugestão: React + backend com autenticação por perfil) e implementar lá.

`Portal de Assinatura Veracis v2.dc.html` é a versão final e canônica. `Portal de Assinatura Veracis.dc.html` é a v1 (histórico). `support.js` é apenas runtime do protótipo — ignore no desenvolvimento.

## Fidelity
**High-fidelity (hifi).** Cores, tipografia, espaçamentos, estados e microcopy são finais. Recriar pixel-perfect com as bibliotecas do codebase.

## Perfis de usuário
- **Recepção**: agenda do dia, detalhes da guia, ações (pedido, baixar guia, assinar, cancelar).
- **Faturamento**: tudo da recepção + relatórios com coluna VALOR + tela "Tipos de Consulta" editável.
Um seletor de perfil no protótipo simula o login; em produção deve vir da autenticação.

## Screens / Views

### 1. Agenda de Hoje (home)
- **Propósito**: fila de trabalho da recepção — consultas do dia importadas do FeeGow.
- **Layout**: cards de resumo no topo (5 cards: Consultas de hoje, Pend. reconhec. facial, Autorizadas, Assinadas, Realizadas), filtros em pills (Todas / A baixar guia / P/ assinar / Concluídas), tabela em CSS grid `58px 1.25fr 1.1fr 118px 0.8fr 1.2fr 86px 168px` com colunas HORA, PACIENTE, PROFISSIONAL, Nº PEDIDO, GUIA, STATUS, REALIZADA, ações.
- **Coluna Nº PEDIDO**: se tem pedido → texto tabular bold 13px; se não tem e não cancelada → `<input placeholder="Digitar nº">` (salva no Enter ou blur, qualquer perfil); se cancelada → pill "aguarda pedido" (#FBF0DC / #B0873A).
- **Coluna GUIA**: tipo (Consulta/Terapia/Exame) e, para pacotes, contador "N de M" (verde #0E6B5B; vermelho #A33B2E quando esgotado).
- **Ações por linha** (flex, gap 6px, alinhado à direita):
  - Botão ícone 👁 (32×32, borda #D8D6CF, radius 8px) — abre detalhes, presente em TODAS as linhas.
  - "Baixar guia ↓" — azul #1E6EA7 (hover #175A8A), visível quando status = facial, com pedido e pacote não esgotado. Largura fixa `flex:0 0 160px`.
  - "Coletar assinatura" — verde #0E6B5B (hover #0A4A40), visível quando status = autorizado. Mesma largura fixa 160px.
  - Botão ✕ cancelar — visível quando não assinada/cancelada e não realizada.
- Linhas canceladas com opacity 0.55.

### 2. Detalhe da Guia
- **Propósito**: ver dados da guia, encaminhamento e executar ações.
- Cartões: dados (Paciente, Carteirinha, Nº do pedido, Tipo de guia); ENCAMINHAMENTO (PEDIDO MÉDICO) com arquivo anexado (chip com 📎, fundo #FAFAF7, borda tracejada #D8D6CF) e progresso do pacote.
- **Pacote esgotado**: aviso + campo "Sessões do novo pacote" (default 1) + botão anexar novo encaminhamento. O novo pacote nasce com a quantidade informada e zera as sessões usadas.
- Painel "Baixar guia do TopSaúde" (fundo escuro, botão azul) quando aplicável; aviso âmbar "Aguardando nº do pedido…" quando falta pedido.

### 3. Relatórios / Histórico (~40 dias)
- Grid com DATA, PACIENTE, PROFISSIONAL, Nº PEDIDO, GUIA, STATUS, REALIZADA (+ VALOR alinhado à direita só para Faturamento). Botão 👁 abre detalhe de qualquer registro histórico.

### 4. Tipos de Consulta (só Faturamento)
- Grid `1.6fr 1fr 1fr 120px 88px`: TIPO DE CONSULTA, CÓDIGO CBO, CÓDIGO TUS, VALOR, ações.
- Linha de adição no topo (fundo #FAFAF7).
- Por linha: botão ✎ (hover #EAF3F0) entra em modo edição inline — inputs para nome/CBO/TUS/valor, ✓ verde salva (toast "Tipo de consulta atualizado"), ✕ cancela; botão 🗑 (hover #F7E4E1) remove.

### 5. Assistente Vera (chat)
- Chat flutuante; responde em pt-BR, curto, com números exatos calculados dos dados (agenda de hoje + histórico). Primeira mensagem: "✦ Olá! Sou a Vera! Pergunte qualquer informação sobre seu negócio que te respondo!". Em produção: LLM com contexto montado a partir do banco (ver `buildContext()` no protótipo).

## Máquina de estados da guia
`facial → autorizado → assinado` (+ `papel` = assinada em papel; `cancelado` terminal; `realizada` é flag independente do status).
- **Pend. reconhec. facial** (#FBF0DC / #8A5A12): aguardando presença do paciente. Baixar guia habilitado se houver pedido e pacote não esgotado.
- **Autorizado** (#DDEEF9 / #1E6EA7): guia baixada do TopSaúde, pronta para assinar.
- **Assinado** (#E3F2E8 / #1D6B3C): assinatura coletada no tablet.
- Regras: salvar pedido mantém/coloca status facial; baixar guia exige pedido (toast de erro "Sem nº do pedido — aguarde a pré-autorização (Beth)") e pacote válido (toast "Pacote de sessões esgotado — anexe um novo encaminhamento"); cancelar registra não-comparecimento.

## Interactions & Behavior
- Toasts de confirmação para toda ação (vincular pedido, baixar guia, salvar tipo, cancelar).
- Inputs de pedido: salvar no Enter e no blur; ignorar vazio.
- Hovers: linhas da tabela #FAFAF7; botões conforme cores acima.
- Sem navegação por URL no protótipo — tabs em estado; em produção usar rotas.

## State Management
- Lista de consultas do dia (importada do FeeGow) com: id, hora, paciente, carteira, médico, especialidade, tipo, exigeFacial, pedido, status, realizada, enc {arquivo, usadas, total}.
- Tabela de tipos: {id, nome, cbo, tus, valor}.
- Filtro ativo, tab ativa, registro selecionado, perfil do usuário, id da linha em edição (tipos), rascunho de edição.

## Design Tokens
- **Primária (verde)**: #0E6B5B, hover #0A4A40; tint #E7F1EE / #EAF3F0
- **Ação secundária (azul)**: #1E6EA7, hover #175A8A; tint #DDEEF9
- **Alerta/pendente (âmbar)**: fundo #FBF0DC, texto #8A5A12 / #B0873A
- **Erro/esgotado**: #A33B2E; hover destrutivo #F7E4E1
- **Sucesso**: fundo #E3F2E8, texto #1D6B3C
- **Neutros**: texto #22302C, secundário #6B7A75, terciário #9AA6A1 / #5F6B66; fundos #FAFAF7, #F3F2ED, #EEEDE9; bordas #E5E3DD, #D8D6CF, #EEEDE8
- **Tipografia**: títulos de coluna 11px/800 letter-spacing 0.06em caps; corpo 13–14px; labels 12–13px/600–800; números com `font-variant-numeric: tabular-nums`
- **Raios**: botões 8–10px, cartões 14px, pills 999px
- **Botões de ação da tabela**: 160px fixos; botões-ícone 30–32px quadrados

## Screenshots
Em `screenshots/`: `01-login.png`, `02-inicio-agenda.png` (cards de resumo do Início), `03-detalhe-guia.png`, `04-relatorios.png` (perfil Faturamento), `05-tipos-consulta.png`. São referência visual rápida; o HTML é a fonte da verdade.

## Deploy (Railway)
O portal será hospedado no Railway:
- Estruturar como app web com build padrão detectável (ex.: Next.js/Vite + Node) — Railway usa Nixpacks/Railpack e detecta o framework automaticamente; basta o `package.json` com scripts `build` e `start`.
- Servidor deve escutar em `0.0.0.0` na porta da variável `PORT` fornecida pelo Railway.
- Banco: provisionar PostgreSQL como serviço Railway; ler credenciais de `DATABASE_URL`.
- Segredos via variáveis de ambiente do Railway: chave da API do LLM da assistente Vera, credenciais de integração FeeGow/TopSaúde, secret de sessão/JWT.
- Autenticação real por perfil (Recepção × Faturamento) — o seletor de perfil do protótipo é só simulação.
- A chamada ao LLM da Vera deve ser feita no backend (nunca expor a chave no cliente).

## Assets
Nenhum asset externo — ícones são caracteres Unicode/emoji (👁 ✎ 🗑 ✓ ✕ 📎 ⤓ ✍️ 🩺 📅 👤 ✦). Em produção, substituir por biblioteca de ícones do codebase.

## Files
- `Portal de Assinatura Veracis v2.dc.html` — design final (todas as telas, lógica de estados e dados de exemplo)
- `Portal de Assinatura Veracis.dc.html` — v1, apenas histórico
- `support.js` — runtime do protótipo, ignorar
