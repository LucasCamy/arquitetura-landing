import { Fragment, type ElementType } from 'react'

/**
 * Título editorial: trechos entre asteriscos viram itálico (*luz*). Cada palavra fica numa
 * máscara com `data-word` para a revelação escalonada; o texto continua legível sem JS.
 */
export function RichTitle({
  text,
  as: Tag = 'h2',
  className = '',
  id,
}: {
  text: string
  as?: ElementType
  className?: string
  id?: string
}) {
  const parts = text.split('*')
  let key = 0
  return (
    <Tag id={id} className={`serif ${className}`}>
      {parts.map((part, i) => {
        const italic = i % 2 === 1
        const words = part.split(/(\s+)/)
        return words.map((w) => {
          key += 1
          if (!w) return null
          if (/^\s+$/.test(w)) return <Fragment key={key}> </Fragment>
          const word = (
            <span className="mask" key={key}>
              <span data-word>{w}</span>
            </span>
          )
          return italic ? <em key={key}>{word}</em> : word
        })
      })}
    </Tag>
  )
}
