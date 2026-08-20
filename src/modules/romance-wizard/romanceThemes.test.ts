import { describe, expect, it } from 'vitest'
import { getRomanceExperience } from './romanceExperiences'
import {
  isThemeRecommendedForExperience,
  listRomanceThemes,
  listRomanceThemesForExperience,
} from './romanceThemes'

describe('romance theme catalog', () => {
  it('declares a base model, media requirements and recommendations for every theme', () => {
    for (const theme of listRomanceThemes()) {
      expect(theme.baseModelLabel.trim()).not.toBe('')
      expect(theme.mediaRequirements.length).toBeGreaterThan(0)
      expect(theme.recommendedExperienceIds.length).toBeGreaterThan(0)
    }
  })

  it.each([
    'declaracao-amor',
    'pedido-namoro',
    'pedido-casamento',
    'carta-amor',
    'nossa-historia',
  ] as const)('places the default theme first for %s', (experienceId) => {
    const experience = getRomanceExperience(experienceId)
    const themes = listRomanceThemesForExperience(experienceId, experience?.defaultThemeId)
    expect(themes[0].id).toBe(experience?.defaultThemeId)
    expect(isThemeRecommendedForExperience(themes[0], experienceId)).toBe(true)
  })

  it('keeps persisted ids while avoiding third-party brands in visible labels', () => {
    const themes = listRomanceThemes()
    expect(themes.find((theme) => theme.id === 'estilo-spotify')?.label).toBe('Player Musical')
    expect(themes.find((theme) => theme.id === 'disney')?.label).toBe('Conto Encantado')
  })
})
