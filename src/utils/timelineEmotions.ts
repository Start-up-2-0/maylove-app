import { STORY_EMOTION_OPTIONS } from '@/modules/tribute-wizard/tributeWizardSteps'

const EMOTION_BY_ID = new Map(STORY_EMOTION_OPTIONS.map((option) => [option.id, option]))

export interface EmotionDisplay {
  icon: string
  label: string
}

export function getEmotionDisplay(emotionId?: string): EmotionDisplay | null {
  const id = emotionId?.trim()
  if (!id) return null
  const option = EMOTION_BY_ID.get(id as (typeof STORY_EMOTION_OPTIONS)[number]['id'])
  if (option) return { icon: option.icon, label: option.label }
  return { icon: '✨', label: id }
}
