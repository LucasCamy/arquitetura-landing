import { useRef, useState, type PointerEvent } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { projects, type Project } from '../../data/content'
import { media } from '../../data/media'
import { gsap, ScrollTrigger, scrollToY, useCanAnimate, useGSAP, useIsDesktop, useScene } from '../../lib/scroll'
import { setThemeFlag } from '../../lib/theme'
import { MediaImage } from '../ui/MediaImage'
import { RichTitle } from '../ui/RichTitle'
import { PortfolioDialog } from './PortfolioDialog'

const TOTAL = projects.length
const pad = (n: number) => String(n).padStart(2, '0')

function Meta({ p }: { p: Project }) {
  return (
    <p className="meta text-night-2">
      {[p.city, p.area, p.year, p.scope].map((item, i) => (
        <span key={item}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          {item}
        </span>
      ))}
    </p>
  )
}

function FinalCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <p className="serif text-[clamp(1.8rem,2.6vw,2.6rem)] leading-[1.12]">
        Portfólio completo, plantas e <em>visitas</em> a obras entregues.
      </p>
      <button type="button" aria-haspopup="dialog" onClick={onOpen} className="pill pill-light self-start">
        Pedir portfólio{' '}
        <span className="arrow" aria-hidden="true">
          →
        </span>
      </button>
    </div>
  )
}

export function Projects({ onOpenPrivacy }: { onOpenPrivacy: () => void }) {
  const canAnimate = useCanAnimate()
  const isDesktop = useIsDesktop()
  const horizontal = canAnimate && isDesktop
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)
  const sealRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const drag = useRef<{ x: number; scroll: number; moved: boolean } | null>(null)
  const [current, setCurrent] = useState(0)
  const [portfolioOpen, setPortfolioOpen] = useState(false)

  // Capítulo escuro: a navegação e a régua invertem enquanto Projetos ocupa o topo da tela.
  useGSAP(() => {
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 72px',
      end: 'bottom 72px',
      // Calculado depois do pin desta seção, para o fim incluir a distância do trilho.
      refreshPriority: -1,
      onToggle: (self) => setThemeFlag('projects', self.isActive),
    })
    return () => {
      st.kill()
      setThemeFlag('projects', false)
    }
  })

  useScene(
    sectionRef,
    ({ desktop }) => {
      const section = sectionRef.current
      const q = gsap.utils.selector(sectionRef)
      // Transição de fundo: o linho escurece até o carvão enquanto a seção sobe.
      gsap.fromTo(
        section,
        { backgroundColor: '#F2EFE9' },
        {
          backgroundColor: '#191815',
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top 95%', end: 'top 30%', scrub: true },
        },
      )
      gsap.from(q('[data-word]'), {
        yPercent: 110,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: q('h2')[0], start: 'top 85%', once: true },
      })

      const track = trackRef.current
      if (!desktop || !track || !pinRef.current) return
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)
      // Deslocamento de cada card em relação ao primeiro: o card ativo é o último que já chegou à esquerda.
      let offsets: number[] = []
      const measure = () => {
        const cards = [...track.querySelectorAll<HTMLElement>('[data-card]')]
        const first = cards[0]?.offsetLeft ?? 0
        offsets = cards.map((c) => c.offsetLeft - first)
      }
      measure()
      let last = -1
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pinRef.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: measure,
          onUpdate: (self) => {
            if (dotRef.current) dotRef.current.style.left = `${self.progress * 100}%`
            const moved = self.progress * distance() + window.innerWidth * 0.25
            const reached = offsets.filter((o) => o <= moved).length - 1
            const idx = self.progress > 0.98 ? TOTAL - 1 : Math.max(0, Math.min(TOTAL - 1, reached))
            if (idx !== last) {
              last = idx
              setCurrent(idx)
            }
          },
        },
      })
      triggerRef.current = tween.scrollTrigger ?? null

      // Parallax horizontal dentro de cada fotografia enquanto o trilho desliza.
      q('[data-card]').forEach((card) => {
        const img = card.querySelector('[data-parallax]')
        if (!img) return
        gsap.fromTo(
          img,
          { xPercent: -7 },
          {
            xPercent: 7,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        )
      })

      // Selo "Arraste" segue o ponteiro.
      const seal = sealRef.current
      if (seal) {
        gsap.set(seal, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 })
        const moveX = gsap.quickTo(seal, 'x', { duration: 0.45, ease: 'power3' })
        const moveY = gsap.quickTo(seal, 'y', { duration: 0.45, ease: 'power3' })
        const area = seal.parentElement
        const onMove = (e: globalThis.PointerEvent) => {
          if (e.pointerType !== 'mouse' || !area) return
          const r = area.getBoundingClientRect()
          moveX(e.clientX - r.left)
          moveY(e.clientY - r.top)
        }
        const show = (e: globalThis.PointerEvent) => {
          if (e.pointerType === 'mouse') gsap.to(seal, { scale: 1, opacity: 1, duration: 0.35, ease: 'power3.out' })
        }
        const hide = () => gsap.to(seal, { scale: 0, opacity: 0, duration: 0.25 })
        area?.addEventListener('pointermove', onMove)
        area?.addEventListener('pointerenter', show)
        area?.addEventListener('pointerleave', hide)
        return () => {
          area?.removeEventListener('pointermove', onMove)
          area?.removeEventListener('pointerenter', show)
          area?.removeEventListener('pointerleave', hide)
          triggerRef.current = null
        }
      }
      return () => {
        triggerRef.current = null
      }
    },
    [horizontal],
  )

  const goTo = (index: number) => {
    const st = triggerRef.current
    const track = trackRef.current
    if (!st || !track) return
    const clamped = Math.max(0, Math.min(TOTAL - 1, index))
    const card = track.querySelectorAll<HTMLElement>('[data-card]')[clamped]
    if (!card) return
    const first = track.querySelector<HTMLElement>('[data-card]')
    const offset = card.offsetLeft - (first?.offsetLeft ?? 0)
    scrollToY(Math.min(st.end, st.start + offset + (clamped === TOTAL - 1 ? 0 : 2)))
  }

  // Arrastar o trilho converte o deslocamento horizontal em scroll (1:1 com o trilho).
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!horizontal || e.button !== 0 || (e.target as HTMLElement).closest('button, a')) return
    drag.current = { x: e.clientX, scroll: window.scrollY, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const st = triggerRef.current
    if (!d || !st) return
    const delta = d.x - e.clientX
    if (Math.abs(delta) > 4) d.moved = true
    scrollToY(Math.max(st.start, Math.min(st.end, d.scroll + delta)), true)
  }
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <section
      id="projetos"
      ref={sectionRef}
      aria-labelledby="projetos-title"
      className="on-dark relative bg-night text-linen"
    >
      <div ref={pinRef} className={horizontal ? 'flex h-dvh min-h-[640px] flex-col pt-[100px] pb-7' : 'py-24 md:py-32'}>
        <div className="shell flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="meta text-clay-glow">02 · Projetos</p>
            <RichTitle id="projetos-title" text="Casas que já têm *moradores*." className="t-section mt-4" />
          </div>
          <p className="meta text-night-2">{pad(TOTAL)} obras selecionadas</p>
        </div>

        {horizontal ? (
          <>
            <div
              className="relative mt-8 min-h-0 flex-1 cursor-grab touch-pan-y select-none active:cursor-grabbing [&_img]:[-webkit-user-drag:none]"
              onDragStart={(e) => e.preventDefault()}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <ol
                ref={trackRef}
                className="flex h-full items-stretch gap-10 pr-[12vw] pl-[max(96px,calc((100vw-1360px)/2+96px))] will-change-transform"
              >
                {projects.map((p) => (
                  <li key={p.index} data-card className="flex h-full shrink-0 flex-col">
                    <figure
                      className={`relative min-h-0 flex-1 overflow-hidden rounded-[2px] ${p.orientation === 'landscape' ? 'aspect-[16/10]' : 'aspect-[4/5]'}`}
                    >
                      <div data-parallax className="absolute inset-y-0 -left-[9%] w-[118%]">
                        <MediaImage asset={media[p.media]} sizes="60vw" />
                      </div>
                    </figure>
                    <div className="mt-5 flex max-w-[34rem] items-baseline gap-4">
                      <span className="meta text-clay-glow">{p.index}</span>
                      <div>
                        <h3 className="serif text-[1.7rem] leading-tight">{p.name}</h3>
                        <Meta p={p} />
                      </div>
                    </div>
                  </li>
                ))}
                <li className="w-[min(26rem,30vw)] shrink-0">
                  <FinalCard onOpen={() => setPortfolioOpen(true)} />
                </li>
              </ol>
              <div
                ref={sealRef}
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 z-10 grid size-24 place-items-center rounded-full bg-linen text-ink shadow-soft"
              >
                <span className="meta">Arraste</span>
              </div>
            </div>

            <div className="shell mt-6 flex items-center gap-6">
              <p className="meta w-20 shrink-0 tabular-nums" aria-live="polite">
                {pad(current + 1)} / {pad(TOTAL)}
                <span className="sr-only">: {projects[current]?.name}</span>
              </p>
              <div className="relative h-px flex-1 bg-line-night" aria-hidden="true">
                <span
                  ref={dotRef}
                  className="absolute top-1/2 left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-clay-glow"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => goTo(current - 1)}
                  aria-disabled={current === 0}
                  aria-label="Projeto anterior"
                  className="grid size-11 place-items-center rounded-full border border-line-night transition-colors hover:border-linen aria-disabled:opacity-40"
                >
                  <CaretLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(current + 1)}
                  aria-disabled={current === TOTAL - 1}
                  aria-label="Próximo projeto"
                  className="grid size-11 place-items-center rounded-full border border-line-night transition-colors hover:border-linen aria-disabled:opacity-40"
                >
                  <CaretRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <ol className="shell mt-12 grid gap-14 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
            {projects.map((p) => (
              <li key={p.index} className={p.orientation === 'landscape' ? 'md:col-span-2' : ''}>
                <figure
                  className={`overflow-hidden rounded-[2px] ${p.orientation === 'landscape' ? 'aspect-[16/10]' : 'aspect-[4/5]'}`}
                >
                  <MediaImage asset={media[p.media]} sizes="(min-width: 768px) 90vw, 100vw" />
                </figure>
                <div className="mt-5 flex items-baseline gap-4">
                  <span className="meta text-clay-glow">{p.index}</span>
                  <div>
                    <h3 className="serif text-[1.6rem] leading-tight">{p.name}</h3>
                    <Meta p={p} />
                    <p className="mt-3 max-w-[46ch] text-[0.98rem] leading-relaxed text-night-2">{p.note}</p>
                  </div>
                </div>
              </li>
            ))}
            <li className="border-t border-line-night pt-10 md:col-span-2">
              <FinalCard onOpen={() => setPortfolioOpen(true)} />
            </li>
          </ol>
        )}
      </div>

      <PortfolioDialog open={portfolioOpen} onClose={() => setPortfolioOpen(false)} onOpenPrivacy={onOpenPrivacy} />
    </section>
  )
}
