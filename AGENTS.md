# AGENTS.md — Moura Arquitetura e Interiores (landing page demonstrativa)

## Propósito e stack

Landing page scrollytelling de um estúdio de arquitetura e interiores **demonstrativo** (marca, pessoas, obras, números e registros são fictícios). Direção de arte: arquétipo **ARQ-B, Editorial Orgânico & Tátil** (ver `DESIGN.md`). A versão anterior (Atelier Vértice, ARQ-A) está no primeiro commit do repositório.

- Vite 8 + React 19 + TypeScript 5.9 (`strict`, `noUncheckedIndexedAccess`).
- Tailwind CSS v4 via `@tailwindcss/vite`; tokens em `src/styles/tokens.css` expostos com `@theme inline`.
- GSAP 3.15 + ScrollTrigger + `@gsap/react` + Lenis 1.3 para as cenas de scroll. Estados de UI (diálogos, acordeão, troca de material, cortina) usam CSS e React; não misturar Motion e GSAP no mesmo componente.
- Ícones `@phosphor-icons/react`. Fontes self-hosted via Fontsource: Newsreader (serifada, com itálico), Hanken Grotesk, IBM Plex Mono.
- Playwright (dev) para validação e para gerar mídia derivada em `<canvas>`.

## Organização

```
img/                         pacote de mídia original (fora do git; espelhado em public/media/)
public/media/                mídias servidas (WebP + AVIF); frames/ alimenta a sequência "do traço à obra"
public/media/generated/      croqui anotado (sobre sketch-before.webp) e amostras, gerados por scripts/gerar-midia.mjs
src/data/MEDIA_MANIFEST.json manifesto do pacote (alt, foco, crédito, licença)
src/data/media.ts            única porta de acesso às mídias (object-position a partir do focalPoint, recortes de material)
src/data/content.ts          conteúdo demonstrativo centralizado
src/data/legal.ts            minutas legais (revisão jurídica pendente)
src/lib/scroll.ts            GSAP/ScrollTrigger/Lenis, reduced motion, ?movimento=1, trava de scroll
src/lib/briefing.tsx         leva o tipo de projeto escolhido em outras seções até o formulário
src/lib/theme.ts             tema da página (claro / capítulo escuro / sobre foto) aplicado no <html>
src/components/ui/           primitivos (Dialog, MediaImage, RichTitle, Pill)
src/components/nav/          Navbar, MobileMenu, ChapterRuler, FloatingCta
src/components/sections/     uma seção por arquivo, na ordem do documento
src/BelowFold.tsx            seções abaixo do hero + rodapé, carregadas sob demanda (React.lazy)
scripts/validate.mjs         validação Playwright
scripts/gerar-midia.mjs      gera croqui alinhado a hero-main.webp e as 6 amostras de material
```

## Comandos

| Comando | Efeito |
|---|---|
| `npm install` | instala dependências |
| `npm run dev` | desenvolvimento em `http://localhost:5317` |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run build` | typecheck + build em `dist/` |
| `npm run preview` | serve `dist/` em `http://localhost:4317` (a porta 4173 é usada por outro projeto nesta máquina) |
| `npm run validate:browser` | Playwright contra o preview; grava screenshots e `report.json` em `.validation/` |
| `npm run media:generate` | regera `public/media/generated/` |

Sem o Chromium do Playwright baixado, os scripts usam o Edge/Chrome instalado.

## Convenções

- Sem hex solto em componentes: classes geradas pelos tokens (`bg-linen`, `text-ink`, `text-ink-2`, `bg-night`, `text-clay`...).
- Um acento (terracota). Em texto pequeno use `clay-ink` (claro) ou `clay-glow` (escuro); `clay` puro só em títulos grandes, fios e pontos.
- Títulos de seção usam `RichTitle` com a palavra-chave entre asteriscos (`"Casas feitas de *luz*..."`), renderizada em itálico.
- Cenas de scroll em `useScene()` (`useGSAP` + `gsap.matchMedia()` + `motionConditions()`); cada cena tem versão estática e `useCanAnimate()` decide também o layout.
- Pins na ordem do documento: Manifesto → Projetos → Do traço à obra → Materiais (coluna) → Processo (coluna) → Perguntas (coluna). `BelowFold` chama `ScrollTrigger.sort()` + `refresh()` ao montar e cria os gatilhos de seção ativa.
- Divisão de código: o bundle inicial leva hero, navegação, React e GSAP; `BelowFold` e o Lenis (só com movimento permitido) são importados sob demanda. Grupos de vendor em `vite.config.ts`.
- Todo diálogo usa `components/ui/Dialog.tsx` (pausa o Lenis e devolve o foco).
- Copy em pt-BR, sem travessão longo em texto visível; números com unidade.

## Mídia

- Os AVIF de `public/media/frames/` foram regerados: o script do pacote usa `-still-picture 1`, que grava o box `av1C` vazio e faz Chrome/Edge recusarem os arquivos (os AVIF das fotos vêm corretos). Não sobrescreva com cópias de `img/frames/`; regere quadro a quadro:
  `ffmpeg -i img/frames/frame_0001.webp -frames:v 1 -vf format=yuv420p -c:v libaom-av1 -crf 30 -b:v 0 -cpu-used 6 public/media/frames/frame_0001.avif`
- O croqui anotado é `sketch-before.webp` (mesmas dimensões e enquadramento de `hero-main.webp`) com notas à mão. Se o pacote mudar, rode `npm run media:generate` e revise as posições das anotações em `scripts/gerar-midia.mjs`.
- `hero-ambient.mp4` (2,6 MB) só é usado no desktop com movimento, com botão de pausa.

## Validação

`typecheck`, `build` e `validate:browser` (desktop e celular, `reducedMotion` `no-preference` e `reduce`, mais `?movimento=1`). Conferir screenshots em `.validation/`. A preferência do pacote de skills é estruturar UI no Figma antes do código; ainda não há arquivo Figma definido para este projeto.

## Segurança e publicação

- Formulários simulam o envio localmente; nada sai do navegador.
- Antes de publicar: trocar marca, pessoas, retratos (stock ilustrativo), obras, números e registros; preencher razão social, CNPJ e endereço (pendentes visíveis no rodapé); revisar minutas legais com advogado.
- Push para `origin` (`github.com/LucasCamy/arquitetura-landing`) autorizado pelo usuário; o remoto define a identidade git pessoal via `includeIf`.
