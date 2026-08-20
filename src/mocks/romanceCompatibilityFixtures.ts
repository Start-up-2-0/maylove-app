import type { TributeContentJson } from '@/api/types'
import type { RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'

export interface LegacyRomanceFixture {
  id: string
  experienceId: RomanceExperienceId
  content: TributeContentJson
}

/** Payloads mínimos anteriores às etapas especializadas, mantidos para regressão. */
export const LEGACY_ROMANCE_FIXTURES: LegacyRomanceFixture[] = [
  { id: 'legacy-declaration', experienceId: 'declaracao-amor', content: { effects: ['hearts'] } },
  { id: 'legacy-dating-proposal', experienceId: 'pedido-namoro', content: { romance_experience_id: 'pedido-namoro' } },
  { id: 'legacy-marriage-proposal', experienceId: 'pedido-casamento', content: { romance_experience_id: 'pedido-casamento' } },
  { id: 'legacy-letter', experienceId: 'carta-amor', content: { sender_name: 'Ana' } },
  {
    id: 'legacy-story',
    experienceId: 'nossa-historia',
    content: { timeline: [{ title: 'O começo', description: 'Foi em um dia especial.' }] },
  },
]
