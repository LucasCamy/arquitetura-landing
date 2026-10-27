# AGENTS.md — Atelier Vértice (landing page demonstrativa)

## Propósito e stack

Landing page scrollytelling de um estúdio de arquitetura e urbanismo **demonstrativo** (marca, nomes, números e registros CAU são fictícios).

- Vite 8 + React 19 + TypeScript 5.9 (`strict`, `noUncheckedIndexedAccess`).
- Tailwind CSS v4 via `@tailwindcss/vite`; tokens em `src/styles/tokens.css` expostos com `@theme inline`.
- GSAP 3.15 + ScrollTrigger + `@gsap/react` + Lenis 1.3 para as cenas ligadas ao scroll. Estados de UI (diálogos, hover, acordeão) usam CSS; não misturar Motion e GSAP no mesmo componente.
- Ícones: `@phosphor-icons/react`. Fontes self-hosted via Fontsource (Big Shoulders Display, Hanken Grotesk, IBM Plex Mono).
- Playwright (dependência de desenvolvimento) para validação em navegador.

## Organização

```
public/media/            mídias reais (espelho de img/); a página usa frames-v2/ (AVIF + WebP) e hero-ambient-v2.mp4
src/data/MEDIA_MANIFEST.json   manifesto original (fonte de alt, foco, crédito e licença)
src/data/media.ts        única porta de acesso às mídias (object-position a partir do focalPoint)
src/data/content.ts      conteúdo demonstrativo centralizado (pilares, obras, etapas, sócios, FAQ)
src/data/legal.ts        minutas legais e créditos (minuta para revisão jurídica)
src/lib/scroll.ts        GSAP/ScrollTrigger/Lenis, reduced motion, ?movimento=1, trava de scroll
src/lib/briefing.ts      contexto que leva tipologia/formato escolhidos até o formulário
src/components/ui/       primitivos (Dialog, MediaImage, SplitWords, SectionDiagram)
src/components/nav/      Navbar, menu móvel, régua de cota (progresso do scroll)
src/components/sections/ uma seção por arquivo, na ordem do documento
scripts/validate.mjs     validação Playwright (overflow, âncoras, console, screenshots)
```

`img/` é a origem preservada das mídias; edite/adicione mídia em `public/media/` e registre no manifesto.

Exceção: os AVIF de `public/media/frames*/` foram regerados a partir dos WebP de `img/`. O pacote original usa `-still-picture 1`, que grava o box `av1C` vazio, e Chrome/Edge recusam esses arquivos (o ffmpeg decodifica normalmente, então o defeito não aparece fora do navegador). Ao receber mídia nova, não sobrescreva esses AVIF com cópias de `img/`; regere quadro a quadro:

```bash
ffmpeg -i img/frames-v2/frame_0001.webp -frames:v 1 -vf format=yuv420p -c:v libaom-av1 -crf 30 -b:v 0 -cpu-used 6 public/media/frames-v2/frame_0001.avif
```

## Comandos

| Comando | Efeito |
|---|---|
| `npm install` | instala dependências |
| `npm run dev` | servidor de desenvolvimento em `http://localhost:5317` |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run build` | typecheck + build de produção em `dist/` |
| `npm run preview` | serve `dist/` em `http://localhost:4317` |
| `npm run validate:browser` | Playwright contra `http://localhost:4317` (rode `build` e `preview` antes); grava em `.validation/` |

Sem Chromium do Playwright baixado, o script usa o Edge/Chrome instalado (`channel: 'msedge'`).

## Convenções

- Sem hex solto em componentes: use as classes geradas pelos tokens (`bg-stone`, `text-limestone`, `border-line`, `text-clay`...).
- Um único acento (`--clay`). Erro/sucesso sempre com ícone + texto.
- Toda cena de scroll fica em `useGSAP(..., { scope })` com `gsap.matchMedia()` e `motionConditions()`; cada cena tem versão estática (`useCanAnimate()` decide também o layout).
- Pins são criados na ordem do documento (Hero → Travessia → Método → Dúvidas); depois da montagem o `App` chama `ScrollTrigger.sort()` + `refresh()`.
- Todo diálogo usa `components/ui/Dialog.tsx` (pausa o Lenis, devolve o foco, `data-lenis-prevent`).
- Copy em pt-BR, sem travessão longo em texto visível, números no formato brasileiro com unidade.

## Validação

Para mudanças de UI: `typecheck`, `build` e `validate:browser` (desktop e celular, `reducedMotion` `no-preference` e `reduce`, mais `?movimento=1`). Conferir screenshots em `.validation/`. A preferência do pacote é estruturar UI no Figma antes do código; neste projeto ainda não há arquivo Figma definido.

## Segurança e publicação

- O formulário **simula** o envio localmente; nada sai do navegador. Integração real exige backend e revisão da base legal.
- Antes de publicar: trocar marca, sócios, retratos (stock ilustrativo), números, CAU e preencher razão social/CNPJ (pendentes visíveis no rodapé). Minutas legais exigem revisão de advogado. Ver `DESIGN.md` › Conformidade.
