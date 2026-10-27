import { useCallback, useId, useState, type FormEvent } from 'react'
import { CheckCircle, SpinnerGap, WarningCircle } from '@phosphor-icons/react'
import { projectTypes } from '../../data/content'
import { Dialog } from '../ui/Dialog'

type Status = 'idle' | 'sending' | 'sent'

/** Gaveta "Pedir portfólio": formulário curto com validação e envio simulado. */
export function PortfolioDialog({
  open,
  onClose,
  onOpenPrivacy,
}: {
  open: boolean
  onClose: () => void
  onOpenPrivacy: () => void
}) {
  const id = useId()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [tipo, setTipo] = useState('')
  const [errors, setErrors] = useState<{ nome?: string; email?: string; tipo?: string }>({})
  const [status, setStatus] = useState<Status>('idle')
  const successRef = useCallback((node: HTMLHeadingElement | null) => node?.focus(), [])

  const validate = () => {
    const e: typeof errors = {}
    if (nome.trim().length < 2) e.nome = 'Informe seu nome.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = 'Informe um e-mail válido.'
    if (!tipo) e.tipo = 'Escolha o tipo de projeto.'
    return e
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    const first = (['nome', 'email', 'tipo'] as const).find((k) => found[k])
    if (first) {
      event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setStatus('sending')
    window.setTimeout(() => setStatus('sent'), 1100)
  }

  const close = () => {
    onClose()
    if (status === 'sent') {
      setStatus('idle')
      setNome('')
      setEmail('')
      setTipo('')
    }
  }

  const err = (key: keyof typeof errors) =>
    errors[key] && (
      <p id={`${id}-${key}-err`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-error">
        <WarningCircle size={16} aria-hidden="true" />
        {errors[key]}
      </p>
    )

  return (
    <Dialog
      open={open}
      onClose={close}
      variant="drawer"
      eyebrow="Portfólio completo"
      title="Plantas, fotos e visitas a obras entregues"
    >
      {status === 'sent' ? (
        <div role="status">
          <CheckCircle size={40} weight="light" className="text-ok" aria-hidden="true" />
          <h3 ref={successRef} tabIndex={-1} className="serif mt-4 text-3xl outline-none">
            Pedido <em>recebido</em>.
          </h3>
          <p className="mt-4 leading-relaxed text-ink-2">
            Em uma operação real, o portfólio em PDF chegaria em até um dia útil, com um convite para visitar uma obra
            entregue. Nesta demonstração nada foi enviado.
          </p>
          <button type="button" onClick={close} className="pill pill-dark mt-8">
            Voltar aos projetos
          </button>
        </div>
      ) : (
        <form noValidate onSubmit={submit}>
          <p className="leading-relaxed text-ink-2">
            Enviamos o portfólio completo com plantas e fichas técnicas, e agendamos uma visita a uma casa entregue
            quando a família moradora autoriza.
          </p>
          <div className="mt-8 grid gap-6">
            <div>
              <label htmlFor={`${id}-nome`} className="text-sm font-semibold">
                Nome
              </label>
              <input
                id={`${id}-nome`}
                name="nome"
                autoComplete="name"
                className="field mt-2"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                aria-invalid={errors.nome ? true : undefined}
                aria-describedby={errors.nome ? `${id}-nome-err` : undefined}
              />
              {err('nome')}
            </div>
            <div>
              <label htmlFor={`${id}-email`} className="text-sm font-semibold">
                E-mail
              </label>
              <input
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="email"
                className="field mt-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? `${id}-email-err` : undefined}
              />
              {err('email')}
            </div>
            <div>
              <label htmlFor={`${id}-tipo`} className="text-sm font-semibold">
                Tipo de projeto
              </label>
              <select
                id={`${id}-tipo`}
                name="tipo"
                className="field mt-2"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                aria-invalid={errors.tipo ? true : undefined}
                aria-describedby={errors.tipo ? `${id}-tipo-err` : undefined}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {projectTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {err('tipo')}
            </div>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-ink-2">
            Usamos estes dados só para enviar o portfólio. Veja a{' '}
            <button type="button" onClick={onOpenPrivacy} className="underline underline-offset-2">
              Política de Privacidade
            </button>
            . Demonstração: o envio é simulado.
          </p>
          <button
            type="submit"
            className="pill pill-dark mt-6 min-w-[14rem]"
            disabled={status === 'sending'}
            aria-busy={status === 'sending'}
          >
            {status === 'sending' ? (
              <>
                <SpinnerGap size={18} className="spin" aria-hidden="true" /> Enviando
              </>
            ) : (
              <>
                Receber o portfólio{' '}
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </>
            )}
          </button>
        </form>
      )}
    </Dialog>
  )
}
