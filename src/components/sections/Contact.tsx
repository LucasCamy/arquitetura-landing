import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, CheckCircle, Copy, SpinnerGap, WarningCircle } from '@phosphor-icons/react'
import { brand, briefingScopes, meetingOptions, terrainOptions, type MeetingFormat } from '../../data/content'
import { media } from '../../data/media'
import { useBriefing } from '../../lib/briefing'
import { gsap, useScene } from '../../lib/scroll'
import { MediaImage } from '../ui/MediaImage'

type Fields = {
  nome: string
  email: string
  telefone: string
  escopo: string
  terreno: string
  area: string
  formato: MeetingFormat
  mensagem: string
}

type Errors = Partial<Record<keyof Fields, string>>

const empty: Fields = {
  nome: '',
  email: '',
  telefone: '',
  escopo: '',
  terreno: '',
  area: '',
  formato: 'presencial',
  mensagem: '',
}

const withHelp = new Set<keyof Fields>(['telefone', 'area', 'mensagem'])

const order: (keyof Fields)[] = ['nome', 'email', 'telefone', 'escopo', 'terreno', 'area', 'mensagem']

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (f.nome.trim().length < 2) e.nome = 'Informe seu nome.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()))
    e.email = 'Informe um e-mail válido, como nome@dominio.com.'
  if (f.telefone && f.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Use DDD e número, ou deixe em branco.'
  if (!f.escopo) e.escopo = 'Escolha uma tipologia ou "Ainda não sei".'
  if (!f.terreno) e.terreno = 'Escolha a situação do terreno.'
  if (f.area && (!/^\d+([.,]\d+)?$/.test(f.area.trim()) || Number(f.area.replace(',', '.')) <= 0))
    e.area = 'Use apenas números, por exemplo 320.'
  if (f.mensagem.trim().length < 20) e.mensagem = 'Conte um pouco mais (mínimo de 20 caracteres).'
  return e
}

type Status = 'idle' | 'sending' | 'sent'

export function Contact({ onOpenPrivacy }: { onOpenPrivacy: () => void }) {
  const sectionRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const id = useId()
  const [fields, setFields] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [copied, setCopied] = useState(false)
  const { preset } = useBriefing()

  // Tipologia ou formato escolhidos em outra seção chegam pré-selecionados.
  useEffect(() => {
    if (preset.version === 0) return
    setStatus('idle')
    setFields((f) => ({
      ...f,
      escopo: preset.scope ?? f.escopo,
      formato: preset.meeting ?? f.formato,
    }))
    const t = window.setTimeout(() => {
      formRef.current?.querySelector<HTMLInputElement>('input[name="nome"]')?.focus({ preventScroll: true })
    }, 1300)
    return () => window.clearTimeout(t)
  }, [preset])

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
      const target = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)
      target?.focus()
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

  useScene(sectionRef, () => {
    const q = gsap.utils.selector(sectionRef)
    gsap.from(q('[data-word]'), {
      yPercent: 105,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: q('h2')[0], start: 'top 85%', once: true },
    })
    // Clip-path: o ateliê noturno se revela como um vão.
    const frame = q('[data-reveal]')[0]
    if (!frame) return
    gsap
      .timeline({ scrollTrigger: { trigger: frame, start: 'top 95%', end: 'bottom 80%', scrub: 1 } })
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
      .fromTo(q('[data-reveal] img'), { scale: 1.12 }, { scale: 1, ease: 'none' }, 0)
  })

  const fieldProps = (key: keyof Fields) => ({
    id: `${id}-${key}`,
    name: key,
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby':
      [errors[key] ? `${id}-${key}-err` : '', withHelp.has(key) ? `${id}-${key}-help` : ''].filter(Boolean).join(' ') ||
      undefined,
  })

  return (
    <section
      id="contato"
      ref={sectionRef}
      aria-labelledby="contato-title"
      className="border-t border-line pt-24 pb-16 md:pt-32"
    >
      <div className="container-grid">
        <h2 id="contato-title" className="monumental">
          <span className="mask">
            <span data-word>Vamos</span>
          </span>{' '}
          <span className="mask">
            <span data-word>Conversar</span>
          </span>
        </h2>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <figure className="lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
            <div data-reveal className="relative aspect-[16/10] overflow-hidden bg-stone">
              <MediaImage asset={media.contact} sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
            <figcaption className="mt-3 flex justify-between gap-4 border-t border-line pt-3 text-sm text-ash">
              <span>O ateliê à noite, com as maquetes da semana</span>
              <span className="mono shrink-0 text-xs">{brand.coordinates}</span>
            </figcaption>
          </figure>

          <div className="lg:col-span-7 lg:pl-8">
            <dl className="grid gap-px border border-line bg-line sm:grid-cols-2">
              <InfoBlock title="Endereço">
                Pinheiros, São Paulo · SP
                <span className="mt-1 block text-xs text-ash">Endereço completo enviado na confirmação da visita.</span>
              </InfoBlock>
              <InfoBlock title="Horário">
                Seg. a sex., 9h às 18h
                <span className="mt-1 block text-xs text-ash">Visitas ao ateliê com hora marcada.</span>
              </InfoBlock>
              <InfoBlock title="Contato" wide>
                <span className="flex flex-wrap items-center gap-x-5">
                  <a
                    href={`mailto:${brand.email}`}
                    className="break-words underline decoration-line-strong underline-offset-4 hover:decoration-clay"
                  >
                    {brand.email}
                  </a>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="label inline-flex min-h-11 items-center gap-2 text-ash hover:text-limestone"
                  >
                    {copied ? (
                      <CheckCircle size={14} className="text-ok" aria-hidden="true" />
                    ) : (
                      <Copy size={14} aria-hidden="true" />
                    )}
                    {copied ? 'E-mail copiado' : 'Copiar e-mail'}
                  </button>
                </span>
                <span className="sr-only" aria-live="polite">
                  {copied ? 'E-mail copiado para a área de transferência.' : ''}
                </span>
              </InfoBlock>
            </dl>

            <div className="mt-10 border border-line bg-stone p-5 md:p-8">
              {status === 'sent' ? (
                <div className="py-6" role="status">
                  <CheckCircle size={40} weight="light" className="text-ok" aria-hidden="true" />
                  <h3 ref={successRef} tabIndex={-1} className="display mt-4 text-4xl leading-none outline-none">
                    Briefing recebido
                  </h3>
                  <p className="mt-4 max-w-[52ch] leading-relaxed text-limestone/90">
                    Obrigado, {fields.nome.split(' ')[0]}. Em uma demonstração real, um dos sócios responderia em até 2
                    dias úteis para marcar a conversa {fields.formato === 'video' ? 'por vídeo' : 'no ateliê'}.
                  </p>
                  <p className="mt-3 text-sm text-ash">Envio simulado: nenhum dado saiu do seu navegador.</p>
                  <button
                    type="button"
                    className="btn btn-secondary mt-6"
                    onClick={() => {
                      setFields(empty)
                      setErrors({})
                      setSubmitted(false)
                      setStatus('idle')
                    }}
                  >
                    Enviar outro briefing
                  </button>
                </div>
              ) : (
                <form ref={formRef} noValidate onSubmit={onSubmit} aria-labelledby={`${id}-form-title`}>
                  <h3 id={`${id}-form-title`} className="display text-3xl leading-none">
                    Briefing inicial
                  </h3>
                  <p className="mt-2 text-sm text-ash">Campos com * são obrigatórios. Leva cerca de 2 minutos.</p>

                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <Field
                      label="Nome *"
                      htmlFor={`${id}-nome`}
                      error={errors.nome}
                      errId={`${id}-nome-err`}
                      helpId={`${id}-nome-help`}
                    >
                      <input
                        {...fieldProps('nome')}
                        className="field"
                        autoComplete="name"
                        value={fields.nome}
                        onChange={(e) => set('nome', e.target.value)}
                      />
                    </Field>
                    <Field
                      label="E-mail *"
                      htmlFor={`${id}-email`}
                      error={errors.email}
                      errId={`${id}-email-err`}
                      helpId={`${id}-email-help`}
                    >
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
                      help="Opcional. Só se preferir uma ligação."
                      error={errors.telefone}
                      errId={`${id}-telefone-err`}
                      helpId={`${id}-telefone-help`}
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
                      label="Tipologia *"
                      htmlFor={`${id}-escopo`}
                      error={errors.escopo}
                      errId={`${id}-escopo-err`}
                      helpId={`${id}-escopo-help`}
                    >
                      <select
                        {...fieldProps('escopo')}
                        className="field"
                        value={fields.escopo}
                        onChange={(e) => set('escopo', e.target.value)}
                      >
                        <option value="" disabled>
                          Selecione
                        </option>
                        {briefingScopes.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <fieldset
                    className="mt-6"
                    aria-invalid={errors.terreno ? true : undefined}
                    aria-describedby={errors.terreno ? `${id}-terreno-err` : undefined}
                  >
                    <legend className="text-sm font-semibold">Situação do terreno *</legend>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {terrainOptions.map((o) => (
                        <Choice
                          key={o.value}
                          name="terreno"
                          value={o.value}
                          label={o.label}
                          checked={fields.terreno === o.value}
                          invalid={!!errors.terreno}
                          onChange={() => set('terreno', o.value)}
                        />
                      ))}
                    </div>
                    {errors.terreno && <ErrorText id={`${id}-terreno-err`}>{errors.terreno}</ErrorText>}
                  </fieldset>

                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <Field
                      label="Área estimada"
                      htmlFor={`${id}-area`}
                      help="Opcional, em m²."
                      error={errors.area}
                      errId={`${id}-area-err`}
                      helpId={`${id}-area-help`}
                    >
                      <div className="relative">
                        <input
                          {...fieldProps('area')}
                          inputMode="decimal"
                          className="field pr-12"
                          value={fields.area}
                          onChange={(e) => set('area', e.target.value)}
                        />
                        <span
                          aria-hidden="true"
                          className="mono pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-ash"
                        >
                          m²
                        </span>
                      </div>
                    </Field>
                    <fieldset>
                      <legend className="text-sm font-semibold">Primeira conversa</legend>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {meetingOptions.map((o) => (
                          <Choice
                            key={o.value}
                            name="formato"
                            value={o.value}
                            label={o.label}
                            checked={fields.formato === o.value}
                            onChange={() => set('formato', o.value)}
                          />
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div className="mt-6">
                    <Field
                      label="Conte sobre o projeto *"
                      htmlFor={`${id}-mensagem`}
                      help="Programa, prazo desejado, referências. Mínimo de 20 caracteres."
                      error={errors.mensagem}
                      errId={`${id}-mensagem-err`}
                      helpId={`${id}-mensagem-help`}
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

                  <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
                    <p className="max-w-[46ch] text-xs leading-relaxed text-ash">
                      Usamos estes dados só para responder ao seu pedido. Veja a{' '}
                      <button
                        type="button"
                        onClick={onOpenPrivacy}
                        className="text-limestone underline underline-offset-2 hover:decoration-clay"
                      >
                        Política de Privacidade
                      </button>
                      . Demonstração: o envio é simulado e nada sai do navegador.
                    </p>
                    <button
                      type="submit"
                      className="btn btn-primary min-w-[13rem]"
                      disabled={status === 'sending'}
                      aria-busy={status === 'sending'}
                    >
                      {status === 'sending' ? (
                        <>
                          <SpinnerGap size={18} className="spin" aria-hidden="true" />
                          Enviando
                        </>
                      ) : (
                        <>
                          Enviar briefing
                          <ArrowRight size={18} weight="bold" aria-hidden="true" />
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

function InfoBlock({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`bg-basalt p-5 ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className="label text-ash">{title}</dt>
      <dd className="mt-2 text-[0.95rem] leading-snug">{children}</dd>
    </div>
  )
}

function Field(props: {
  label: string
  htmlFor: string
  help?: string
  error?: string
  errId: string
  helpId: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={props.htmlFor} className="text-sm font-semibold">
        {props.label}
      </label>
      <div className="mt-2">{props.children}</div>
      {props.help && (
        <p id={props.helpId} className="mt-1.5 text-xs text-ash">
          {props.help}
        </p>
      )}
      {props.error && <ErrorText id={props.errId}>{props.error}</ErrorText>}
    </div>
  )
}

function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-error">
      <WarningCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  )
}

function Choice(props: {
  name: string
  value: string
  label: string
  checked: boolean
  invalid?: boolean
  onChange: () => void
}) {
  return (
    <label
      className={`relative flex min-h-12 cursor-pointer items-center justify-center rounded-[var(--radius-control)] border px-3 py-2 text-center text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-clay ${
        props.checked
          ? 'border-limestone bg-limestone font-semibold text-basalt'
          : props.invalid
            ? 'border-error text-limestone'
            : 'border-line-strong text-limestone hover:border-ash'
      }`}
    >
      <input
        type="radio"
        name={props.name}
        value={props.value}
        checked={props.checked}
        onChange={props.onChange}
        className="sr-only"
      />
      {props.label}
    </label>
  )
}
