# IMPLEMENTATION_PLAN.md — Moura (ARQ-B)

## Arquitetura da página

| # | id | Componente | Forma (catálogo) | Interação real | Cena de scroll |
|---|---|---|---|---|---|
| 0 | — | `Navbar`, `MobileMenu`, `ChapterRuler`, `FloatingCta` | NAV-2 | links, menu modal, pílula flutuante | progresso, tema por capítulo |
| 1 | `manifesto` | `HeroManifesto` | HERO-2 | CTAs | pin + scrub + timeline + stagger + contadores |
| 2 | `projetos` | `Projects` | PORT-2 | arraste, anterior/próximo, gaveta "Pedir portfólio" com formulário | pin + scrub horizontal + parallax + tema escuro |
| 3 | `croqui` | `Croqui` | SIGN-1 | cortina arrastável/teclado | clip-path + scrub |
| 3b | `traco` | `SketchSequence` | SIGN-3 | anterior/próximo momento | pin + scrub + canvas + timeline |
| 4 | `materiais` | `Materials` | SIGN-2 | amostras com hover/foco/clique | pin da coluna + stagger + gatilho por amostra |
| 5 | `processo` | `Process` | METH-2 | botão de agendamento | pin da coluna + foco de opacidade |
| 6 | `estudio` | `Studio` | TEAM-2 | — | stagger |
| 6b | `perguntas` | `Faq` | coluna fixa + acordeão | acordeão | pin da coluna |
| 6c | `contato` | `Contact`, `Footer` | CTA com formulário | formulário, modais legais | clip-path |

## Pastas

```
src/
  App.tsx, main.tsx
  styles/tokens.css, globals.css
  data/MEDIA_MANIFEST.json, media.ts, content.ts, legal.ts
  lib/scroll.ts, briefing.tsx, theme.ts
  components/ui/      Dialog, MediaImage, RichTitle, Pill
  components/nav/     Navbar, MobileMenu, ChapterRuler, FloatingCta
  components/sections HeroManifesto, Projects, PortfolioDialog, Croqui, Materials, LightSequence, Process, Studio, Faq, Contact, Footer
scripts/gerar-midia.mjs, scripts/validate.mjs
```

## Dependências

Mantidas: react, react-dom, gsap, @gsap/react, lenis, @phosphor-icons/react, Hanken Grotesk, IBM Plex Mono. Trocada: Big Shoulders Display → Newsreader (serifada com itálico real). Sem novas libs de imagem: croqui e amostras são gerados em `<canvas>` via Playwright, que já era dependência de desenvolvimento.

## Ordem de implementação

1. Mídia derivada (croqui alinhado, 6 amostras) e documentos.
2. Tokens, globals, fontes; `scroll.ts` reaproveitado; `theme.ts`.
3. Dados (`media.ts` com recortes por material, `content.ts`, `legal.ts`).
4. Primitivos e navegação (régua lateral, pílula flutuante).
5. Hero → Manifesto (estático primeiro, depois pin/clip).
6. Projetos (pilha estática primeiro, depois trilho, arraste, selo).
7. Croqui, Materiais, Luz, Processo, Estúdio, Perguntas, Contato, Rodapé.
8. Ordenação de gatilhos, validação, revisão.

## Estratégias

- **Hero → Manifesto**: a foto fica em camada absoluta no palco fixado; o `clip-path: inset()` anima do quadro inteiro até o retângulo medido de um marcador na coluna direita (funções com `invalidateOnRefresh`), e a imagem interna desescala de 1.12 para 1. Movimento reduzido: hero e manifesto em fluxo normal.
- **Trilho**: `x: () => -(scrollWidth - innerWidth)`; parallax interno com `containerAnimation`; arraste converte delta horizontal em scroll vertical (1:1); botões rolam até o card; selo segue o ponteiro com `gsap.quickTo`, oculto em ponteiro grosso.
- **Cortina**: `--pos` em CSS, croqui por cima com `clip-path: inset(0 calc(100% - var(--pos)) 0 0)`; varredura 25 → 55 % por scrub até a primeira interação do usuário.
- **Quadros**: AVIF com fallback WebP, pré-carregamento em `top 250%`, DPR ≤ 2.
- **Tema**: `ScrollTrigger` em Projetos alterna `data-theme="night"` no `<html>`; fundo do `body` faz transição de 600 ms; com movimento reduzido a seção tem fundo próprio.

## Performance

Hero com preload AVIF e `fetchpriority="high"`; fotos em `<picture>` AVIF + WebP; 120 quadros AVIF 1280×720 ≈ 5,6 MB só perto da cena; vídeo do hero (2,3 MB, loop sem emenda) só no desktop. Código: bundle inicial (app 16,6 kB + React 68 kB + GSAP 45 kB gzip), `BelowFold` 19,8 kB e Lenis 5,4 kB sob demanda.

## Testes

`typecheck`, `build`, `validate:browser`: 7 larguras (375–1920) com overflow e âncoras; desktop/celular × `no-preference`/`reduce` + `?movimento=1`; encolhimento do hero (área da foto antes/depois), deslocamento do trilho, arraste e teclado da cortina, troca de materiais, formulários, gaveta de portfólio, menu móvel, erros de console.

## Pendências

- Figma sem arquivo definido (autorizado seguir pelo DESIGN.md).
- Dados reais da empresa, retratos autorizados, obras e números comprovados, revisão jurídica, backend dos formulários.
