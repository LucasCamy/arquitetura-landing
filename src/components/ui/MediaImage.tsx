import type { CSSProperties, Ref } from 'react'
import type { MediaAsset } from '../../data/media'

type MediaImageProps = {
  asset: MediaAsset
  className?: string
  priority?: boolean
  sizes?: string
  imgRef?: Ref<HTMLImageElement>
  style?: CSSProperties
  /** Imagem decorativa quando o mesmo conteúdo já está descrito ao lado. */
  decorative?: boolean
}

/** Imagem do manifesto com object-position derivado do focalPoint. */
export function MediaImage({ asset, className = '', priority, sizes, imgRef, style, decorative }: MediaImageProps) {
  return (
    <img
      ref={imgRef}
      src={asset.src}
      alt={decorative ? '' : asset.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      sizes={sizes}
      className={`h-full w-full object-cover ${className}`}
      style={{ objectPosition: asset.objectPosition, ...style }}
    />
  )
}
