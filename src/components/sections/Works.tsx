import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react'
import { workFilters, workRows, works, type Work, type WorkCategory } from '../../data/content'
import { media } from '../../data/media'
import { useBriefing } from '../../lib/briefing'
import { gsap, ScrollTrigger, useScene } from '../../lib/scroll'
import { Dialog } from '../ui/Dialog'
import { MediaImage } from '../ui/MediaImage'
import { SectionDiagram } from '../ui/SectionDiagram'

const categoryLabel: Record<WorkCategory, string> = {
  residencial: 'Residencial Autoral',
  urbano: 'Urbano e Cultural',
}

export function Works() {
  const sectionRef = useRef<HTMLElement>(null)
  const [filter, setFilter] = useState<'todas' | WorkCategory>('todas')
  const [openId, setOpenId] = useState<string | null>(null)
  const { startBriefing } = useBriefing()

  const visible = works.filter((w) => filter === 'todas' || w.category === filter)
  const rows = workRows
    .map((row) => ({
      ...row,
      items: row.works.map((id) => visible.find((w) => w.id === id)).filter(Boolean) as Work[],
    }))
    .filter((row) => row.items.length > 0)

  // A altura da seção muda com o filtro: recalcula os gatilhos abaixo dela.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [filter])

  // Parallax: fotografia, número da prancha e ficha em velocidades diferentes.
  useScene(sectionRef, () => {
    const q = gsap.utils.selector(sectionRef)
    q('[data-row]').forEach((row) => {
      const st = { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true }
      gsap.fromTo(
        row.querySelector('[data-parallax-img]'),
        { yPercent: -7 },
        { yPercent: 7, ease: 'none', scrollTrigger: st },
      )
      row
        .querySelectorAll('[data-parallax-num]')
        .forEach((num) => gsap.fromTo(num, { yPercent: 40 }, { yPercent: -40, ease: 'none', scrollTrigger: st }))
      row
        .querySelectorAll('[data-parallax-ficha]')
        .forEach((f) => gsap.fromTo(f, { y: 18 }, { y: -18, ease: 'none', scrollTrigger: st }))
    })
    gsap.from(q('[data-word]'), {
      yPercent: 105,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.07,
      scrollTrigger: { trigger: q('h2')[0], start: 'top 85%', once: true },
    })
  }, [filter])

  const open = works.find((w) => w.id === openId)

  return (
    <section id="obras" ref={sectionRef} aria-labelledby="obras-title" className="border-t border-line py-24 md:py-32">
      <div className="container-grid">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="label text-ash">Obras e Tipologias</p>
            <h2 id="obras-title" className="h2 mt-4">
              <span className="mask">
                <span data-word>Como</span>
              </span>{' '}
              <span className="mask">
                <span data-word>Projetamos</span>
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="leading-relaxed text-limestone/90">
              Seis frentes de trabalho, um mesmo método. Abra a prancha técnica de cada uma para ver corte, ficha e
              prazo médio de projeto.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-y border-line py-4 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Filtrar por tipologia" className="flex flex-wrap gap-2">
            {workFilters.map((f) => {
              const pressed = filter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setFilter(f.id)}
                  className={`min-h-11 rounded-[var(--radius-control)] border px-4 text-sm font-semibold transition-colors ${
                    pressed
                      ? 'border-limestone bg-limestone text-basalt'
                      : 'border-line-strong text-limestone hover:border-limestone'
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
          <p className="mono text-xs text-ash" aria-live="polite">
            Exibindo {visible.length} de {works.length} frentes
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-16 md:gap-24">
          {rows.map((row, rowIndex) => {
            const asset = media[row.media]
            const reversed = rowIndex % 2 === 1
            return (
              <div key={row.media} data-row className="grid gap-px bg-line md:grid-cols-12">
                <figure
                  className={`relative overflow-hidden bg-stone md:col-span-7 ${reversed ? 'md:order-2' : ''}`}
                  style={{ aspectRatio: asset.ratio >= 1 ? '4 / 3' : '4 / 5' }}
                >
                  <div data-parallax-img className="absolute inset-x-0 -top-[8%] h-[116%]">
                    <MediaImage asset={asset} sizes="(min-width: 768px) 58vw, 100vw" />
                  </div>
                  <figcaption className="label absolute bottom-0 left-0 bg-basalt/85 px-3 py-2 text-ash">
                    {row.caption}
                  </figcaption>
                </figure>
                <ul className={`flex flex-col gap-px md:col-span-5 ${reversed ? 'md:order-1' : ''}`}>
                  {row.items.map((w) => (
                    <li key={w.id} className="relative flex flex-1 flex-col overflow-hidden bg-basalt p-5 md:p-8">
                      <span
                        data-parallax-num
                        aria-hidden="true"
                        className="display pointer-events-none absolute -top-2 right-3 text-[clamp(5rem,9vw,8.5rem)] leading-none text-limestone/[0.07]"
                      >
                        {w.index}
                      </span>
                      <p className="label text-ash">
                        {w.index} · {categoryLabel[w.category]}
                      </p>
                      <h3 className="display mt-3 max-w-[16ch] text-[clamp(1.75rem,2.6vw,2.4rem)] leading-[0.95]">
                        {w.title}
                      </h3>
                      <p className="mt-4 max-w-[42ch] text-[0.98rem] leading-relaxed text-limestone/85">{w.summary}</p>
                      <dl
                        data-parallax-ficha
                        className="mono mt-6 grid grid-cols-2 gap-px border border-line bg-line text-xs"
                      >
                        <div className="bg-basalt p-3">
                          <dt className="text-ash">Área média</dt>
                          <dd className="mt-1 text-limestone">{w.ficha.area}</dd>
                        </div>
                        <div className="bg-basalt p-3">
                          <dt className="text-ash">Prazo</dt>
                          <dd className="mt-1 text-limestone">{w.ficha.prazo}</dd>
                        </div>
                      </dl>
                      <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={() => setOpenId(w.id)}
                        className="btn-text mt-6 self-start"
                      >
                        Explorar
                        <span className="sr-only"> {w.title}</span>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      <Dialog
        open={open !== undefined}
        onClose={() => setOpenId(null)}
        eyebrow={open ? `Prancha técnica ${open.index} · ${categoryLabel[open.category]}` : undefined}
        title={open?.title ?? ''}
        footer={
          open && (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-ash">
                Valores de referência. A ficha do seu projeto sai do estudo preliminar.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const id = open.id
                  setOpenId(null)
                  startBriefing({ scope: id })
                }}
              >
                Iniciar estudo nesta tipologia
                <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>
          )
        }
      >
        {open && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div>
              <div className="border border-line bg-basalt p-2 md:p-3">
                <SectionDiagram profile={open.profile} title={open.title} />
              </div>
              <p className="mt-3 text-sm text-ash">
                Corte esquemático sem escala, com níveis em metros e incidência solar.
              </p>
            </div>
            <div>
              <p className="leading-relaxed text-limestone/90">{open.summary}</p>
              <dl className="mt-6 border-t border-line">
                {(
                  [
                    ['Metragem média', open.ficha.area],
                    ['Sistema estrutural', open.ficha.estrutura],
                    ['Insolação', open.ficha.insolacao],
                    ['Materialidade', open.ficha.materialidade],
                    ['Prazo de projeto', open.ficha.prazo],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 border-b border-line py-3"
                  >
                    <dt className="text-sm text-ash">{label}</dt>
                    <dd className="mono text-sm">{value}</dd>
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
