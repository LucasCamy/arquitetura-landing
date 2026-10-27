import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { CheckCircle, Copy, SpinnerGap, WarningCircle } from '@phosphor-icons/react'
import { brand, projectTypes } from '../../data/content'
import { media } from '../../data/media'
import { useBriefing } from '../../lib/briefing'
import { gsap, useScene } from '../../lib/scroll'
import { MediaImage } from '../ui/MediaImage'
import { RichTitle } from '../ui/RichTitle'

type Fields = {
  nome: string
  email: string
  telefone: string
  tipo: string
  metragem: string
  local: string
  mensagem: string
}
type Errors = Partial<Record<keyof Fields, string>>

const empty: Fields = { nome: '', email: '', telefone: '', tipo: '', metragem: '', local: '', mensagem: '' }
const order: (keyof Fields)[] = ['nome', 'email', 'telefone', 'tipo', 'metragem', 'local', 'mensagem']
const withHelp = new Set<keyof Fields>(['telefone', 'metragem', 'local', 'mensagem'])

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (f.nome.trim().length < 2) e.nome = 'Informe seu nome.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()))
    e.email = 'Informe um e-mail válido, como nome@dominio.com.'
  if (f.telefone && f.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Use DDD e número, ou deixe em branco.'
  if (!f.tipo) e.tipo = 'Escolha o tipo de projeto ou "Ainda não sei".'
  if (f.metragem && (!/^\d+([.,]\d+)?$/.test(f.metragem.trim()) || Number(f.metragem.replace(',', '.')) <= 0))
    e.metragem = 'Use apenas números, por exemplo 450.'
  if (f.mensagem.trim().length < 20) e.mensagem = 'Conte um pouco mais (mínimo de 20 caracteres).'
  return e
}

type Status = 'idle' | 'sending' | 'sent'

export function Contact({ onOpenPrivacy, onVisible }: { onOpenPrivacy: () => void; onVisible: (v: boolean) => void }) {
  const sectionRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const id = useId()
  const [fields, setFields] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [copied, setCopied] = useState(false)
  const { preset } = useBriefing()

  // Pedidos vindos de outras seções chegam pré-preenchidos.
  useEffect(() => {
    if (preset.version === 0) return
    setStatus('idle')
    setFields((f) => ({ ...f, tipo: preset.projectType ?? f.tipo, mensagem: preset.message ?? f.mensagem }))
    const t = window.setTimeout(() => {
      formRef.current?.querySelector<HTMLInputElement>('input[name="nome"]')?.focus({ preventScroll: true })
    }, 1300)
    return () => window.clearTimeout(t)
  }, [preset])

  // A pílula flutuante some quando o formulário já está à vista.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => onVisible(!!entry?.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [onVisible])

  useScene(sectionRef, () => {
    const q = gsap.utils.selector(sectionRef)
    gsap.from(q('[data-word]'), {
      yPercent: 110,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: { trigger: q('h2')[0], start: 'top 85%', once: true },
    })
    const frame = q('[data-reveal]')[0]
    if (!frame) return
    gsap
      .timeline({ scrollTrigger: { trigger: frame, start: 'top 95%', end: 'bottom 75%', scrub: 1 } })
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
      .fromTo(q('[data-reveal] img'), { scale: 1.12 }, { scale: 1, ease: 'none' }, 0)
  })

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    const next = { ...fields, [key]: value }
    setFields(next)
    if (submitted) setErrors(validate(next))
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    const found = validate(fields)
    setErrors(found)
    const first = order.find((k) => found[k])
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setStatus('sending')
    // Sem backend: envio simulado localmente, nada sai do navegador.
    window.setTimeout(() => setStatus('sent'), 1200)
  }

  const successRef = useCallback((node: HTMLHeadingElement | null) => node?.focus(), [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(brand.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2400)
    } catch {
      setCopied(false)
    }
  }

  const fieldProps = (key: keyof Fields) => ({
    id: `${id}-${key}`,
    name: key,
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby':
      [errors[key] ? `${id}-${key}-err` : '', withHelp.has(key) ? `${id}-${key}-help` : ''].filter(Boolean).join(' ') ||
      undefined,
  })

  return (
    <section id="contato" ref={sectionRef} aria-labelledby="contato-title" className="bg-linen pt-28 pb-20 md:pt-40">
      <div className="shell">
        <div className="max-w-[52rem]">
          <p className="meta text-clay-ink">Vamos conversar</p>
          <RichTitle id="contato-title" text="Conte como a sua família *vive*." className="t-section mt-4" />
          <p className="mt-6 max-w-[48ch] leading-relaxed text-ink-2">
            A primeira conversa é sem custo, no estúdio do Jardim Europa ou por vídeo. Respondemos em até dois dias
            úteis.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <figure>
              <div data-reveal className="aspect-[16/10] overflow-hidden rounded-[2px] lg:aspect-[4/5]">
                <MediaImage asset={media.contact} sizes="(min-width: 1024px) 40vw, 100vw" />
              </div>
              <figcaption className="meta mt-4 text-ink-2">O estúdio à noite, com as maquetes da semana</figcaption>
            </figure>
            <dl className="mt-10 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="meta text-ink-2">Endereço</dt>
                <dd className="mt-2 leading-snug">
                  Jardim Europa, São Paulo · SP
                  <span className="mt-1 block text-sm text-ink-2">
                    Endereço completo enviado na confirmação da visita.
                  </span>
                </dd>
              </div>
              <div>
                <dt className="meta text-ink-2">Horário</dt>
                <dd className="mt-2 leading-snug">
                  Seg. a sex., 9h às 18h
                  <span className="mt-1 block text-sm text-ink-2">Visitas ao estúdio com hora marcada.</span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="meta text-ink-2">Contato</dt>
                <dd className="mt-2 flex flex-wrap items-center gap-x-5">
                  <a
                    href={`mailto:${brand.email}`}
                    className="underline decoration-line underline-offset-4 hover:decoration-ink"
                  >
                    {brand.email}
                  </a>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="meta inline-flex min-h-11 items-center gap-2 text-ink-2 hover:text-ink"
                  >
                    {copied ? (
                      <CheckCircle size={14} className="text-ok" aria-hidden="true" />
                    ) : (
                      <Copy size={14} aria-hidden="true" />
                    )}
                    {copied ? 'E-mail copiado' : 'Copiar e-mail'}
                  </button>
                  <span className="sr-only" aria-live="polite">
                    {copied ? 'E-mail copiado para a área de transferência.' : ''}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[2px] bg-sand p-6 md:p-10">
              {status === 'sent' ? (
                <div role="status" className="py-6">
                  <CheckCircle size={44} weight="light" className="text-ok" aria-hidden="true" />
                  <h3 ref={successRef} tabIndex={-1} className="serif mt-4 text-4xl outline-none">
                    Recebemos o seu <em>projeto</em>.
                  </h3>
                  <p className="mt-4 max-w-[50ch] leading-relaxed text-ink-2-deep">
                    Obrigada, {fields.nome.split(' ')[0]}. Em uma operação real, Cecília responderia em até dois dias
                    úteis para marcar a primeira conversa. Envio simulado: nenhum dado saiu do seu navegador.
                  </p>
                  <button
                    type="button"
                    className="pill pill-outline mt-8"
                    onClick={() => {
                      setFields(empty)
                      setErrors({})
                      setSubmitted(false)
                      setStatus('idle')
                    }}
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form ref={formRef} noValidate onSubmit={onSubmit} aria-labelledby={`${id}-title`}>
                  <h3 id={`${id}-title`} className="serif text-3xl">
                    Começar um <em>projeto</em>
                  </h3>
                  <p className="mt-2 text-sm text-ink-2-deep">Campos com * são obrigatórios.</p>

                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <Field label="Nome *" htmlFor={`${id}-nome`} error={errors.nome} errId={`${id}-nome-err`}>
                      <input
                        {...fieldProps('nome')}
                        className="field"
                        autoComplete="name"
                        value={fields.nome}
                        onChange={(e) => set('nome', e.target.value)}
                      />
                    </Field>
                    <Field label="E-mail *" htmlFor={`${id}-email`} error={errors.email} errId={`${id}-email-err`}>
                      <input
                        {...fieldProps('email')}
                        type="email"
                        inputMode="email"
                        className="field"
                        autoComplete="email"
                        value={fields.email}
                        onChange={(e) => set('email', e.target.value)}
                      />
                    </Field>
                    <Field
                      label="Telefone"
                      htmlFor={`${id}-telefone`}
                      help="Opcional, se preferir uma ligação."
                      helpId={`${id}-telefone-help`}
                      error={errors.telefone}
                      errId={`${id}-telefone-err`}
                    >
                      <input
                        {...fieldProps('telefone')}
                        type="tel"
                        inputMode="tel"
                        className="field"
                        autoComplete="tel"
                        value={fields.telefone}
                        onChange={(e) => set('telefone', e.target.value)}
                      />
                    </Field>
                    <Field
                      label="Tipo de projeto *"
                      htmlFor={`${id}-tipo`}
                      error={errors.tipo}
                      errId={`${id}-tipo-err`}
                    >
                      <select
                        {...fieldProps('tipo')}
                        className="field"
                        value={fields.tipo}
                        onChange={(e) => set('tipo', e.target.value)}
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
                    </Field>
                    <Field
                      label="Metragem aproximada"
                      htmlFor={`${id}-metragem`}
                      help="Opcional, em m²."
                      helpId={`${id}-metragem-help`}
                      error={errors.metragem}
                      errId={`${id}-metragem-err`}
                    >
                      <div className="relative">
                        <input
                          {...fieldProps('metragem')}
                          inputMode="decimal"
                          className="field pr-12"
                          value={fields.metragem}
                          onChange={(e) => set('metragem', e.target.value)}
                        />
                        <span
                          aria-hidden="true"
                          className="mono pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-ink-2-deep"
                        >
                          m²
                        </span>
                      </div>
                    </Field>
                    <Field
                      label="Local da obra"
                      htmlFor={`${id}-local`}
                      help="Opcional: bairro ou cidade."
                      helpId={`${id}-local-help`}
                    >
                      <input
                        {...fieldProps('local')}
                        className="field"
                        autoComplete="address-level2"
                        value={fields.local}
                        onChange={(e) => set('local', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="mt-6">
                    <Field
                      label="Conte sobre a casa *"
                      htmlFor={`${id}-mensagem`}
                      help="Quem mora, o que precisa mudar, prazos. Mínimo de 20 caracteres."
                      helpId={`${id}-mensagem-help`}
                      error={errors.mensagem}
                      errId={`${id}-mensagem-err`}
                    >
                      <textarea
                        {...fieldProps('mensagem')}
                        rows={5}
                        className="field resize-y"
                        value={fields.mensagem}
                        onChange={(e) => set('mensagem', e.target.value)}
                      />
                    </Field>
                  </div>

                  <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <p className="max-w-[44ch] text-xs leading-relaxed text-ink-2-deep">
                      Usamos estes dados só para responder ao seu pedido. Veja a{' '}
                      <button type="button" onClick={onOpenPrivacy} className="text-ink underline underline-offset-2">
                        Política de Privacidade
                      </button>
                      . Demonstração: o envio é simulado e nada sai do navegador.
                    </p>
                    <button
                      type="submit"
                      className="pill pill-dark min-w-[13rem]"
                      disabled={status === 'sending'}
                      aria-busy={status === 'sending'}
                    >
                      {status === 'sending' ? (
                        <>
                          <SpinnerGap size={18} className="spin" aria-hidden="true" /> Enviando
                        </>
                      ) : (
                        <>
                          Enviar{' '}
                          <span className="arrow" aria-hidden="true">
                            →
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Field(props: {
  label: string
  htmlFor: string
  help?: string
  helpId?: string
  error?: string
  errId?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={props.htmlFor} className="text-sm font-semibold">
        {props.label}
      </label>
      <div className="mt-2">{props.children}</div>
      {props.help && (
        <p id={props.helpId} className="mt-1.5 text-xs text-ink-2-deep">
          {props.help}
        </p>
      )}
      {props.error && (
        <p id={props.errId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-error">
          <WarningCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {props.error}
        </p>
      )}
    </div>
  )
}
