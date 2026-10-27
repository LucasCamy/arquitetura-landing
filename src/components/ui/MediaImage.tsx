import type { CSSProperties, Ref } from 'react'
import type { MediaAsset } from '../../data/media'

type MediaImageProps = {
  asset: MediaAsset
  className?: string
  priority?: boolean
  sizes?: string
  imgRef?: Ref<HTMLImageElement>
  /** Estilo da <img> (o object-position do focalPoint é aplicado por padrão). */
  style?: CSSProperties
  /** Imagem decorativa quando o mesmo conteúdo já está descrito ao lado. */
  decorative?: boolean
  alt?: string
}

/** Imagem do manifesto: AVIF com fallback WebP e object-position derivado do focalPoint. */
export function MediaImage({
  asset,
  className = '',
  priority,
  sizes,
  imgRef,
  style,
  decorative,
  alt,
}: MediaImageProps) {
  return (
    <picture className="contents">
      {asset.avif && <source type="image/avif" srcSet={asset.avif} sizes={sizes} />}
      <img
        ref={imgRef}
        src={asset.src}
        alt={decorative ? '' : (alt ?? asset.alt)}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        sizes={sizes}
        draggable={false}
        className={`h-full w-full object-cover ${className}`}
        style={{ objectPosition: asset.objectPosition, ...style }}
      />
    </picture>
  )
}
