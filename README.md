# Moura Arquitetura e Interiores · landing page

Landing page scrollytelling **demonstrativa** de um estúdio de arquitetura e interiores no Jardim Europa, São Paulo. Marca, pessoas, obras, números e registros são fictícios.

- **Produção:** https://arquitetura.cloudlane.com.br
- **Status:** https://status.cloudlane.com.br (monitor 31, "Moura (Arquitetura)")
- **Imagem:** `ghcr.io/lucascamy/arquitetura-landing:latest`

Direção de arte ARQ-B (Editorial Orgânico & Tátil): papel de linho, serifada com palavras-chave em itálico, um único capítulo escuro para a galeria de obras. Detalhes em [DESIGN.md](DESIGN.md); arquitetura e decisões em [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md); regras para agentes em [AGENTS.md](AGENTS.md).

## O que a página tem

| Capítulo | Cena | Técnica |
|---|---|---|
| 01 Manifesto | Foto em tela cheia (com vídeo de ambiência no desktop) que encolhe até a moldura do manifesto, métricas com contagem | pin, scrub, timeline, clip-path, stagger |
| 02 Projetos | Trilho horizontal de 5 obras em fundo escuro, arraste com selo "Arraste", gaveta "Pedir portfólio" | pin, scrub horizontal, parallax |
| 03 Do croqui ao espaço | Cortina croqui ↔ obra (arraste e teclado) e sequência de 120 quadros em `<canvas>` do traço à obra acesa | clip-path, scrub, canvas |
| 04 Materiais | Mesa de 6 amostras táteis que trocam a foto aplicada | pin da coluna, stagger |
| 05 Processo | Seis etapas com foco de leitura por opacidade | pin da coluna, trigger |
| 06 Estúdio | Fundadora, perguntas frequentes e formulário de contato | stagger, clip-path |

Com `prefers-reduced-motion: reduce` não há Lenis, pin nem scrub, e cada cena tem uma versão estática com o mesmo conteúdo. `?movimento=1` força as animações; `?movimento=0` força a versão estática.

## Stack

Vite 8, React 19, TypeScript 5.9 (strict), Tailwind CSS 4, GSAP 3.15 + ScrollTrigger, Lenis 1.3, Phosphor Icons, fontes self-hosted (Newsreader, Hanken Grotesk, IBM Plex Mono). Playwright para validação e para gerar mídia derivada.

O bundle inicial leva hero, navegação, React e GSAP; as seções abaixo do hero (`src/BelowFold.tsx`) e o Lenis são carregados sob demanda.

## Rodar localmente

```bash
npm install
npm run dev          # http://localhost:5317
npm run typecheck
npm run build
npm run preview      # http://localhost:4317
npm run validate:browser   # Playwright contra o preview; resultado em .validation/
npm run media:generate     # regera croqui anotado e amostras em public/media/generated/
```

## Mídia

`public/media/` vem do pacote de mídia do projeto (fotos WebP + AVIF, vídeos, quadros), com três ajustes registrados em [AGENTS.md](AGENTS.md):

- vídeo do hero reencodado para web (2,3 MB, loop de 4,5 s sem salto na emenda);
- 120 quadros reextraídos do vídeo 1920×1080 em 1280×720 (WebP + AVIF);
- AVIF dos quadros regerados quadro a quadro (o `-still-picture 1` do pacote grava um `av1C` vazio que Chrome e Edge recusam).

## Deploy (Cloudlane Homelab)

Segue a skill `cloudlane-homelab` ([homelab-docs](https://github.com/LucasCamy/homelab-docs)):

1. Push na `main` dispara [.github/workflows/deploy.yml](.github/workflows/deploy.yml), que publica a imagem `linux/amd64` no GHCR (`:latest` e `:<sha>`).
2. O Keel detecta o novo digest em até 1 minuto e faz o rollout de [k8s/deploy.yaml](k8s/deploy.yaml): namespace `landingpages`, Service LoadBalancer `192.168.15.19:8214` → contêiner 8080.
3. O Cloudlane Tunnel publica `arquitetura.cloudlane.com.br` → `http://192.168.15.19:8214`; o Uptime Kuma verifica `http://192.168.15.19:8214/healthz` a cada 60 s.

A imagem ([Dockerfile](Dockerfile)) compila com Node 24 e serve com `nginx-unprivileged` como usuário 101, raiz somente leitura e `/tmp` em memória ([docker/nginx.conf](docker/nginx.conf): `/healthz`, cache imutável em `/assets/`, 7 dias em `/media/`). Para testar como no cluster:

```bash
docker build -t arquitetura-landing:local .
docker run --rm --read-only --tmpfs /tmp -p 4318:8080 arquitetura-landing:local
```

Alterações só em `*.md`, `k8s/` ou `scripts/` não disparam build. Mudanças em `k8s/deploy.yaml` precisam de `kubectl apply -f k8s/deploy.yaml` na VM 200.

## Antes de usar como site real

Trocar marca, pessoas, retratos (stock ilustrativo), obras, números e registros; preencher razão social, CNPJ e endereço (pendentes visíveis no rodapé); revisar as minutas de privacidade e termos com um advogado; ligar os formulários a um backend (hoje o envio é simulado no navegador).
