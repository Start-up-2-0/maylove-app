import { describe, expect, it } from 'vitest'
import { resolveSpecialDateCounterState } from './specialDate'

describe('special date counter state', () => {
  const now = new Date('2026-08-20T12:00:00Z').getTime()

  it('counts down to a future date', () => {
    const target = new Date('2026-08-21T12:00:00Z').getTime()
    expect(resolveSpecialDateCounterState(target, 'countdown', now)).toEqual({
      effectiveMode: 'countdown',
      diffMs: 86_400_000,
      completedCountdown: false,
    })
  })

  it('switches an expired countdown to elapsed time', () => {
    const target = new Date('2026-08-19T12:00:00Z').getTime()
    expect(resolveSpecialDateCounterState(target, 'countdown', now)).toEqual({
      effectiveMode: 'since',
      diffMs: 86_400_000,
      completedCountdown: true,
    })
  })

  it('keeps elapsed mode for past events', () => {
    const target = new Date('2026-08-18T12:00:00Z').getTime()
    expect(resolveSpecialDateCounterState(target, 'since', now).diffMs).toBe(172_800_000)
  })
})
