import { useRef, useState } from 'react'
import { materials } from '../../data/content'
import { cropStyle, generated, media } from '../../data/media'
import { gsap, ScrollTrigger, useCanAnimate, useIsDesktop, useScene } from '../../lib/scroll'
import { RichTitle } from '../ui/RichTitle'

/** SIGN-2: mesa de amostras. Hover, foco, clique ou a própria rolagem trocam a foto aplicada. */
export function Materials() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const pickedAt = useRef(0)
  const pick = (i: number) => {
    pickedAt.current = performance.now()
    setActive(i)
  }
  const canAnimate = useCanAnimate()
  const isDesktop = useIsDesktop()
  const pinned = canAnimate && isDesktop
  const current = materials[active] ?? materials[0]!

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
      gsap.from(q('[data-swatch]'), {
        opacity: 0,
        y: 36,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: q('[data-swatches]')[0], start: 'top 80%', once: true },
      })
      if (!desktop || !gridRef.current || !asideRef.current) return
      const aside = asideRef.current
      const offset = 72 + 40
      // Coluna da foto fixa enquanto a lista de amostras passa.
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: `top top+=${offset}`,
        end: () => `bottom top+=${offset + aside.offsetHeight}`,
        pin: aside,
        pinSpacing: false,
        invalidateOnRefresh: true,
      })
      // A amostra que cruza o meio da tela vira a ativa.
      q('[data-swatch]').forEach((el, i) =>
        ScrollTrigger.create({
          trigger: el,
          start: 'top 58%',
          end: 'bottom 58%',
          onToggle: (self) => {
            if (self.isActive && performance.now() - pickedAt.current > 1500) setActive(i)
          },
        }),
      )
    },
    [pinned],
  )

  return (
    <section
      id="materiais"
      ref={sectionRef}
      aria-labelledby="materiais-title"
      className="bg-linen pt-10 pb-28 md:pb-40"
    >
      <div className="shell">
        <div className="max-w-[46rem]">
          <p className="meta text-clay-ink">04 · Materiais</p>
          <RichTitle
            id="materiais-title"
            text="Poucos materiais, escolhidos para *envelhecer* bem."
            className="t-section mt-4"
          />
        </div>

        <div ref={gridRef} className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div
            className={`sticky top-[84px] z-10 self-start bg-linen pb-4 lg:col-span-6 lg:pb-0 ${pinned ? 'lg:static' : 'lg:top-[112px]'}`}
          >
            <div ref={asideRef}>
              <figure>
                <div className="frame">
                  <div className="relative h-[34dvh] overflow-hidden md:h-[44dvh] lg:aspect-[4/5] lg:h-auto lg:max-h-[calc(100dvh-220px)] lg:w-full">
                    {materials.map((m, i) => (
                      <div
                        key={m.id}
                        aria-hidden={i !== active}
                        className={`absolute inset-0 overflow-hidden transition-[opacity,scale] duration-700 ease-[var(--ease-out)] ${
                          i === active ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'
                        }`}
                      >
                        <img
                          src={media[m.crop.media].src}
                          alt={i === active ? m.alt : ''}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                          style={cropStyle(m.crop)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <figcaption className="meta mt-4 text-ink-2" aria-live="polite">
                  {current.caption}
                </figcaption>
              </figure>
            </div>
          </div>

          <ol data-swatches className="lg:col-span-6" aria-label="Amostras de material">
            {materials.map((m, i) => {
              const isActive = i === active
              return (
                <li key={m.id} data-swatch className="border-t border-line last:border-b lg:py-3">
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => pick(i)}
                    onMouseEnter={() => pick(i)}
                    onFocus={() => pick(i)}
                    className="group flex w-full items-center gap-5 py-5 text-left md:gap-7"
                  >
                    <span
                      className={`relative size-20 shrink-0 overflow-hidden rounded-[2px] transition-[translate,box-shadow] duration-300 md:size-24 ${
                        isActive ? '-translate-y-0.5 shadow-soft ring-1 ring-ink' : 'group-hover:-translate-y-0.5'
                      }`}
                    >
                      <img
                        src={generated.swatch(m.id)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="meta text-ink-2">{m.index}</span>
                      <span
                        className={`serif mt-1 block text-[clamp(1.5rem,2.2vw,2rem)] leading-tight ${isActive ? 'italic text-clay-ink' : ''}`}
                      >
                        {m.name}
                      </span>
                      <span className="mt-1 block text-[0.95rem] text-ink-2">{m.use}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`hidden text-xl transition-[opacity,translate] duration-300 sm:block ${isActive ? 'opacity-100' : 'opacity-0 -translate-x-2'}`}
                    >
                      →
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
