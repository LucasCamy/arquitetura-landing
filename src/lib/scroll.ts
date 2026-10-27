import { useSyncExternalStore, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import type Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export { gsap, ScrollTrigger, useGSAP }

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
export const DESKTOP_QUERY = '(min-width: 1024px)'
export const NAV_HEIGHT = 72

/**
 * `?movimento=1` força as animações mesmo com "reduzir movimento" ligado no sistema;
 * `?movimento=0` força a versão estática. Sem parâmetro, vale a preferência do usuário.
 */
export function motionOverride(): 'force' | 'off' | null {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('movimento')
  if (value === '1') return 'force'
  if (value === '0') return 'off'
  return null
}

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

export function canAnimateNow() {
  const override = motionOverride()
  if (override === 'force') return true
  if (override === 'off') return false
  return !window.matchMedia(REDUCED_QUERY).matches
}

/** Decide animação e também layout (trilho horizontal x lista, canvas x grade). */
export function useCanAnimate() {
  return useSyncExternalStore(subscribeReduced, canAnimateNow, () => false)
}

function subscribeQuery(query: string) {
  return (onChange: () => void) => {
    const mq = window.matchMedia(query)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }
}

const subscribeDesktop = subscribeQuery(DESKTOP_QUERY)
export function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  )
}

/** Condições para gsap.matchMedia(): movimento permitido combinado com breakpoints. */
export function motionConditions() {
  const override = motionOverride()
  const motion =
    override === 'force' ? 'all' : override === 'off' ? 'not all' : '(prefers-reduced-motion: no-preference)'
  return { motion, desktop: DESKTOP_QUERY }
}

type SceneSetup = (ctx: { desktop: boolean }) => void | (() => void)

/**
 * Cena de scroll com limpeza automática. Só roda quando o movimento é permitido;
 * a versão estática é o próprio markup sem estilos iniciais aplicados pelo GSAP.
 */
export function useScene(scope: RefObject<HTMLElement | null>, setup: SceneSetup, dependencies: unknown[] = []) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(
        motionConditions(),
        (context) => {
          const { motion, desktop } = context.conditions as { motion: boolean; desktop: boolean }
          if (!motion) return
          return setup({ desktop })
        },
        scope.current ?? undefined,
      )
      return () => mm.revert()
    },
    { scope, dependencies, revertOnUpdate: true },
  )
}

let lenis: Lenis | null = null
let lockCount = 0

/**
 * Lenis é importado sob demanda: quem prefere movimento reduzido nunca baixa o chunk.
 * Até ele chegar, a rolagem nativa (com scroll-padding) cobre âncoras e ScrollTrigger.
 */
export function initSmoothScroll() {
  if (lenis || !canAnimateNow()) return () => {}
  let cancelled = false
  let cleanup = () => {}
  void import('lenis').then(({ default: LenisClass }) => {
    if (cancelled || lenis) return
    // O Lenis já desconta o scroll-padding-top (altura do menu) definido no <html>.
    const instance = new LenisClass({ lerp: 0.085, anchors: true })
    lenis = instance
    if (lockCount > 0) instance.stop()
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    cleanup = () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      if (lenis === instance) lenis = null
    }
  })
  return () => {
    cancelled = true
    cleanup()
  }
}

export const getLenis = () => lenis

/** Diálogos, gaveta e menu móvel: pausa o Lenis e trava a rolagem nativa. Contador permite aninhar. */
export function lockScroll() {
  lockCount += 1
  lenis?.stop()
  document.documentElement.classList.add('scroll-locked')
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount > 0) return
  document.documentElement.classList.remove('scroll-locked')
  lenis?.start()
}

export function scrollToY(y: number, immediate = false) {
  if (lenis) lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.2 })
  else window.scrollTo({ top: y, behavior: 'auto' })
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.2 })
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT, behavior: 'auto' })
}

/** Marca o <html> para desligar a regra global de reduced motion quando forçado. */
export function applyMotionClass() {
  document.documentElement.classList.toggle('motion-forced', motionOverride() === 'force')
}
