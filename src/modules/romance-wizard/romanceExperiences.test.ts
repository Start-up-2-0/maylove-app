import { describe, expect, it } from 'vitest'
import { getExperienceSteps, getRomanceExperience } from './romanceExperiences'
import {
  nextExperienceStep,
  previousExperienceStep,
  resolveExperienceStep,
} from './romanceExperienceFlow'

describe('romance experience steps', () => {
  it('includes the editable proposal before media in dating proposal', () => {
    expect(getExperienceSteps('pedido-namoro')).toEqual([
      'recipient',
      'message',
      'proposal',
      'photos',
      'music',
      'theme',
      'preview',
    ])
  })

  it('keeps video after the proposal in marriage proposal', () => {
    const steps = getExperienceSteps('pedido-casamento')
    expect(steps.indexOf('proposal')).toBeLessThan(steps.indexOf('video'))
    expect(nextExperienceStep('message', 'pedido-casamento')).toBe('proposal')
    expect(previousExperienceStep('photos', 'pedido-casamento')).toBe('proposal')
  })

  it('rejects a proposal route for experiences that do not support it', () => {
    expect(resolveExperienceStep('proposal', 'declaracao-amor')).toBe('recipient')
  })

  it('declares requirements before starting every catalog experience', () => {
    for (const id of [
      'declaracao-amor',
      'pedido-namoro',
      'pedido-casamento',
      'mapa-casal',
      'buque-digital',
      'carta-amor',
      'nossa-historia',
      'playlist-casal',
    ] as const) {
      expect(getRomanceExperience(id)?.requirements?.length).toBeGreaterThan(0)
    }
  })

  it('offers optional photo upload before chapters in Our Story', () => {
    const experience = getRomanceExperience('nossa-historia')
    expect(experience?.steps).toEqual(['recipient', 'photos', 'chapters', 'theme', 'preview'])
    expect(experience?.photosOptional).toBe(true)
  })

  it('does not imply physical delivery for the digital bouquet', () => {
    const experience = getRomanceExperience('buque-digital')
    expect(experience?.description.toLocaleLowerCase('pt-BR')).toContain('digital')
    expect(experience?.description.toLocaleLowerCase('pt-BR')).not.toContain('físic')
  })
})
