import { ArrowUp } from '@phosphor-icons/react'
import { brand, navLinks } from '../../data/content'
import { companyPending, privacyPolicy, termsOfUse, type LegalDoc } from '../../data/legal'
import { generated, licenseNotes, mediaCredits } from '../../data/media'
import { scrollToY } from '../../lib/scroll'
import { Dialog } from '../ui/Dialog'

type LegalId = LegalDoc['id']

const fontCredits = [
  { name: 'Newsreader', license: 'SIL Open Font License 1.1', url: 'https://fontsource.org/fonts/newsreader' },
  { name: 'Hanken Grotesk', license: 'SIL Open Font License 1.1', url: 'https://fontsource.org/fonts/hanken-grotesk' },
  { name: 'IBM Plex Mono', license: 'SIL Open Font License 1.1', url: 'https://fontsource.org/fonts/ibm-plex-mono' },
  { name: 'Phosphor Icons', license: 'MIT', url: 'https://phosphoricons.com' },
]

const linkClass = 'underline decoration-line underline-offset-4 hover:decoration-ink'

export function Footer({ legal, onOpenLegal }: { legal: LegalId | null; onOpenLegal: (id: LegalId | null) => void }) {
  const doc = legal === 'privacidade' ? privacyPolicy : legal === 'termos' ? termsOfUse : null

  return (
    <footer className="border-t border-line bg-linen text-ink">
      <div className="shell grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="serif text-4xl">{brand.name}</p>
          <p className="meta mt-2 text-ink-2">{brand.descriptor}</p>
          <p className="mt-6 max-w-[34ch] leading-relaxed text-ink-2">
            Residências, apartamentos e interiores de alto padrão no {brand.place}.
          </p>
          <p className="mono mt-6 text-xs leading-relaxed text-ink-2">
            {companyPending.legalName} · {companyPending.cnpj}
            <br />
            Marca e conteúdo demonstrativos. Dados da empresa pendentes antes da publicação.
          </p>
        </div>

        <nav aria-label="Rodapé" className="md:col-span-3">
          <p className="meta text-ink-2">Navegar</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 md:grid-cols-1">
            {[...navLinks, { id: 'contato', label: 'Contato' }].map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className="inline-flex min-h-10 items-center hover:text-clay-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className="meta text-ink-2">Informações legais</p>
          <ul className="mt-3">
            {(
              [
                ['privacidade', 'Política de Privacidade'],
                ['termos', 'Termos de Uso'],
                ['creditos', 'Créditos e Licenças'],
              ] as const
            ).map(([id, label]) => (
              <li key={id}>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => onOpenLegal(id)}
                  className={`inline-flex min-h-10 items-center ${linkClass}`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-ink-2">
            Fotografias de obras: imagens geradas para o projeto e fotos de studiopipin e Pietro Bolzonetti (Unsplash).
            Retratos ilustrativos de banco (Unsplash). Croqui e amostras gerados a partir dessas imagens.
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col-reverse items-start justify-between gap-4 py-5 pb-24 sm:flex-row sm:items-center md:pb-5">
          <p className="mono text-xs text-ink-2">© 2026 {brand.full} (demonstrativo)</p>
          <button
            type="button"
            onClick={() => scrollToY(0)}
            className="meta inline-flex min-h-11 items-center gap-2 text-ink-2 hover:text-ink"
          >
            Voltar ao topo <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <Dialog open={doc !== null} onClose={() => onOpenLegal(null)} eyebrow={doc?.updated} title={doc?.title ?? ''}>
        {doc && (
          <div className="max-w-[66ch]">
            <p className="mb-6 rounded-[8px] bg-sand p-4 text-sm leading-relaxed text-ink-2-deep">
              Minuta para revisão jurídica. Não é parecer jurídico nem texto definitivo. Itens entre colchetes são
              pendências que bloqueiam a publicação.
            </p>
            {doc.sections.map((s) => (
              <section key={s.heading} className="mb-6">
                <h3 className="text-lg font-semibold">{s.heading}</h3>
                {s.body.map((b) => (
                  <p key={b} className="mt-2 leading-relaxed text-ink-2">
                    {b}
                  </p>
                ))}
              </section>
            ))}
          </div>
        )}
      </Dialog>

      <Dialog
        open={legal === 'creditos'}
        onClose={() => onOpenLegal(null)}
        eyebrow="Mídias, fontes e ícones"
        title="Créditos e Licenças"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/30">
                <th scope="col" className="meta py-2 pr-4 font-normal text-ink-2">
                  Arquivo
                </th>
                <th scope="col" className="meta py-2 pr-4 font-normal text-ink-2">
                  Crédito
                </th>
                <th scope="col" className="meta py-2 font-normal text-ink-2">
                  Licença
                </th>
              </tr>
            </thead>
            <tbody>
              {mediaCredits.map((m) => (
                <tr key={m.key} className="border-b border-line align-top">
                  <td className="mono py-2 pr-4 text-xs">{m.src.replace('/media/', '')}</td>
                  <td className="py-2 pr-4">
                    {m.sourcePage ? (
                      <a href={m.sourcePage} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {m.credit}
                      </a>
                    ) : (
                      m.credit
                    )}
                    {m.representativeStockImage && (
                      <span className="mt-1 block text-xs text-ink-2">
                        Retrato ilustrativo, não é membro da equipe.
                      </span>
                    )}
                  </td>
                  <td className="py-2">
                    {m.licenseUrl ? (
                      <a href={m.licenseUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        Licença Unsplash
                      </a>
                    ) : (
                      <span className="text-ink-2">Gerada para o projeto</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-line align-top">
                <td className="mono py-2 pr-4 text-xs">generated/*.webp</td>
                <td className="py-2 pr-4">{generated.croqui.credit}; amostras de material procedurais</td>
                <td className="py-2 text-ink-2">Gerada para o projeto</td>
              </tr>
              {fontCredits.map((f) => (
                <tr key={f.name} className="border-b border-line">
                  <td className="mono py-2 pr-4 text-xs">{f.name}</td>
                  <td className="py-2 pr-4">
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {f.name}
                    </a>
                  </td>
                  <td className="py-2">{f.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-6 space-y-2 text-xs leading-relaxed text-ink-2">
          <li>{licenseNotes.unsplash}</li>
          <li>{licenseNotes.stockPeople}</li>
        </ul>
      </Dialog>
    </footer>
  )
}
