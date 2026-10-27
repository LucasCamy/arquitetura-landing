import { Fragment } from 'react'

/** Quebra o texto em palavras mascaradas para a revelação escalonada (data-word). */
export function SplitWords({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className={`mask ${className}`}>
            <span data-word>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
}
