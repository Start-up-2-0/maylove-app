import { describe, expect, it } from 'vitest'
import { LEGACY_ROMANCE_FIXTURES } from '@/mocks/romanceCompatibilityFixtures'
import { hydrateProposalCopy, resolveProposalCopy } from './proposalCopy'

describe('proposal compatibility', () => {
  it('keeps baseline fixtures for the five main romance experiences', () => {
    expect(LEGACY_ROMANCE_FIXTURES.map((fixture) => fixture.experienceId)).toEqual([
      'declaracao-amor',
      'pedido-namoro',
      'pedido-casamento',
      'carta-amor',
      'nossa-historia',
    ])
  })

  it('hydrates proposal drafts created before question and celebration existed', () => {
    const form = { question: '', celebration: '' }
    expect(hydrateProposalCopy(form, 'pedido-namoro')).toBe(true)
    expect(form.question).toBe('Quer namorar comigo?')
    expect(form.celebration).toContain('próximo capítulo')
  })

  it('never overwrites customized proposal copy', () => {
    const form = { question: 'Topa essa aventura?', celebration: 'Nossa história continua!' }
    expect(hydrateProposalCopy(form, 'pedido-casamento')).toBe(false)
    expect(form).toEqual({
      question: 'Topa essa aventura?',
      celebration: 'Nossa história continua!',
    })
  })

  it('provides read-only fallbacks to old published proposals', () => {
    expect(resolveProposalCopy('pedido-casamento', '', '').question)
      .toBe('Você aceita casar comigo?')
    expect(resolveProposalCopy(null, '', '').question)
      .toBe('Quer viver este próximo capítulo comigo?')
  })
})
