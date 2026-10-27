import { useRef, useState } from 'react'
import { ArrowUpRight, Info } from '@phosphor-icons/react'
import { partners } from '../../data/content'
import { licenseNotes, media } from '../../data/media'
import { gsap, useScene } from '../../lib/scroll'
import { Dialog } from '../ui/Dialog'
import { MediaImage } from '../ui/MediaImage'
import { SplitWords } from '../ui/SplitWords'

export function Partners() {
  const sectionRef = useRef<HTMLElement>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  useScene(sectionRef, () => {
    const q = gsap.utils.selector(sectionRef)
    gsap.from(q('[data-word]'), {
      yPercent: 105,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: { trigger: q('h2')[0], start: 'top 85%', once: true },
    })
    gsap.from(q('[data-partner]'), {
      y: 64,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.14,
      scrollTrigger: { trigger: q('[data-partners]')[0], start: 'top 80%', once: true },
    })
  })

  const open = partners.find((p) => p.id === openId)

  return (
    <section
      id="socios"
      ref={sectionRef}
      aria-labelledby="socios-title"
      className="border-t border-line py-24 md:py-32"
    >
      <div className="container-grid">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="socios-title" className="h2 lg:col-span-8">
            <SplitWords text="Quem Conduz Cada Projeto" />
          </h2>
          <p className="leading-relaxed text-limestone/90 lg:col-span-4">
            Todo projeto tem um sócio responsável do primeiro croqui à entrega da obra. Você fala com quem desenha.
          </p>
        </div>

        <ul data-partners className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
          {partners.map((p) => {
            const asset = media[p.media]
            return (
              <li key={p.id} data-partner className="group flex flex-col bg-basalt">
                <div className="relative aspect-[3/4] overflow-hidden bg-stone">
                  <MediaImage asset={asset} className="grayscale-rest" sizes="(min-width: 768px) 33vw, 100vw" />
                  <span className="label absolute top-3 left-3 rounded-[var(--radius-badge)] border border-line-strong bg-basalt/80 px-2 py-1 text-[0.65rem] text-ash">
                    Imagem ilustrativa
                  </span>
                  <div className="absolute inset-x-0 bottom-0 translate-y-3 bg-basalt/90 p-4 opacity-0 transition-[opacity,translate] duration-500 ease-out group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
                    <p className="label text-ash">Especialidade</p>
                    <p className="mt-1 text-sm">{p.specialty}</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <p className="label text-ash">{p.role}</p>
                  <h3 className="display mt-2 text-3xl leading-none">{p.name}</h3>
                  <p className="mono mt-3 text-xs text-ash">{p.cau} · registro demonstrativo</p>
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => setOpenId(p.id)}
                    className="btn-text mt-5 self-start"
                  >
                    Trajetória
                    <span className="sr-only"> de {p.name}</span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ash">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          Retratos de banco de imagem (Unsplash) usados como ilustração. Nomes, registros CAU e obras são demonstrativos
          e não representam pessoas reais da equipe.
        </p>
      </div>

      <Dialog
        open={open !== undefined}
        onClose={() => setOpenId(null)}
        eyebrow={open ? `${open.role} · ${open.cau} (demonstrativo)` : undefined}
        title={open?.name ?? ''}
      >
        {open && (
          <div className="grid gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <figure>
              <div className="aspect-[3/4] overflow-hidden bg-stone">
                <MediaImage asset={media[open.media]} />
              </div>
              <figcaption className="mt-3 text-xs leading-relaxed text-ash">
                Imagem ilustrativa de demonstração. Crédito: {media[open.media].credit}. {licenseNotes.stockPeople}
              </figcaption>
            </figure>
            <div>
              <p className="label text-ash">Especialidade</p>
              <p className="mt-1">{open.specialty}</p>
              <p className="mt-6 leading-relaxed text-limestone/90">{open.bio}</p>

              <h3 className="label mt-8 text-ash">Formação</h3>
              <ul className="mt-2 border-t border-line">
                {open.education.map((e) => (
                  <li key={e} className="border-b border-line py-2 text-sm">
                    {e}
                  </li>
                ))}
              </ul>

              <h3 className="label mt-8 text-ash">Obras conduzidas</h3>
              <table className="mt-2 w-full border-t border-line text-left text-sm">
                <caption className="sr-only">Obras conduzidas por {open.name}</caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Obra</th>
                    <th scope="col">Ano</th>
                    <th scope="col">Local</th>
                  </tr>
                </thead>
                <tbody>
                  {open.works.map((w) => (
                    <tr key={w.name} className="border-b border-line">
                      <th scope="row" className="py-2 pr-3 font-semibold">
                        {w.name}
                      </th>
                      <td className="mono py-2 pr-3 text-ash">{w.year}</td>
                      <td className="py-2 text-ash">{w.place}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  )
}
