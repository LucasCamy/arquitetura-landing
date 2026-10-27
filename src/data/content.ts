/*
 * Conteúdo DEMONSTRATIVO. Marca, nomes, números, registros CAU e obras são fictícios.
 * Trocar ou remover tudo antes de publicar (ver DESIGN.md › Conformidade).
 */
import type { MediaKey } from './media'

export const brand = {
  name: 'Atelier Vértice',
  tagline: 'Arquitetura, Urbanismo e Materialidade',
  city: 'São Paulo',
  scope: 'Residências autorais, edifícios boutique e pavilhões culturais',
  email: 'contato@ateliervertice.example',
  coordinates: '23°33′S · 46°41′W',
}

export const chapters = [
  { id: 'inicio', label: 'Abertura' },
  { id: 'estudio', label: 'Estúdio' },
  { id: 'obras', label: 'Obras' },
  { id: 'travessia', label: 'Travessia' },
  { id: 'metodo', label: 'Método' },
  { id: 'socios', label: 'Sócios' },
  { id: 'duvidas', label: 'Dúvidas' },
  { id: 'contato', label: 'Contato' },
] as const

export type ChapterId = (typeof chapters)[number]['id']

export const navLinks: { id: ChapterId; label: string }[] = [
  { id: 'estudio', label: 'Estúdio' },
  { id: 'obras', label: 'Obras' },
  { id: 'travessia', label: 'Travessia' },
  { id: 'metodo', label: 'Método' },
  { id: 'socios', label: 'Sócios' },
  { id: 'duvidas', label: 'Dúvidas' },
]

export type PillarKind = 'topografia' | 'estrutura' | 'materia' | 'luz'

export const pillars: {
  kind: PillarKind
  index: string
  title: string
  summary: string
  measure: string
  detailTitle: string
  detail: string
  specs: { label: string; value: string }[]
}[] = [
  {
    kind: 'topografia',
    index: '01',
    title: 'Topografia',
    summary: 'O terreno decide a primeira linha. Cortamos pouco e assentamos a casa nas curvas existentes.',
    measure: 'Δ 4,80 m',
    detailTitle: 'Implantação em platôs',
    detail:
      'Levantamento planialtimétrico antes de qualquer croqui. Os níveis da casa seguem as curvas de 1 m do terreno, com no máximo dois platôs e contenções incorporadas à estrutura, não escondidas.',
    specs: [
      { label: 'Desnível típico', value: '2,00 a 6,00 m' },
      { label: 'Platôs', value: 'até 2' },
      { label: 'Movimento de terra', value: 'compensado no lote' },
    ],
  },
  {
    kind: 'estrutura',
    index: '02',
    title: 'Estrutura',
    summary:
      'Concreto aparente que trabalha e aparece. Vãos livres e balanços desenhados com o calculista desde o estudo.',
    measure: 'vão 12,00 m',
    detailTitle: 'Pórtico e balanço',
    detail:
      'Lajes nervuradas e vigas de borda permitem vãos de até 12 m sem pilares intermediários. Os balanços de até 4 m são verificados com o engenheiro estrutural já no estudo preliminar.',
    specs: [
      { label: 'Vão livre', value: 'até 12,00 m' },
      { label: 'Balanço', value: 'até 4,00 m' },
      { label: 'Sistema', value: 'concreto armado e protendido' },
    ],
  },
  {
    kind: 'materia',
    index: '03',
    title: 'Matéria',
    summary:
      'Poucos materiais, honestos e duráveis: concreto de forma de tábua, madeira certificada, pedra local e vidro.',
    measure: '4 materiais',
    detailTitle: 'Camadas de uma parede',
    detail:
      'Concreto com forma de tábua de pinus, isolamento térmico interno, brise de madeira certificada (FSC) e esquadria de alumínio com vidro laminado. Cada camada tem função e é especificada com o fornecedor.',
    specs: [
      { label: 'Concreto', value: 'forma de tábua, 25 cm' },
      { label: 'Madeira', value: 'cumaru certificado' },
      { label: 'Vidro', value: 'laminado 10 mm' },
    ],
  },
  {
    kind: 'luz',
    index: '04',
    title: 'Luz',
    summary:
      'A fachada filtra o sol do poente e abre para o norte. A luz do dia guia a planta antes da iluminação artificial.',
    measure: '23,5° S',
    detailTitle: 'Controle de insolação',
    detail:
      'Estudo de carta solar para a latitude de São Paulo (23,5° S). Brises verticais a oeste, beirais calculados ao norte para bloquear o sol de verão e admitir o de inverno.',
    specs: [
      { label: 'Beiral norte', value: '1,20 m' },
      { label: 'Brise oeste', value: 'lâminas a 15 cm' },
      { label: 'Autonomia de luz', value: '≥ 70% das horas de uso' },
    ],
  },
]

export const metrics = [
  { value: 16, suffix: '+', unit: 'anos', label: 'Anos de estúdio', context: 'desde 2010, em São Paulo' },
  { value: 42000, suffix: '', unit: 'm²', label: 'Metros quadrados projetados', context: 'entre 2010 e 2026' },
  { value: 14, suffix: '', unit: 'pessoas', label: 'Arquitetos na equipe', context: 'em 2026' },
  { value: 8, suffix: '', unit: 'prêmios', label: 'Prêmios e menções', context: 'nacionais, 2014 a 2025' },
]

export type WorkCategory = 'residencial' | 'urbano'

export type SectionProfile = {
  terrain: string
  mass: string
  neighbors?: string
  voids?: string
  /** Traços sem preenchimento (escadas, eixos). */
  details?: string
  levels: { y: number; label: string }[]
  sun: { x1: number; y1: number; x2: number; y2: number; label: string }
}

export type Work = {
  id: string
  index: string
  title: string
  category: WorkCategory
  summary: string
  ficha: {
    area: string
    estrutura: string
    insolacao: string
    materialidade: string
    prazo: string
  }
  profile: SectionProfile
}

export const workFilters: { id: 'todas' | WorkCategory; label: string }[] = [
  { id: 'todas', label: 'Todas as Frentes' },
  { id: 'residencial', label: 'Residencial Autoral' },
  { id: 'urbano', label: 'Urbano e Cultural' },
]

export const works: Work[] = [
  {
    id: 'campo-litoral',
    index: '01',
    title: 'Residências no Campo e Litoral',
    category: 'residencial',
    summary: 'Casas térreas e em balanço sobre terrenos amplos, com varandas profundas e ventilação cruzada.',
    ficha: {
      area: '320 a 650 m²',
      estrutura: 'Concreto armado com balanço de até 4 m',
      insolacao: 'Varandas ao norte, brises a oeste',
      materialidade: 'Concreto de tábua, cumaru, pedra local',
      prazo: '10 a 14 meses de projeto',
    },
    profile: {
      terrain: 'M0 236 L230 236 L600 198',
      mass: 'M90 236 V170 H330 V236 Z M250 170 V118 H520 V140 H330 V170 Z',
      levels: [
        { y: 236, label: '+0.00m' },
        { y: 170, label: '+3.30m' },
        { y: 118, label: '+5.90m' },
      ],
      sun: { x1: 560, y1: 30, x2: 400, y2: 140, label: 'sol de inverno 43°' },
    },
  },
  {
    id: 'casas-urbanas',
    index: '02',
    title: 'Casas Urbanas',
    category: 'residencial',
    summary: 'Lotes estreitos entre empenas: pátios internos levam luz e silêncio para o centro da casa.',
    ficha: {
      area: '220 a 420 m²',
      estrutura: 'Concreto armado e laje nervurada',
      insolacao: 'Pátio central, aberturas zenitais',
      materialidade: 'Concreto, tijolo aparente, freijó',
      prazo: '9 a 12 meses de projeto',
    },
    profile: {
      terrain: 'M0 236 H600',
      neighbors: 'M30 236 V120 H160 V236 Z M440 236 V96 H570 V236 Z',
      mass: 'M170 236 V100 H430 V236 Z',
      voids: 'M255 236 V170 H345 V236 Z M255 100 V130 H345 V100 Z',
      levels: [
        { y: 236, label: '+0.00m' },
        { y: 170, label: '+3.20m' },
        { y: 100, label: '+6.60m' },
      ],
      sun: { x1: 300, y1: 20, x2: 300, y2: 128, label: 'zenital 90°' },
    },
  },
  {
    id: 'edificios-boutique',
    index: '03',
    title: 'Edifícios Boutique',
    category: 'urbano',
    summary: 'Edifícios de 6 a 12 pavimentos com poucas unidades por andar, térreo aberto à calçada e fachada ativa.',
    ficha: {
      area: '2.400 a 7.800 m²',
      estrutura: 'Concreto protendido, pilares no perímetro',
      insolacao: 'Brises móveis a oeste, varandas ao norte',
      materialidade: 'Concreto aparente, vidro laminado, aço corten',
      prazo: '14 a 20 meses de projeto',
    },
    profile: {
      terrain: 'M0 236 H600',
      neighbors: 'M40 236 V150 H180 V236 Z',
      mass: 'M220 236 V40 H400 V236 Z M200 236 V266 H420 V236 Z',
      voids: 'M240 236 V206 H380 V236 Z',
      levels: [
        { y: 266, label: '-3.00m' },
        { y: 236, label: '+0.00m' },
        { y: 138, label: '+12.00m' },
        { y: 40, label: '+24.00m' },
      ],
      sun: { x1: 560, y1: 30, x2: 410, y2: 120, label: 'poente oeste 35°' },
    },
  },
  {
    id: 'pavilhoes-culturais',
    index: '04',
    title: 'Pavilhões Culturais',
    category: 'urbano',
    summary: 'Grandes coberturas sobre poucos apoios: espaços abertos para exposições, feiras e encontros.',
    ficha: {
      area: '600 a 3.000 m²',
      estrutura: 'Laje protendida sobre 4 a 6 apoios',
      insolacao: 'Cobertura com rasgos zenitais orientados',
      materialidade: 'Concreto, piso de granilite, vidro',
      prazo: '8 a 12 meses de projeto',
    },
    profile: {
      terrain: 'M0 236 H600',
      mass: 'M50 96 H550 V118 H50 Z M110 118 H126 V236 H110 Z M474 118 H490 V236 H474 Z',
      voids: 'M250 96 H290 V118 H250 Z M330 96 H370 V118 H330 Z',
      levels: [
        { y: 236, label: '+0.00m' },
        { y: 118, label: '+7.20m' },
        { y: 96, label: '+8.10m' },
      ],
      sun: { x1: 300, y1: 20, x2: 310, y2: 200, label: 'rasgo zenital' },
    },
  },
  {
    id: 'interiores',
    index: '05',
    title: 'Interiores Arquitetônicos',
    category: 'residencial',
    summary: 'Marcenaria, iluminação e mobiliário desenhados junto com a estrutura, não depois dela.',
    ficha: {
      area: '90 a 400 m²',
      estrutura: 'Intervenção em estrutura existente',
      insolacao: 'Luz natural rebatida, iluminação em camadas',
      materialidade: 'Madeira maciça, linho, pedra, latão escovado',
      prazo: '4 a 8 meses de projeto',
    },
    profile: {
      terrain: 'M0 236 H600',
      mass: 'M80 236 V60 H90 V226 H510 V60 H520 V236 Z M80 60 H520 V70 H80 Z M90 150 H300 V160 H90 Z',
      details: 'M300 226 L300 220 L320 220 L320 200 L340 200 L340 180 L360 180 L360 160 L380 160',
      levels: [
        { y: 236, label: '+0.00m' },
        { y: 160, label: '+3.00m' },
        { y: 70, label: '+6.20m' },
      ],
      sun: { x1: 560, y1: 40, x2: 430, y2: 200, label: 'luz rebatida' },
    },
  },
  {
    id: 'masterplan',
    index: '06',
    title: 'Masterplan e Implantação',
    category: 'urbano',
    summary: 'Planos de ocupação para glebas e condomínios: eixos, gabaritos e espaços livres antes dos edifícios.',
    ficha: {
      area: '2 a 40 hectares',
      estrutura: 'Diretrizes de gabarito e ocupação',
      insolacao: 'Afastamentos por sombreamento',
      materialidade: 'Paisagismo nativo, pavimentos drenantes',
      prazo: '6 a 10 meses de plano',
    },
    profile: {
      terrain: 'M0 250 C120 240 200 210 300 214 C420 218 480 236 600 226',
      mass: 'M60 236 V190 H130 V236 Z M160 222 V150 H220 V222 Z M330 214 V120 H380 V214 Z M420 224 V170 H500 V224 Z',
      levels: [
        { y: 250, label: '+0.00m' },
        { y: 190, label: '+9.00m' },
        { y: 120, label: '+28.00m' },
      ],
      sun: { x1: 580, y1: 30, x2: 390, y2: 120, label: 'sombra de inverno' },
    },
  },
]

/** Grade xadrez: cada imagem acompanha duas frentes. */
export const workRows: { media: MediaKey; caption: string; works: string[] }[] = [
  { media: 'pavilion', caption: 'Prancha A · luz rasante em concreto', works: ['campo-litoral', 'casas-urbanas'] },
  { media: 'detail', caption: 'Prancha B · escada em balanço', works: ['edificios-boutique', 'pavilhoes-culturais'] },
  { media: 'interior', caption: 'Prancha C · cobertura em madeira', works: ['interiores', 'masterplan'] },
]

export const traverseSteps = [
  {
    index: '01',
    title: 'Implantação e Eixo',
    body: 'Antes da forma, a direção: o eixo de chegada organiza o percurso do acesso até o último cômodo.',
    still: 'hero' as MediaKey,
  },
  {
    index: '02',
    title: 'Estrutura em Balanço',
    body: 'O pavimento superior avança sem apoio aparente. O balanço protege a varanda e emoldura a vista.',
    still: 'detail' as MediaKey,
  },
  {
    index: '03',
    title: 'Controle de Insolação',
    body: 'A luz entra filtrada pelos brises, em pontos medidos. Sombra também é material de projeto.',
    still: 'pavilion' as MediaKey,
  },
  {
    index: '04',
    title: 'Permanência e Habitar',
    body: 'O percurso termina num lugar para ficar: pé-direito, luz quente e silêncio.',
    still: 'interior' as MediaKey,
  },
]

export const methodSteps = [
  {
    index: '01',
    title: 'Estudo Preliminar',
    duration: '4 a 6 semanas',
    body: 'Visita ao terreno, programa de necessidades, levantamento e estudo de massa com maquete física.',
    deliverables: ['Levantamento planialtimétrico', 'Estudo de massa e insolação', 'Maquete de estudo 1:200'],
  },
  {
    index: '02',
    title: 'Anteprojeto e Legal',
    duration: '6 a 10 semanas',
    body: 'Plantas, cortes e fachadas definidos, compatíveis com o código de obras e aprovados na prefeitura.',
    deliverables: ['Anteprojeto completo', 'Projeto legal e protocolo', 'Estimativa de custo por m²'],
  },
  {
    index: '03',
    title: 'Projeto Executivo e Compatibilização',
    duration: '12 a 20 semanas',
    body: 'Detalhamento construtivo e compatibilização com estrutura, instalações, luminotécnica e paisagismo.',
    deliverables: ['Executivo em BIM', 'Compatibilização de disciplinas', 'Caderno de especificações'],
  },
  {
    index: '04',
    title: 'Direção Artística de Obra',
    duration: 'durante a obra',
    body: 'Visitas quinzenais, aprovação de amostras e protótipos, ajustes de detalhe com a construtora.',
    deliverables: ['Visitas quinzenais', 'Aprovação de amostras', 'Relatório de conformidade'],
  },
]

export type Partner = {
  id: string
  name: string
  role: string
  specialty: string
  cau: string
  media: MediaKey
  bio: string
  education: string[]
  works: { name: string; year: string; place: string }[]
}

export const partners: Partner[] = [
  {
    id: 'clara',
    name: 'Arq. Clara Vértice',
    role: 'Sócia fundadora',
    specialty: 'Residências em terrenos de topografia difícil',
    cau: 'CAU A000001-0',
    media: 'team01',
    bio: 'Conduz o estudo preliminar de todas as residências do estúdio e acompanha a implantação no terreno até a primeira concretagem.',
    education: ['Arquitetura e Urbanismo, FAU (demonstrativo)', 'Mestrado em Tecnologia da Construção (demonstrativo)'],
    works: [
      { name: 'Casa Platô', year: '2023', place: 'Serra da Cantareira, SP' },
      { name: 'Casa Duna', year: '2021', place: 'Litoral Norte, SP' },
      { name: 'Casa Vale', year: '2019', place: 'Itu, SP' },
    ],
  },
  {
    id: 'beatriz',
    name: 'Arq. Beatriz Leme',
    role: 'Sócia',
    specialty: 'Edifícios boutique e projeto legal',
    cau: 'CAU A000002-0',
    media: 'team02',
    bio: 'Responsável por anteprojeto, aprovação legal e compatibilização. Coordena calculistas, instaladores e consultores de fachada.',
    education: ['Arquitetura e Urbanismo (demonstrativo)', 'Especialização em Gestão de Projetos BIM (demonstrativo)'],
    works: [
      { name: 'Edifício Alameda 12', year: '2025', place: 'Jardins, São Paulo' },
      { name: 'Edifício Fradique', year: '2022', place: 'Pinheiros, São Paulo' },
      { name: 'Edifício Mourato', year: '2020', place: 'Vila Madalena, São Paulo' },
    ],
  },
  {
    id: 'gabriel',
    name: 'Arq. Gabriel Rocha',
    role: 'Sócio',
    specialty: 'Pavilhões culturais e direção de obra',
    cau: 'CAU A000003-0',
    media: 'team03',
    bio: 'Lidera os projetos urbanos e culturais e a direção artística de obra: amostras, protótipos e decisões de detalhe no canteiro.',
    education: ['Arquitetura e Urbanismo (demonstrativo)', 'Mestrado em Projeto Urbano (demonstrativo)'],
    works: [
      { name: 'Pavilhão das Águas', year: '2024', place: 'Parque urbano, São Paulo' },
      { name: 'Galeria Cota 760', year: '2022', place: 'Centro, São Paulo' },
      { name: 'Masterplan Campo Alto', year: '2018', place: 'Interior de SP' },
    ],
  },
]

export const faqs = [
  {
    q: 'Quanto tempo leva um projeto residencial completo?',
    a: 'Do estudo preliminar ao executivo, entre 9 e 14 meses para residências de 220 a 650 m². A aprovação na prefeitura corre em paralelo e depende do município.',
  },
  {
    q: 'Vocês indicam ou trabalham com construtoras específicas?',
    a: 'Indicamos de duas a três construtoras com quem já executamos obras semelhantes e participamos da concorrência técnica. A contratação é sempre direta entre o cliente e a construtora.',
  },
  {
    q: 'Como funciona o acompanhamento de obra?',
    a: 'A direção artística de obra prevê visitas quinzenais, aprovação de amostras e protótipos e um relatório de conformidade a cada visita. Não substitui a responsabilidade técnica da construtora.',
  },
  {
    q: 'Meu terreno tem aclive ou declive acentuado. É um problema?',
    a: 'Costuma ser uma vantagem. Desníveis de 2 a 6 m permitem platôs, garagens semienterradas e vistas que um terreno plano não oferece. O levantamento planialtimétrico é o primeiro passo.',
  },
  {
    q: 'Ainda não tenho terreno. Vocês ajudam na escolha?',
    a: 'Sim. Fazemos um estudo de viabilidade de até três terrenos: legislação, insolação, topografia e potencial construtivo, antes da compra.',
  },
  {
    q: 'Como são calculados os honorários?',
    a: 'Por etapa, a partir da área estimada e da complexidade. A proposta detalhada é enviada depois da primeira conversa e da visita ao terreno.',
  },
]

export const briefingScopes = [
  ...works.map((w) => ({ value: w.id, label: w.title })),
  { value: 'indefinido', label: 'Ainda não sei' },
]

export const terrainOptions = [
  { value: 'plano', label: 'Plano' },
  { value: 'aclive', label: 'Aclive' },
  { value: 'declive', label: 'Declive' },
  { value: 'sem-terreno', label: 'Ainda não tenho' },
]

export const meetingOptions = [
  { value: 'presencial', label: 'No ateliê, em Pinheiros' },
  { value: 'video', label: 'Por vídeo' },
] as const

export type MeetingFormat = (typeof meetingOptions)[number]['value']
