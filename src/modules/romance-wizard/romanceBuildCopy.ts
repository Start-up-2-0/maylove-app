import type { RomanceExperienceStepId } from '@/modules/romance-wizard/romanceExperiences'

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
  'Responda algumas perguntas — layout, animações e efeitos ficam por nossa conta.'

export function buildProgressLabel(current: number, total: number): string {
  if (current >= total) return 'Último passo — quase lá!'
  return `Montando seu presente · ${current} de ${total}`
}
