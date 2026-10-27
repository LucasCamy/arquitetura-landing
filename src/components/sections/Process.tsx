import { useRef } from 'react'
import { processSteps } from '../../data/content'
import { media } from '../../data/media'
import { useBriefing } from '../../lib/briefing'
import { gsap, ScrollTrigger, useCanAnimate, useIsDesktop, useScene } from '../../lib/scroll'
import { MediaImage } from '../ui/MediaImage'
import { RichTitle } from '../ui/RichTitle'

/** METH-2: coluna esquerda fixa e seis etapas com foco de leitura por opacidade. */
export function Process() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLDivElement>(null)
  const canAnimate = useCanAnimate()
  const isDesktop = useIsDesktop()
  const pinned = canAnimate && isDesktop
  const { startProject } = useBriefing()

  useScene(
    sectionRef,
    ({ desktop }) => {
      const q = gsap.utils.selector(sectionRef)
      gsap.from(q('[data-word]'), {
        yPercent: 110,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: q('h2')[0], start: 'top 85%', once: true },
      })

      // Foco de leitura: só a etapa na faixa central fica opaca.
      const steps = q('[data-step]')
      gsap.set(steps, { opacity: 0.25 })
      steps.forEach((step) =>
        ScrollTrigger.create({
          trigger: step,
          start: 'top 62%',
          end: 'bottom 42%',
          onToggle: (self) =>
            gsap.to(step, { opacity: self.isActive ? 1 : 0.25, duration: 0.6, ease: 'power2.out', overwrite: true }),
        }),
      )

      if (!desktop || !gridRef.current || !asideRef.current) return
      const aside = asideRef.current
      const offset = 72 + 40
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: `top top+=${offset}`,
        end: () => `bottom top+=${offset + aside.offsetHeight}`,
        pin: aside,
        pinSpacing: false,
        invalidateOnRefresh: true,
      })
    },
    [pinned],
  )

  return (
    <section id="processo" ref={sectionRef} aria-labelledby="processo-title" className="bg-linen py-28 md:py-40">
      <div ref={gridRef} className="shell grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div ref={asideRef}>
            <p className="meta text-clay-ink">05 · Processo</p>
            <RichTitle id="processo-title" text="Seis etapas, uma só *interlocutora*." className="t-section mt-4" />
            <p className="mt-6 max-w-[40ch] leading-relaxed text-ink-2">
              De 5 a 8 meses de projeto e toda a obra acompanhada pela mesma arquiteta. Você sabe sempre o que está
              acontecendo e quem responde por isso.
            </p>
            <figure className="mt-8">
              <div className="frame">
                <div className="aspect-[4/3] max-h-[32dvh] w-full overflow-hidden lg:max-h-[30dvh]">
                  <MediaImage asset={media.editorial} sizes="(min-width: 1024px) 35vw, 100vw" />
                </div>
              </div>
              <figcaption className="meta mt-3 text-ink-2">Mesa de projeto · estúdio no Jardim Europa</figcaption>
            </figure>
            <button type="button" className="pill pill-dark mt-8" onClick={() => startProject()}>
              Agendar a primeira conversa{' '}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>

        <ol className="lg:col-span-6 lg:col-start-7 lg:pt-[18dvh] lg:pb-[24dvh]">
          {processSteps.map((s) => (
            <li key={s.index} data-step className="border-t border-line py-10 last:border-b md:py-14">
              <div className="flex items-baseline gap-5">
                <span className="serif text-[clamp(2.4rem,4vw,3.6rem)] leading-none text-clay italic">{s.index}</span>
                <h3 className="serif text-[clamp(1.7rem,2.6vw,2.4rem)] leading-tight">{s.title}</h3>
              </div>
              <p className="mt-4 max-w-[46ch] leading-relaxed text-ink-2">{s.body}</p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="meta text-ink-2">Prazo de referência</dt>
                  <dd className="meta mt-1 text-ink">{s.time}</dd>
                </div>
                <div>
                  <dt className="meta text-ink-2">Entregas</dt>
                  <dd className="meta mt-1 text-ink">{s.output}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
