import { useCallback, useEffect, useState } from 'react'
import type { ChapterId } from './data/content'
import type { LegalDoc } from './data/legal'
import { BriefingProvider } from './lib/briefing'
import { applyMotionClass, initSmoothScroll, ScrollTrigger, useGSAP } from './lib/scroll'
import { Navbar } from './components/nav/Navbar'
import { ChapterRuler } from './components/nav/ChapterRuler'
import { FloatingCta } from './components/nav/FloatingCta'
import { HeroManifesto } from './components/sections/HeroManifesto'
import { Projects } from './components/sections/Projects'
import { Croqui } from './components/sections/Croqui'
import { Materials } from './components/sections/Materials'
import { LightSequence } from './components/sections/LightSequence'
import { Process } from './components/sections/Process'
import { Studio } from './components/sections/Studio'
import { Faq } from './components/sections/Faq'
import { Contact } from './components/sections/Contact'
import { Footer } from './components/sections/Footer'

/** Seções que pertencem a cada capítulo da régua (a cena da luz faz parte de Materiais; perguntas e contato, do Estúdio). */
const chapterOf: Record<string, ChapterId> = {
  manifesto: 'manifesto',
  projetos: 'projetos',
  croqui: 'croqui',
  materiais: 'materiais',
  luz: 'materiais',
  processo: 'processo',
  estudio: 'estudio',
  perguntas: 'estudio',
  contato: 'estudio',
}

export function App() {
  const [chapter, setChapter] = useState<ChapterId>('manifesto')
  const [section, setSection] = useState('manifesto')
  const [legal, setLegal] = useState<LegalDoc['id'] | null>(null)
  const [contactVisible, setContactVisible] = useState(false)
  const onContactVisible = useCallback((v: boolean) => setContactVisible(v), [])

  useEffect(() => {
    applyMotionClass()
    return initSmoothScroll()
  }, [])

  // Roda depois das cenas filhas (pins criados na ordem do documento).
  useGSAP(() => {
    Object.keys(chapterOf).forEach((id) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (!self.isActive) return
          setSection(id)
          setChapter(chapterOf[id] ?? 'manifesto')
        },
      }),
    )
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
    void document.fonts.ready.then(() => ScrollTrigger.refresh())
  })

  return (
    <BriefingProvider>
      <a
        href="#conteudo"
        className="sr-only-focusable fixed top-3 left-3 z-50 rounded-full bg-ink px-5 py-3 font-semibold text-linen"
      >
        Pular para o conteúdo
      </a>
      <Navbar active={section} />
      <ChapterRuler active={chapter} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <HeroManifesto />
        <Projects onOpenPrivacy={() => setLegal('privacidade')} />
        <Croqui />
        <Materials />
        <LightSequence />
        <Process />
        <Studio />
        <Faq />
        <Contact onOpenPrivacy={() => setLegal('privacidade')} onVisible={onContactVisible} />
      </main>
      <Footer legal={legal} onOpenLegal={setLegal} />
      {/* Some no hero (que já tem o CTA) e nas cenas fixadas com controles no canto inferior. */}
      <FloatingCta hidden={contactVisible || ['manifesto', 'projetos', 'luz'].includes(section)} />
    </BriefingProvider>
  )
}
