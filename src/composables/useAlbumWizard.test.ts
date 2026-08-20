import { describe, expect, it } from 'vitest'
import { mergeAlbumContentJson } from './useAlbumWizard'

describe('mergeAlbumContentJson', () => {
  it('preserva efeitos e configurações existentes ao atualizar a apresentação', () => {
    expect(
      mergeAlbumContentJson(
        {
          presentation: 'classic-photobook',
          effects: ['stars'],
          future_option: { enabled: true },
        },
        'memorial-luz',
      ),
    ).toEqual({
      presentation: 'memorial-luz',
      effects: ['stars'],
      future_option: { enabled: true },
    })
  })
})
