/*
 * Conteúdo DEMONSTRATIVO. Marca, pessoas, obras, números e registros são fictícios.
 * Trocar ou remover antes de publicar (ver DESIGN.md › Conformidade).
 */
import type { Crop, MediaKey } from './media'

export const brand = {
  name: 'Moura',
  full: 'Moura Arquitetura e Interiores',
  descriptor: 'Arquitetura e Interiores',
  place: 'Jardim Europa, São Paulo',
  email: 'contato@mouraarquitetura.example',
}

export const chapters = [
  { id: 'manifesto', label: 'Manifesto' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'croqui', label: 'Do croqui ao espaço' },
  { id: 'materiais', label: 'Materiais' },
  { id: 'processo', label: 'Processo' },
  { id: 'estudio', label: 'Estúdio' },
] as const

export type ChapterId = (typeof chapters)[number]['id']

export const navLinks = [
  { id: 'projetos', label: 'Projetos' },
  { id: 'materiais', label: 'Materiais' },
  { id: 'processo', label: 'Processo' },
  { id: 'estudio', label: 'Estúdio' },
  { id: 'perguntas', label: 'Perguntas' },
] as const

export const hero = {
  eyebrow: 'Estúdio de arquitetura e interiores · Jardim Europa, São Paulo',
  title: 'Casas feitas de *luz*, matéria e tempo.',
  subtitle: 'Residências, apartamentos e interiores de alto padrão, do primeiro croqui à última peça no lugar.',
  ficha: ['Casa Jardim Europa', 'Sala de estar', '620 m²', '2024'],
}

export const manifesto = {
  statement: 'Uma casa boa não chama atenção para si. Ela organiza a *luz*, acolhe o tempo e deixa a vida acontecer.',
  paragraphs: [
    'Desenhamos poucas casas por ano, e cada uma começa do mesmo jeito: ouvindo como a família vive, onde o sol bate às sete da manhã e o que precisa caber na rotina de quem mora.',
    'O resultado são espaços silenciosos, com materiais naturais que envelhecem bem, marcenaria feita para durar e uma obra acompanhada de perto até a última peça no lugar.',
  ],
  caption: 'Casa Jardim Europa · fachada sul ao entardecer',
}

export const metrics = [
  { value: 15, suffix: '', unit: 'anos', label: 'de estúdio' },
  { value: 132, suffix: '+', unit: 'projetos', label: 'entregues' },
  { value: 85, suffix: ' mil', unit: 'm²', label: 'projetados' },
  { value: 6, suffix: '', unit: 'casas novas', label: 'por ano, no máximo' },
]

export type Project = {
  index: string
  name: string
  city: string
  area: string
  year: string
  scope: string
  media: MediaKey
  orientation: 'landscape' | 'portrait'
  note: string
}

export const projects: Project[] = [
  {
    index: '01',
    name: 'Casa Cidade Jardim',
    city: 'São Paulo, SP',
    area: '620 m²',
    year: '2024',
    scope: 'Arquitetura e interiores',
    media: 'hero',
    orientation: 'landscape',
    note: 'Sala inteira aberta para o espelho d’água, protegida pelo balanço de 4 m.',
  },
  {
    index: '02',
    name: 'Casa Baleia',
    city: 'São Sebastião, SP',
    area: '540 m²',
    year: '2023',
    scope: 'Arquitetura e interiores',
    media: 'pavilion',
    orientation: 'portrait',
    note: 'Concreto de fôrma de tábua e rasgos de luz contra a maresia.',
  },
  {
    index: '03',
    name: 'Apartamento Alto de Pinheiros',
    city: 'São Paulo, SP',
    area: '310 m²',
    year: '2023',
    scope: 'Interiores',
    media: 'interior',
    orientation: 'portrait',
    note: 'Forro de ripas de madeira que desenha a luz do zenital.',
  },
  {
    index: '04',
    name: 'Casa Pacaembu',
    city: 'São Paulo, SP',
    area: '480 m²',
    year: '2022',
    scope: 'Reforma e interiores',
    media: 'detail',
    orientation: 'landscape',
    note: 'Escada em balanço de concreto e madeira maciça, pensada como escultura.',
  },
  {
    index: '05',
    name: 'Casa Jardim América',
    city: 'São Paulo, SP',
    area: '690 m²',
    year: '2021',
    scope: 'Arquitetura e interiores',
    media: 'contact',
    orientation: 'landscape',
    note: 'Biblioteca com pé-direito duplo voltada para a cidade.',
  },
]

export const croqui = {
  title: 'Tudo começa num *traço* à mão.',
  intro:
    'Antes do 3D, o lápis. O croqui decide a implantação, o balanço e onde a luz entra. Arraste a cortina e compare o estudo de 2022 com a casa entregue em 2024.',
  before: 'Croqui · 2022',
  after: 'Entrega · 2024',
  specs: [
    { label: 'Pé-direito', value: '3,40 m' },
    { label: 'Caixilhos', value: 'De piso a teto' },
    { label: 'Piso', value: 'Travertino romano' },
    { label: 'Painel', value: 'Freijó' },
    { label: 'Estudo', value: '2022' },
    { label: 'Entrega', value: '2024' },
  ],
}

export type Material = {
  id: string
  index: string
  name: string
  use: string
  caption: string
  crop: Crop
  alt: string
}

export const materials: Material[] = [
  {
    id: 'travertino',
    index: '01',
    name: 'Travertino romano',
    use: 'Pisos e bancos · levigado, sem resina',
    caption: 'Travertino · varanda · Casa Jardim Europa',
    crop: { media: 'hero', x: 0.74, y: 0.66, zoom: 1.9 },
    alt: 'Deck de travertino da varanda iluminado ao entardecer, junto ao espelho d’água.',
  },
  {
    id: 'concreto',
    index: '02',
    name: 'Concreto aparente',
    use: 'Estrutura e paredes · fôrma de tábua',
    caption: 'Concreto · pátio · Casa Baleia',
    crop: { media: 'pavilion', x: 0.5, y: 0.5, zoom: 1.08 },
    alt: 'Paredes de concreto aparente com recortes de luz e sombra.',
  },
  {
    id: 'cumaru',
    index: '03',
    name: 'Cumaru',
    use: 'Brises e fachadas · óleo natural',
    caption: 'Cumaru · brises da fachada · Casa Jardim Europa',
    crop: { media: 'hero', x: 0.66, y: 0.27, zoom: 2.2 },
    alt: 'Brises verticais de madeira cumaru iluminados por dentro na fachada.',
  },
  {
    id: 'freijo',
    index: '04',
    name: 'Freijó',
    use: 'Forros, painéis e marcenaria',
    caption: 'Freijó · forro em ripas · Apto. Alto de Pinheiros',
    crop: { media: 'interior', x: 0.42, y: 0.22, zoom: 1.35 },
    alt: 'Forro de ripas de madeira clara cruzadas sob uma claraboia.',
  },
  {
    id: 'terracota',
    index: '05',
    name: 'Terracota',
    use: 'Vasos, pisos e revestimentos · argila queimada',
    caption: 'Terracota · vaso no estúdio · Jardim Europa',
    crop: { media: 'editorial', x: 0.73, y: 0.42, zoom: 2.4 },
    alt: 'Vaso de cerâmica com costela-de-adão junto à janela do estúdio.',
  },
  {
    id: 'linho',
    index: '06',
    name: 'Linho',
    use: 'Cortinas, estofados e roupa de casa',
    caption: 'Linho · sofá da sala · Casa Jardim Europa',
    crop: { media: 'hero', x: 0.69, y: 0.6, zoom: 2.6 },
    alt: 'Sofá claro em linho na sala envidraçada, sob luz quente.',
  },
]

export const lightSteps = [
  {
    index: '01',
    title: 'Chegada pelo jardim',
    body: 'O percurso começa na borda do espelho d’água, com a casa inteira à vista e o céu ainda claro.',
  },
  {
    index: '02',
    title: 'O balanço emoldura a sala',
    body: 'A laje de 4 m avança sobre a varanda e transforma a fachada envidraçada num quadro.',
  },
  {
    index: '03',
    title: 'Brises filtram o poente',
    body: 'As réguas de cumaru deixam passar a luz do fim de tarde em faixas, sem ofuscar.',
  },
  {
    index: '04',
    title: 'A casa acesa ao anoitecer',
    body: 'Luz quente indireta, rebatida no forro e no travertino. Nenhuma lâmpada à vista.',
  },
]

export const processSteps = [
  {
    index: '01',
    title: 'Escuta',
    time: '2 a 3 semanas',
    output: 'Programa de necessidades, levantamento',
    body: 'Conversas com a família, visita ao terreno ou apartamento e um programa escrito com o que a casa precisa resolver.',
  },
  {
    index: '02',
    title: 'Estudo preliminar',
    time: '4 a 6 semanas',
    output: 'Croquis, maquete de estudo',
    body: 'Implantação, volumes e luz. Duas ou três alternativas discutidas sobre croquis e uma maquete física.',
  },
  {
    index: '03',
    title: 'Anteprojeto',
    time: '4 a 6 semanas',
    output: 'Plantas, 3D, paleta',
    body: 'A alternativa escolhida ganha medidas, imagens 3D e a primeira paleta de materiais com amostras reais.',
  },
  {
    index: '04',
    title: 'Executivo e interiores',
    time: '8 a 12 semanas',
    output: 'Projeto executivo, marcenaria',
    body: 'Detalhamento para obra, compatibilização com engenharia e todos os desenhos de marcenaria e iluminação.',
  },
  {
    index: '05',
    title: 'Acompanhamento de obra',
    time: 'Durante a obra',
    output: 'Relatórios de visita',
    body: 'Visitas semanais, aprovação de amostras e um relatório escrito depois de cada visita.',
  },
  {
    index: '06',
    title: 'Entrega e styling',
    time: '1 a 2 semanas',
    output: 'Casa pronta',
    body: 'Montagem, objetos, livros, plantas e roupa de casa. A família entra com a casa pronta para morar.',
  },
]

export const studio = {
  title: 'Cecília Moura, arquiteta e sócia *fundadora*.',
  quote: 'Só começo a desenhar uma casa depois de entender como a família acorda.',
  bio: [
    'Formada pela FAU-USP, Cecília trabalhou dez anos em escritórios de São Paulo e Lisboa antes de abrir o estúdio no Jardim Europa, em 2010.',
    'Conduz pessoalmente todos os projetos, da primeira conversa à entrega das chaves. É a mesma pessoa que atende a família e a construtora.',
  ],
  credentials: [
    { label: 'Formação', value: 'FAU-USP' },
    { label: 'Registro', value: 'CAU/SP · demonstrativo' },
    { label: 'Estúdio', value: 'Desde 2010' },
  ],
  caption: 'Cecília Moura no estúdio · Jardim Europa',
  team: [
    { name: 'Helena Prado', role: 'Coordenadora de interiores', media: 'team02' as MediaKey },
    { name: 'Rafael Antunes', role: 'Coordenador de obras', media: 'team03' as MediaKey },
  ],
  teamNote: 'Equipe de 9 pessoas: arquitetas, designers de interiores e um coordenador de obras.',
}

export const faqs = [
  {
    q: 'Existe uma metragem mínima para começar um projeto?',
    a: 'Para arquitetura de casas, trabalhamos a partir de 300 m² construídos. Para interiores de apartamentos, a partir de 150 m². Abaixo disso, indicamos colegas de confiança.',
  },
  {
    q: 'Vale mais a pena reformar ou construir do zero?',
    a: 'Depende da estrutura existente, do terreno e do prazo. Fazemos uma visita técnica e um estudo comparativo de custo e prazo antes de você decidir.',
  },
  {
    q: 'Vocês trabalham com construtoras específicas?',
    a: 'Indicamos duas ou três construtoras com quem já entregamos obras semelhantes e participamos da concorrência. A contratação é sempre direta entre você e a construtora.',
  },
  {
    q: 'Como são calculados os honorários?',
    a: 'Por etapa, a partir da metragem e da complexidade. A proposta detalhada sai depois da primeira conversa e da visita ao local, sem custo.',
  },
  {
    q: 'Quanto tempo leva do primeiro croqui à casa pronta?',
    a: 'O projeto leva de 5 a 8 meses. A obra, de 12 a 24 meses para casas novas e de 6 a 10 meses para reformas e interiores.',
  },
  {
    q: 'Atendem fora de São Paulo?',
    a: 'Sim, no litoral norte e no interior do estado, com visitas de obra quinzenais. Fora de São Paulo, avaliamos caso a caso.',
  },
]

export const projectTypes = [
  { value: 'casa-nova', label: 'Casa nova' },
  { value: 'reforma', label: 'Reforma de casa' },
  { value: 'interiores', label: 'Interiores de apartamento' },
  { value: 'indefinido', label: 'Ainda não sei' },
] as const

export type ProjectType = (typeof projectTypes)[number]['value']
