import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { croqui } from '../../data/content'
import { generated, media } from '../../data/media'
import { useBriefing } from '../../lib/briefing'
import { gsap, useScene } from '../../lib/scroll'
import { MediaImage } from '../ui/MediaImage'
import { RichTitle } from '../ui/RichTitle'

const clamp = (v: number) => Math.max(0, Math.min(100, v))

/**
 * SIGN-1: croqui (gerado a partir da própria foto, mesmo enquadramento) sobre a obra entregue.
 * A posição da cortina vive numa variável CSS; React só guarda o valor arredondado para o ARIA.
 */
export function Croqui() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const posRef = useRef(50)
  const touchedRef = useRef(false)
  const sweepRef = useRef<gsap.core.Tween | null>(null)
  const [ariaPos, setAriaPos] = useState(50)
  const { startProject } = useBriefing()

  const apply = useCallback((value: number) => {
    const v = clamp(value)
    posRef.current = v
    stageRef.current?.style.setProperty('--pos', `${v}%`)
    setAriaPos(Math.round(v))
  }, [])

  // O usuário assumiu a cortina: a varredura pelo scroll para de interferir.
  const takeOver = () => {
    if (touchedRef.current) return
    touchedRef.current = true
    sweepRef.current?.scrollTrigger?.kill()
    sweepRef.current?.kill()
  }

  useScene(sectionRef, () => {
    const q = gsap.utils.selector(sectionRef)
    gsap.from(q('[data-word]'), {
      yPercent: 110,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: { trigger: q('h2')[0], start: 'top 85%', once: true },
    })
    if (touchedRef.current) return
    const proxy = { pos: 25 }
    apply(25)
    sweepRef.current = gsap.to(proxy, {
      pos: 55,
      ease: 'none',
      onUpdate: () => {
        if (!touchedRef.current) apply(proxy.pos)
      },
      scrollTrigger: { trigger: stageRef.current, start: 'top 80%', end: 'center 45%', scrub: 1 },
    })
    return () => {
      sweepRef.current = null
      if (!touchedRef.current) apply(50)
    }
  })

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    apply(((e.clientX - r.left) / r.width) * 100)
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 5
    const map: Record<string, number> = {
      ArrowLeft: posRef.current - step,
      ArrowDown: posRef.current - step,
      ArrowRight: posRef.current + step,
      ArrowUp: posRef.current + step,
      Home: 0,
      End: 100,
      PageDown: posRef.current - 20,
      PageUp: posRef.current + 20,
    }
    const next = map[e.key]
    if (next === undefined) return
    e.preventDefault()
    takeOver()
    apply(next)
  }

  return (
    <section id="croqui" ref={sectionRef} aria-labelledby="croqui-title" className="bg-linen py-28 md:py-40">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="meta text-clay-ink">03 · Do croqui ao espaço</p>
            <RichTitle id="croqui-title" text={croqui.title} className="t-section mt-4" />
          </div>
          <p className="max-w-[44ch] leading-relaxed text-ink-2 lg:col-span-5">{croqui.intro}</p>
        </div>

        <div
          ref={stageRef}
          className="relative mt-12 aspect-[4/5] cursor-ew-resize touch-pan-y overflow-hidden rounded-[2px] select-none md:aspect-[16/10] [&_img]:[-webkit-user-drag:none]"
          style={{ ['--pos' as string]: '50%' }}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            if (e.button !== 0) return
            takeOver()
            e.currentTarget.setPointerCapture(e.pointerId)
            fromPointer(e)
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e)
          }}
          onPointerUp={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
          }}
        >
          {/* Mesmo arquivo de origem, mesmas dimensões e mesmo object-position: alinhamento exato. */}
          <MediaImage asset={media.hero} sizes="(min-width: 1360px) 1200px, 100vw" />
          <div className="absolute inset-0" style={{ clipPath: 'inset(0 calc(100% - var(--pos)) 0 0)' }}>
            <img
              src={generated.croqui.src}
              alt={generated.croqui.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ objectPosition: media.hero.objectPosition }}
            />
          </div>

          <span className="meta pointer-events-none absolute top-4 left-4 rounded-full bg-linen/90 px-3 py-1.5 text-ink">
            {croqui.before}
          </span>
          <span className="meta pointer-events-none absolute top-4 right-4 rounded-full bg-ink/80 px-3 py-1.5 text-linen">
            {croqui.after}
          </span>

          <div className="pointer-events-none absolute inset-y-0" style={{ left: 'var(--pos)' }}>
            <div className="absolute inset-y-0 -left-px w-0.5 bg-linen shadow-[0_0_0_1px_rgba(28,27,24,0.15)]" />
          </div>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Comparar croqui de 2022 e casa entregue em 2024"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={ariaPos}
            aria-valuetext={`${ariaPos}% de croqui visível`}
            onKeyDown={onKey}
            className="absolute top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full bg-linen text-ink shadow-soft active:cursor-grabbing"
            style={{ left: 'var(--pos)' }}
          >
            <span className="flex items-center" aria-hidden="true">
              <CaretLeft size={16} weight="bold" />
              <CaretRight size={16} weight="bold" />
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[2px] bg-line sm:grid-cols-3 lg:grid-cols-6 lg:flex-1">
            {croqui.specs.map((s) => (
              <div key={s.label} className="bg-sand px-4 py-3">
                <dt className="meta text-ink-2-deep">{s.label}</dt>
                <dd className="mt-1 text-[0.95rem] font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            className="link-arrow shrink-0 self-start lg:self-center"
            onClick={() => startProject({ message: 'Gostaria de conversar sobre o estudo da minha casa.' })}
          >
            Conversar sobre o seu estudo <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
