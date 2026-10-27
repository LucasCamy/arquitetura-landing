import { useEffect, useRef, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Pause, Play } from '@phosphor-icons/react'
import { brand, pillars, type PillarKind } from '../../data/content'
import { media } from '../../data/media'
import { gsap, useCanAnimate, useScene } from '../../lib/scroll'
import { MediaImage } from '../ui/MediaImage'
import { Dialog } from '../ui/Dialog'
import { PillarDiagram } from '../ui/PillarDiagram'

const HERO_AREA = 486

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canAnimate = useCanAnimate()
  const [playing, setPlaying] = useState(false)
  const [pillar, setPillar] = useState<PillarKind | null>(null)

  // Vídeo de ambiência: só toca com movimento permitido, com botão de pausa.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (canAnimate) {
      video.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      )
    } else {
      video.pause()
      setPlaying(false)
    }
  }, [canAnimate])

  const toggleVideo = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play().then(() => setPlaying(true))
    else {
      video.pause()
      setPlaying(false)
    }
  }

  useScene(sectionRef, ({ desktop }) => {
    const q = gsap.utils.selector(sectionRef)
    const area = { v: 0 }
    const areaEl = q('[data-hero-area]')[0]

    // Timeline de abertura: máscara do texto → vão da imagem → cotas → índice e m² → legenda e CTA.
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 })
    intro
      .from(q('[data-hero-line] > span'), { yPercent: 110, duration: 0.95, stagger: 0.12 })
      .fromTo(
        q('[data-hero-frame]'),
        { clipPath: desktop ? 'inset(46% 0% 46% 0%)' : 'inset(0% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' },
        '-=0.55',
      )
      .from(q('[data-hero-cota="x"]'), { scaleX: 0, duration: 0.7, stagger: 0.08 }, '-=0.35')
      .from(q('[data-hero-cota="y"]'), { scaleY: 0, duration: 0.7 }, '<')
      .from(q('[data-hero-index]'), { opacity: 0, y: 10, duration: 0.45, stagger: 0.06 }, '-=0.3')
      .to(
        area,
        {
          v: HERO_AREA,
          duration: 0.9,
          ease: 'power2.out',
          onUpdate: () => {
            if (areaEl) areaEl.textContent = Math.round(area.v).toLocaleString('pt-BR')
          },
        },
        '<',
      )
      .from(q('[data-hero-legend], [data-hero-cta]'), { opacity: 0, y: 14, duration: 0.5, stagger: 0.06 }, '-=0.7')

    // Pin + progresso: a fotografia ganha escala e perde opacidade conforme o scroll.
    gsap
      .timeline({
        scrollTrigger: { trigger: pinRef.current, start: 'top top', end: '+=70%', pin: true, scrub: 1 },
      })
      .to(q('[data-hero-img]'), { scale: 1.14, opacity: 0.42, ease: 'none' }, 0)
      .to(q('[data-hero-copy]'), { yPercent: -10, opacity: 0.25, ease: 'none' }, 0)

    // Stagger dos quatro pilares abaixo do hero.
    gsap.from(q('[data-pillar]'), {
      y: 48,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: q('[data-pillars]')[0], start: 'top 85%', once: true },
    })

    return () => {
      if (areaEl) areaEl.textContent = HERO_AREA.toLocaleString('pt-BR')
    }
  })

  const activePillar = pillars.find((p) => p.kind === pillar)

  return (
    <section id="inicio" ref={sectionRef} aria-labelledby="hero-title" className="relative">
      <div ref={pinRef} className="relative h-dvh min-h-[560px] overflow-hidden pt-16">
        <div aria-hidden="true" className="blueprint pointer-events-none absolute inset-0 top-16" />

        {/* Celular: fotografia de fundo com scrim. Desktop: coluna à direita. */}
        <div className="container-grid relative grid h-full grid-cols-1 lg:grid-cols-12 lg:gap-8">
          <div
            data-hero-copy
            className="relative z-10 flex h-full flex-col justify-end pb-8 lg:col-span-7 lg:justify-between lg:py-10"
          >
            <video
              ref={videoRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full object-cover opacity-[0.22] lg:block"
              src={media.heroAmbient.src}
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-basalt/40 lg:block" />

            <p data-hero-index className="label hidden text-ash lg:block">
              Estúdio de arquitetura · {brand.city} · {brand.coordinates}
            </p>

            <div>
              <h1 id="hero-title" className="monumental">
                <span data-hero-line className="mask block">
                  <span>Matéria</span>
                </span>
                <span data-hero-line className="mask block">
                  <span>
                    <span className="text-clay">&amp;</span> Luz
                  </span>
                </span>
              </h1>
              <p data-hero-legend className="mt-6 max-w-[34rem] text-base leading-relaxed text-limestone/90 md:text-lg">
                Arquitetura silenciosa em concreto, madeira e luz natural. Projetamos residências, edifícios boutique e
                pavilhões em São Paulo a partir do terreno e da estrutura, não da fachada.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a data-hero-cta href="#contato" className="btn btn-primary">
                  Agendar Conversa
                  <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                </a>
                <a data-hero-cta href="#obras" className="btn btn-secondary">
                  Explorar Obras
                  <ArrowDownRight size={18} aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="mt-8 hidden items-end justify-between gap-6 lg:flex">
              <dl className="flex gap-8">
                <div data-hero-index>
                  <dt className="label text-ash">Obra em destaque</dt>
                  <dd className="mt-1 text-sm">Casa Platô · Cantareira, SP</dd>
                </div>
                <div data-hero-index>
                  <dt className="label text-ash">Área construída</dt>
                  <dd className="mono mt-1 text-sm">
                    <span data-hero-area>{HERO_AREA.toLocaleString('pt-BR')}</span> m²
                  </dd>
                </div>
                <div data-hero-index>
                  <dt className="label text-ash">Nível de acesso</dt>
                  <dd className="mono mt-1 text-sm">+0.00m</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={toggleVideo}
                className="label inline-flex min-h-11 items-center gap-2 text-ash hover:text-limestone"
                aria-pressed={!playing}
              >
                {playing ? (
                  <Pause size={14} weight="fill" aria-hidden="true" />
                ) : (
                  <Play size={14} weight="fill" aria-hidden="true" />
                )}
                {playing ? 'Pausar ambiência' : 'Tocar ambiência'}
              </button>
            </div>
          </div>

          <div className="absolute inset-0 lg:relative lg:col-span-5 lg:flex lg:items-center lg:py-10">
            <div className="relative h-full w-full lg:h-auto">
              <div
                data-hero-cota="y"
                aria-hidden="true"
                className="cota-v absolute top-0 -left-5 hidden h-full lg:block"
              />
              <span
                data-hero-index
                aria-hidden="true"
                className="label absolute top-1/2 -left-5 hidden -translate-x-full -translate-y-1/2 pr-3 text-ash lg:block"
                style={{ writingMode: 'vertical-rl' }}
              >
                h 9,60 m
              </span>
              <figure
                data-hero-frame
                className="relative h-full w-full overflow-hidden lg:aspect-[4/5] lg:h-auto lg:max-h-[calc(100dvh-64px-120px)]"
              >
                <div data-hero-img className="h-full w-full">
                  <MediaImage asset={media.hero} priority sizes="(min-width: 1024px) 40vw, 100vw" />
                </div>
                <div aria-hidden="true" className="scrim-bottom absolute inset-0 lg:hidden" />
              </figure>
              <div className="mt-4 hidden lg:block">
                <div data-hero-cota="x" aria-hidden="true" className="cota" />
                <div className="mt-2 flex justify-between">
                  <span data-hero-index className="label text-ash">
                    Fachada norte
                  </span>
                  <span data-hero-index className="mono text-xs text-ash">
                    18,40 m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-grid relative pb-24 md:pb-32">
        <h2 className="sr-only">Pilares tectônicos</h2>
        <ul data-pillars className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          {pillars.map((p) => (
            <li key={p.kind} data-pillar className="bg-basalt">
              <button
                type="button"
                onClick={() => setPillar(p.kind)}
                className="group flex h-full w-full flex-col items-start gap-3 p-4 text-left transition-colors hover:bg-stone md:p-6"
                aria-haspopup="dialog"
              >
                <span className="flex w-full items-baseline justify-between">
                  <span className="label text-ash">{p.index}</span>
                  <span className="mono text-xs text-clay-ink">{p.measure}</span>
                </span>
                <span className="display text-3xl md:text-4xl">{p.title}</span>
                <span className="hidden text-sm leading-relaxed text-ash sm:block">{p.summary}</span>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold underline decoration-line-strong underline-offset-[6px] group-hover:decoration-clay">
                  Ver detalhe
                  <ArrowUpRight size={14} aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Dialog
        open={activePillar !== undefined}
        onClose={() => setPillar(null)}
        eyebrow={activePillar ? `Pilar ${activePillar.index} · ${activePillar.title}` : undefined}
        title={activePillar?.detailTitle ?? ''}
      >
        {activePillar && (
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="border border-line bg-basalt p-3">
              <PillarDiagram kind={activePillar.kind} />
            </div>
            <div>
              <p className="leading-relaxed text-limestone/90">{activePillar.detail}</p>
              <dl className="mt-6 border-t border-line">
                {activePillar.specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-4 border-b border-line py-3">
                    <dt className="text-sm text-ash">{s.label}</dt>
                    <dd className="mono text-right text-sm">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  )
}
