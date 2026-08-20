import { describe, expect, it } from 'vitest'
import { isSupportedVideoUrl, resolveSupportedVideoEmbed } from './videoUrl'

describe('supported video URLs', () => {
  it.each([
    ['https://www.youtube.com/watch?v=abcdefghijk', 'youtube'],
    ['https://youtu.be/abcdefghijk', 'youtube'],
    ['https://www.youtube.com/shorts/abcdefghijk', 'youtube'],
    ['https://vimeo.com/123456789', 'vimeo'],
    ['https://cdn.example.com/video.mp4', 'direct'],
  ])('accepts %s', (url, provider) => {
    expect(resolveSupportedVideoEmbed(url)?.provider).toBe(provider)
  })

  it.each([
    'http://www.youtube.com/watch?v=abcdefghijk',
    'https://www.youtube.com/channel/example',
    'javascript:alert(1)',
    'https://example.com/page',
    'not a url',
  ])('rejects unsupported URL %s', (url) => {
    expect(isSupportedVideoUrl(url)).toBe(false)
  })
})
