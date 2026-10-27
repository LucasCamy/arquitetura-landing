import { useRef, useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { MediaImage } from '../ui/MediaImage'
import { traverseSteps } from '../../data/content'
import { frameSequence, media, type FrameFormat } from '../../data/media'
import { gsap, scrollToY, ScrollTrigger, useCanAnimate, useScene } from '../../lib/scroll'

const LAST = frameSequence.count - 1
const STEPS = traverseSteps.length

/** Desenha a imagem cobrindo o canvas (object-fit: cover manual). */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
}

export function Traverse() {
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
      for (let i = wanted; i >= 0; i--) {
        if (loaded[i]) {
          index = i
          break
        }
      }
      if (index < 0) index = loaded.findIndex(Boolean)
      if (index < 0 || (index === drawn && !force)) return
      const img = images[index]
      if (!img) return
      drawCover(ctx, img, canvas.width, canvas.height)
      drawn = index
      if (counterRef.current) counterRef.current.textContent = String(wanted + 1).padStart(3, '0')
    }

    // AVIF (metade do peso) com fallback WebP: o quadro 1 decide o formato dos demais.
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
        // Redesenha se o quadro que chegou está mais perto do pedido do que o desenhado.
        if (i <= wanted && i > drawn) render(true)
        else if (drawn < 0) render(true)
      }
      img.src = frameSequence.src(i, format)
      images[i] = img
    }

    // Resolução limitada a DPR 2, redimensionada com o contêiner.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      render(true)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Pôster: o primeiro quadro carrega logo; os demais quando a cena se aproxima.
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
    const fills = q('[data-step-fill]')
    gsap.set(captions.slice(1), { opacity: 0, y: 18 })
    gsap.set(fills, { scaleX: 0 })

    let current = 0
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: pinRef.current,
        start: 'top top',
        end: '+=320%',
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
      tl.to(captions[i - 1] ?? null, { opacity: 0, y: -18, duration: 0.22, ease: 'power1.in' }, i - 0.18)
      tl.to(captions[i] ?? null, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, i + 0.02)
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

  const active = traverseSteps[step] ?? traverseSteps[0]!

  return (
    <section
      id="travessia"
      ref={sectionRef}
      aria-labelledby="travessia-title"
      className="relative border-t border-line"
    >
      {canAnimate ? (
        <div ref={pinRef} className="relative h-dvh min-h-[560px] overflow-hidden bg-basalt">
          <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
          <p className="sr-only">
            {frameSequence.alt} São 120 quadros conduzidos pela rolagem, em quatro etapas descritas a seguir.
          </p>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-r from-basalt/85 via-basalt/30 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-basalt/90 to-transparent"
          />

          <div className="container-grid relative flex h-full flex-col justify-between pt-24 pb-6 md:pb-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="label text-ash">Luz, vão e matéria</p>
                <h2 id="travessia-title" className="h2 mt-3">
                  Travessia Espacial
                </h2>
              </div>
              <p className="mono hidden text-xs text-ash md:block" aria-hidden="true">
                quadro <span ref={counterRef}>001</span>/{frameSequence.count}
              </p>
            </div>

            <div>
              <div className="relative min-h-[11rem] max-w-xl md:min-h-[12rem]">
                {traverseSteps.map((s, i) => (
                  <div key={s.index} data-caption aria-hidden={i !== step} className="absolute inset-x-0 bottom-0">
                    <p className="mono text-sm text-clay-ink">{s.index}</p>
                    <h3 className="display mt-2 text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.95]">{s.title}</h3>
                    <p className="mt-3 max-w-[44ch] leading-relaxed text-limestone/90">{s.body}</p>
                  </div>
                ))}
              </div>
              <p className="sr-only" aria-live="polite">
                Etapa {active.index} de 04: {active.title}. {active.body}
              </p>

              <div className="mt-8 flex items-center gap-4">
                <ol className="grid flex-1 grid-cols-4 gap-2" aria-label="Etapas da travessia">
                  {traverseSteps.map((s, i) => (
                    <li key={s.index} aria-current={i === step ? 'step' : undefined}>
                      <span className="block h-px bg-line-strong">
                        <span data-step-fill className="block h-full origin-left bg-clay" />
                      </span>
                      <span className={`label mt-2 hidden md:block ${i === step ? 'text-limestone' : 'text-ash'}`}>
                        {s.index} {s.title}
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => goTo(step - 1)}
                    aria-disabled={step === 0}
                    aria-label="Etapa anterior"
                    className="grid size-11 place-items-center rounded-[var(--radius-control)] border border-line-strong bg-basalt/60 transition-colors hover:border-limestone aria-disabled:opacity-40"
                  >
                    <CaretLeft size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(step + 1)}
                    aria-disabled={step === STEPS - 1}
                    aria-label="Próxima etapa"
                    className="grid size-11 place-items-center rounded-[var(--radius-control)] border border-line-strong bg-basalt/60 transition-colors hover:border-limestone aria-disabled:opacity-40"
                  >
                    <CaretRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container-grid py-24 md:py-32">
          <p className="label text-ash">Luz, vão e matéria</p>
          <h2 id="travessia-title" className="h2 mt-3">
            Travessia Espacial
          </h2>
          <ol className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {traverseSteps.map((s) => (
              <li key={s.index} className="bg-basalt">
                <div className="aspect-video overflow-hidden bg-stone">
                  <MediaImage asset={media[s.still]} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                </div>
                <div className="p-5">
                  <p className="mono text-sm text-clay-ink">{s.index}</p>
                  <h3 className="display mt-2 text-3xl leading-[0.95]">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-limestone/85">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
