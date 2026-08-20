import { nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAutosave } from './useAutosave'

afterEach(() => {
  vi.useRealTimers()
})

describe('useAutosave', () => {
  it('mantém alterações feitas durante uma gravação como pendentes', async () => {
    vi.useFakeTimers()
    const source = ref({ title: 'Inicial' })
    const resolvers: Array<() => void> = []
    const save = vi.fn(
      (_payload: { title: string }) => new Promise<void>((resolve) => resolvers.push(resolve)),
    )
    const autosave = useAutosave(source, save, 10)

    source.value.title = 'Primeira alteração'
    await nextTick()
    await vi.advanceTimersByTimeAsync(10)
    expect(save).toHaveBeenCalledTimes(1)

    source.value.title = 'Alteração durante a gravação'
    await nextTick()
    const flushPromise = autosave.flush()
    resolvers.shift()?.()
    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(2))
    expect(save.mock.calls[1]?.[0]).toEqual({ title: 'Alteração durante a gravação' })
    resolvers.shift()?.()

    await expect(flushPromise).resolves.toBe(true)
  })

  it('bloqueia o flush após erro e permite tentar novamente', async () => {
    const source = ref({ title: 'Inicial' })
    const save = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(undefined)
    const autosave = useAutosave(source, save, 10)

    source.value.title = 'Novo título'
    await nextTick()

    await expect(autosave.flush()).resolves.toBe(false)
    expect(autosave.error.value).toBe('Não foi possível salvar automaticamente.')

    await expect(autosave.flush()).resolves.toBe(true)
    expect(autosave.error.value).toBe('')
  })
})
