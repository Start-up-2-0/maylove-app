import type { RomanceExperienceId } from './romanceExperiences'

export interface ProposalCopy {
  question: string
  celebration: string
}

const PROPOSAL_COPY: Partial<Record<RomanceExperienceId, ProposalCopy>> = {
  'pedido-namoro': {
    question: 'Quer namorar comigo?',
    celebration: 'Você disse sim! Este é o começo do nosso próximo capítulo. 💞',
  },
  'pedido-casamento': {
    question: 'Você aceita casar comigo?',
    celebration: 'Você disse sim! Para sempre começa agora. 💍',
  },
}

const GENERIC_PROPOSAL_COPY: ProposalCopy = {
  question: 'Quer viver este próximo capítulo comigo?',
  celebration: 'Você disse sim! Um novo capítulo começa agora. 💞',
}

export function getProposalDefaults(experienceId?: string | null): ProposalCopy | null {
  if (!experienceId) return null
  return PROPOSAL_COPY[experienceId as RomanceExperienceId] ?? null
}

export function resolveProposalCopy(
  experienceId: string | null | undefined,
  question?: string | null,
  celebration?: string | null,
): ProposalCopy {
  const defaults = getProposalDefaults(experienceId) ?? GENERIC_PROPOSAL_COPY
  return {
    question: question?.trim() || defaults.question,
    celebration: celebration?.trim() || defaults.celebration,
  }
}

export function hydrateProposalCopy(
  form: { question: string; celebration: string },
  experienceId?: string | null,
): boolean {
  const defaults = getProposalDefaults(experienceId)
  if (!defaults) return false
  let changed = false
  if (!form.question.trim()) {
    form.question = defaults.question
    changed = true
  }
  if (!form.celebration.trim()) {
    form.celebration = defaults.celebration
    changed = true
  }
  return changed
}
