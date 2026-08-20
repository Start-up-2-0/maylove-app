import { describe, expect, it } from 'vitest'
import { validateExperienceStep } from './useRomanceWizardValidation'

function proposalForm(question = '', celebration = '') {
  return { question, celebration } as never
}

describe('proposal step validation', () => {
  it('requires the main question', () => {
    expect(
      validateExperienceStep(
        'proposal',
        proposalForm('', 'Você disse sim!'),
        0,
        null,
        'pedido-namoro',
      ),
    ).toEqual({ valid: false, message: 'Escreva a pergunta especial antes de continuar.' })
  })

  it('requires the post-acceptance message', () => {
    expect(
      validateExperienceStep(
        'proposal',
        proposalForm('Quer namorar comigo?', '   '),
        0,
        null,
        'pedido-namoro',
      ),
    ).toEqual({ valid: false, message: 'Escreva a mensagem que aparece depois do aceite.' })
  })

  it('accepts a complete proposal', () => {
    expect(
      validateExperienceStep(
        'proposal',
        proposalForm('Você aceita casar comigo? 💍', 'Para sempre começa agora.'),
        0,
        null,
        'pedido-casamento',
      ),
    ).toEqual({ valid: true })
  })
})

describe('Our Story chapter validation', () => {
  it('rejects a started but incomplete chapter', () => {
    const form = { timeline: [{ title: 'Como nos conhecemos' }] } as never
    expect(validateExperienceStep('chapters', form, 0, null, 'nossa-historia')).toEqual({
      valid: false,
      message: 'Complete o capítulo 1 com título e texto ou foto.',
    })
  })

  it('accepts a complete chapter and optional photos step', () => {
    const form = {
      timeline: [{ title: 'Como nos conhecemos', description: 'Foi em um dia especial.' }],
    } as never
    expect(validateExperienceStep('chapters', form, 0, null, 'nossa-historia')).toEqual({ valid: true })
    expect(validateExperienceStep('photos', form, 0, null, 'nossa-historia')).toEqual({ valid: true })
  })
})

describe('optional video validation', () => {
  it('accepts an empty video and supported providers', () => {
    expect(validateExperienceStep('video', { video_url: '' } as never)).toEqual({ valid: true })
    expect(
      validateExperienceStep(
        'video',
        { video_url: 'https://www.youtube.com/watch?v=abcdefghijk' } as never,
      ),
    ).toEqual({ valid: true })
  })

  it('rejects unsupported or insecure links', () => {
    expect(
      validateExperienceStep('video', { video_url: 'http://example.com/video.mp4' } as never),
    ).toEqual({
      valid: false,
      message: 'Use uma URL HTTPS válida do YouTube, Vimeo ou de um arquivo MP4/WebM.',
    })
  })
})
