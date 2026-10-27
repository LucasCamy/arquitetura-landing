import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import { lockScroll, unlockScroll } from '../../lib/scroll'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: ReactNode
  /** Texto do título para leitores de tela quando `title` tem marcação. */
  eyebrow?: string
  children: ReactNode
  footer?: ReactNode
  /** `drawer` abre como gaveta lateral à direita (pedido de portfólio). */
  variant?: 'center' | 'drawer'
  size?: 'md' | 'lg'
}

/**
 * Diálogo modal nativo: foco preso pelo navegador, Esc e clique no fundo fecham,
 * pausa o Lenis e devolve o foco a quem abriu.
 */
export function Dialog({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  variant = 'center',
  size = 'lg',
}: DialogProps) {
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

  const shape =
    variant === 'drawer'
      ? 'ml-auto mr-0 my-0 h-dvh max-h-dvh w-full max-w-[34rem] rounded-none'
      : `m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] rounded-[14px] ${size === 'lg' ? 'max-w-3xl' : 'max-w-xl'}`

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      data-lenis-prevent
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={`overflow-hidden bg-linen p-0 text-ink shadow-soft ${shape}`}
    >
      {open && (
        <div className={`flex flex-col ${variant === 'drawer' ? 'h-dvh' : 'max-h-[calc(100dvh-32px)]'}`}>
          <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 md:px-9">
            <div className="min-w-0">
              {eyebrow && <p className="meta text-ink-2">{eyebrow}</p>}
              <h2 id={titleId} className="serif mt-2 text-[clamp(1.7rem,3.2vw,2.4rem)] leading-[1.08]">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-sand"
            >
              <X size={20} />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-7 md:px-9">{children}</div>
          {footer && <footer className="border-t border-line px-6 py-4 md:px-9">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}
