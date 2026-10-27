import { ArrowUp } from '@phosphor-icons/react'
import { brand, navLinks } from '../../data/content'
import { companyPending, privacyPolicy, termsOfUse, type LegalDoc } from '../../data/legal'
import { licenseNotes, mediaCredits } from '../../data/media'
import { scrollToY } from '../../lib/scroll'
import { Dialog } from '../ui/Dialog'

type LegalId = LegalDoc['id']

const fontCredits = [
  {
    name: 'Big Shoulders Display',
    license: 'SIL Open Font License 1.1',
    url: 'https://fontsource.org/fonts/big-shoulders-display',
  },
  { name: 'Hanken Grotesk', license: 'SIL Open Font License 1.1', url: 'https://fontsource.org/fonts/hanken-grotesk' },
  { name: 'IBM Plex Mono', license: 'SIL Open Font License 1.1', url: 'https://fontsource.org/fonts/ibm-plex-mono' },
  { name: 'Phosphor Icons', license: 'MIT', url: 'https://phosphoricons.com' },
]

export function Footer({ legal, onOpenLegal }: { legal: LegalId | null; onOpenLegal: (id: LegalId | null) => void }) {
  const doc = legal === 'privacidade' ? privacyPolicy : legal === 'termos' ? termsOfUse : null

  return (
    <footer className="border-t border-line">
      <div className="container-grid grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="display text-3xl tracking-[0.04em]">{brand.name}</p>
          <p className="mt-2 text-sm text-ash">{brand.tagline}</p>
          <p className="mt-1 text-sm text-ash">
            {brand.city} · {brand.scope}
          </p>
          <p className="mono mt-6 text-xs leading-relaxed text-ash">
            {companyPending.legalName} · {companyPending.cnpj}
            <br />
            Marca e conteúdo demonstrativos. Dados da empresa pendentes antes da publicação.
          </p>
        </div>

        <nav aria-label="Rodapé" className="md:col-span-3">
          <p className="label text-ash">Navegar</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 md:grid-cols-1">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className="inline-flex min-h-10 items-center text-sm hover:text-clay-ink">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#contato" className="inline-flex min-h-10 items-center text-sm hover:text-clay-ink">
                Contato
              </a>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className="label text-ash">Informações legais</p>
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
                  className="inline-flex min-h-10 items-center text-sm underline decoration-line-strong underline-offset-4 hover:decoration-clay"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-ash">
            Fotografias: studiopipin, Pietro Bolzonetti e retratos ilustrativos via Unsplash. Imagens-chave, vídeo de
            ambiência e sequência da Travessia gerados para este projeto.
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-grid flex flex-col-reverse items-start justify-between gap-4 py-5 sm:flex-row sm:items-center">
          <p className="mono text-xs text-ash">
            © 2026 {brand.name} (demonstrativo) · {brand.coordinates}
          </p>
          <button
            type="button"
            onClick={() => scrollToY(0)}
            className="label inline-flex min-h-11 items-center gap-2 text-ash hover:text-limestone"
          >
            Voltar ao topo
            <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <Dialog open={doc !== null} onClose={() => onOpenLegal(null)} eyebrow={doc?.updated} title={doc?.title ?? ''}>
        {doc && (
          <div className="max-w-[68ch]">
            <p className="mb-6 border border-line-strong bg-basalt p-4 text-sm leading-relaxed text-ash">
              Minuta para revisão jurídica. Não é parecer jurídico nem texto definitivo. Itens entre colchetes são
              pendências que bloqueiam a publicação.
            </p>
            {doc.sections.map((s) => (
              <section key={s.heading} className="mb-6">
                <h3 className="text-lg font-semibold">{s.heading}</h3>
                {s.body.map((b) => (
                  <p key={b} className="mt-2 leading-relaxed text-limestone/85">
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
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line-strong">
                <th scope="col" className="label py-2 pr-4 font-normal text-ash">
                  Arquivo
                </th>
                <th scope="col" className="label py-2 pr-4 font-normal text-ash">
                  Crédito
                </th>
                <th scope="col" className="label py-2 font-normal text-ash">
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
                      <a
                        href={m.sourcePage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-line-strong underline-offset-4 hover:decoration-clay"
                      >
                        {m.credit}
                      </a>
                    ) : (
                      m.credit
                    )}
                    {m.representativeStockImage && (
                      <span className="mt-1 block text-xs text-ash">Retrato ilustrativo, não é membro da equipe.</span>
                    )}
                  </td>
                  <td className="py-2">
                    {m.licenseUrl ? (
                      <a
                        href={m.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-line-strong underline-offset-4 hover:decoration-clay"
                      >
                        {m.licenseUrl.includes('pexels') ? 'Licença Pexels' : 'Licença Unsplash'}
                      </a>
                    ) : (
                      <span className="text-ash">Gerada para o projeto</span>
                    )}
                  </td>
                </tr>
              ))}
              {fontCredits.map((f) => (
                <tr key={f.name} className="border-b border-line">
                  <td className="mono py-2 pr-4 text-xs">{f.name}</td>
                  <td className="py-2 pr-4">
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-line-strong underline-offset-4 hover:decoration-clay"
                    >
                      {f.name}
                    </a>
                  </td>
                  <td className="py-2">{f.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-6 space-y-2 text-xs leading-relaxed text-ash">
          <li>{licenseNotes.unsplash}</li>
          <li>{licenseNotes.stockPeople}</li>
        </ul>
      </Dialog>
    </footer>
  )
}
