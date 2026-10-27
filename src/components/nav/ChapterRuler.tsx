import { useRef } from 'react'
import { chapters, type ChapterId } from '../../data/content'
import { ScrollTrigger, useGSAP } from '../../lib/scroll'

/**
 * Régua editorial lateral (NAV-2): fio vertical fixo à esquerda com preenchimento contínuo
 * e o capítulo atual em texto vertical. No celular vira uma linha fina sob a navegação.
 * É orientação, não animação: funciona igual com movimento reduzido.
 */
export function ChapterRuler({ active }: { active: ChapterId }) {
  const fillRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (fillRef.current) fillRef.current.style.transform = `scaleY(${self.progress})`
        if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`
      },
    })
    return () => st.kill()
  })

  const index = Math.max(
    0,
    chapters.findIndex((c) => c.id === active),
  )
  const chapter = chapters[index] ?? chapters[0]
  const label = `${String(index + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-[72px] z-30 h-0.5 lg:hidden"
        style={{ background: 'var(--nav-line)' }}
      >
        <div ref={barRef} className="h-full origin-left bg-clay" style={{ transform: 'scaleX(0)' }} />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-[72px] bottom-0 left-0 z-30 hidden w-[72px] flex-col items-center py-8 transition-colors duration-500 lg:flex"
        style={{ color: 'var(--rail-fg)' }}
      >
        <span className="meta whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          <span className="text-clay">{label}</span>
          <span className="mx-3 opacity-40">·</span>
          {chapter.label}
        </span>
        <div className="relative mt-6 w-px flex-1 bg-current/20">
          <div ref={fillRef} className="absolute inset-0 origin-top bg-clay" style={{ transform: 'scaleY(0)' }} />
        </div>
        <ol className="mt-6 flex flex-col gap-2">
          {chapters.map((c, i) => (
            <li
              key={c.id}
              className={`block size-1.5 rounded-full transition-colors duration-500 ${i === index ? 'bg-clay' : 'bg-current/25'}`}
            />
          ))}
        </ol>
      </div>
    </>
  )
}
