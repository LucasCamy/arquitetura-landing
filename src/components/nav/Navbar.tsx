import { useState } from 'react'
import { List } from '@phosphor-icons/react'
import { brand, navLinks } from '../../data/content'
import { MobileMenu } from './MobileMenu'

/** Barra superior limpa (NAV-2). As cores vêm do tema do <html> (claro, foto ou capítulo escuro). */
export function Navbar({ active }: { active: string }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-40 h-[72px] border-b transition-colors duration-500"
        style={{ background: 'var(--nav-bg)', color: 'var(--nav-fg)', borderColor: 'var(--nav-line)' }}
      >
        <div className="shell flex h-full items-center justify-between gap-6">
          <a
            href="#manifesto"
            className="flex min-h-11 items-baseline gap-2.5"
            aria-label={`${brand.full}, voltar ao início`}
          >
            <span className="serif text-[1.65rem] leading-none tracking-tight">{brand.name}</span>
            <span className="meta hidden opacity-80 sm:inline">{brand.descriptor}</span>
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-4">
              {navLinks.map((link) => {
                const isActive = active === link.id
                return (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      aria-current={isActive ? 'location' : undefined}
                      className="group relative inline-flex min-h-11 items-center px-2.5 text-[0.95rem]"
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={`absolute right-2.5 bottom-2 left-2.5 h-px origin-left bg-current transition-transform duration-300 ${
                          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#contato"
              className="pill hidden min-h-11 border border-current sm:inline-flex hover:bg-[var(--nav-fg)] hover:text-[var(--page-bg)]"
            >
              Começar um projeto{' '}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full border border-current lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              aria-controls="menu-movel"
              onClick={() => setMenuOpen(true)}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} active={active} />
    </>
  )
}
