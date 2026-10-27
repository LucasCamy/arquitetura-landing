import { useRef } from 'react'
import { MapPin, VideoCamera } from '@phosphor-icons/react'
import { methodSteps } from '../../data/content'
import { useBriefing } from '../../lib/briefing'
import { gsap, useCanAnimate, useIsDesktop, useScene } from '../../lib/scroll'

export function Method() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)
  const canAnimate = useCanAnimate()
  const isDesktop = useIsDesktop()
  const horizontal = canAnimate && isDesktop
  const { startBriefing } = useBriefing()

  useScene(
    sectionRef,
    ({ desktop }) => {
      const q = gsap.utils.selector(sectionRef)
      const track = trackRef.current
      if (!track) return

      if (desktop && pinRef.current) {
        // Trilho horizontal fixado; o preenchimento acompanha o scrub e volta ao rolar para cima.
        const distance = () => Math.max(0, track.scrollWidth - track.clientWidth)
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pinRef.current,
            start: 'top top',
            end: () => `+=${distance() + window.innerHeight * 0.6}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
        tl.to(track, { x: () => -distance(), duration: 1 }, 0).fromTo(
          q('[data-method-fill]'),
          { scaleX: 0 },
          { scaleX: 1, duration: 1 },
          0,
        )
        q('[data-method-step]').forEach((step) => {
          gsap.to(step, {
            scrollTrigger: {
              trigger: step,
              containerAnimation: tl.getChildren()[0] as gsap.core.Tween,
              start: 'left 70%',
              toggleClass: { targets: step, className: 'is-active' },
            },
          })
        })
      } else {
        // Celular: lista vertical com a linha preenchida pelo scroll.
        gsap.fromTo(
          q('[data-method-fill-v]'),
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: track, start: 'top 70%', end: 'bottom 60%', scrub: 1 },
          },
        )
        q('[data-method-step]').forEach((step) =>
          gsap.from(step, {
            opacity: 0,
            y: 32,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: step, start: 'top 85%', once: true },
          }),
        )
      }
    },
    [horizontal],
  )

  const firstStep = (
    <div className="flex flex-col gap-4 border border-line bg-stone p-5 md:flex-row md:items-center md:justify-between md:p-6">
      <div>
        <p className="label text-clay-ink">Primeiro passo</p>
        <p className="mt-2 max-w-[52ch] leading-relaxed">
          Uma conversa de 60 minutos sobre terreno, programa e orçamento, no ateliê em Pinheiros ou por vídeo. Sem
          custo.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={() => startBriefing({ meeting: 'presencial' })}>
          <MapPin size={18} aria-hidden="true" />
          Agendar no ateliê
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => startBriefing({ meeting: 'video' })}>
          <VideoCamera size={18} aria-hidden="true" />
          Agendar por vídeo
        </button>
      </div>
    </div>
  )

  return (
    <section id="metodo" ref={sectionRef} aria-labelledby="metodo-title" className="border-t border-line">
      <div
        ref={pinRef}
        className={
          horizontal ? 'flex h-dvh min-h-[640px] flex-col justify-between overflow-hidden pt-24 pb-8' : 'py-24 md:py-32'
        }
      >
        <div className="container-grid flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="metodo-title" className="h2">
            Etapas do Projeto
          </h2>
          <p className="mono text-sm text-ash">01 a 04 · do terreno à obra</p>
        </div>

        <div className={horizontal ? 'container-grid' : 'container-grid mt-12'}>
          {horizontal && (
            <div aria-hidden="true" className="mb-8 h-px bg-line-strong">
              <div data-method-fill className="h-full origin-left bg-clay" />
            </div>
          )}
          <div className={horizontal ? 'overflow-visible' : 'relative pl-6 md:pl-10'}>
            {!horizontal && (
              <div aria-hidden="true" className="absolute top-0 bottom-0 left-0 w-px bg-line-strong">
                <div data-method-fill-v className="h-full w-full origin-top bg-clay" />
              </div>
            )}
            <ol
              ref={trackRef}
              className={horizontal ? 'flex gap-px will-change-transform' : 'flex flex-col gap-px bg-line'}
            >
              {methodSteps.map((s) => (
                <li
                  key={s.index}
                  data-method-step
                  className={`group/step bg-basalt ${
                    horizontal ? 'w-[min(34rem,40vw)] shrink-0 border border-line p-8' : 'py-8 md:py-10'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="display text-[clamp(4rem,7vw,6.5rem)] leading-none text-limestone/25 transition-colors duration-500 group-[.is-active]/step:text-clay">
                      {s.index}
                    </span>
                    <span className="mono text-xs text-ash">{s.duration}</span>
                  </div>
                  <h3 className="display mt-4 text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[0.95]">{s.title}</h3>
                  <p className="mt-4 max-w-[46ch] leading-relaxed text-limestone/85">{s.body}</p>
                  <ul className="mt-6 border-t border-line">
                    {s.deliverables.map((d) => (
                      <li key={d} className="mono flex gap-3 border-b border-line py-2 text-xs text-ash">
                        <span aria-hidden="true" className="text-limestone">
                          +
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className={horizontal ? 'container-grid' : 'container-grid mt-12'}>{firstStep}</div>
      </div>
    </section>
  )
}
