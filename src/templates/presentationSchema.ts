import { WIZARD_STEP_LABELS, type WizardStep } from '@/api/types'
import { getPresentation, listPresentations as listPresentationStyles } from './presentations'
import type { ExperienceLayout, TemplateDefinition } from './types'
import { EXPERIENCE_LAYOUT_LABELS } from './types'

/**
 * Configuração da apresentação (o "schema" que dirige o wizard).
 *
 * Cada estilo de apresentação tem uma estrutura própria: passos, campos
 * obrigatórios/opcionais e limites diferentes. Em vez de espalhar condicionais
 * por vários componentes, centralizamos aqui uma configuração declarativa que o
 * frontend interpreta para montar dinamicamente os steps e os campos.
 *
 * Este módulo representa o contrato que, futuramente, pode ser servido pelo
 * backend (`GET /tributes/:id/wizard-schema`): a forma dos dados é serializável
 * e não depende de nenhuma regra fixa por apresentação no restante do frontend.
 * Para adicionar uma nova apresentação basta descrever a configuração dela aqui.
 */

/** Passo do wizard já rotulado, pronto para o stepper. */
export interface WizardStepConfig {
  id: WizardStep
  label: string
}

/** Campos e textos do passo "Textos e identidade", por experiência. */
export interface TextFieldSchema {
  contextHint: string
  titleLabel: string
  titlePlaceholder: string
  showSubtitle: boolean
  subtitleLabel: string
  subtitlePlaceholder: string
  subtitleHint: string
  /** Campos de pergunta/comemoração (só o Pedido Interativo usa). */
  showProposal: boolean
  messageSectionTitle: string
  messageSectionHint: string
  messageLabel: string
  messagePlaceholder: string
  closingLabel: string
  closingPlaceholder: string
  closingHint: string
  showDate: boolean
  dateLabel: string
  dateHint: string
}

/** Como o passo de fotos se comporta em cada experiência. */
export interface PhotoFieldSchema {
  guidance: string
  /** Mínimo recomendado; 0 = fotos opcionais nesta experiência. */
  minPhotos: number
}

/** Configuração completa que o wizard interpreta. */
export interface PresentationSchema {
  layout: ExperienceLayout
  presentationId: string | null
  presentationLabel: string
  presentationEmoji: string
  config: { music: boolean; minimal: boolean; dramatic: boolean }
  steps: WizardStepConfig[]
  limits: { minPhotos: number; maxPhotos: number | null }
  /** Campos obrigatórios para publicar (nomes lógicos: title, message...). */
  required: string[]
  text: TextFieldSchema
  photos: PhotoFieldSchema
}

/**
 * Entrada do catálogo de apresentações servido pelo backend
 * (`GET /api/v1/presentations`). O frontend hidrata esta lista uma vez e a usa
 * como fonte de `config`/`limits`/`required`. A composição dos passos continua
 * determinística (layout + config + template), garantindo paridade com o PHP.
 */
export interface PresentationCatalogEntry {
  id: string
  label: string
  emoji: string
  description: string
  layout: ExperienceLayout
  highlights: string[]
  config: { music: boolean; minimal: boolean; dramatic: boolean }
  steps: WizardStepConfig[]
  limits: { minPhotos: number; maxPhotos: number | null }
  required: string[]
}

const TEXT_SCHEMA: Record<ExperienceLayout, TextFieldSchema> = {
  letter: {
    contextHint: 'uma carta minimalista, focada na mensagem.',
    titleLabel: 'Título da carta',
    titlePlaceholder: 'Ex.: Para o meu amor',
    showSubtitle: true,
    subtitleLabel: 'Abertura (opcional)',
    subtitlePlaceholder: 'Ex.: Uma carta especial',
    subtitleHint: 'Pequeno texto que aparece acima do título.',
    showProposal: false,
    messageSectionTitle: 'A carta',
    messageSectionHint: 'O corpo da carta — capriche, ele é o coração desta experiência.',
    messageLabel: 'Corpo da carta',
    messagePlaceholder: 'Querida(o)...',
    closingLabel: 'Despedida',
    closingPlaceholder: 'Com amor,',
    closingHint: 'Fecha a carta, logo antes da assinatura.',
    showDate: false,
    dateLabel: 'Data especial',
    dateHint: '',
  },
  envelope: {
    contextHint: 'um envelope que abre e revela a carta com digitação.',
    titleLabel: 'Título da carta',
    titlePlaceholder: 'Ex.: Uma carta para você',
    showSubtitle: true,
    subtitleLabel: 'Texto do envelope',
    subtitlePlaceholder: 'Ex.: Você recebeu uma mensagem',
    subtitleHint: 'Aparece sobre o envelope fechado, antes de abrir.',
    showProposal: false,
    messageSectionTitle: 'Abertura (opcional)',
    messageSectionHint:
      'Texto inicial antes dos trechos. Os parágrafos entre as fotos são definidos na etapa Momentos.',
    messageLabel: 'Texto de abertura',
    messagePlaceholder: 'Opcional — deixe em branco se a carta começar direto nos trechos.',
    closingLabel: 'Despedida',
    closingPlaceholder: 'Com amor,',
    closingHint: 'Aparece ao final, após todos os trechos.',
    showDate: false,
    dateLabel: 'Data especial',
    dateHint: '',
  },
  cinematic: {
    contextHint: 'fotos em tela cheia, como um trailer.',
    titleLabel: 'Título de abertura',
    titlePlaceholder: 'Ex.: Nossa história',
    showSubtitle: true,
    subtitleLabel: 'Frase de abertura',
    subtitlePlaceholder: 'Uma frase de impacto para a abertura',
    subtitleHint: 'Aparece sobre a primeira foto, como a legenda de um trailer.',
    showProposal: false,
    messageSectionTitle: 'Legendas',
    messageSectionHint:
      'A legenda de abertura da experiência. As legendas de cada foto vêm da etapa de Fotos.',
    messageLabel: 'Legenda de abertura',
    messagePlaceholder: 'Escreva a legenda inicial...',
    closingLabel: 'Legenda final',
    closingPlaceholder: 'A frase que encerra a apresentação',
    closingHint: 'Aparece sobre a última foto.',
    showDate: false,
    dateLabel: 'Data especial',
    dateHint: '',
  },
  storytelling: {
    contextHint: 'uma narrativa em capítulos, explorada passo a passo.',
    titleLabel: 'Título da história',
    titlePlaceholder: 'Ex.: A nossa jornada',
    showSubtitle: true,
    subtitleLabel: 'Introdução',
    subtitlePlaceholder: 'Como a história começa...',
    subtitleHint: 'Texto do primeiro capítulo, sobre a foto de abertura.',
    showProposal: false,
    messageSectionTitle: 'Narrativa',
    messageSectionHint:
      'Texto de abertura da narrativa. Os capítulos seguintes vêm dos momentos/fotos.',
    messageLabel: 'Texto de abertura',
    messagePlaceholder: 'Comece a contar a história...',
    closingLabel: 'Capítulo final',
    closingPlaceholder: 'A frase que encerra a história',
    closingHint: 'Vira o título do último capítulo, o desfecho da história.',
    showDate: false,
    dateLabel: 'Data especial',
    dateHint: '',
  },
  timeline: {
    contextHint: 'uma linha do tempo com os marcos da trajetória.',
    titleLabel: 'Título da linha do tempo',
    titlePlaceholder: 'Ex.: Nossa trajetória',
    showSubtitle: true,
    subtitleLabel: 'Introdução',
    subtitlePlaceholder: 'Uma introdução curta',
    subtitleHint: 'Aparece no topo, antes da linha do tempo.',
    showProposal: false,
    messageSectionTitle: 'Mensagem',
    messageSectionHint:
      'Mensagem de abertura (usada se não houver momentos). As datas e marcos vêm da etapa de Momentos.',
    messageLabel: 'Mensagem principal',
    messagePlaceholder: 'Escreva uma introdução...',
    closingLabel: 'Mensagem de encerramento',
    closingPlaceholder: 'Uma despedida especial',
    closingHint: 'Aparece ao final da linha do tempo.',
    showDate: false,
    dateLabel: 'Data especial',
    dateHint: '',
  },
  album: {
    contextHint: 'um álbum de fotos que se folheia página a página.',
    titleLabel: 'Título do álbum',
    titlePlaceholder: 'Ex.: Nossas memórias',
    showSubtitle: true,
    subtitleLabel: 'Subtítulo da capa',
    subtitlePlaceholder: 'Uma frase para a capa',
    subtitleHint: 'Aparece na capa do álbum.',
    showProposal: false,
    messageSectionTitle: 'Mensagem',
    messageSectionHint:
      'Mensagem da primeira página (usada se não houver mensagens por foto). As páginas vêm dos momentos/fotos.',
    messageLabel: 'Mensagem principal',
    messagePlaceholder: 'Escreva a mensagem de abertura...',
    closingLabel: 'Mensagem da contracapa',
    closingPlaceholder: 'Uma despedida especial',
    closingHint: 'Aparece na contracapa, ao fim do álbum.',
    showDate: false,
    dateLabel: 'Data especial',
    dateHint: '',
  },
  proposal: {
    contextHint: 'uma história em etapas que termina numa grande pergunta.',
    titleLabel: 'Título',
    titlePlaceholder: 'Ex.: Nossa história',
    showSubtitle: true,
    subtitleLabel: 'Frase de abertura',
    subtitlePlaceholder: 'Como a história começa',
    subtitleHint: 'Texto do primeiro passo, antes de chegar à pergunta.',
    showProposal: true,
    messageSectionTitle: 'Mensagem',
    messageSectionHint: 'Passo inicial da história (usado se não houver momentos cadastrados).',
    messageLabel: 'Mensagem de abertura',
    messagePlaceholder: 'Escreva o começo da história...',
    closingLabel: 'Mensagem final',
    closingPlaceholder: 'O que aparece depois do aceite',
    closingHint: 'Aparece após o aceite, antes da assinatura.',
    showDate: false,
    dateLabel: 'Data especial',
    dateHint: '',
  },
  scroll: {
    contextHint: 'seções empilhadas, exploradas pela rolagem.',
    titleLabel: 'Título',
    titlePlaceholder: 'Ex.: Feliz Aniversário',
    showSubtitle: true,
    subtitleLabel: 'Subtítulo',
    subtitlePlaceholder: 'Uma frase carinhosa',
    subtitleHint: 'Uma frase curta de apoio ao título.',
    showProposal: false,
    messageSectionTitle: 'Mensagem',
    messageSectionHint: 'A mensagem principal e o encerramento da homenagem.',
    messageLabel: 'Mensagem principal',
    messagePlaceholder: 'Escreva sua mensagem...',
    closingLabel: 'Mensagem de encerramento',
    closingPlaceholder: 'Uma despedida especial',
    closingHint: 'Exibida no bloco final da experiência.',
    showDate: true,
    dateLabel: 'Data especial',
    dateHint: 'Usada na contagem regressiva e nos destaques de data.',
  },
}

const PHOTO_SCHEMA: Record<ExperienceLayout, PhotoFieldSchema> = {
  scroll: {
    guidance: 'As fotos aparecem na galeria e nos blocos de fotos ao longo da rolagem.',
    minPhotos: 1,
  },
  letter: {
    guidance: 'Nesta carta as fotos são opcionais. Poucas (até 3) mantêm o clima intimista.',
    minPhotos: 0,
  },
  envelope: {
    guidance: 'Envie as fotos na etapa Fotos e associe cada uma a um trecho na etapa Momentos.',
    minPhotos: 0,
  },
  cinematic: {
    guidance:
      'As fotos são o centro: aparecem uma a uma em tela cheia. Capriche na seleção e na ordem.',
    minPhotos: 3,
  },
  album: {
    guidance: 'Cada foto vira uma página do álbum. A ordem define a sequência da folheada.',
    minPhotos: 2,
  },
  storytelling: {
    guidance: 'Cada foto acompanha um capítulo da narrativa, em tela cheia.',
    minPhotos: 2,
  },
  timeline: {
    guidance: 'As fotos acompanham os marcos da linha do tempo, na ordem enviada.',
    minPhotos: 1,
  },
  proposal: {
    guidance: 'As fotos ilustram os passos da história até a grande pergunta.',
    minPhotos: 1,
  },
}

/** Layouts narrativos/foto-centrados editam conteúdo por "Momentos". */
const MOMENT_LAYOUTS: ExperienceLayout[] = [
  'envelope',
  'timeline',
  'album',
  'storytelling',
  'cinematic',
  'proposal',
]

/** Categorias em que faz sentido pedir data/local/mapa do evento. */
const EVENT_CATEGORIES = ['casamento', 'pedido-casamento', 'formatura', 'cha-de-bebe']

/** Layouts que aproveitam um vídeo (abertura/fundo). */
const VIDEO_LAYOUTS: ExperienceLayout[] = ['scroll', 'cinematic', 'storytelling']

/** Mínimo de fotos recomendado por layout (0 = totalmente opcional). */
const MIN_PHOTOS: Record<ExperienceLayout, number> = {
  scroll: 1,
  letter: 0,
  envelope: 0,
  cinematic: 3,
  album: 2,
  storytelling: 2,
  timeline: 1,
  proposal: 1,
}

function buildStepConfig(id: WizardStep): WizardStepConfig {
  return { id, label: WIZARD_STEP_LABELS[id] }
}

/**
 * Catálogo de apresentações servido pelo backend, hidratado uma vez no início do
 * fluxo. Enquanto não carregado, o resolver usa os defaults locais
 * (`presentations.ts`), garantindo funcionamento offline/mockado.
 */
let backendCatalog: Record<string, PresentationCatalogEntry> | null = null

export function setPresentationCatalog(entries: PresentationCatalogEntry[]): void {
  backendCatalog = Object.fromEntries(entries.map((entry) => [entry.id, entry]))
}

export function getPresentationCatalog(): PresentationCatalogEntry[] | null {
  return backendCatalog ? Object.values(backendCatalog) : null
}

/**
 * Interpreta a apresentação escolhida + o template e devolve o schema que o
 * wizard usa para montar os passos, campos e validações. A composição dos
 * passos é determinística (layout + config + capacidades do template); quando o
 * catálogo do backend está carregado, ele fornece `config`/`limits`/`required`.
 */
export function resolvePresentationSchema(
  presentationId: string | null | undefined,
  definition: TemplateDefinition | null | undefined,
): PresentationSchema {
  const entry = presentationId ? backendCatalog?.[presentationId] : undefined
  const presentation = getPresentation(presentationId)
  const layout: ExperienceLayout =
    entry?.layout ?? presentation?.layout ?? definition?.layout ?? 'scroll'

  const config = entry?.config ?? {
    music: presentation ? presentation.config?.music !== false : true,
    minimal: presentation ? presentation.config?.minimal === true : layout === 'letter',
    dramatic: presentation ? presentation.config?.dramatic === true : false,
  }

  const usesMoments = MOMENT_LAYOUTS.includes(layout)
  const supportsVideo = definition?.capabilities?.supportsVideo === true
  const isEvent = definition ? EVENT_CATEGORIES.includes(definition.category) : false

  const steps: WizardStep[] = ['presentation', 'style', 'texts', 'photos']
  if (usesMoments) steps.push('moments')
  if (supportsVideo && VIDEO_LAYOUTS.includes(layout)) steps.push('video')
  if (config.music) steps.push('music')
  if (isEvent) steps.push('event')
  if (!config.minimal) steps.push('effects')
  steps.push('preview', 'publish')

  const minPhotos = entry?.limits.minPhotos ?? MIN_PHOTOS[layout] ?? 1
  const maxPhotos = entry?.limits.maxPhotos ?? definition?.capabilities?.maxPhotos ?? null

  return {
    layout,
    presentationId: entry?.id ?? presentation?.id ?? null,
    presentationLabel:
      entry?.label ?? presentation?.label ?? `${EXPERIENCE_LAYOUT_LABELS[layout]} (padrão do modelo)`,
    presentationEmoji: entry?.emoji ?? presentation?.emoji ?? '✨',
    config,
    steps: steps.map(buildStepConfig),
    limits: { minPhotos, maxPhotos },
    required: entry?.required ?? (usesMoments ? ['title'] : ['title', 'message']),
    text: TEXT_SCHEMA[layout] ?? TEXT_SCHEMA.scroll,
    photos: PHOTO_SCHEMA[layout] ?? PHOTO_SCHEMA.scroll,
  }
}

/** Passos base (sem os dependentes de template: vídeo/evento). Espelha o PHP. */
function catalogSteps(
  layout: ExperienceLayout,
  config: { music: boolean; minimal: boolean },
): WizardStepConfig[] {
  const ids: WizardStep[] = ['presentation', 'style', 'texts', 'photos']
  if (MOMENT_LAYOUTS.includes(layout)) ids.push('moments')
  if (config.music) ids.push('music')
  if (!config.minimal) ids.push('effects')
  ids.push('preview', 'publish')
  return ids.map(buildStepConfig)
}

/**
 * Monta o catálogo de apresentações no mesmo formato do backend
 * (`GET /api/v1/presentations`). Usado pelo mock para garantir paridade com o
 * PHP a partir de uma única fonte de dados (`presentations.ts`).
 */
export function buildPresentationCatalog(): PresentationCatalogEntry[] {
  return listPresentationStyles().map((p) => {
    const config = {
      music: p.config?.music !== false,
      minimal: p.config?.minimal === true,
      dramatic: p.config?.dramatic === true,
    }
    const usesMoments = MOMENT_LAYOUTS.includes(p.layout)
    return {
      id: p.id,
      label: p.label,
      emoji: p.emoji,
      description: p.description,
      layout: p.layout,
      highlights: p.highlights,
      config,
      steps: catalogSteps(p.layout, config),
      limits: { minPhotos: MIN_PHOTOS[p.layout] ?? 1, maxPhotos: null },
      required: usesMoments ? ['title'] : ['title', 'message'],
    }
  })
}
