import { useRef } from 'react'
import { Info } from '@phosphor-icons/react'
import { studio } from '../../data/content'
import { media } from '../../data/media'
import { gsap, useScene } from '../../lib/scroll'
import { MediaImage } from '../ui/MediaImage'
import { RichTitle } from '../ui/RichTitle'

/** TEAM-2: autoria da fundadora, com retrato amplo, citação e credenciais. */
export function Studio() {
  const sectionRef = useRef<HTMLElement>(null)

  useScene(sectionRef, () => {
    const q = gsap.utils.selector(sectionRef)
    const frame = q('[data-reveal]')[0]
    if (frame)
      gsap.fromTo(
        frame,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top 90%', end: 'top 35%', scrub: 1 },
        },
      )
    gsap.from(q('[data-word]'), {
      yPercent: 110,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.05,
      scrollTrigger: { trigger: q('h2')[0], start: 'top 85%', once: true },
    })
    gsap.from(q('[data-in]'), {
      opacity: 0,
      y: 28,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: q('blockquote')[0], start: 'top 85%', once: true },
    })
  })

  return (
    <section id="estudio" ref={sectionRef} aria-labelledby="estudio-title" className="bg-sand py-28 md:py-40">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
        <figure className="lg:col-span-5">
          <div data-reveal className="aspect-[3/4] overflow-hidden rounded-[2px]">
            <MediaImage asset={media.team01} sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
          <figcaption className="mt-4">
            <span className="meta block text-ink-2-deep">{studio.caption}</span>
            <span className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink-2-deep">
              <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              Imagem ilustrativa de banco (Unsplash). Pessoa, nome e registro demonstrativos.
            </span>
          </figcaption>
        </figure>

        <div className="flex flex-col lg:col-span-6 lg:col-start-7 lg:pt-10">
          <p className="meta text-clay-ink">06 · Estúdio</p>
          <RichTitle id="estudio-title" text={studio.title} className="t-section mt-4" />
          <blockquote data-in className="mt-10 border-l-2 border-clay pl-6">
            <p className="serif text-[clamp(1.5rem,2.4vw,2.1rem)] leading-snug italic">“{studio.quote}”</p>
            <footer className="meta mt-4 text-ink-2-deep">Cecília Moura</footer>
          </blockquote>
          <div data-in className="mt-10 grid gap-5 leading-relaxed text-ink-2-deep md:grid-cols-2">
            {studio.bio.map((b) => (
              <p key={b.slice(0, 16)}>{b}</p>
            ))}
          </div>
          <dl data-in className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-5">
            {studio.credentials.map((c) => (
              <div key={c.label}>
                <dt className="meta text-ink-2-deep">{c.label}</dt>
                <dd className="mt-1 font-semibold">{c.value}</dd>
              </div>
            ))}
          </dl>
          <div data-in className="mt-10 border-t border-line pt-6">
            <p className="text-sm text-ink-2-deep">{studio.teamNote}</p>
            <ul className="mt-4 flex flex-wrap gap-6">
              {studio.team.map((t) => (
                <li key={t.name} className="flex items-center gap-3">
                  <span className="size-14 overflow-hidden rounded-full">
                    <MediaImage asset={media[t.media]} sizes="56px" decorative />
                  </span>
                  <span>
                    <span className="block font-semibold">{t.name}</span>
                    <span className="block text-sm text-ink-2-deep">{t.role}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-2-deep">Retratos ilustrativos de banco de imagem.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
