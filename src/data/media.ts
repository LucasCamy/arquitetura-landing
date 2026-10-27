import manifest from './MEDIA_MANIFEST.json'

/** Ponto focal normalizado (0..1) definido no manifesto. */
export type FocalPoint = { x: number; y: number }

export type MediaAsset = {
  key: string
  src: string
  alt: string
  aspect: string
  /** Proporção numérica (largura / altura) para reservar espaço sem layout shift. */
  ratio: number
  focalPoint: FocalPoint
  objectPosition: string
  credit: string
  sourcePage?: string
  licenseUrl?: string
  representativeStockImage: boolean
}

type RawAsset = {
  path: string
  alt: string
  expectedAspectRatio: string
  focalPoint: FocalPoint
  credit: string
  sourcePage?: string
  sourceUrl?: string | null
  licenseUrl?: string
  representativeStockImage?: boolean
}

// Alternativas v2 (geradas para o projeto) convivem com os ativos originais no mesmo índice.
const raw = { ...manifest.assets, ...manifest.alternates } as Record<string, RawAsset>

function toRatio(aspect: string) {
  const [w, h] = aspect.split(':').map(Number)
  return w && h ? w / h : 1
}

function build(key: string): MediaAsset {
  const asset = raw[key]
  if (!asset) throw new Error(`Mídia ausente no manifesto: ${key}`)
  const { x, y } = asset.focalPoint
  return {
    key,
    src: `/${asset.path}`,
    alt: asset.alt,
    aspect: asset.expectedAspectRatio,
    ratio: toRatio(asset.expectedAspectRatio),
    focalPoint: asset.focalPoint,
    objectPosition: `${x * 100}% ${y * 100}%`,
    credit: asset.credit,
    sourcePage: asset.sourcePage ?? asset.sourceUrl ?? undefined,
    licenseUrl: asset.licenseUrl,
    representativeStockImage: asset.representativeStockImage === true,
  }
}

export const media = {
  hero: build('hero'),
  // v2: pan noturno sobre o ateliê, sem pessoas nem marcas (o v1 do Pexels mostrava ambos).
  heroAmbient: build('heroAmbientV2'),
  editorial: build('editorial'),
  pavilion: build('pavilion'),
  detail: build('detail'),
  interior: build('interior'),
  team01: build('team01'),
  team02: build('team02'),
  team03: build('team03'),
  contact: build('contact'),
  canvasSequence: build('canvasSequenceV2'),
} as const

export type MediaKey = keyof typeof media

const sequence = manifest.alternates.canvasSequenceV2

export type FrameFormat = 'avif' | 'webp'

/** Quadros da Travessia Espacial (v2): /media/frames-v2/frame_0001.avif|webp .. frame_0120. */
export const frameSequence = {
  count: sequence.frameCount,
  width: sequence.frameWidth,
  height: sequence.frameHeight,
  fps: sequence.frameRate,
  alt: sequence.alt,
  src: (index: number, format: FrameFormat = 'webp') =>
    `/${(format === 'avif' ? sequence.frameAvifPattern : sequence.framePattern).replace(
      '%04d',
      String(index + 1).padStart(4, '0'),
    )}`,
}

/** Todos os ativos com crédito, para o bloco de licenças do rodapé. */
export const mediaCredits = Object.values(media)

export const licenseNotes = manifest.licenseNotes
