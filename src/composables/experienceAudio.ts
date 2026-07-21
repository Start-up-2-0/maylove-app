import { inject, provide, type InjectionKey, type Ref } from 'vue'
import { useTributeAudio, type TributeAudioOptions } from './useTributeAudio'

/**
 * Áudio único da experiência: o ExperienceRenderer cria uma instância e a
 * disponibiliza via provide. Os shells (envelope, cinematográfico, etc.) podem
 * injetá-la para dar play em gestos do usuário (ex.: abrir o envelope), sem
 * criar múltiplos <audio> tocando ao mesmo tempo.
 */
export interface ExperienceAudioApi {
  playing: Ref<boolean>
  hasAudio: boolean
  currentTime: Ref<number>
  duration: Ref<number>
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (seconds: number) => void
}

export const EXPERIENCE_AUDIO_KEY: InjectionKey<ExperienceAudioApi> = Symbol('experience-audio')

export function provideExperienceAudio(
  urlGetter: () => string | null | undefined,
  options: TributeAudioOptions = {},
): ExperienceAudioApi {
  const audio = useTributeAudio(urlGetter, options)
  const api: ExperienceAudioApi = {
    playing: audio.playing,
    hasAudio: Boolean(urlGetter()),
    currentTime: audio.currentTime,
    duration: audio.duration,
    play: () => void audio.play(),
    pause: audio.pause,
    toggle: audio.toggle,
    seek: (seconds: number) => void audio.seek(seconds),
  }
  provide(EXPERIENCE_AUDIO_KEY, api)
  return api
}

export function useExperienceAudio(): ExperienceAudioApi | null {
  return inject(EXPERIENCE_AUDIO_KEY, null)
}
