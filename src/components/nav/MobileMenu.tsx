import { useEffect, useRef } from 'react'
import { X } from '@phosphor-icons/react'
import { brand, navLinks, type ChapterId } from '../../data/content'
import { lockScroll, scrollToId, unlockScroll } from '../../lib/scroll'

/** Menu móvel em <dialog> modal, renderizado fora do header (evita bloco de contenção do fixed). */
export function MobileMenu({ open, onClose, active }: { open: boolean; onClose: () => void; active: ChapterId }) {
  const ref = useRef<HTMLDialogElement>(null)
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

  const go = (id: string) => {
    onClose()
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(id)))
  }

  return (
    <dialog
      ref={ref}
      id="menu-movel"
      aria-label="Menu"
      data-lenis-prevent
      className="m-0 h-dvh max-h-none w-full max-w-none bg-basalt p-0 text-limestone backdrop:bg-basalt"
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="container-grid flex h-16 shrink-0 items-center justify-between border-b border-line">
            <span className="display text-xl tracking-[0.04em]">{brand.name}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="grid size-11 place-items-center rounded-[var(--radius-control)] border border-line-strong"
            >
              <X size={22} weight="light" />
            </button>
          </div>
          <nav aria-label="Menu móvel" className="container-grid flex-1 overflow-y-auto py-6">
            <ul className="border-t border-line">
              {navLinks.map((link, i) => (
                <li key={link.id} className="border-b border-line">
                  <a
                    href={`#${link.id}`}
                    aria-current={active === link.id ? 'location' : undefined}
                    onClick={(event) => {
                      event.preventDefault()
                      go(link.id)
                    }}
                    className="flex min-h-16 items-baseline gap-4 py-3"
                  >
                    <span className="label text-ash">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`display text-4xl ${active === link.id ? 'text-clay-ink' : ''}`}>
                      {link.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="container-grid shrink-0 border-t border-line py-4">
            <a
              href="#contato"
              onClick={(event) => {
                event.preventDefault()
                go('contato')
              }}
              className="btn btn-primary w-full"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      )}
    </dialog>
  )
}
