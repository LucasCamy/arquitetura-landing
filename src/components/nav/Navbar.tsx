import { useState } from 'react'
import { List } from '@phosphor-icons/react'
import { brand, navLinks, type ChapterId } from '../../data/content'
import { MobileMenu } from './MobileMenu'

export function Navbar({ active }: { active: ChapterId }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-line bg-basalt/95">
        <div className="container-grid flex h-full items-center justify-between gap-6">
          <a
            href="#inicio"
            className="group flex min-h-11 items-center gap-3"
            aria-label={`${brand.name}, voltar ao início`}
          >
            <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
              <path d="M2 4h20L12 21z" fill="none" className="stroke-clay" strokeWidth="1.5" />
              <path d="M2 4h20" className="stroke-limestone" strokeWidth="1.5" />
            </svg>
            <span className="display text-xl tracking-[0.04em] lg:text-[1.35rem]">Atelier Vértice</span>
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-3">
              {navLinks.map((link) => {
                const isActive = active === link.id
                return (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      aria-current={isActive ? 'location' : undefined}
                      className={`relative inline-flex min-h-11 items-center px-2 text-[0.92rem] transition-colors xl:px-3 ${
                        isActive ? 'text-limestone' : 'text-ash hover:text-limestone'
                      }`}
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-2 bottom-2 h-px origin-left bg-clay transition-transform duration-300 xl:inset-x-3 ${
                          isActive ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a href="#contato" className="btn btn-primary hidden min-h-11 sm:inline-flex">
              Fale Conosco
            </a>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-[var(--radius-control)] border border-line-strong lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              aria-controls="menu-movel"
              onClick={() => setMenuOpen(true)}
            >
              <List size={22} weight="light" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} active={active} />
    </>
  )
}
