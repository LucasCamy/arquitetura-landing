import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import { lockScroll, unlockScroll } from '../../lib/scroll'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  eyebrow?: string
  children: ReactNode
  size?: 'md' | 'lg'
  footer?: ReactNode
}

/**
 * Diálogo modal nativo: foco preso pelo navegador, Esc fecha, clique no fundo fecha,
 * pausa o Lenis e devolve o foco a quem abriu.
 */
export function Dialog({ open, onClose, title, eyebrow, children, size = 'lg', footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const dialog = ref.current
    if (!open || !dialog) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.showModal()
    lockScroll()
    const onCancel = (event: Event) => {
      event.preventDefault()
      onCloseRef.current()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => {
      dialog.removeEventListener('cancel', onCancel)
      if (dialog.open) dialog.close()
      unlockScroll()
      opener?.focus({ preventScroll: true })
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      data-lenis-prevent
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={`m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] overflow-hidden rounded-[var(--radius-dialog)] border border-line-strong bg-stone-2 p-0 text-limestone shadow-dialog backdrop:backdrop-blur-[2px] ${
        size === 'lg' ? 'max-w-4xl' : 'max-w-xl'
      }`}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-32px)] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 md:px-8 md:py-5">
            <div className="min-w-0">
              {eyebrow && <p className="label text-ash">{eyebrow}</p>}
              <h2 id={titleId} className="display mt-1 text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[0.95]">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="-mr-2 grid size-11 shrink-0 place-items-center rounded-[var(--radius-control)] text-ash transition-colors hover:text-limestone"
            >
              <X size={22} weight="light" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 md:px-8 md:py-8">{children}</div>
          {footer && <footer className="border-t border-line px-5 py-4 md:px-8">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}
