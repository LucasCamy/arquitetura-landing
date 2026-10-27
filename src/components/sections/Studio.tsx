import { useRef } from 'react'
import { metrics } from '../../data/content'
import { media } from '../../data/media'
import { gsap, ScrollTrigger, useScene } from '../../lib/scroll'
import { MediaImage } from '../ui/MediaImage'
import { SplitWords } from '../ui/SplitWords'

const format = (n: number) => n.toLocaleString('pt-BR')

export function Studio() {
  const sectionRef = useRef<HTMLElement>(null)

  useScene(sectionRef, () => {
    const q = gsap.utils.selector(sectionRef)

    // Trigger: contadores partem de zero ao entrar na viewport, uma vez.
    q('[data-counter]').forEach((el) => {
      const target = Number(el.getAttribute('data-counter'))
      const state = { v: 0 }
      el.textContent = '0'
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () =>
          gsap.to(state, {
            v: target,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = format(Math.round(state.v))
            },
          }),
      })
    })

    // Stagger das palavras do título.
    gsap.from(q('[data-word]'), {
      yPercent: 105,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: { trigger: q('h2')[0], start: 'top 85%', once: true },
    })

    // Clip-path: a maquete aparece como um vão que se abre, com a escala desacelerando.
    const frame = q('[data-reveal]')[0]
    if (!frame) return
    gsap
      .timeline({ scrollTrigger: { trigger: frame, start: 'top 95%', end: 'bottom 80%', scrub: 1 } })
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
      .fromTo(q('[data-reveal] img'), { scale: 1.12 }, { scale: 1, ease: 'none' }, 0)

    return () => {
      q('[data-counter]').forEach((el) => {
        el.textContent = format(Number(el.getAttribute('data-counter')))
      })
    }
  })

  return (
    <section id="estudio" ref={sectionRef} aria-labelledby="estudio-title" className="relative border-t border-line">
      <div className="container-grid">
        <h2 className="sr-only">O estúdio em números</h2>
        <dl className="grid grid-cols-2 gap-px border-x border-b border-line bg-line lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-3 bg-basalt px-4 py-8 md:px-6 md:py-10">
              <dt className="order-2 text-sm text-limestone">{m.label}</dt>
              <dd className="order-1">
                <span className="display flex items-baseline gap-2 text-[clamp(2.75rem,6vw,5rem)] leading-none">
                  <span aria-hidden="true" className="tabular-nums">
                    <span data-counter={m.value}>{format(m.value)}</span>
                    {m.suffix}
                  </span>
                  <span className="sr-only">
                    {format(m.value)}
                    {m.suffix} {m.unit}
                  </span>
                  <span aria-hidden="true" className="mono text-sm font-normal text-ash normal-case">
                    {m.unit}
                  </span>
                </span>
                <span data-cota="x" aria-hidden="true" className="cota mt-4 block" />
              </dd>
              <dd className="order-3 mono text-xs text-ash">{m.context}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-ash">Números demonstrativos para apresentação do layout.</p>
      </div>

      <div className="container-grid grid gap-12 py-24 md:py-32 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6 lg:pr-8">
          <p className="label text-clay-ink">O Estúdio</p>
          <h2 id="estudio-title" className="h2 mt-4">
            <SplitWords text="Onde a Estrutura Define a Forma" />
          </h2>
          <div className="mt-10 gap-8 text-[1.05rem] leading-relaxed text-limestone/90 md:columns-2">
            <p>
              Começamos pelo terreno e pela estrutura. Antes de desenhar fachada, entendemos onde o sol nasce, por onde
              a água escorre e qual vão a laje consegue vencer sem pilar.
            </p>
            <p className="mt-5 md:mt-0">
              Cada projeto passa pela mesa do ateliê como maquete física em 1:200 e 1:50. É ali que cliente, calculista
              e arquitetos decidem juntos o que fica aparente.
            </p>
            <p className="mt-5">
              O resultado são casas e edifícios com poucos materiais, bem resolvidos, que envelhecem com dignidade e
              pedem pouca manutenção.
            </p>
          </div>
        </div>

        <figure className="lg:col-span-6">
          <div data-reveal className="relative aspect-[4/3] overflow-hidden bg-stone">
            <MediaImage asset={media.editorial} sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
          <figcaption className="mt-3 flex justify-between gap-4 border-t border-line pt-3">
            <span className="text-sm text-ash">Maquete de estudo na mesa do ateliê</span>
            <span className="mono shrink-0 text-xs text-ash">esc. 1:200</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
