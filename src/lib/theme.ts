/**
 * Tema da página aplicado em <html data-theme>: claro (linho), "night" nos capítulos escuros
 * (Projetos e A luz na matéria) e "photo" enquanto a navegação está sobre a foto do hero.
 * Cada seção liga a própria chave; night tem prioridade sobre photo.
 */
const flags = { projects: false, light: false, photo: false }

export function setThemeFlag(key: keyof typeof flags, on: boolean) {
  if (flags[key] === on) return
  flags[key] = on
  const theme = flags.projects || flags.light ? 'night' : flags.photo ? 'photo' : 'light'
  document.documentElement.dataset.theme = theme
}
