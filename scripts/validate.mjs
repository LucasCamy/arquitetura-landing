// Validação em navegador: overflow, âncoras, console, cenas, interações e reduced motion.
// Uso: npm run build && npm run preview (em outro terminal) && npm run validate:browser
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const BASE = process.env.BASE_URL ?? 'http://localhost:4317'
const OUT = '.validation'
const WIDTHS = [375, 390, 768, 1024, 1280, 1440, 1920]
const SCENES = ['manifesto', 'projetos', 'croqui', 'traco', 'materiais', 'processo', 'estudio', 'perguntas', 'contato']
const PINNED = new Set(['manifesto', 'projetos', 'traco'])

await mkdir(OUT, { recursive: true })

async function launch() {
  for (const channel of [undefined, 'msedge', 'chrome']) {
    try {
      return await chromium.launch(channel ? { channel } : {})
    } catch {
      /* tenta o próximo navegador */
    }
  }
  throw new Error('Nenhum Chromium/Edge/Chrome disponível para o Playwright')
}

const overflowScript = () => {
  const iw = document.documentElement.clientWidth
  const bad = []
  for (const e of document.querySelectorAll('main *, footer *, header *')) {
    const r = e.getBoundingClientRect()
    if (!r.width || r.right <= iw + 1) continue
    let p = e.parentElement
    let clipped = false
    while (p && p !== document.body) {
      if (
        /(hidden|clip|auto|scroll)/.test(getComputedStyle(p).overflowX) &&
        p.getBoundingClientRect().right <= iw + 1
      ) {
        clipped = true
        break
      }
      p = p.parentElement
    }
    if (!clipped) bad.push(e.tagName + ' ' + (e.textContent || '').trim().slice(0, 30))
  }
  const broken = [...new Set([...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')))].filter(
    (h) => h.length > 1 && !document.getElementById(h.slice(1)),
  )
  return {
    iw,
    docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    overflow: bad.slice(0, 10),
    brokenAnchors: broken,
  }
}

const browser = await launch()
const report = { base: BASE, widths: [], modes: [], interactions: {}, errors: [] }
// Grava o relatório parcial se alguma etapa falhar.
process.on('uncaughtException', async (err) => {
  report.fatal = String(err.message ?? err)
  await writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2))
  console.error(err)
  process.exit(1)
})

function track(page, label) {
  page.on('pageerror', (err) => report.errors.push(`${label} pageerror: ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      report.errors.push(`${label} console.${msg.type()}: ${msg.text()}`)
  })
}

const settle = (page, ms = 1600) => page.waitForTimeout(ms)
const scrollTo = (page, y) => page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y)

/** Posição de uma cena; em cenas fixadas, `fraction` percorre a duração do pin. */
async function sceneY(page, id, fraction) {
  return page.evaluate(
    ({ id, fraction }) => {
      const el = document.getElementById(id)
      if (!el) return 0
      const top = el.getBoundingClientRect().top + window.scrollY
      const spacer = el.querySelector('.pin-spacer')
      if (!spacer) return Math.max(0, top - 72)
      const extra = spacer.getBoundingClientRect().height - window.innerHeight
      return Math.max(0, top + Math.max(0, extra) * fraction)
    },
    { id, fraction },
  )
}

async function scrollAll(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += 700) {
    await scrollTo(page, y)
    await page.waitForTimeout(40)
  }
  await scrollTo(page, await page.evaluate(() => document.documentElement.scrollHeight))
  await settle(page, 800)
}

// 1) Overflow, âncoras e linhas do h1 nas larguras pedidas.
for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  track(page, `w${width}`)
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await settle(page, 1800)
  const top = await page.evaluate(overflowScript)
  const h1 = await page.evaluate(() => {
    const h = document.querySelector('h1')
    if (!h) return null
    const lh = parseFloat(getComputedStyle(h).lineHeight)
    return { lines: Math.round(h.getBoundingClientRect().height / lh) }
  })
  const wrappedPills = await page.evaluate(() =>
    [...document.querySelectorAll('.pill')]
      .filter((b) => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().height > 56)
      .map((b) => b.textContent.trim()),
  )
  await page.screenshot({ path: `${OUT}/hero-${width}.png` })
  await scrollAll(page)
  const bottom = await page.evaluate(overflowScript)
  report.widths.push({ width, top, bottom, h1, wrappedPills })
  await context.close()
}

// 2) Cenas em desktop/celular com as duas preferências e com ?movimento=1.
const modes = [
  { name: 'desktop-motion', viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference', query: '' },
  { name: 'desktop-reduce', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', query: '' },
  {
    name: 'desktop-reduce-forced',
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
    query: '?movimento=1',
  },
  {
    name: 'mobile-motion',
    viewport: { width: 390, height: 844 },
    reducedMotion: 'no-preference',
    query: '',
    mobile: true,
  },
  { name: 'mobile-reduce', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', query: '', mobile: true },
]

for (const mode of modes) {
  const context = await browser.newContext({
    viewport: mode.viewport,
    reducedMotion: mode.reducedMotion,
    isMobile: !!mode.mobile,
    hasTouch: !!mode.mobile,
    deviceScaleFactor: mode.mobile ? 2 : 1,
  })
  const page = await context.newPage()
  track(page, mode.name)
  await page.goto(BASE + mode.query, { waitUntil: 'networkidle' })
  await settle(page, 2000)
  const state = await page.evaluate(() => ({
    lenis: document.documentElement.classList.contains('lenis'),
    forced: document.documentElement.classList.contains('motion-forced'),
    pins: document.querySelectorAll('.pin-spacer').length,
    canvas: !!document.querySelector('#traco canvas'),
    // Divisão de código: o chunk do Lenis só deve chegar com movimento permitido.
    lenisChunk: performance.getEntriesByType('resource').some((r) => /\/assets\/lenis-/.test(r.name)),
    belowFoldChunk: performance.getEntriesByType('resource').some((r) => /\/assets\/BelowFold-/.test(r.name)),
    heroVideo: (() => {
      const v = document.querySelector('#manifesto video')
      return v ? { playing: !v.paused, src: v.currentSrc.split('/').pop() } : null
    })(),
    horizontalTrack: !!document.querySelector('#projetos [data-card]'),
  }))
  let shots = 0
  for (const id of SCENES) {
    const fractions = PINNED.has(id) && state.pins ? [0, 0.5, 1] : [0]
    for (const f of fractions) {
      await scrollTo(page, await sceneY(page, id, f))
      await settle(page, 1500)
      await page.screenshot({
        path: `${OUT}/${mode.name}-${id}${fractions.length > 1 ? `-${Math.round(f * 100)}` : ''}.png`,
      })
      shots += 1
    }
  }
  let canvasDrawn = null
  if (state.canvas) {
    await scrollTo(page, await sceneY(page, 'traco', 0.5))
    await settle(page, 1500)
    canvasDrawn = await page.evaluate(() => {
      const c = document.querySelector('#traco canvas')
      const d = c.getContext('2d').getImageData(c.width / 2, c.height / 2, 1, 1).data
      const res = performance.getEntriesByType('resource').map((r) => r.name)
      return {
        alpha: d[3],
        avif: res.filter((n) => n.includes('/frames/') && n.endsWith('.avif')).length,
        webp: res.filter((n) => n.includes('/frames/') && n.endsWith('.webp')).length,
      }
    })
  }
  const overflow = await page.evaluate(overflowScript)
  report.modes.push({ mode: mode.name, state, canvasDrawn, overflow, shots })
  await context.close()
}

// 3) Interações e cenas-assinatura (desktop com movimento).
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  track(page, 'interactions')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await settle(page, 2000)
  const r = {}

  // Hero encolhe para a moldura do manifesto.
  const photoRect = () =>
    page.evaluate(() => {
      const img = document.querySelector('#manifesto [data-photo-img]')
      const b = img.parentElement.getBoundingClientRect()
      const clip = getComputedStyle(img.parentElement).clipPath
      return {
        w: Math.round(b.width),
        h: Math.round(b.height),
        left: Math.round(b.left),
        clip,
        theme: document.documentElement.dataset.theme,
      }
    })
  r.heroStart = await photoRect()
  await scrollTo(page, await sceneY(page, 'manifesto', 1))
  await settle(page, 2000)
  r.heroEnd = await photoRect()
  r.heroShrunk = r.heroEnd.w * r.heroEnd.h < r.heroStart.w * r.heroStart.h * 0.45
  await page.screenshot({ path: `${OUT}/hero-shrunk.png` })

  // Vídeo de ambiência: botão de pausa.
  await scrollTo(page, 0)
  await settle(page, 800)
  const pauseBtn = page.getByRole('button', { name: /Pausar movimento|Retomar movimento/ })
  r.videoBefore = await page.evaluate(() => !document.querySelector('#manifesto video')?.paused)
  await pauseBtn.click()
  await settle(page, 300)
  r.videoAfterPause = await page.evaluate(() => ({
    paused: document.querySelector('#manifesto video')?.paused,
    label: [...document.querySelectorAll('#manifesto button')]
      .map((b) => b.textContent.trim())
      .find((t) => /movimento/.test(t)),
  }))

  // Trilho horizontal: deslocamento, tema escuro, botões e arraste.
  await scrollTo(page, await sceneY(page, 'projetos', 0))
  await settle(page, 1500)
  const trackX = () =>
    page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('#projetos ol')).transform).m41)
  r.trackStartX = Math.round(await trackX())
  r.themeInProjects = await page.evaluate(() => document.documentElement.dataset.theme)
  await scrollTo(page, await sceneY(page, 'projetos', 0.6))
  await settle(page, 1800)
  r.trackMidX = Math.round(await trackX())
  r.counter = await page.evaluate(() => document.querySelector('#projetos [aria-live]')?.textContent)
  await page.mouse.move(900, 450)
  await settle(page, 500)
  r.sealVisible = await page.evaluate(() => {
    const s = [...document.querySelectorAll('#projetos [aria-hidden="true"]')].find((n) => n.textContent === 'Arraste')
    return s ? Number(getComputedStyle(s).opacity) > 0.5 : false
  })
  await page.screenshot({ path: `${OUT}/projetos-arraste.png` })
  const beforeDrag = await page.evaluate(() => window.scrollY)
  await page.mouse.down()
  await page.mouse.move(500, 450, { steps: 8 })
  await page.mouse.up()
  await settle(page, 600)
  r.dragScrolled = Math.round((await page.evaluate(() => window.scrollY)) - beforeDrag)
  await page.getByRole('button', { name: 'Projeto anterior' }).click()
  await settle(page, 1800)
  r.counterAfterPrev = await page.evaluate(() => document.querySelector('#projetos [aria-live]')?.textContent)

  // Gaveta de portfólio.
  await scrollTo(page, await sceneY(page, 'projetos', 1))
  await settle(page, 1500)
  await page.getByRole('button', { name: /Pedir portfólio/ }).click()
  await settle(page, 400)
  r.drawerOpen = await page.evaluate(
    () => !!document.querySelector('dialog[open]') && document.documentElement.classList.contains('lenis-stopped'),
  )
  await page.getByRole('button', { name: /Receber o portfólio/ }).click()
  await settle(page, 300)
  r.drawerErrors = await page.evaluate(() => document.querySelectorAll('dialog[open] [role="alert"]').length)
  await page.screenshot({ path: `${OUT}/dialog-portfolio.png` })
  await page.fill('dialog[open] input[name="nome"]', 'Marina Teste')
  await page.fill('dialog[open] input[name="email"]', 'marina@exemplo.example')
  await page.selectOption('dialog[open] select[name="tipo"]', 'casa-nova')
  await page.getByRole('button', { name: /Receber o portfólio/ }).click()
  await settle(page, 1600)
  r.drawerSuccess = await page.evaluate(() => document.activeElement?.textContent)
  await page.keyboard.press('Escape')
  await settle(page, 300)
  r.drawerClosedFocus = await page.evaluate(() => document.activeElement?.textContent?.trim())

  // Cortina croqui ↔ obra: varredura pelo scroll, arraste e teclado.
  await page.evaluate(() => document.getElementById('croqui').scrollIntoView())
  await settle(page, 1800)
  const slider = page.getByRole('slider')
  r.curtainAfterScroll = Number(await slider.getAttribute('aria-valuenow'))
  const box = await page.evaluate(() => {
    const b = document.querySelector('#croqui [role="slider"]').parentElement.getBoundingClientRect()
    return { x: b.left, y: b.top, w: b.width, h: b.height }
  })
  await page.mouse.move(box.x + box.w * 0.5, box.y + box.h * 0.5)
  await page.mouse.down()
  await page.mouse.move(box.x + box.w * 0.8, box.y + box.h * 0.5, { steps: 6 })
  await page.mouse.up()
  r.curtainAfterDrag = Number(await slider.getAttribute('aria-valuenow'))
  await slider.focus()
  await page.keyboard.press('ArrowLeft')
  r.curtainAfterArrow = Number(await slider.getAttribute('aria-valuenow'))
  await page.keyboard.press('Home')
  r.curtainHome = Number(await slider.getAttribute('aria-valuenow'))
  await page.keyboard.press('PageUp')
  await page.keyboard.press('PageUp')
  await page.screenshot({ path: `${OUT}/croqui-40.png` })

  // Materiais: hover e foco trocam a foto e a legenda.
  await page.evaluate(() => document.getElementById('materiais').scrollIntoView())
  await settle(page, 1500)
  await page.getByRole('button', { name: /Cumaru/ }).hover()
  await settle(page, 900)
  r.materialHover = await page.evaluate(() => ({
    pressed: document.querySelector('#materiais [aria-pressed="true"]')?.textContent?.slice(0, 12),
    caption: document.querySelector('#materiais figcaption')?.textContent,
  }))
  await page.screenshot({ path: `${OUT}/materiais-cumaru.png` })
  await page.getByRole('button', { name: /Linho/ }).focus()
  await settle(page, 300)
  r.materialFocus = await page.evaluate(() => document.querySelector('#materiais figcaption')?.textContent)

  // Processo: etapa no centro fica opaca.
  await page.evaluate(() => document.querySelectorAll('#processo [data-step]')[2].scrollIntoView({ block: 'center' }))
  await settle(page, 1500)
  r.processOpacity = await page.evaluate(() =>
    [...document.querySelectorAll('#processo [data-step]')].map((s) => Number(getComputedStyle(s).opacity).toFixed(2)),
  )
  await page.screenshot({ path: `${OUT}/processo-foco.png` })

  // Âncora da navbar.
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Estúdio' }).click()
  await settle(page, 2400)
  r.anchorEstudio = await page.evaluate(() =>
    Math.round(document.getElementById('estudio').getBoundingClientRect().top),
  )

  // Acordeão.
  await page.evaluate(() => document.getElementById('perguntas').scrollIntoView())
  await settle(page, 800)
  const q2 = page.getByRole('button', { name: /reformar ou construir/ })
  await q2.click()
  await settle(page, 400)
  r.accordion = await q2.getAttribute('aria-expanded')

  // Contato: erros e sucesso; pílula flutuante some.
  await page.evaluate(() => document.getElementById('contato').scrollIntoView())
  await settle(page, 1200)
  r.floatingHiddenAtContact = await page.evaluate(
    () => getComputedStyle(document.querySelector('.floating-cta')).opacity === '0',
  )
  await page.getByRole('button', { name: 'Enviar', exact: true }).click()
  await settle(page, 300)
  r.formErrors = await page.evaluate(() => ({
    alerts: document.querySelectorAll('#contato [role="alert"]').length,
    focused: document.activeElement?.getAttribute('name'),
  }))
  await page.fill('#contato input[name="nome"]', 'Marina Teste')
  await page.fill('#contato input[name="email"]', 'marina@exemplo.example')
  await page.selectOption('#contato select[name="tipo"]', 'reforma')
  await page.fill('#contato textarea[name="mensagem"]', 'Reforma de casa de 450 m² no Jardim Europa, família de cinco.')
  await page.getByRole('button', { name: 'Enviar', exact: true }).click()
  await settle(page, 1700)
  r.formSuccess = await page.evaluate(() => document.activeElement?.textContent)
  await page.screenshot({ path: `${OUT}/contato-sucesso.png` })

  // Rodapé: créditos.
  await scrollTo(page, await page.evaluate(() => document.documentElement.scrollHeight))
  await settle(page, 800)
  await page.getByRole('button', { name: 'Créditos e Licenças' }).click()
  await settle(page, 300)
  r.credits = await page.evaluate(() => document.querySelectorAll('dialog[open] tbody tr').length)
  report.interactions.desktop = r
  await context.close()
}

// 4) Celular: menu e cortina por toque.
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'no-preference',
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  track(page, 'mobile')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await settle(page, 1800)
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await settle(page, 300)
  const opened = await page.evaluate(() => !!document.querySelector('#menu-movel[open]'))
  await page.screenshot({ path: `${OUT}/mobile-menu.png` })
  await page
    .getByRole('dialog', { name: 'Menu' })
    .getByRole('link', { name: /Processo/ })
    .click()
  await settle(page, 2400)
  const afterMenu = await page.evaluate(() => ({
    closed: !document.querySelector('#menu-movel[open]'),
    processoTop: Math.round(document.getElementById('processo').getBoundingClientRect().top),
  }))
  report.interactions.mobile = { opened, ...afterMenu }
  await context.close()
}

await browser.close()
await writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
