import { useEffect, useId, useRef, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { faqs } from '../../data/content'
import { useBriefing } from '../../lib/briefing'
import { NAV_HEIGHT, ScrollTrigger, useScene } from '../../lib/scroll'
import { RichTitle } from '../ui/RichTitle'

export function Faq() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLDivElement>(null)
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set([0]))
  const baseId = useId()
  const { startProject } = useBriefing()

  // Coluna esquerda fixa enquanto o acordeão rola (desktop com movimento).
  useScene(sectionRef, ({ desktop }) => {
    if (!desktop || !gridRef.current || !asideRef.current) return
    const aside = asideRef.current
    const offset = NAV_HEIGHT + 48
    ScrollTrigger.create({
      trigger: gridRef.current,
      start: `top top+=${offset}`,
      end: () => `bottom top+=${offset + aside.offsetHeight}`,
      pin: aside,
      pinSpacing: false,
      invalidateOnRefresh: true,
    })
  })

  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 360)
    return () => window.clearTimeout(id)
  }, [openSet])

  const toggle = (i: number) =>
    setOpenSet((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <section id="perguntas" ref={sectionRef} aria-labelledby="perguntas-title" className="bg-linen py-28 md:py-40">
      <div ref={gridRef} className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div ref={asideRef} className="lg:pr-6">
            <p className="meta text-clay-ink">Perguntas frequentes</p>
            <RichTitle id="perguntas-title" text="Antes da primeira *conversa*." className="t-section mt-4" />
            <p className="mt-6 max-w-[38ch] leading-relaxed text-ink-2">
              Metragem, reforma, construtoras e honorários. Se a sua dúvida não estiver aqui, ela é um bom começo.
            </p>
            <button type="button" className="pill pill-outline mt-8" onClick={() => startProject()}>
              Enviar minha pergunta{' '}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>

        <ol className="border-t border-line lg:col-span-7">
          {faqs.map((f, i) => {
            const isOpen = openSet.has(i)
            const buttonId = `${baseId}-b${i}`
            const panelId = `${baseId}-p${i}`
            return (
              <li key={f.q} className="border-b border-line">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                    className="group flex min-h-16 w-full items-start gap-5 py-6 text-left"
                  >
                    <span className="meta pt-2 text-ink-2">{String(i + 1).padStart(2, '0')}</span>
                    <span className="serif flex-1 text-[clamp(1.3rem,1.9vw,1.7rem)] leading-snug">{f.q}</span>
                    <span
                      aria-hidden="true"
                      className={`mt-1 grid size-9 shrink-0 place-items-center rounded-full border transition-[transform,background-color,color] duration-300 ${
                        isOpen ? 'rotate-45 border-ink bg-ink text-linen' : 'border-line group-hover:border-ink'
                      }`}
                    >
                      <Plus size={16} />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="flex gap-5 overflow-hidden">
                    <span aria-hidden="true" className="meta invisible">
                      00
                    </span>
                    <p className="max-w-[58ch] pb-7 leading-relaxed text-ink-2">{f.a}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
