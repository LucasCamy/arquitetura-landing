import { useEffect, useId, useRef, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { faqs } from '../../data/content'
import { useBriefing } from '../../lib/briefing'
import { NAV_HEIGHT, ScrollTrigger, useScene } from '../../lib/scroll'

export function Faq() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLDivElement>(null)
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set([0]))
  const baseId = useId()
  const { startBriefing } = useBriefing()

  // Pin da coluna esquerda enquanto o acordeão rola (só desktop com movimento).
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

  // Altura muda ao abrir/fechar: recalcula depois da transição.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 320)
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
    <section
      id="duvidas"
      ref={sectionRef}
      aria-labelledby="duvidas-title"
      className="border-t border-line py-24 md:py-32"
    >
      <div ref={gridRef} className="container-grid grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div ref={asideRef} className="lg:pr-10">
            <p className="label text-clay-ink">Dúvidas</p>
            <h2 id="duvidas-title" className="h2 mt-4">
              Perguntas Frequentes
            </h2>
            <p className="mt-6 max-w-[40ch] leading-relaxed text-limestone/90">
              Prazos, obra, terreno e honorários. Se a sua dúvida não estiver aqui, ela é um bom começo de conversa.
            </p>
            <button type="button" className="btn btn-secondary mt-8" onClick={() => startBriefing({})}>
              Enviar minha pergunta
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
                    className="group flex min-h-16 w-full items-start gap-4 py-5 text-left md:gap-6"
                  >
                    <span className="mono pt-1 text-sm text-ash">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1 text-lg leading-snug font-semibold md:text-xl">{f.q}</span>
                    <Plus
                      size={20}
                      aria-hidden="true"
                      className={`mt-1 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45 text-clay' : 'text-ash group-hover:text-limestone'}`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="flex gap-4 overflow-hidden md:gap-6">
                    <span aria-hidden="true" className="mono invisible text-sm">
                      00
                    </span>
                    <p className="max-w-[60ch] pb-6 leading-relaxed text-limestone/85">{f.a}</p>
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
