import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ProjectType } from '../data/content'
import { scrollToId } from './scroll'

type Preset = { projectType?: ProjectType; message?: string; version: number }

type BriefingContextValue = {
  preset: Preset
  /** Pré-preenche o formulário de contato, rola até ele e pede foco no primeiro campo. */
  startProject: (values?: { projectType?: ProjectType; message?: string }) => void
}

const BriefingContext = createContext<BriefingContextValue | null>(null)

export function BriefingProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<Preset>({ version: 0 })

  const startProject = useCallback((values: { projectType?: ProjectType; message?: string } = {}) => {
    setPreset((prev) => ({ ...values, version: prev.version + 1 }))
    // Espera um diálogo fechar e o Lenis voltar antes de rolar.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToId('contato')))
  }, [])

  const value = useMemo(() => ({ preset, startProject }), [preset, startProject])
  return <BriefingContext.Provider value={value}>{children}</BriefingContext.Provider>
}

export function useBriefing() {
  const ctx = useContext(BriefingContext)
  if (!ctx) throw new Error('useBriefing fora do BriefingProvider')
  return ctx
}
