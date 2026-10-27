import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import type { ChapterId } from './data/content'
import type { LegalDoc } from './data/legal'
import { BriefingProvider } from './lib/briefing'
import { applyMotionClass, initSmoothScroll } from './lib/scroll'
import { Navbar } from './components/nav/Navbar'
import { ChapterRuler } from './components/nav/ChapterRuler'
import { FloatingCta } from './components/nav/FloatingCta'
import { HeroManifesto } from './components/sections/HeroManifesto'

// Seções abaixo do hero e rodapé: um chunk separado, buscado depois do primeiro render.
const BelowFold = lazy(() => import('./BelowFold'))
const Footer = lazy(() => import('./BelowFold').then((m) => ({ default: m.Footer })))

export function App() {
  const [chapter, setChapter] = useState<ChapterId>('manifesto')
  const [section, setSection] = useState('manifesto')
  const [legal, setLegal] = useState<LegalDoc['id'] | null>(null)
  const [contactVisible, setContactVisible] = useState(false)
  const onContactVisible = useCallback((v: boolean) => setContactVisible(v), [])
  const onSection = useCallback((id: string, ch: ChapterId) => {
    setSection(id)
    setChapter(ch)
  }, [])
  const openPrivacy = useCallback(() => setLegal('privacidade'), [])

  useEffect(() => {
    applyMotionClass()
    return initSmoothScroll()
  }, [])

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
        {/* Altura reservada enquanto o chunk chega, para o hero não encostar no rodapé. */}
        <Suspense fallback={<div aria-hidden="true" className="min-h-[200vh] bg-night" />}>
          <BelowFold onOpenPrivacy={openPrivacy} onContactVisible={onContactVisible} onSection={onSection} />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer legal={legal} onOpenLegal={setLegal} />
      </Suspense>
      {/* Some no hero (que já tem o CTA) e nas cenas fixadas com controles no canto inferior. */}
      <FloatingCta hidden={contactVisible || ['manifesto', 'projetos', 'traco'].includes(section)} />
    </BriefingProvider>
  )
}
