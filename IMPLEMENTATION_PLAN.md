# IMPLEMENTATION_PLAN.md

## Arquitetura da página

Página única (SPA estática, sem roteador). `App` monta, em ordem do documento:

| # | id | Componente | Família de layout | Interação real | Cena de scroll |
|---|---|---|---|---|---|
| 0 | — | `Navbar` + `MobileMenu` + `ScrollRuler` | barra fixa | links com seção ativa, menu modal | progresso, trigger (nav ativa) |
| 1 | `inicio` | `Hero` | split monumental 7/5 + grade 1 px de 4 pilares | pilares abrem diálogo de detalhe construtivo; pausa do vídeo | pin, timeline, progresso (escala/opacidade), stagger |
| 2 | `estudio` | `Studio` | faixa de métricas + split assimétrico editorial | — (conteúdo) | trigger (contadores, cotas), clip-path |
| 3 | `obras` | `Works` | xadrez imagem × fichas | filtro por tipologia, Prancha Técnica (diálogo) com corte SVG e "Iniciar estudo" | parallax |
| 4 | `travessia` | `Traverse` | cena de tela cheia | etapa anterior/próxima | pin, scrub, timeline, canvas |
| 5 | `metodo` | `Method` | trilho horizontal | barra de primeiro passo (presencial / vídeo) | pin + scrub horizontal |
| 6 | `socios` | `Partners` | trio de retratos | hover/foco revela especialidade; modal Trajetória | stagger |
| 7 | `duvidas` | `Faq` | coluna fixa + acordeão | acordeão WAI-ARIA | pin da coluna |
| 8 | `contato` | `Contact` + `Footer` | título monumental + foto + formulário | formulário com validação e estados; modais legais | clip-path |

## Árvore e pastas

```
src/
  main.tsx                 fontes, estilos, render
  App.tsx                  BriefingProvider, Lenis, ScrollTrigger.sort/refresh, cotas globais
  styles/tokens.css        tokens + @theme inline
  styles/globals.css       base, grade, utilitários, reduced motion
  data/MEDIA_MANIFEST.json manifesto original
  data/media.ts            mídias tipadas + objectPosition
  data/content.ts          conteúdo demonstrativo
  data/legal.ts            minutas e créditos
  lib/scroll.ts            registro GSAP, Lenis, motion hooks, trava de scroll, scrollToId
  lib/briefing.ts          contexto do briefing (tipologia + formato pré-selecionados)
  components/ui/           Dialog, MediaImage, SplitWords, SectionDiagram, PillarDiagram, Icon helpers
  components/nav/          Navbar, MobileMenu, ScrollRuler
  components/sections/     Hero, Studio, Works, Traverse, Method, Partners, Faq, Contact, Footer
scripts/validate.mjs       Playwright
```

## Dependências

Runtime: react, react-dom, gsap, @gsap/react, lenis, @phosphor-icons/react, 3 pacotes Fontsource. Dev: vite, @vitejs/plugin-react, typescript, tailwindcss, @tailwindcss/vite, @types/react(-dom), playwright. Sem Motion (os estados de UI cabem em CSS), sem Three.js (canvas 2D basta), sem libs de gráfico.

## Ordem de implementação

1. Scaffold, configs, cópia de mídia, manifesto.
2. Tokens, globals, fontes.
3. `media.ts`, `content.ts`, `legal.ts`.
4. `scroll.ts` (Lenis + matchMedia + trava), `Dialog`, `MediaImage`, `SplitWords`.
5. Navbar, menu móvel, régua.
6. Hero (estático primeiro, depois timeline e pin).
7. Travessia (pôster/grade estática primeiro, depois canvas).
8. Studio, Works, Method, Partners, Faq, Contact, Footer.
9. Ordenação de gatilhos e refresh; validação.

## Responsividade

Mobile-first com Tailwind; troca de layout por `useCanAnimate()` + breakpoints em `gsap.matchMedia()` (`desktop: (min-width: 1024px)`). Pins de trilho horizontal só ≥ 1024. Hero pinado em todas as larguras (cabe em `100dvh`); FAQ pinada só ≥ 1024.

## Fallback do elemento-assinatura

1. Antes do pré-carregamento: canvas desenha o quadro 1 assim que ele chega (carregado primeiro).
2. Pré-carregamento de 120 quadros v2 começa em `top 250%`, uma vez: AVIF (≈ 4,3 MB) quando o quadro 1 decodifica, senão WebP (≈ 8,7 MB).
3. Quadro pedido indisponível → desenha o carregado mais próximo anterior; redesenha quando chega.
4. Movimento reduzido → grade com 4 fotografias distintas e as 4 legendas, sem canvas.
5. Canvas `aria-hidden` + descrição `sr-only`; legenda ativa em `aria-live`; botões anterior/próxima rolam até a etapa.

## Performance

- Hero com `fetchpriority="high"` e preload; demais imagens `loading="lazy"` + `decoding="async"` com `aspect-ratio` reservado.
- Vídeo de ambiência `preload="metadata"`, só toca com movimento permitido e em viewport.
- Canvas: DPR ≤ 2, redesenho só quando o quadro muda, ResizeObserver.
- Valores contínuos em objetos GSAP/refs, nunca em estado React por quadro.

## Testes

- `npm run typecheck`, `npm run build`.
- `scripts/validate.mjs`: 7 larguras × overflow + âncoras; desktop/celular × `no-preference`/`reduce`; `?movimento=1` com reduce; screenshots por cena; erros de console; diálogo pausa Lenis; filtro; acordeão; formulário (erro → sucesso).

## Pendências explícitas

- Figma: nenhum arquivo/destino informado; implementação seguiu DESIGN.md (autorizado no briefing).
- Dados reais da empresa, retratos autorizados, CAU reais, números comprovados, revisão jurídica das minutas.
- Backend do formulário.
