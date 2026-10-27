import manifest from './MEDIA_MANIFEST.json'

/** Ponto focal normalizado (0..1) definido no manifesto. */
export type FocalPoint = { x: number; y: number }

export type MediaAsset = {
  key: string
  src: string
  /** Versão AVIF (mesmo nome, extensão .avif) quando o ativo é uma imagem WebP. */
  avif?: string
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

const raw = manifest.assets as Record<string, RawAsset>

function toRatio(aspect: string) {
  const [w, h] = aspect.split(':').map(Number)
  return w && h ? w / h : 1
}

function build(key: string): MediaAsset {
  const asset = raw[key]
  if (!asset) throw new Error(`Mídia ausente no manifesto: ${key}`)
  const { x, y } = asset.focalPoint
  const src = `/${asset.path}`
  return {
    key,
    src,
    avif: src.endsWith('.webp') ? src.replace(/\.webp$/, '.avif') : undefined,
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
  editorial: build('editorial'),
  pavilion: build('pavilion'),
  detail: build('detail'),
  interior: build('interior'),
  team01: build('team01'),
  team02: build('team02'),
  team03: build('team03'),
  contact: build('contact'),
  sketch: build('sketchBefore'),
  heroAmbient: build('heroAmbient'),
  canvasSequence: build('canvasSequence'),
} as const

export type MediaKey = keyof typeof media

const sequence = manifest.assets.canvasSequence

export type FrameFormat = 'avif' | 'webp'

/** Quadros "do croqui à obra": /media/frames/frame_0001.avif|webp .. frame_0120. */
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

/** Mídia derivada gerada por scripts/gerar-midia.mjs (canvas no navegador). */
export const generated = {
  croqui: {
    src: '/media/generated/croqui-casa-jardim-europa.webp',
    alt: 'Croqui técnico da mesma casa, no mesmo enquadramento, com anotações à mão: laje em balanço, brise de cumaru, caixilhos de piso a teto, espelho d’água, deck de travertino e cota de pé-direito de 3,40 m.',
    credit: 'Anotações sobre sketch-before.webp, gerado para este projeto',
  },
  swatch: (id: string) => `/media/generated/amostra-${id}.webp`,
}

/** Recorte de uma fotografia para mostrar um material aplicado (foco + aproximação). */
export type Crop = { media: MediaKey; x: number; y: number; zoom: number }

export function cropStyle(crop: Crop) {
  const position = `${crop.x * 100}% ${crop.y * 100}%`
  return { objectPosition: position, transformOrigin: position, transform: `scale(${crop.zoom})` }
}

/** Ativos usados pela página, com crédito, para o bloco de licenças do rodapé. */
export const mediaCredits = [
  media.hero,
  media.heroAmbient,
  media.sketch,
  media.canvasSequence,
  media.pavilion,
  media.detail,
  media.interior,
  media.editorial,
  media.contact,
  media.team01,
  media.team02,
  media.team03,
]

export const licenseNotes = manifest.licenseNotes
