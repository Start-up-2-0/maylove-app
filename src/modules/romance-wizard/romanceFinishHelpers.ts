import type { TributeDetail } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { getRomanceExperience, type RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'
import { isLegacyGenericTitle } from '@/modules/romance-wizard/romanceCopy'

export function buildRomanceFinishSummary(
  form: ReturnType<typeof useTributeWizard>['form'],
  experienceId?: RomanceExperienceId | null,
  photoCount = 0,
): string[] {
  const experience = getRomanceExperience(experienceId)
  const items: string[] = []

  if (experience) {
    items.push(`${experience.icon} ${experience.label}`)
  }
  if (form.title?.trim() && !isLegacyGenericTitle(form.title)) {
    items.push(`"${form.title.trim()}"`)
  }
  if (form.honoree_name?.trim()) {
    items.push(`Para ${form.honoree_name.trim()}`)
  }
  if (photoCount > 0) {
    items.push(`${photoCount} foto${photoCount === 1 ? '' : 's'}`)
  }
  if (form.message?.replace(/<[^>]*>/g, '').trim()) {
    items.push('Carta escrita')
  }
  if (form.music_source !== 'none') {
    items.push('Trilha sonora')
  }
  if (form.effects.length) {
    items.push(`${form.effects.length} efeito${form.effects.length === 1 ? '' : 's'}`)
  }
  if (form.special_date_config.enabled && form.special_date_config.date) {
    items.push('Data especial')
  }
  if (form.video_url?.trim()) {
    items.push('Vídeo')
  }
  const chapters = form.timeline.filter((item) => item.title?.trim() || item.description?.trim())
  if (chapters.length) {
    items.push(`${chapters.length} capítulo${chapters.length === 1 ? '' : 's'}`)
  }

  return items
}

export function romanceHasMusicConfigured(
  form: ReturnType<typeof useTributeWizard>['form'],
  tribute?: TributeDetail | null,
): boolean {
  if (tribute) return tributeHasMusicConfigured(tribute)
  if (form.music_source === 'none') return false
  if (form.music_source === 'library') return Boolean(form.music_track_id)
  if (form.music_source === 'upload') return form.music_duration_seconds > 0
  return false
}

export function tributeHasMusicConfigured(tribute: TributeDetail): boolean {
  if (tribute.music_source === 'none') return false
  if (tribute.music_source === 'library') return Boolean(tribute.music_track_id)
  if (tribute.music_source === 'upload') return Boolean(tribute.music_media_id)
  return false
}
