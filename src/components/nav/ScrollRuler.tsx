import { useRef } from 'react'
import { chapters, type ChapterId } from '../../data/content'
import { ScrollTrigger, useGSAP } from '../../lib/scroll'

const MAX_LEVEL = 24
const ticks = Array.from({ length: MAX_LEVEL / 2 + 1 }, (_, i) => i * 2)

/**
 * Régua de cota: o scroll sobe o "edifício" de +0.00m a +24.00m.
 * Orientação, não decoração: funciona também com movimento reduzido (sem suavização).
 * No desktop ocupa só o gutter direito, com a leitura em texto vertical junto ao marcador.
 */
export function ScrollRuler({ active }: { active: ChapterId }) {
  const markerRef = useRef<HTMLDivElement>(null)
  const readingRef = useRef<HTMLDivElement>(null)
  const levelRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const p = self.progress
        if (markerRef.current) markerRef.current.style.transform = `translateY(${(1 - p) * 100}%)`
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
        if (levelRef.current) levelRef.current.textContent = `+${(p * MAX_LEVEL).toFixed(2)}m`
        // Leitura acima do marcador na metade de baixo, abaixo dele na metade de cima.
        if (readingRef.current)
          readingRef.current.style.transform = p > 0.5 ? 'translateY(10px)' : 'translateY(calc(-100% - 10px))'
      },
    })
    return () => st.kill()
  })

  const index = chapters.findIndex((c) => c.id === active)
  const chapter = chapters[index] ?? chapters[0]

  return (
    <>
      {/* Celular e tablet: linha de progresso sob a barra de navegação. */}
      <div aria-hidden="true" className="fixed inset-x-0 top-16 z-30 h-0.5 bg-line lg:hidden">
        <div ref={barRef} className="h-full origin-left bg-clay" style={{ transform: 'scaleX(0)' }} />
      </div>

      {/* Desktop: régua vertical de níveis no gutter direito. */}
      <div aria-hidden="true" className="pointer-events-none fixed top-16 right-0 bottom-0 z-30 hidden w-8 lg:block">
        <div className="absolute top-8 right-2.5 bottom-8 w-px bg-line-strong">
          {ticks.map((t) => (
            <span
              key={t}
              className={`absolute right-0 h-px bg-line-strong ${t % 4 === 0 ? 'w-2.5' : 'w-1.5'}`}
              style={{ bottom: `${(t / MAX_LEVEL) * 100}%` }}
            />
          ))}
          <div ref={markerRef} className="absolute inset-0" style={{ transform: 'translateY(100%)' }}>
            <span className="absolute -top-px -right-1 block h-0.5 w-3.5 bg-clay" />
            <div
              ref={readingRef}
              className="absolute top-0 right-2 flex items-center gap-2 whitespace-nowrap"
              style={{ writingMode: 'vertical-rl', transform: 'translateY(calc(-100% - 10px))' }}
            >
              <span ref={levelRef} className="mono text-[11px] text-limestone">
                +0.00m
              </span>
              <span className="label text-[10px] text-ash">
                {String(index + 1).padStart(2, '0')}/{String(chapters.length).padStart(2, '0')} {chapter.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
