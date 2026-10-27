/** Pílula discreta fixa no canto inferior direito; some quando o formulário de contato já está à vista. */
export function FloatingCta({ hidden }: { hidden: boolean }) {
  return (
    <a
      href="#contato"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={`floating-cta pill pill-dark fixed right-4 bottom-4 z-30 min-h-11 shadow-soft transition-[opacity,translate] duration-500 md:right-6 md:bottom-6 ${
        hidden ? 'pointer-events-none translate-y-4 opacity-0' : 'opacity-100'
      }`}
    >
      Começar um projeto{' '}
      <span className="arrow" aria-hidden="true">
        →
      </span>
    </a>
  )
}
