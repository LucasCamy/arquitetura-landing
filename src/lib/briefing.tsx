import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { MeetingFormat } from '../data/content'
import { scrollToId } from './scroll'

type Preset = { scope?: string; meeting?: MeetingFormat; version: number }

type BriefingContextValue = {
  preset: Preset
  /** Pré-seleciona campos do formulário, rola até o contato e pede foco no formulário. */
  startBriefing: (values: { scope?: string; meeting?: MeetingFormat }) => void
}

const BriefingContext = createContext<BriefingContextValue | null>(null)

export function BriefingProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<Preset>({ version: 0 })

  const startBriefing = useCallback((values: { scope?: string; meeting?: MeetingFormat }) => {
    setPreset((prev) => ({ ...values, version: prev.version + 1 }))
    // Espera o diálogo fechar e o Lenis voltar antes de rolar.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToId('contato')))
  }, [])

  const value = useMemo(() => ({ preset, startBriefing }), [preset, startBriefing])
  return <BriefingContext.Provider value={value}>{children}</BriefingContext.Provider>
}

export function useBriefing() {
  const ctx = useContext(BriefingContext)
  if (!ctx) throw new Error('useBriefing fora do BriefingProvider')
  return ctx
}
