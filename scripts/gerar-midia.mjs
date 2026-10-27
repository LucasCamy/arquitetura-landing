// Gera mídia derivada no navegador (canvas), sem dependências nativas:
//  - croqui à mão sobre papel creme, pixel a pixel alinhado a hero-main.webp;
//  - seis amostras quadradas de material (travertino, concreto, cumaru, freijó, terracota, linho).
// Uso: node scripts/gerar-midia.mjs   (grava em public/media/generated/)
import { chromium } from 'playwright'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const OUT = 'public/media/generated'
await mkdir(OUT, { recursive: true })

async function launch() {
  for (const channel of [undefined, 'msedge', 'chrome']) {
    try {
      return await chromium.launch(channel ? { channel } : {})
    } catch {
      /* tenta o próximo navegador */
    }
  }
  throw new Error('Nenhum Chromium/Edge/Chrome disponível')
}

const browser = await launch()
const page = await browser.newPage()
await page.setContent('<!doctype html><body></body>')

const heroData = `data:image/webp;base64,${(await readFile('public/media/hero-main.webp')).toString('base64')}`

const save = async (name, dataUrl) => {
  await writeFile(`${OUT}/${name}`, Buffer.from(dataUrl.split(',')[1], 'base64'))
  console.log('gerado', `${OUT}/${name}`)
}

// ---------- Croqui ----------
const croqui = await page.evaluate(async (src) => {
  const img = new Image()
  img.src = src
  await img.decode()
  const W = img.naturalWidth
  const H = img.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const px = ctx.getImageData(0, 0, W, H).data

  const gray = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) gray[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]

  const blur = (a, r) => {
    const tmp = new Float32Array(W * H)
    const out = new Float32Array(W * H)
    const n = 2 * r + 1
    for (let y = 0; y < H; y++) {
      let s = 0
      for (let x = -r; x <= r; x++) s += a[y * W + Math.min(W - 1, Math.max(0, x))]
      for (let x = 0; x < W; x++) {
        tmp[y * W + x] = s / n
        s += a[y * W + Math.min(W - 1, x + r + 1)] - a[y * W + Math.max(0, x - r)]
      }
    }
    for (let x = 0; x < W; x++) {
      let s = 0
      for (let y = -r; y <= r; y++) s += tmp[Math.min(H - 1, Math.max(0, y)) * W + x]
      for (let y = 0; y < H; y++) {
        out[y * W + x] = s / n
        s += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x]
      }
    }
    return out
  }

  const sobel = (a) => {
    const m = new Float32Array(W * H)
    for (let y = 1; y < H - 1; y++)
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x
        const gx = a[i - W + 1] + 2 * a[i + 1] + a[i + W + 1] - a[i - W - 1] - 2 * a[i - 1] - a[i + W - 1]
        const gy = a[i + W - 1] + 2 * a[i + W] + a[i + W + 1] - a[i - W - 1] - 2 * a[i - W] - a[i - W + 1]
        m[i] = Math.hypot(gx, gy)
      }
    return m
  }

  // Equaliza o tom (foto noturna): percentis 3 e 97 viram 0 e 1.
  const sorted = Float32Array.from(gray).sort()
  const lo = sorted[Math.floor(sorted.length * 0.03)]
  const hi = sorted[Math.floor(sorted.length * 0.97)]
  const norm = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) norm[i] = Math.min(1, Math.max(0, (gray[i] - lo) / (hi - lo))) * 255

  const fine = sobel(blur(norm, 1))
  const coarse = sobel(blur(norm, 3))
  const tone = blur(norm, 7)
  const smooth = (v, a, b) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)
  }
  const hash = (x, y) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
    return s - Math.floor(s)
  }

  const out = ctx.createImageData(W, H)
  const o = out.data
  const paper = [241, 233, 217]
  const lead = [48, 46, 42]
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const r = px[i * 4]
      const b = px[i * 4 + 2]
      const sky = smooth(b - r, 12, 40) // céu azul e o reflexo dele na água
      const edge = Math.max(smooth(fine[i], 70, 190) * 0.6, smooth(coarse[i], 34, 110)) * (1 - 0.82 * sky)
      const d = (1 - tone[i] / 255) * (1 - sky)
      const jitter = 2.4 * Math.sin(y * 0.021 + x * 0.004)
      // Cada traço de hachura é interrompido ao longo do próprio comprimento, como lápis.
      const dashA = hash(Math.floor((x + y + jitter) / 11), Math.floor((x - y) / 70)) > 0.3 ? 1 : 0
      const dashB = hash(Math.floor((x - y + jitter) / 11) + 91, Math.floor((x + y) / 70)) > 0.35 ? 1 : 0
      let hatch = 0
      if (d > 0.6 && (((x + y + jitter) % 11) + 11) % 11 < 1.1) hatch = Math.max(hatch, 0.34 * dashA)
      if (d > 0.78 && (((x - y + jitter) % 11) + 11) % 11 < 1.1) hatch = Math.max(hatch, 0.4 * dashB)
      if (d > 0.92 && (y + jitter) % 7 < 1) hatch = Math.max(hatch, 0.3)
      const grain = 0.72 + 0.28 * hash(x, y)
      const L = Math.min(1, (edge * 0.95 + hatch) * grain)
      const mottle = (hash(Math.floor(x / 9), Math.floor(y / 9)) - 0.5) * 6 + (hash(x, y) - 0.5) * 7
      const vig = 1 - 0.06 * Math.hypot(x / W - 0.5, y / H - 0.5)
      for (let c = 0; c < 3; c++) o[i * 4 + c] = (paper[c] + mottle) * vig * (1 - L) + lead[c] * L
      o[i * 4 + 3] = 255
    }
  ctx.putImageData(out, 0, 0)

  // Linhas de construção e cotas, como o arquiteto faria sobre o croqui.
  const pencil = (alpha, width) => {
    ctx.strokeStyle = `rgba(48,46,42,${alpha})`
    ctx.lineWidth = width
    ctx.lineCap = 'round'
  }
  const line = (x1, y1, x2, y2) => {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2 + 0.6, y2 - 0.4)
    ctx.stroke()
  }
  // Texto com halo de papel: legível sobre hachura, como letra feita em área poupada.
  const letter = (text, tx, ty) => {
    ctx.save()
    ctx.strokeStyle = 'rgba(241,233,217,0.92)'
    ctx.lineWidth = 7
    ctx.lineJoin = 'round'
    ctx.strokeText(text, tx, ty)
    ctx.fillStyle = 'rgba(40,38,34,0.86)'
    ctx.fillText(text, tx, ty)
    ctx.restore()
  }
  pencil(0.28, 1.1)
  line(-10, H * 0.622, W + 10, H * 0.622) // linha do horizonte
  ctx.font = `${Math.round(W * 0.02)}px "Segoe Print", "Comic Sans MS", cursive`
  letter('LH', W * 0.02, H * 0.614)

  // Cota de pé-direito ao lado da sala envidraçada.
  const cx = W * 0.905
  const y1 = H * 0.47
  const y2 = H * 0.625
  pencil(0.75, 1.4)
  line(cx, y1 - 14, cx, y2 + 14)
  line(cx - 9, y1, cx + 9, y1)
  line(cx - 9, y2, cx + 9, y2)
  line(cx - 7, y1 + 7, cx + 7, y1 - 7)
  line(cx - 7, y2 + 7, cx + 7, y2 - 7)
  ctx.save()
  ctx.translate(cx + 22, (y1 + y2) / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  letter('pé-dir. 3,40', 0, 0)
  ctx.restore()

  const note = (text, tx, ty, ax, ay) => {
    const w = ctx.measureText(text).width
    pencil(0.6, 1.2)
    line(ax, ay, tx < ax ? tx + w + 8 : tx - 8, ty - 7)
    ctx.beginPath()
    ctx.arc(ax, ay, 3.5, 0, Math.PI * 2)
    ctx.stroke()
    letter(text, tx, ty)
  }
  ctx.textAlign = 'left'
  note('brise cumaru', W * 0.55, H * 0.075, W * 0.66, H * 0.27)
  note('caixilho piso-teto', W * 0.03, H * 0.5, W * 0.44, H * 0.56)
  note('laje em balanço', W * 0.52, H * 0.8, W * 0.62, H * 0.47)
  note("espelho d'água", W * 0.05, H * 0.88, W * 0.3, H * 0.8)
  note('deck travertino', W * 0.6, H * 0.7, W * 0.82, H * 0.645)

  // Carimbo do estudo.
  ctx.font = `${Math.round(W * 0.024)}px "Segoe Print", "Comic Sans MS", cursive`
  ctx.textAlign = 'right'
  letter('Casa Jardim Europa · estudo 03', W * 0.96, H * 0.95)
  ctx.font = `${Math.round(W * 0.018)}px "Segoe Print", "Comic Sans MS", cursive`
  letter('mar. 2022 · C.M.', W * 0.96, H * 0.977)

  return canvas.toDataURL('image/webp', 0.86)
}, heroData)
await save('croqui-casa-jardim-europa.webp', croqui)

// ---------- Amostras de material ----------
const swatches = await page.evaluate(() => {
  const S = 480
  const hash = (x, y) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
    return s - Math.floor(s)
  }
  const vnoise = (x, y) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)
    const a = hash(xi, yi)
    const b = hash(xi + 1, yi)
    const c = hash(xi, yi + 1)
    const d = hash(xi + 1, yi + 1)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }
  const fbm = (x, y) => vnoise(x, y) * 0.55 + vnoise(x * 2.1, y * 2.1) * 0.28 + vnoise(x * 4.3, y * 4.3) * 0.17

  const make = (fn) => {
    const c = document.createElement('canvas')
    c.width = S
    c.height = S
    const ctx = c.getContext('2d')
    const img = ctx.createImageData(S, S)
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const [r, g, b] = fn(x, y)
        const i = (y * S + x) * 4
        img.data[i] = r
        img.data[i + 1] = g
        img.data[i + 2] = b
        img.data[i + 3] = 255
      }
    ctx.putImageData(img, 0, 0)
    return { c, ctx }
  }
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
  const result = {}

  // Travertino romano levigado: veios horizontais ondulados e poros preenchidos.
  result.travertino = make((x, y) => {
    const band = Math.sin(y * 0.045 + fbm(x * 0.008, y * 0.02) * 9)
    let col = mix([226, 212, 188], [205, 186, 156], (band + 1) * 0.28 + fbm(x * 0.02, y * 0.02) * 0.3)
    const pore = hash(Math.floor(x / 5), Math.floor(y / 3))
    if (pore > 0.975) col = mix(col, [238, 228, 208], 0.7)
    if (pore < 0.012) col = mix(col, [176, 156, 126], 0.6)
    const n = (hash(x, y) - 0.5) * 8
    return col.map((v) => v + n)
  }).c.toDataURL('image/webp', 0.9)

  // Concreto aparente com fôrma de tábua e furos de tirante.
  {
    const { c, ctx } = make((x, y) => {
      const board = Math.floor(y / 96)
      const plank = (hash(board, 3) - 0.5) * 14
      const grain = Math.sin(x * 0.09 + fbm(x * 0.01, y * 0.08) * 5) * 4
      const seam = y % 96 < 2 ? -22 : 0
      const n = fbm(x * 0.03, y * 0.03) * 26 + (hash(x, y) - 0.5) * 16
      const v = 150 + plank + grain + seam + n
      return [v + 2, v, v - 4]
    })
    ctx.fillStyle = 'rgba(70,68,64,0.85)'
    for (const [hx, hy] of [
      [120, 144],
      [360, 144],
      [120, 336],
      [360, 336],
    ]) {
      ctx.beginPath()
      ctx.arc(hx, hy, 9, 0, Math.PI * 2)
      ctx.fill()
    }
    result.concreto = c.toDataURL('image/webp', 0.9)
  }

  const wood = (light, dark, freq) => (x, y) => {
    // Veio reto (tábua cortada ao longo da fibra), com deriva lenta e fibras finas.
    const warp = fbm(x * 0.006, y * 0.0025) * 26
    const ring = Math.sin((x + warp) * freq)
    const fiber = (vnoise(x * 0.9, y * 0.012) - 0.5) * 0.5
    const t = Math.min(1, Math.max(0, (ring + 1) * 0.3 + fiber + fbm(x * 0.02, y * 0.003) * 0.35))
    const n = (hash(x, y) - 0.5) * 7
    return mix(light, dark, t).map((v) => v + n)
  }
  // Cumaru: madeira densa, castanho avermelhado, óleo natural.
  result.cumaru = make(wood([146, 92, 56], [92, 52, 30], 0.11)).c.toDataURL('image/webp', 0.9)
  // Freijó: dourado, veio aberto e reto.
  result.freijo = make(wood([214, 178, 126], [168, 128, 82], 0.07)).c.toDataURL('image/webp', 0.9)

  // Terracota: argila queimada com pintas minerais e variação de queima.
  result.terracota = make((x, y) => {
    const burn = fbm(x * 0.008, y * 0.008)
    let col = mix([192, 102, 66], [158, 76, 46], burn * 0.9)
    const s = hash(x, y)
    if (s > 0.992) col = mix(col, [230, 196, 160], 0.6)
    if (s < 0.006) col = mix(col, [96, 46, 28], 0.6)
    const n = (hash(x * 3, y) - 0.5) * 10
    return col.map((v) => v + n)
  }).c.toDataURL('image/webp', 0.9)

  // Linho: trama tela 1x1 com fios irregulares (slub).
  result.linho = make((x, y) => {
    const warp = (x % 6) / 6
    const weft = (y % 6) / 6
    const over = (Math.floor(x / 6) + Math.floor(y / 6)) % 2 === 0
    const shade = over ? Math.sin(warp * Math.PI) : Math.sin(weft * Math.PI)
    const slub = (vnoise(x * 0.05, Math.floor(y / 6)) - 0.5) * 18 + (vnoise(Math.floor(x / 6), y * 0.05) - 0.5) * 14
    const v = 196 + shade * 22 + slub + (hash(x, y) - 0.5) * 8
    return [v + 14, v + 6, v - 10]
  }).c.toDataURL('image/webp', 0.9)

  return result
})
for (const [name, data] of Object.entries(swatches)) await save(`amostra-${name}.webp`, data)

await browser.close()
