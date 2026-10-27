// Validação em navegador: overflow, âncoras, console, cenas, interações e reduced motion.
// Uso: npm run build && npm run preview (em outro terminal) && npm run validate:browser
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const BASE = process.env.BASE_URL ?? 'http://localhost:4317'
const OUT = '.validation'
const WIDTHS = [375, 390, 768, 1024, 1280, 1440, 1920, 2560]
const SCENES = ['inicio', 'estudio', 'obras', 'travessia', 'metodo', 'socios', 'duvidas', 'contato']
const PINNED = new Set(['inicio', 'travessia', 'metodo'])

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

function track(page, label) {
  page.on('pageerror', (err) => report.errors.push(`${label} pageerror: ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      report.errors.push(`${label} console.${msg.type()}: ${msg.text()}`)
  })
}

async function settle(page, ms = 1600) {
  await page.waitForTimeout(ms)
}

async function sceneY(page, id, fraction) {
  return page.evaluate(
    ({ id, fraction }) => {
      const el = document.getElementById(id)
      if (!el) return 0
      const top = el.getBoundingClientRect().top + window.scrollY
      const spacer = el.querySelector('.pin-spacer')
      const extra = spacer ? spacer.getBoundingClientRect().height - window.innerHeight : 0
      return Math.max(0, top - (spacer ? 0 : 64) + Math.max(0, extra) * fraction)
    },
    { id, fraction },
  )
}

async function scrollAll(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += 600) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y)
    await page.waitForTimeout(40)
  }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await settle(page, 800)
}

// 1) Overflow e âncoras em todas as larguras (movimento permitido), no topo e após percorrer a página.
for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  track(page, `w${width}`)
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await settle(page, 2600)
  const top = await page.evaluate(overflowScript)
  const h1 = await page.evaluate(() => {
    const h = document.querySelector('h1')
    if (!h) return null
    const lines = [...h.querySelectorAll('[data-hero-line]')].map((l) => Math.round(l.getBoundingClientRect().height))
    const lh = parseFloat(getComputedStyle(h).lineHeight)
    return {
      height: Math.round(h.getBoundingClientRect().height),
      lineHeight: lh,
      lines: Math.round(h.getBoundingClientRect().height / lh),
    }
  })
  const wrappedButtons = await page.evaluate(() =>
    [...document.querySelectorAll('.btn')]
      .filter((b) => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().height > 56)
      .map((b) => b.textContent.trim()),
  )
  await scrollAll(page)
  const bottom = await page.evaluate(overflowScript)
  await page.screenshot({ path: `${OUT}/hero-${width}.png` })
  report.widths.push({ width, top, bottom, h1, wrappedButtons })
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
  await settle(page, 2600)
  const state = await page.evaluate(() => ({
    lenis: document.documentElement.classList.contains('lenis'),
    forced: document.documentElement.classList.contains('motion-forced'),
    pins: document.querySelectorAll('.pin-spacer').length,
    canvas: !!document.querySelector('#travessia canvas'),
    staticGrid: document.querySelectorAll('#travessia ol img').length,
    methodHorizontal: !!document.querySelector('[data-method-fill]'),
  }))
  const shots = []
  for (const id of SCENES) {
    const fractions = PINNED.has(id) ? [0, 0.5, 0.95] : [0]
    for (const f of fractions) {
      const y = await sceneY(page, id, f)
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y)
      await settle(page, 1500)
      const file = `${OUT}/${mode.name}-${id}${fractions.length > 1 ? `-${Math.round(f * 100)}` : ''}.png`
      await page.screenshot({ path: file })
      shots.push(file)
    }
  }
  // Canvas: algum quadro desenhado (pixel não totalmente transparente).
  let canvasDrawn = null
  if (state.canvas) {
    const y = await sceneY(page, 'travessia', 0.5)
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y)
    await settle(page, 1500)
    canvasDrawn = await page.evaluate(() => {
      const c = document.querySelector('#travessia canvas')
      const ctx = c.getContext('2d')
      const d = ctx.getImageData(c.width / 2, c.height / 2, 1, 1).data
      const res = performance.getEntriesByType('resource').map((r) => r.name)
      return {
        w: c.width,
        h: c.height,
        alpha: d[3],
        avif: res.filter((n) => n.includes('/frames-v2/') && n.endsWith('.avif')).length,
        webp: res.filter((n) => n.includes('/frames-v2/') && n.endsWith('.webp')).length,
        ambient: res.filter((n) => n.includes('hero-ambient')).map((n) => n.split('/').pop()),
      }
    })
  }
  const overflow = await page.evaluate(overflowScript)
  report.modes.push({ mode: mode.name, state, canvasDrawn, overflow, shots: shots.length })
  await context.close()
}

// 3) Interações (desktop com movimento).
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  track(page, 'interactions')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await settle(page, 2400)
  const r = {}

  // Âncora da navbar com Lenis: seção para logo abaixo do menu.
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Sócios' }).click()
  await settle(page, 2200)
  r.anchorSocios = await page.evaluate(() => Math.round(document.getElementById('socios').getBoundingClientRect().top))
  r.navCurrent = await page.evaluate(
    () => document.querySelector('nav[aria-label="Principal"] [aria-current]')?.textContent,
  )

  // Pilar abre diálogo e pausa o Lenis.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await settle(page, 800)
  await page
    .getByRole('button', { name: /Estrutura/ })
    .first()
    .click()
  await settle(page, 400)
  r.pillarDialog = await page.evaluate(() => ({
    open: !!document.querySelector('dialog[open]'),
    lenisStopped: document.documentElement.classList.contains('lenis-stopped'),
    title: document.querySelector('dialog[open] h2')?.textContent,
  }))
  const before = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, 900)
  await settle(page, 600)
  r.scrollLockedWhileDialog = (await page.evaluate(() => window.scrollY)) === before
  await page.screenshot({ path: `${OUT}/dialog-pilar.png` })
  await page.keyboard.press('Escape')
  await settle(page, 400)
  r.pillarFocusReturned = await page.evaluate(() => document.activeElement?.textContent?.includes('Estrutura'))
  r.lenisResumed = await page.evaluate(() => !document.documentElement.classList.contains('lenis-stopped'))

  // Filtro de obras.
  await page.evaluate(() => document.getElementById('obras').scrollIntoView())
  await settle(page, 600)
  await page.getByRole('button', { name: 'Urbano e Cultural' }).click()
  await settle(page, 400)
  r.filterUrbano = await page.evaluate(() => ({
    pressed: document.querySelector('[aria-pressed="true"]')?.textContent,
    status: [...document.querySelectorAll('#obras [aria-live]')].map((n) => n.textContent).join(),
    cards: document.querySelectorAll('#obras [data-row] li').length,
  }))
  await page.getByRole('button', { name: 'Todas as Frentes' }).click()
  await settle(page, 400)

  // Prancha técnica → iniciar estudo leva a tipologia ao formulário.
  await page.getByRole('button', { name: /Explorar Edifícios Boutique/ }).click()
  await settle(page, 400)
  r.prancha = await page.evaluate(() => ({
    title: document.querySelector('dialog[open] h2')?.textContent,
    svg: !!document.querySelector('dialog[open] svg[role="img"]'),
  }))
  await page.screenshot({ path: `${OUT}/dialog-prancha.png` })
  await page.getByRole('button', { name: 'Iniciar estudo nesta tipologia' }).click()
  await settle(page, 2600)
  r.briefingPreset = await page.evaluate(() => ({
    scope: document.querySelector('#contato select')?.value,
    contactTop: Math.round(document.getElementById('contato').getBoundingClientRect().top),
    focused: document.activeElement?.getAttribute('name'),
  }))

  // Formulário: erros, depois sucesso.
  await page.getByRole('button', { name: 'Enviar briefing' }).click()
  await settle(page, 300)
  r.formErrors = await page.evaluate(() => ({
    alerts: document.querySelectorAll('#contato [role="alert"]').length,
    invalid: document.querySelectorAll('#contato [aria-invalid="true"]').length,
    focused: document.activeElement?.getAttribute('name'),
  }))
  await page.fill('input[name="nome"]', 'Marina Teste')
  await page.fill('input[name="email"]', 'marina@exemplo.example')
  await page.getByText('Aclive', { exact: true }).click()
  await page.fill('textarea[name="mensagem"]', 'Casa de 320 m² em terreno com aclive na Cantareira.')
  await page.getByRole('button', { name: 'Enviar briefing' }).click()
  await settle(page, 300)
  r.formSending = await page.evaluate(() => document.querySelector('#contato button[type="submit"]')?.textContent)
  await settle(page, 1600)
  r.formSuccess = await page.evaluate(() => ({
    heading: document.activeElement?.textContent,
    status: !!document.querySelector('#contato [role="status"]'),
  }))
  await page.screenshot({ path: `${OUT}/form-success.png` })

  // Acordeão FAQ.
  await page.evaluate(() => document.getElementById('duvidas').scrollIntoView())
  await settle(page, 600)
  const q2 = page.getByRole('button', { name: /Vocês indicam/ })
  await q2.click()
  await settle(page, 400)
  r.accordion = await q2.getAttribute('aria-expanded')

  // Sócio: modal de trajetória.
  await page.getByRole('button', { name: /Trajetória de Arq. Beatriz Leme/ }).click()
  await settle(page, 400)
  r.partnerModal = await page.evaluate(() => ({
    title: document.querySelector('dialog[open] h2')?.textContent,
    notice: document.querySelector('dialog[open] figcaption')?.textContent?.includes('ilustrativa'),
  }))
  await page.keyboard.press('Escape')

  // Travessia: próxima etapa avança a legenda.
  const y = await sceneY(page, 'travessia', 0.05)
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y)
  await settle(page, 1500)
  await page.getByRole('button', { name: 'Próxima etapa' }).click()
  await settle(page, 2400)
  r.traverseStep = await page.evaluate(() => document.querySelector('#travessia [aria-current="step"]')?.textContent)

  // Rodapé: minuta legal e créditos.
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await settle(page, 800)
  await page.getByRole('button', { name: 'Créditos e Licenças' }).click()
  await settle(page, 300)
  r.credits = await page.evaluate(() => document.querySelectorAll('dialog[open] tbody tr').length)
  await page.keyboard.press('Escape')
  report.interactions.desktop = r
  await context.close()
}

// 4) Menu móvel.
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'no-preference',
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  track(page, 'mobile-menu')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await settle(page, 2000)
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await settle(page, 300)
  const opened = await page.evaluate(() => !!document.querySelector('#menu-movel[open]'))
  await page.screenshot({ path: `${OUT}/mobile-menu.png` })
  await page
    .getByRole('dialog', { name: 'Menu' })
    .getByRole('link', { name: /Método/ })
    .click()
  await settle(page, 2400)
  const result = await page.evaluate(() => ({
    closed: !document.querySelector('#menu-movel[open]'),
    metodoTop: Math.round(document.getElementById('metodo').getBoundingClientRect().top),
  }))
  report.interactions.mobileMenu = { opened, ...result }
  await context.close()
}

await browser.close()
await writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
