import { useRef, useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { lightSteps } from '../../data/content'
import { frameSequence, type FrameFormat } from '../../data/media'
import { gsap, scrollToY, ScrollTrigger, useCanAnimate, useGSAP, useScene } from '../../lib/scroll'
import { setThemeFlag } from '../../lib/theme'
import { RichTitle } from '../ui/RichTitle'

const LAST = frameSequence.count - 1
const STEPS = lightSteps.length

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
}

/** SIGN-3 "A luz na matéria": 120 quadros em canvas conduzidos pelo scroll, com 4 legendas. */
export function LightSequence() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
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
        end: '+=300%',
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

  useGSAP(
    () => {
      if (!canAnimate) return
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 72px',
        end: 'bottom 72px',
        onToggle: (self) => setThemeFlag('light', self.isActive),
      })
      return () => {
        st.kill()
        setThemeFlag('light', false)
      }
    },
    { dependencies: [canAnimate] },
  )

  const goTo = (target: number) => {
    const st = triggerRef.current
    if (!st || target < 0 || target >= STEPS) return
    scrollToY(st.start + (st.end - st.start) * ((target + 0.45) / STEPS))
  }
  const active = lightSteps[step] ?? lightSteps[0]!

  const heading = (
    <div>
      <p className="meta opacity-90">04 · A luz na matéria</p>
      <RichTitle text="A *luz* também é material de projeto." className="t-section mt-4 max-w-[16ch]" />
    </div>
  )

  if (!canAnimate) {
    return (
      <section id="luz" aria-label="A luz na matéria" className="bg-linen pb-28 md:pb-40">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">{heading}</div>
          <figure className="lg:col-span-7">
            <picture>
              <source type="image/avif" srcSet={frameSequence.src(60, 'avif')} />
              <img
                src={frameSequence.src(60, 'webp')}
                alt={frameSequence.alt}
                width={frameSequence.width}
                height={frameSequence.height}
                loading="lazy"
                className="aspect-video w-full rounded-[2px] object-cover"
              />
            </picture>
          </figure>
          <ol className="grid gap-8 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-4">
            {lightSteps.map((s) => (
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
    <section id="luz" ref={sectionRef} aria-label="A luz na matéria" className="on-dark relative bg-night text-linen">
      <div ref={pinRef} className="relative h-dvh min-h-[560px] overflow-hidden">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        <p className="sr-only">
          {frameSequence.alt} São 120 quadros conduzidos pela rolagem, em quatro momentos descritos a seguir.
        </p>
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-ink/80 via-ink/25 to-transparent" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/85 to-transparent"
        />

        <div className="shell relative flex h-full flex-col justify-between pt-[104px] pb-8 md:pb-10">
          {heading}
          <div>
            <div className="relative min-h-[10rem] max-w-xl">
              {lightSteps.map((s, i) => (
                <div key={s.index} data-caption aria-hidden={i !== step} className="absolute inset-x-0 bottom-0">
                  <p className="meta text-clay-glow">{s.index}</p>
                  <h3 className="serif mt-2 text-[clamp(1.8rem,3.2vw,2.8rem)] leading-tight">{s.title}</h3>
                  <p className="mt-2 max-w-[44ch] leading-relaxed opacity-90">{s.body}</p>
                </div>
              ))}
            </div>
            <p className="sr-only" aria-live="polite">
              Momento {active.index} de 04: {active.title}. {active.body}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <ol className="grid flex-1 grid-cols-4 gap-2" aria-label="Momentos da sequência">
                {lightSteps.map((s, i) => (
                  <li key={s.index} aria-current={i === step ? 'step' : undefined}>
                    <span className="block h-px bg-line-night">
                      <span data-fill className="block h-full origin-left bg-clay-glow" />
                    </span>
                    <span className={`meta mt-2 hidden md:block ${i === step ? 'opacity-100' : 'opacity-60'}`}>
                      {s.title}
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
                  className="grid size-11 place-items-center rounded-full border border-line-night bg-ink/40 hover:border-linen aria-disabled:opacity-40"
                >
                  <CaretLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(step + 1)}
                  aria-disabled={step === STEPS - 1}
                  aria-label="Próximo momento"
                  className="grid size-11 place-items-center rounded-full border border-line-night bg-ink/40 hover:border-linen aria-disabled:opacity-40"
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
