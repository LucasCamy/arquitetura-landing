import { useRef } from 'react'
import { hero, manifesto, metrics } from '../../data/content'
import { media } from '../../data/media'
import { gsap, ScrollTrigger, useCanAnimate, useGSAP, useIsDesktop, useScene } from '../../lib/scroll'
import { setThemeFlag } from '../../lib/theme'
import { MediaImage } from '../ui/MediaImage'
import { RichTitle } from '../ui/RichTitle'

const format = (n: number) => n.toLocaleString('pt-BR')

/** Posição de um elemento relativa a um ancestral, pelo layout (ignora transformações e pin). */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let top = 0
  let left = 0
  let node: HTMLElement | null = el
  while (node && node !== ancestor) {
    top += node.offsetTop
    left += node.offsetLeft
    node = node.offsetParent as HTMLElement | null
  }
  return { top, left, width: el.offsetWidth, height: el.offsetHeight }
}

function HeroCopy({ onPhoto = true }: { onPhoto?: boolean }) {
  return (
    <div
      className={`shell relative flex h-full flex-col justify-end pt-[72px] pb-10 md:pb-14 ${onPhoto ? 'text-linen' : ''}`}
    >
      <p data-hero-in className="meta max-w-[46ch] opacity-90">
        {hero.eyebrow}
      </p>
      <RichTitle as="h1" id="hero-title" text={hero.title} className="t-hero mt-5 max-w-[14ch] [&_em]:!text-linen" />
      <p data-hero-in className="mt-6 max-w-[40ch] text-[1.05rem] leading-relaxed opacity-90 md:text-lg">
        {hero.subtitle}
      </p>
      <div className="mt-8 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <div data-hero-in className="flex flex-wrap gap-3">
          <a href="#contato" className="pill pill-light">
            Começar um projeto{' '}
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </a>
          <a href="#projetos" className="pill pill-ghost-light">
            Ver projetos <span aria-hidden="true">↓</span>
          </a>
        </div>
        <p data-hero-in className="meta flex flex-wrap gap-x-3 opacity-90 md:justify-end md:text-right">
          {hero.ficha.map((item, i) => (
            <span key={item}>
              {i > 0 && (
                <span aria-hidden="true" className="mr-3">
                  ·
                </span>
              )}
              {item}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}

function Metrics() {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
      {metrics.map((m) => (
        <div key={m.label} data-metric className="border-t border-line pt-3">
          <dt className="sr-only">
            {m.unit} {m.label}
          </dt>
          <dd>
            <span className="serif block text-[clamp(1.8rem,2.6vw,2.5rem)] leading-none">
              <span aria-hidden="true">
                <span data-counter={m.value}>{format(m.value)}</span>
                {m.suffix}
              </span>
              <span className="sr-only">
                {format(m.value)}
                {m.suffix}
              </span>
            </span>
            <span className="meta mt-2 block text-ink-2">
              {m.unit} {m.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Paragraphs({ className = '' }: { className?: string }) {
  return (
    <div className={`grid gap-5 text-[0.98rem] leading-relaxed text-ink-2 md:grid-cols-2 ${className}`}>
      {manifesto.paragraphs.map((p) => (
        <p key={p.slice(0, 20)} data-paragraph>
          {p}
        </p>
      ))}
    </div>
  )
}

export function HeroManifesto() {
  const canAnimate = useCanAnimate()
  const isDesktop = useIsDesktop()
  return canAnimate ? <AnimatedHero isDesktop={isDesktop} /> : <StaticHero />
}

/** HERO-2 com movimento: a foto em tela cheia encolhe até a moldura da coluna direita. */
function AnimatedHero({ isDesktop }: { isDesktop: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)

  useScene(sectionRef, () => {
    const stage = stageRef.current
    const target = targetRef.current
    const photo = photoRef.current
    if (!stage || !target || !photo) return
    const q = gsap.utils.selector(sectionRef)

    // A foto vive no retângulo final; a transformação inicial a amplia até cobrir o palco.
    let box = { top: 0, left: 0, width: 1, height: 1 }
    const measure = () => {
      box = offsetWithin(target, stage)
      gsap.set(photo, { top: box.top, left: box.left, width: box.width, height: box.height })
    }
    const cover = () => Math.max(stage.offsetWidth / box.width, stage.offsetHeight / box.height)
    const start = {
      scale: () => cover(),
      x: () => stage.offsetWidth / 2 - (box.left + box.width / 2),
      y: () => stage.offsetHeight / 2 - (box.top + box.height / 2),
      clipPath: () => {
        const s = cover()
        const ix = Math.max(0, (box.width - stage.offsetWidth / s) / 2)
        const iy = Math.max(0, (box.height - stage.offsetHeight / s) / 2)
        return `inset(${iy}px ${ix}px ${iy}px ${ix}px)`
      },
    }
    measure()
    ScrollTrigger.addEventListener('refreshInit', measure)

    const counters = q('[data-counter]')
    const counterState = counters.map(() => ({ v: 0 }))

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setThemeFlag('photo', self.progress < 0.22),
      },
    })
    tl.fromTo(
      photo,
      start,
      { scale: 1, x: 0, y: 0, clipPath: 'inset(0px 0px 0px 0px)', duration: 1, ease: 'power2.inOut' },
      0,
    )
      .fromTo(q('[data-photo-img]'), { scale: 1.08 }, { scale: 1, duration: 1 }, 0)
      .to(q('[data-scrim]'), { opacity: 0, duration: 0.45 }, 0)
      .to(q('[data-hero-copy]'), { opacity: 0, y: -48, duration: 0.3, ease: 'power1.in' }, 0)
      .fromTo(q('[data-frame-bg]'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.8)
      .from(
        q('[data-manifesto] [data-word]'),
        { yPercent: 110, duration: 0.3, stagger: 0.012, ease: 'power3.out' },
        0.62,
      )
      .from(q('[data-caption]'), { opacity: 0, duration: 0.2 }, 0.9)
    setThemeFlag('photo', (tl.scrollTrigger?.progress ?? 0) < 0.22)
    if (isDesktop) {
      tl.from(q('[data-paragraph]'), { opacity: 0, y: 24, duration: 0.25, stagger: 0.06 }, 0.85)
      tl.from(q('[data-metric]'), { opacity: 0, y: 24, duration: 0.25, stagger: 0.05 }, 0.95)
      counters.forEach((el, i) => {
        const target = Number(el.getAttribute('data-counter'))
        tl.fromTo(
          counterState[i]!,
          { v: 0 },
          {
            v: target,
            duration: 0.3,
            onUpdate: () => {
              el.textContent = format(Math.round(counterState[i]!.v))
            },
          },
          0.95 + i * 0.05,
        )
      })
      tl.to({}, { duration: 0.15 })
    } else {
      // Celular: parágrafos e métricas vêm depois do palco, com stagger e contagem ao entrar.
      gsap.from(q('[data-paragraph], [data-metric]'), {
        opacity: 0,
        y: 28,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: q('[data-after]')[0], start: 'top 85%', once: true },
      })
      counters.forEach((el, i) => {
        const target = Number(el.getAttribute('data-counter'))
        el.textContent = '0'
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () =>
            gsap.to(counterState[i]!, {
              v: target,
              duration: 1.4,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = format(Math.round(counterState[i]!.v))
              },
            }),
        })
      })
    }

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', measure)
      setThemeFlag('photo', false)
      counters.forEach((el) => (el.textContent = format(Number(el.getAttribute('data-counter')))))
    }
  }, [isDesktop])

  return (
    <section id="manifesto" ref={sectionRef} aria-labelledby="hero-title" className="relative bg-linen">
      <div ref={stageRef} className="relative h-dvh min-h-[600px] overflow-hidden">
        {/* Camada do manifesto: a moldura da direita é o destino da foto. */}
        <div
          data-manifesto
          className="shell relative grid h-full grid-cols-1 content-start gap-6 pt-[92px] lg:grid-cols-12 lg:content-stretch lg:gap-10 lg:pt-[104px] lg:pb-10"
        >
          <div className="order-2 flex flex-col justify-between lg:order-1 lg:col-span-6">
            <div>
              <p className="meta text-clay-ink">01 · Manifesto</p>
              <RichTitle text={manifesto.statement} className="t-statement mt-4 max-w-[22ch]" />
            </div>
            {isDesktop && <Paragraphs className="max-w-[40rem]" />}
          </div>
          <div className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8 lg:flex lg:flex-col">
            <div className="relative lg:mx-auto lg:w-fit">
              <div data-frame-bg aria-hidden="true" className="frame absolute -inset-[10px]" />
              <div
                ref={targetRef}
                className="relative h-[clamp(200px,calc(100dvh-470px),50dvh)] w-full lg:aspect-[4/5] lg:h-[54dvh] lg:w-auto"
              />
            </div>
            <p data-caption className="meta mt-5 text-ink-2 lg:text-center">
              {manifesto.caption}
            </p>
            {isDesktop && (
              <div className="mt-auto pt-6">
                <Metrics />
              </div>
            )}
          </div>
        </div>

        {/* Foto: posicionada no destino, ampliada no início pela timeline. */}
        <div
          ref={photoRef}
          className="absolute overflow-hidden will-change-transform"
          style={{ top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <div data-photo-img className="h-full w-full">
            <MediaImage asset={media.hero} priority sizes="100vw" />
          </div>
          <div data-scrim aria-hidden="true" className="scrim-hero absolute inset-0" />
        </div>

        <div data-hero-copy className="absolute inset-0">
          <HeroCopy />
        </div>
      </div>

      {!isDesktop && (
        <div data-after className="shell pt-8 pb-20">
          <Paragraphs />
          <div className="mt-10">
            <Metrics />
          </div>
        </div>
      )}
    </section>
  )
}

/** Versão sem movimento: hero em tela cheia seguido do manifesto em fluxo normal. */
function StaticHero() {
  const heroRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const st = ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: 'bottom 72px',
      onToggle: (self) => setThemeFlag('photo', self.isActive),
    })
    setThemeFlag('photo', st.isActive)
    return () => {
      st.kill()
      setThemeFlag('photo', false)
    }
  })

  return (
    <section id="manifesto" aria-labelledby="hero-title">
      <div ref={heroRef} className="relative h-dvh min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <MediaImage asset={media.hero} priority sizes="100vw" />
          <div aria-hidden="true" className="scrim-hero absolute inset-0" />
        </div>
        <HeroCopy />
      </div>
      <div className="shell grid gap-12 py-24 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col justify-between gap-10 lg:col-span-6">
          <div>
            <p className="meta text-clay-ink">01 · Manifesto</p>
            <RichTitle text={manifesto.statement} className="t-statement mt-4 max-w-[22ch]" />
          </div>
          <Paragraphs className="max-w-[40rem]" />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <figure>
            <div className="frame">
              <div className="aspect-[4/5]">
                <MediaImage asset={media.hero} sizes="(min-width: 1024px) 40vw, 100vw" decorative />
              </div>
            </div>
            <figcaption className="meta mt-5 text-ink-2">{manifesto.caption}</figcaption>
          </figure>
          <div className="mt-8">
            <Metrics />
          </div>
        </div>
      </div>
    </section>
  )
}
