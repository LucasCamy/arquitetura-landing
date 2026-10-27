# DESIGN.md — Moura Arquitetura e Interiores

Arquétipo **ARQ-B: Editorial Orgânico & Tátil** (*Warm Linen & Contrast Gallery*). A página se comporta como uma revista de arquitetura impressa em papel de linho: serifada leve com palavras-chave em itálico, fotografia generosa, muito respiro, materiais que se pode quase tocar. O único capítulo escuro é a galeria de obras, para que as casas iluminadas saltem.

## Missão visual

Fazer uma família sentir, antes de qualquer argumento, que esta arquiteta entende como uma casa envelhece e como a luz entra nela. A narrativa vai do sonho (fotografia em tela cheia) ao método (croqui, materiais, etapas) e termina numa conversa.

## Personalidade e público

- Calma, autoral, precisa sem ser técnica demais. Nunca corporativa.
- Público: famílias de alta renda em São Paulo construindo ou reformando a casa principal (decisão longa, emocional, com cônjuges e às vezes construtora envolvidos); compradores de apartamentos para interiores completos.

## Princípios

1. **Papel e fotografia primeiro.** Fundo de linho, imagem grande, texto em coluna estreita.
2. **Itálico como ênfase única.** Cada título tem uma palavra-chave em itálico; nada de negrito em títulos.
3. **Tátil.** Amostras de material, croqui a lápis e papel creme dão textura ao digital.
4. **Um capítulo escuro.** Só a galeria de obras muda para carvão.
5. **Movimento contemplativo.** Scroll suave, transições longas, nada que pisque.

## Paleta (`src/styles/tokens.css`)

| Token | Hex | Uso |
|---|---|---|
| `--linen` | `#F2EFE9` | fundo principal (linho/travertino) |
| `--sand` | `#E8E2D7` | superfície secundária (cards, faixa técnica, campos) |
| `--ink` | `#1C1B18` | texto principal, botões pílula |
| `--ink-2` | `#6E6960` | texto secundário sobre linho |
| `--ink-2-deep` | `#5C574F` | texto secundário sobre areia |
| `--clay` | `#B85D3B` | acento: itálicos grandes, fios, pontos, marcador da régua |
| `--clay-ink` | `#9A4A2C` | acento em texto pequeno sobre claro |
| `--night` | `#191815` | fundo exclusivo do capítulo Projetos |
| `--night-2` | `#A39E94` | texto secundário no escuro |
| `--clay-glow` | `#D98A69` | acento em texto pequeno no escuro |
| `--line` | `rgba(28,27,24,0.14)` | fios sobre claro |
| `--line-night` | `rgba(242,239,233,0.16)` | fios sobre escuro |
| `--ok` / `--error` | `#3F6B4A` / `#A3392B` | estados (sempre com ícone + texto) |

### Contraste calculado (WCAG 2.x)

| Texto | Fundo | Razão | Uso permitido |
|---|---|---|---|
| ink | linen | 15,1:1 | qualquer |
| ink | sand | 13,4:1 | qualquer |
| ink-2 | linen | 4,7:1 | texto normal |
| ink-2 | sand | 4,2:1 | **não usar** → `ink-2-deep` (5,6:1) |
| clay | linen | 3,9:1 | só texto grande (≥ 24 px) e elementos gráficos |
| clay-ink | linen / sand | 5,4:1 / 4,8:1 | texto pequeno |
| linen | night | 15,5:1 | qualquer |
| night-2 | night | 6,6:1 | texto normal |
| clay-glow | night | 6,5:1 | texto pequeno |
| linen | ink (pílula) | 15,1:1 | botões |
| ok / error | linen | 6,1:1 / 6,4:1 | mensagens |
| linen sobre foto | scrim ink 0→70 % | ≥ 7:1 na área do texto | hero |

## Tipografia

- **Display**: Newsreader Variable (OFL), 300/400, eixo óptico; itálico real para palavras-chave. Acentos (é, ã, ç, õ) conferidos em 300 e 300 itálico no navegador.
- **Texto**: Hanken Grotesk Variable (OFL).
- **Dados**: IBM Plex Mono 400/500 (OFL), `tabular-nums`, caixa alta com tracking para fichas (`620 M²`, `2024`) e régua.

| Papel | Tamanho | Linha |
|---|---|---|
| Hero | `clamp(2.6rem, 6.4vw, 6.25rem)`, peso 300 | 1.02 |
| Título de seção | `clamp(2.1rem, 4.6vw, 4.25rem)`, peso 300 | 1.05 |
| Manifesto | `clamp(1.7rem, 3vw, 2.9rem)`, peso 300 | 1.18 |
| Corpo | `1rem → 1.0625rem` | 1.65 |
| Meta (mono) | `0.72rem`, tracking 0.12em | 1.4 |

## Espaçamento, raios, sombras

- Base 4 px; seções `py-28 → py-44`. Gutter 20 px (móvel), 40 px (≥ 768), 64 px (≥ 1280) e 96 px à esquerda no desktop para a régua.
- Raios: **pílula** (999 px) em botões e selos; **2 px** em fotografias e amostras (canto quase vivo, papel cortado); **14 px** em diálogos; **8 px** em campos.
- Sombras: só em diálogos e no selo "Arraste", tingidas de `ink` (`0 30px 60px -30px rgba(28,27,24,.45)`).

## Componentes

- **Botão pílula**: fundo `ink`, texto `linen`, 48 px, seta `→` que avança 4 px no hover. Variante contorno (borda `ink`) e variante clara no escuro.
- **Fotografia emoldurada**: borda de papel (padding 10 px `sand`) e legenda mono abaixo.
- **Ficha técnica**: mono caixa alta separada por `·`.
- **Régua lateral** (NAV-2): fio vertical fixo à esquerda com preenchimento contínuo e rótulo vertical `02 / 06 PROJETOS`.
- **Selo "Arraste"**: círculo de 96 px que segue o ponteiro sobre o trilho.

## Elementos-assinatura

1. **Hero que encolhe para o Manifesto** (HERO-2): a foto em tela cheia se recorta (`clip-path`) até a moldura da coluna direita enquanto o texto do manifesto entra.
2. **Cortina Croqui ↔ Obra** (SIGN-1): croqui a lápis gerado a partir da própria fotografia (mesmas dimensões, alinhamento pixel a pixel) sobre papel creme, com cotas e anotações.
3. **Mesa de materiais** (SIGN-2): seis amostras geradas em canvas trocam a fotografia aplicada.
4. **A luz na matéria** (SIGN-3): 120 quadros em `<canvas>`.

## Motion

- Tokens: `--ease-out: cubic-bezier(0.22,1,0.36,1)`, `--ease-in-out: cubic-bezier(0.65,0,0.35,1)`; durações 180 / 320 / 600 / 900 ms. Lenis `lerp 0.085`; scrub `1`.

| Técnica | Onde | Comunica |
|---|---|---|
| Smooth scroll | página | leitura contemplativa |
| Progresso | régua lateral + barra `01 / 05` da galeria | onde estou na história |
| Trigger | troca de tema ao entrar em Projetos, etapa ativa do Processo, contadores | mudança de capítulo |
| Scrub | encolhimento do hero, trilho de obras, varredura da cortina, quadros | o leitor controla o tempo |
| Pin | manifesto, galeria, coluna de materiais, luz na matéria, coluna do processo, coluna das perguntas | atenção num capítulo |
| Timeline | foto encolhe → título do manifesto sobe → parágrafos → métricas | sequência editorial |
| Clip-path | hero → moldura, cortina croqui, foto do contato | revelar/comparar |
| Parallax | fotos dentro dos cards do trilho | profundidade ao deslizar |
| Canvas | luz na matéria | percorrer o espaço |
| Stagger | palavras dos títulos, métricas, amostras | elementos da mesma família |

Movimento reduzido: sem Lenis, pin ou scrub; hero estático seguido do manifesto; galeria empilhada; cortina parada em 50 % (arraste e teclado continuam); quadros viram uma imagem com as 4 legendas. `?movimento=1` força as animações; `?movimento=0` força a versão estática.

## Estados

Hover (seta avança, foto escala 1.03, amostra levanta 2 px), foco (anel 2 px `clay-ink` com offset 3 px; no escuro `clay-glow`), selecionado (`aria-pressed`, contorno `ink`), loading (spinner na pílula, mesma largura), erro (ícone + texto `error`, `role="alert"`), sucesso (ícone + foco no título).

## Responsividade

| Largura | Recomposição |
|---|---|
| < 768 | régua vira barra no topo; manifesto: foto encolhe para o topo, parágrafos e métricas depois do pin; galeria empilhada; materiais em lista com foto acima; processo sem coluna fixa |
| 768–1023 | igual ao móvel com duas colunas nas métricas e amostras |
| ≥ 1024 | régua lateral, trilho horizontal fixado, colunas fixas em materiais, processo e perguntas |
| ≥ 1440 | container 1360 px; fotos maiores |

## Acessibilidade

Um `h1`; skip link; foco visível; diálogos `<dialog>` modais; cortina com `role="slider"`, `aria-valuenow` e setas/Home/End; materiais com `aria-pressed` e legenda `aria-live`; acordeão WAI-ARIA; canvas `aria-hidden` com descrição; trilho com botões anterior/próximo além do arraste; alvos ≥ 44 px.

## Conformidade (resumo de `conformidade-legal.md`)

- Formulários: contato (nome, e-mail, telefone opcional, tipo de projeto, metragem, local da obra, mensagem) e pedido de portfólio (nome, e-mail, tipo). Envio simulado. Base provável: procedimentos preliminares a pedido do titular; aviso junto ao botão, sem caixa obrigatória (confirmar com advogado).
- Sem rastreadores, cookies próprios ou embeds; fontes self-hosted: em princípio sem banner (confirmar).
- Retratos: stock ilustrativo, aviso visível. Pessoas, obras, números e CAU demonstrativos.
- Sequência de quadros: conjunto v2 gerado para o projeto (o v1 do Pexels mostra pessoas identificáveis e uma marca).
- Razão social, CNPJ e endereço completo: pendentes visíveis. Minutas marcadas como tal.

## Do's e don'ts

- Faça: uma palavra em itálico por título; respiro; fichas em mono; fotos com cantos quase vivos.
- Não faça: grade de fios de 1 px por toda a página (isso é ARQ-A); mais de um acento; sombras pretas; travessão longo em texto visível; gradientes decorativos (só scrim).

## Checklist final

- [x] Contraste conferido nas superfícies reais
- [x] Sem overflow horizontal de 375 a 1920
- [x] Todas as âncoras existem
- [x] Versão reduzida entrega todo o conteúdo
- [x] Diálogos pausam Lenis e devolvem foco
- [x] Cortina operável por arraste e teclado
- [x] Formulários: erro, loading, sucesso
- [x] Pendências legais visíveis e listadas
