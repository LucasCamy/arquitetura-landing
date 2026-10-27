import { useRef, useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { sketchSteps } from '../../data/content'
import { frameSequence, type FrameFormat } from '../../data/media'
import { gsap, scrollToY, ScrollTrigger, useCanAnimate, useScene } from '../../lib/scroll'
import { RichTitle } from '../ui/RichTitle'

const LAST = frameSequence.count - 1
const STEPS = sketchSteps.length

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
}

const heading = (
  <div>
    <p className="meta text-clay-ink">Do traço à obra</p>
    <RichTitle text="O mesmo desenho, dois anos depois, *aceso*." className="t-section mt-4 max-w-[18ch]" />
  </div>
)

/**
 * SIGN-3: 120 quadros em canvas conduzidos pelo scroll. A sequência do pacote transforma
 * o croqui técnico na fotografia da obra; o palco é claro e emoldurado porque começa em papel.
 */
export function SketchSequence() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const canAnimate = useCanAnimate()
  const [step, setStep] = useState(0)

  useScene(sectionRef, () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !pinRef.current) return
    const q = gsap.utils.selector(sectionRef)
    const images: HTMLImageElement[] = []
    const loaded: boolean[] = []
    const playhead = { frame: 0 }
    let drawn = -1

    const render = (force = false) => {
      const wanted = Math.round(playhead.frame)
      let index = -1
      for (let i = wanted; i >= 0; i--)
        if (loaded[i]) {
          index = i
          break
        }
      if (index < 0) index = loaded.findIndex(Boolean)
      if (index < 0 || (index === drawn && !force)) return
      const img = images[index]
      if (!img) return
      drawCover(ctx, img, canvas.width, canvas.height)
      drawn = index
      if (counterRef.current) counterRef.current.textContent = String(wanted + 1).padStart(3, '0')
    }

    // AVIF com fallback WebP: o primeiro quadro decide o formato dos demais.
    let format: FrameFormat = 'avif'
    let resolveFormat: () => void = () => {}
    const formatReady = new Promise<void>((resolve) => (resolveFormat = resolve))
    const load = (i: number) => {
      if (images[i]) return
      const img = new Image()
      img.decoding = 'async'
      img.onerror = () => {
        if (i !== 0 || format === 'webp') return
        format = 'webp'
        img.src = frameSequence.src(0, format)
      }
      img.onload = () => {
        if (i === 0) resolveFormat()
        loaded[i] = true
        const wanted = Math.round(playhead.frame)
        if ((i <= wanted && i > drawn) || drawn < 0) render(true)
      }
      img.src = frameSequence.src(i, format)
      images[i] = img
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      render(true)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    load(0)
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 250%',
      once: true,
      onEnter: () => {
        void formatReady.then(() => {
          for (let i = 1; i <= LAST; i++) load(i)
        })
      },
    })

    gsap.from(q('[data-word]'), {
      yPercent: 110,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.05,
      scrollTrigger: { trigger: q('h2')[0], start: 'top 90%', once: true },
    })

    const captions = q('[data-caption]')
    const fills = q('[data-fill]')
    gsap.set(captions.slice(1), { opacity: 0, y: 20 })
    gsap.set(fills, { scaleX: 0 })
    let current = 0
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: pinRef.current,
        start: 'top top',
        end: '+=260%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const next = Math.min(STEPS - 1, Math.floor(self.progress * STEPS))
          if (next !== current) {
            current = next
            setStep(next)
          }
        },
      },
    })
    triggerRef.current = tl.scrollTrigger ?? null
    tl.to(playhead, { frame: LAST, duration: STEPS, onUpdate: () => render() }, 0)
    fills.forEach((fill, i) => tl.to(fill, { scaleX: 1, duration: 1 }, i))
    for (let i = 1; i < STEPS; i++) {
      tl.to(captions[i - 1] ?? null, { opacity: 0, y: -20, duration: 0.2, ease: 'power1.in' }, i - 0.16)
      tl.to(captions[i] ?? null, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, i + 0.04)
    }

    return () => {
      ro.disconnect()
      triggerRef.current = null
      images.forEach((img) => {
        img.onload = null
        img.onerror = null
      })
    }
  }, [canAnimate])

  const goTo = (target: number) => {
    const st = triggerRef.current
    if (!st || target < 0 || target >= STEPS) return
    scrollToY(st.start + (st.end - st.start) * ((target + 0.45) / STEPS))
  }
  const active = sketchSteps[step] ?? sketchSteps[0]!

  if (!canAnimate) {
    return (
      <section id="traco" aria-label="Do traço à obra" className="bg-linen pb-28 md:pb-40">
        <div className="shell">
          {heading}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[0, LAST].map((frame) => (
              <figure key={frame} className="frame">
                <picture>
                  <source type="image/avif" srcSet={frameSequence.src(frame, 'avif')} />
                  <img
                    src={frameSequence.src(frame, 'webp')}
                    alt={
                      frame === 0 ? 'Croqui técnico da casa sobre papel.' : 'A mesma casa construída, ao fim de tarde.'
                    }
                    width={frameSequence.width}
                    height={frameSequence.height}
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                </picture>
              </figure>
            ))}
          </div>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {sketchSteps.map((s) => (
              <li key={s.index} className="border-t border-line pt-4">
                <p className="meta text-clay-ink">{s.index}</p>
                <h3 className="serif mt-2 text-2xl">{s.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  return (
    <section id="traco" ref={sectionRef} aria-label="Do traço à obra" className="relative bg-linen">
      <div ref={pinRef} className="shell flex h-dvh min-h-[600px] flex-col pt-[96px] pb-6 md:pb-8">
        <div className="flex items-end justify-between gap-6">
          {heading}
          <p className="meta hidden shrink-0 text-ink-2 md:block" aria-hidden="true">
            quadro <span ref={counterRef}>001</span> / {frameSequence.count}
          </p>
        </div>

        <div className="mt-6 grid min-h-0 flex-1 gap-6 lg:mt-8 lg:grid-cols-12 lg:gap-10">
          <div className="flex min-h-0 items-center lg:col-span-8">
            <div className="frame w-full">
              <div className="relative mx-auto aspect-video max-h-[calc(100dvh-330px)] w-full max-w-[calc((100dvh-330px)*16/9)] overflow-hidden lg:max-h-[calc(100dvh-300px)] lg:max-w-[calc((100dvh-300px)*16/9)]">
                <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
              </div>
            </div>
            <p className="sr-only">
              {frameSequence.alt} São 120 quadros conduzidos pela rolagem, em quatro momentos descritos a seguir.
            </p>
          </div>

          <div className="flex flex-col justify-end lg:col-span-4 lg:justify-center">
            <div className="relative min-h-[8.5rem] md:min-h-[9.5rem]">
              {sketchSteps.map((s, i) => (
                <div key={s.index} data-caption aria-hidden={i !== step} className="absolute inset-x-0 top-0">
                  <p className="meta text-clay-ink">{s.index}</p>
                  <h3 className="serif mt-2 text-[clamp(1.6rem,2.4vw,2.2rem)] leading-tight">{s.title}</h3>
                  <p className="mt-2 max-w-[40ch] leading-relaxed text-ink-2">{s.body}</p>
                </div>
              ))}
            </div>
            <p className="sr-only" aria-live="polite">
              Momento {active.index} de 04: {active.title}. {active.body}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <ol className="grid flex-1 grid-cols-4 gap-2" aria-label="Momentos da sequência">
                {sketchSteps.map((s, i) => (
                  <li key={s.index} aria-current={i === step ? 'step' : undefined}>
                    <span className="block h-px bg-line">
                      <span data-fill className="block h-full origin-left bg-clay" />
                    </span>
                  </li>
                ))}
              </ol>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  aria-disabled={step === 0}
                  aria-label="Momento anterior"
                  className="grid size-11 place-items-center rounded-full border border-line hover:border-ink aria-disabled:opacity-40"
                >
                  <CaretLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(step + 1)}
                  aria-disabled={step === STEPS - 1}
                  aria-label="Próximo momento"
                  className="grid size-11 place-items-center rounded-full border border-line hover:border-ink aria-disabled:opacity-40"
                >
                  <CaretRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
