import { describe, expect, it } from 'vitest'
import { timelineItemHasContent, timelineItemIsComplete } from './timeline'

describe('timeline chapter completeness', () => {
  it('distinguishes a started chapter from a complete chapter', () => {
    const chapter = { title: 'Nosso primeiro encontro' }
    expect(timelineItemHasContent(chapter)).toBe(true)
    expect(timelineItemIsComplete(chapter)).toBe(false)
  })

  it('accepts title with text', () => {
    expect(
      timelineItemIsComplete({ title: 'Primeiro encontro', description: 'Um dia inesquecível.' }),
    ).toBe(true)
  })

  it('accepts title with photo and optional text', () => {
    expect(timelineItemIsComplete({ title: 'Nossa viagem', photo_media_id: 'photo-id' })).toBe(true)
  })

  it('rejects media without a title', () => {
    expect(timelineItemIsComplete({ photo_url: 'https://example.com/photo.jpg' })).toBe(false)
  })
})
