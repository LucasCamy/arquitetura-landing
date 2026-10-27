import { useEffect, useState } from 'react'
import { chapters, type ChapterId } from './data/content'
import type { LegalDoc } from './data/legal'
import { BriefingProvider } from './lib/briefing'
import { applyMotionClass, gsap, initSmoothScroll, motionConditions, ScrollTrigger, useGSAP } from './lib/scroll'
import { Navbar } from './components/nav/Navbar'
import { ScrollRuler } from './components/nav/ScrollRuler'
import { Hero } from './components/sections/Hero'
import { Studio } from './components/sections/Studio'
import { Works } from './components/sections/Works'
import { Traverse } from './components/sections/Traverse'
import { Method } from './components/sections/Method'
import { Partners } from './components/sections/Partners'
import { Faq } from './components/sections/Faq'
import { Contact } from './components/sections/Contact'
import { Footer } from './components/sections/Footer'

export function App() {
  const [active, setActive] = useState<ChapterId>('inicio')
  const [legal, setLegal] = useState<LegalDoc['id'] | null>(null)

  useEffect(() => {
    applyMotionClass()
    return initSmoothScroll()
  }, [])

  // Roda depois das cenas filhas (pins já criados na ordem do documento).
  useGSAP(() => {
    // Seção ativa na navbar e na régua.
    chapters.forEach((c) =>
      ScrollTrigger.create({
        trigger: `#${c.id}`,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) setActive(c.id)
        },
      }),
    )

    // Linhas de cota de 1px desenhadas ao entrar.
    const mm = gsap.matchMedia()
    mm.add(motionConditions(), (context) => {
      if (!(context.conditions as { motion: boolean }).motion) return
      gsap.utils.toArray<HTMLElement>('[data-cota="x"]').forEach((el) =>
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            ease: 'power3.inOut',
            scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' },
          },
        ),
      )
    })

    ScrollTrigger.sort()
    ScrollTrigger.refresh()
    void document.fonts.ready.then(() => ScrollTrigger.refresh())
    return () => mm.revert()
  })

  return (
    <BriefingProvider>
      <a
        href="#conteudo"
        className="sr-only-focusable fixed top-3 left-3 z-50 rounded-[var(--radius-control)] bg-limestone px-4 py-3 font-semibold text-basalt"
      >
        Pular para o conteúdo
      </a>
      <Navbar active={active} />
      <ScrollRuler active={active} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero />
        <Studio />
        <Works />
        <Traverse />
        <Method />
        <Partners />
        <Faq />
        <Contact onOpenPrivacy={() => setLegal('privacidade')} />
      </main>
      <Footer legal={legal} onOpenLegal={setLegal} />
    </BriefingProvider>
  )
}
