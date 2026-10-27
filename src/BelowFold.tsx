/*
 * Tudo abaixo do hero, num chunk carregado sob demanda (React.lazy no App).
 * O hero pinta com o bundle inicial; estas seções chegam logo depois, em paralelo.
 */
import type { ChapterId } from './data/content'
import { ScrollTrigger, useGSAP } from './lib/scroll'
import { Projects } from './components/sections/Projects'
import { Croqui } from './components/sections/Croqui'
import { SketchSequence } from './components/sections/SketchSequence'
import { Materials } from './components/sections/Materials'
import { Process } from './components/sections/Process'
import { Studio } from './components/sections/Studio'
import { Faq } from './components/sections/Faq'
import { Contact } from './components/sections/Contact'
export { Footer } from './components/sections/Footer'

/** Seções que pertencem a cada capítulo da régua (a sequência fecha "Do croqui ao espaço"; perguntas e contato, o Estúdio). */
const chapterOf: Record<string, ChapterId> = {
  manifesto: 'manifesto',
  projetos: 'projetos',
  croqui: 'croqui',
  traco: 'croqui',
  materiais: 'materiais',
  processo: 'processo',
  estudio: 'estudio',
  perguntas: 'estudio',
  contato: 'estudio',
}

type BelowFoldProps = {
  onOpenPrivacy: () => void
  onContactVisible: (visible: boolean) => void
  onSection: (section: string, chapter: ChapterId) => void
}

export default function BelowFold({ onOpenPrivacy, onContactVisible, onSection }: BelowFoldProps) {
  // Roda depois das cenas filhas: com todas as seções no DOM, ordena os gatilhos
  // (os pins do hero já existiam) e cria os que acompanham a seção ativa.
  useGSAP(() => {
    Object.entries(chapterOf).forEach(([id, chapter]) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) onSection(id, chapter)
        },
      }),
    )
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
    void document.fonts.ready.then(() => ScrollTrigger.refresh())

    // Link direto (#contato, #processo...) só tem destino depois que este chunk monta.
    const target = window.location.hash && document.getElementById(window.location.hash.slice(1))
    if (target) requestAnimationFrame(() => target.scrollIntoView())
  })

  return (
    <>
      <Projects onOpenPrivacy={onOpenPrivacy} />
      <Croqui />
      <SketchSequence />
      <Materials />
      <Process />
      <Studio />
      <Faq />
      <Contact onOpenPrivacy={onOpenPrivacy} onVisible={onContactVisible} />
    </>
  )
}
