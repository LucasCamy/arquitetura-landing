# DESIGN.md — Atelier Vértice

Direção: **Tectonic Monolith & Blueprint Hairline Grid**. A página se comporta como uma prancha técnica escura: massa monolítica (fotografia e tipografia monumental) apoiada numa grade estrutural aparente de 1 px, com cotas, níveis e áreas em mono.

## Missão visual

Fazer o visitante sentir o peso do concreto e a precisão do desenho antes de ler qualquer argumento. Cada cena de scroll é uma passagem de capítulo, como percorrer uma obra: abertura (vão), estrutura (cotas), travessia (aproximação da casa), método (etapas), pessoas, dúvidas, conversa.

## Personalidade e público

- Silenciosa, precisa, material. Nunca festiva.
- Público: famílias e incorporadores boutique em São Paulo que contratam arquitetura autoral (alto envolvimento, leitura lenta, decisões de 12 a 36 meses). Também curadores e gestores culturais (pavilhões).

## Princípios

1. **Estrutura aparente**: a grade de 1 px é visível e organiza tudo; nada flutua sem eixo.
2. **Dado como cota**: todo número tem unidade (m², anos, +0.00m) e aparece em mono tabular.
3. **Um acento**: argila/terracota marca apenas o que é ação ou leitura ativa.
4. **Movimento como passagem**: o scroll abre vãos, desenha cotas e avança quadros; nunca enfeita.
5. **Recompor, não encolher**: no celular os trilhos viram listas e o hero vira fotografia de fundo.

## Paleta (tokens em `src/styles/tokens.css`)

| Token | Hex | Uso |
|---|---|---|
| `--basalt` | `#0C0C0B` | fundo da página (pedra vulcânica) |
| `--stone` | `#141412` | superfícies (concreto) |
| `--stone-2` | `#1B1B18` | superfície elevada (diálogos, campos) |
| `--line` | `rgba(239,236,230,0.12)` | grade estrutural / bordas 1 px |
| `--line-strong` | `rgba(239,236,230,0.28)` | cotas ativas, borda de campo |
| `--limestone` | `#EFECE6` | texto principal (calcário) |
| `--ash` | `#9A968E` | texto secundário |
| `--clay` | `#C65D3B` | acento único: botões primários, marcador da régua, foco |
| `--clay-ink` | `#D9774F` | acento em texto pequeno sobre `stone` (mesma matiz, mais claro) |
| `--ok` | `#9CC3A0` | estado de sucesso (sempre com ícone de check + texto) |
| `--error` | `#E58A72` | estado de erro (sempre com ícone de aviso + texto) |

### Contraste calculado (WCAG 2.x, luminância relativa)

| Texto | Fundo | Razão | Resultado |
|---|---|---|---|
| limestone | basalt | 16,5:1 | AAA |
| limestone | stone | 15,6:1 | AAA |
| ash | basalt | 6,6:1 | AA |
| ash | stone | 6,3:1 | AA |
| ash | stone-2 | 5,8:1 | AA |
| clay | basalt | 4,7:1 | AA (texto normal) |
| clay | stone | 4,4:1 | só texto grande/ícones → usar `clay-ink` |
| clay-ink | stone | 5,9:1 | AA |
| basalt sobre clay (botão) | clay | 4,7:1 | AA |
| error | stone-2 | 6,6:1 | AA |
| ok | stone-2 | 8,7:1 | AAA |
| limestone sobre foto com scrim (hero móvel) | scrim basalt 0→88 % | ≥ 7:1 na área do texto | AA |

## Tipografia

- **Display**: Big Shoulders Display Variable (OFL). Condensada, monumental, desenho de placa e concreto; permite `MATÉRIA & LUZ` em duas linhas no celular. Acentos (É, Ã, Ç, Õ) conferidos em 800 no navegador.
- **Texto**: Hanken Grotesk Variable (OFL), geométrica limpa.
- **Dados**: IBM Plex Mono 400/500 (OFL) com `font-variant-numeric: tabular-nums` para cotas, m², coordenadas e CAU.

Escala fluida:

| Papel | Tamanho | Linha / tracking |
|---|---|---|
| Monumental (h1, VAMOS CONVERSAR) | `clamp(4.25rem, 15vw, 15rem)` | 0.82 / -0.01em, caixa alta |
| h2 | `clamp(2.4rem, 6vw, 5.5rem)` | 0.9 / 0 |
| h3 | `clamp(1.35rem, 2vw, 1.75rem)` | 1.1 |
| Corpo | `1rem → 1.125rem` | 1.6 |
| Mono label | `0.75rem` | 1.4 / 0.08em, caixa alta |

## Espaçamento, raios e elevação

- Base 4 px. Seções `py-24 → py-40`. Gutter 16 px (móvel), 32 px (≥ 768), 48 px (≥ 1280). Grade de 12 colunas em desktop.
- Raios (arquitetura é ortogonal): **0** em painéis e mídia, **2 px** em badges, **4 px** em botões e campos, **6 px** em diálogos. Nada acima disso.
- Sombras: tingidas de basalto `0 24px 60px -20px rgba(12,12,11,.9)` só em diálogos. Sem brilho, exceto anel de foco.

## Superfícies e componentes

- **Grade hairline**: containers com `gap-px` sobre `bg-line` produzem divisórias de 1 px sem bordas duplicadas.
- **Botões**: primário (fundo clay, texto basalt, 48 px), secundário (borda line-strong, texto limestone), terciário (texto + seta, sublinhado de 1 px). Loading mantém largura.
- **Cards**: sem fundo arredondado; número de prancha em mono, título em display, ficha em mono.
- **Badges**: mono 11 px em borda de 1 px, raio 2.
- **Navegação**: barra fixa 64 px, fundo basalt 92 % com borda inferior line; link ativo com traço clay de 1 px e `aria-current`.
- **Régua de cota (progresso)**: coluna fixa à direita no desktop com ticks a cada 2 m (+0.00m → +24.00m), marcador clay e leitura numérica; no celular, linha de 2 px no topo + nível no canto.

## Elemento-assinatura

A **Travessia Espacial**: 120 quadros (conjunto v2, aproximação contínua sobre a residência brutalista gerada para o projeto) desenhados num `<canvas>` conforme o scroll, em AVIF com fallback WebP, com quatro legendas de projeto. Representa o método do estúdio (percorrer o espaço antes de desenhá-lo). Pôster: quadro 1 desenhado assim que carrega; fallback reduzido: grade com 4 fotografias distintas (residência, escada em balanço, pavilhão, interior) e legendas, porque os quadros v2 variam pouco entre si.

## Motion (tokens)

- `--ease-out: cubic-bezier(0.22,1,0.36,1)`, `--ease-in-out: cubic-bezier(0.65,0,0.35,1)`; GSAP usa `power3.out` / `power2.inOut` equivalentes.
- Durações: 120 / 180 / 280 / 560 / 900 ms.
- Lenis `lerp 0.085`. Scrub `1` em todas as cenas encadeadas.
- Técnicas e motivo:

| Técnica | Onde | O que comunica |
|---|---|---|
| Smooth scroll | página | peso, ritmo de visita a uma obra |
| Progresso | régua de cota + escala/opacidade do hero | em que nível do "edifício" o leitor está |
| Trigger | contadores, cotas 1 px, nav ativa | medição acontecendo ao chegar |
| Scrub | máscaras, etapas, canvas | o leitor controla o tempo e pode voltar |
| Pin | hero, travessia, método, coluna de dúvidas | capítulo que exige atenção |
| Timeline | hero (máscara → vão → cotas → m² → legenda/CTA), travessia, método | sequência construtiva |
| Clip-path | editorial e contato | vão que se abre na parede |
| Parallax | obras | profundidade entre fotografia, número e ficha |
| Canvas | travessia | percorrer o espaço |
| Stagger | pilares, palavras de títulos, sócios | elementos de uma mesma estrutura chegando em ordem |

- Movimento reduzido: sem Lenis, pin, scrub ou autoplay de vídeo; tudo visível no estado final; trilho do método vira lista; canvas vira grade. `?movimento=1` força as animações (classe `motion-forced` no `<html>`), `?movimento=0` força a versão estática.

## Estados

- Hover: imagens de sócios saem do P&B para cor (filter, 560 ms); links ganham sublinhado clay.
- Focus: anel `2px solid clay` + offset 3 px em tudo (`:focus-visible`).
- Active/selecionado: filtros com `aria-pressed` e fundo limestone/texto basalt.
- Loading: botão de envio com spinner e texto "Enviando", mesma largura.
- Erro: mensagem abaixo do campo com ícone de aviso, `role="alert"`, borda error.
- Sucesso: painel com ícone de check, foco movido para o título.
- Vazio: não ocorre nos filtros (todas as tipologias têm itens); contador "Exibindo N de 6 frentes" em `aria-live`.

## Responsividade

| Largura | Recomposição |
|---|---|
| 375–767 | hero com foto de fundo e scrim; pilares 2×2; obras em pilha (imagem → cards); método vertical; FAQ sem pin; régua vira linha no topo |
| 768–1023 | pilares 4 colunas; obras com imagem ao lado de 2 cards; método vertical |
| ≥ 1024 | hero split 7/5; método horizontal fixado; coluna da FAQ fixada; régua lateral |
| ≥ 1440 | container máx. 1440 px, grade aparente continua até as bordas |

## Acessibilidade

Um `h1`, skip link, landmarks, foco visível, diálogos nativos `<dialog>` com foco devolvido e Esc, menu móvel modal, acordeão WAI-ARIA (`aria-expanded`, `aria-controls`, regiões), filtros `aria-pressed`, legendas da travessia em `aria-live="polite"`, canvas `aria-hidden` com descrição `sr-only`, contadores com valor final para leitor de tela, alvos ≥ 44 px, vídeo de ambiência com botão de pausa.

## Conformidade (resumo de `conformidade-legal.md`)

- Dados coletados: formulário de briefing (nome, e-mail, telefone opcional, tipologia, terreno, área, formato, mensagem). Envio simulado localmente. Base provável: procedimentos preliminares a pedido do titular (confirmar com advogado); aviso curto junto ao botão, sem caixa obrigatória.
- Sem rastreadores, sem cookies próprios, fontes self-hosted, nenhum embed de terceiros: em princípio não há banner de cookies (confirmar).
- Retratos de sócios são stock ilustrativo (`representativeStockImage`): aviso visível nos cards e no modal.
- Ambiência do hero e sequência da Travessia usam as versões v2, geradas para o projeto (sem pessoas nem marcas). Os vídeos v1 do Pexels continuam em `public/media/` mas não são usados pela página.
- Razão social, CNPJ e endereço completo: **pendentes visíveis** no rodapé. Minutas de privacidade e termos marcadas como minuta para revisão jurídica.

## Do's

- Alinhar tudo à grade de 12 colunas e às linhas de 1 px.
- Mono para todo número; unidade sempre.
- Fotografia grande, sem molduras arredondadas.

## Don'ts

- Gradientes decorativos, blobs, glow, sombras pretas.
- Segundo acento colorido.
- Travessão longo em texto visível, "Seção 01", "role para baixo".
- Expandir conteúdo no hover deslocando layout.

## Checklist final

- [x] Contraste conferido nas superfícies reais
- [x] Sem overflow horizontal de 375 a 1920
- [x] Todas as âncoras existem
- [x] Versão reduzida entrega todo o conteúdo
- [x] Diálogos pausam Lenis e devolvem foco
- [x] Formulário: erro, loading, sucesso
- [x] Pendências legais visíveis e listadas
