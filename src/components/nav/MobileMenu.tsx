import { useEffect, useRef } from 'react'
import { X } from '@phosphor-icons/react'
import { brand, navLinks } from '../../data/content'
import { lockScroll, scrollToId, unlockScroll } from '../../lib/scroll'

/** Menu móvel em <dialog> modal, renderizado fora do header. */
export function MobileMenu({ open, onClose, active }: { open: boolean; onClose: () => void; active: string }) {
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
      className="m-0 h-dvh max-h-none w-full max-w-none bg-linen p-0 text-ink backdrop:bg-linen"
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="shell flex h-[72px] shrink-0 items-center justify-between border-b border-line">
            <span className="serif text-[1.65rem] leading-none">{brand.name}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="grid size-11 place-items-center rounded-full border border-current"
            >
              <X size={20} />
            </button>
          </div>
          <nav aria-label="Menu móvel" className="shell flex-1 overflow-y-auto py-6">
            <ul>
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
                    <span className="meta text-ink-2">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`serif text-4xl ${active === link.id ? 'italic text-clay' : ''}`}>
                      {link.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="shell shrink-0 border-t border-line py-4">
            <a
              href="#contato"
              onClick={(event) => {
                event.preventDefault()
                go('contato')
              }}
              className="pill pill-dark w-full"
            >
              Começar um projeto{' '}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
      )}
    </dialog>
  )
}
