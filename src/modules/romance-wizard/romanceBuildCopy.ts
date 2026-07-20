import type { RomanceExperienceStepId } from '@/modules/romance-wizard/romanceExperiences'
import type { RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'

/** Tagline inspirada no Love Cards — https://www.lovecards.com.br/page-creator */
export const ROMANCE_LOVE_CARDS_TAGLINE = 'Guarde cada memória especial'
export const ROMANCE_COACH_NAME = 'May'

/** Labels conversacionais — o usuário não vê jargão técnico. */
export const ROMANCE_BUILD_STEP_LABELS: Record<RomanceExperienceStepId, string> = {
  recipient: 'Quem ama quem',
  photos: 'Suas fotos',
  message: 'Sua mensagem',
  music: 'Trilha sonora',
  'special-date': 'Data especial',
  video: 'Seu vídeo',
  chapters: 'Capítulos da história',
  effects: 'Toque especial',
  preview: 'Pronto para emocionar',
}

export const ROMANCE_BUILD_HEADLINE = 'Montamos para você'
export const ROMANCE_BUILD_SUBLINE =
  'Como no Love Cards — responda com calma. Layout, animações e efeitos ficam por nossa conta.'

export const ROMANCE_PICKER_PROMPT =
  'Oi! Sou a May. Que presente digital você quer criar hoje? Escolha uma experiência e eu monto o resto.'

export function buildProgressLabel(current: number, total: number): string {
  if (current >= total) return 'Último passo — quase lá!'
  return `Montando seu presente · ${current} de ${total}`
}

const DEFAULT_STEP_PROMPTS: Record<RomanceExperienceStepId, string> = {
  recipient: 'Me conta: quem são os apaixonados? Você também escolhe o título da página.',
  photos: 'Agora as fotos — escolha as imagens que emocionam de verdade.',
  message: 'Escreva do coração. Este é o texto principal do presente.',
  music: 'Qual trilha embala esse momento? Ela entra automaticamente na experiência.',
  'special-date': 'Tem uma data que marca vocês? Pode incluir ou pular este passo.',
  video: 'Quer adicionar um vídeo especial? Fica lindo na abertura.',
  chapters: 'Conte a história em capítulos — data, título, texto e foto de cada marco.',
  effects: 'Já deixei o visual pronto. Quer adicionar mais animações?',
  preview: 'Última olhada — veja como ficou e publique quando estiver pronto.',
}

const EXPERIENCE_STEP_PROMPTS: Partial<
  Record<RomanceExperienceId, Partial<Record<RomanceExperienceStepId, string>>>
> = {
  'pedido-namoro': {
    message: 'Escreva a carta que prepara o convite — depois vem a pergunta especial.',
    'special-date': 'Qual é a data que marca o início de vocês? Ela aparece na experiência.',
  },
  'pedido-casamento': {
    message: 'Descreva a jornada de vocês até este momento — em seguida, a grande pergunta.',
    video: 'Um vídeo de vocês deixa o pedido ainda mais inesquecível.',
    'special-date': 'Marque a data especial — pode ser contagem regressiva ou tempo juntos.',
  },
  'carta-amor': {
    photos: 'Quer uma foto de capa? Opcional — a carta funciona linda só com palavras.',
    message: 'Escreva a carta como se fosse só para ela(e) ler.',
  },
  'nossa-historia': {
    chapters: 'Adicione os capítulos da história de vocês — montamos a linha do tempo.',
  },
}

export function getCoachPrompt(
  step: RomanceExperienceStepId,
  experienceId?: RomanceExperienceId | null,
): string {
  if (experienceId && EXPERIENCE_STEP_PROMPTS[experienceId]?.[step]) {
    return EXPERIENCE_STEP_PROMPTS[experienceId]![step]!
  }
  return DEFAULT_STEP_PROMPTS[step]
}

export function getCoachStepTitle(
  step: RomanceExperienceStepId,
  experienceLabel?: string,
): string {
  if (step === 'preview') return 'Publicar presente'
  return experienceLabel || ROMANCE_BUILD_STEP_LABELS[step]
}
