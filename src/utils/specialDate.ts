import type { TributeSpecialDateConfig } from '@/api/types'
import type { ExperienceContent, SectionInstance } from '@/templates/types'

export interface ResolvedSpecialDateConfig {
  enabled: boolean
  date: string
  time?: string
  title?: string
  description?: string
  counterMode: 'countdown' | 'since' | 'none'
  displayFormat: 'compact' | 'card' | 'hero' | 'inline'
  kind?: string
}

export function buildSpecialDateIso(date: string, time?: string | null): string | null {
  if (!date?.trim()) return null
  const normalized = date.trim()
  const withTime = time?.trim() ? `${normalized}T${time.trim()}` : `${normalized}T12:00:00`
  const parsed = new Date(withTime)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export function resolveSpecialDateConfig(
  cfg: TributeSpecialDateConfig | null | undefined,
  fallbackDate?: string | null,
): ResolvedSpecialDateConfig | null {
  if (cfg?.enabled && cfg.date?.trim()) {
    return {
      enabled: true,
      date: cfg.date.trim(),
      time: cfg.time?.trim() || undefined,
      title: cfg.title?.trim() || undefined,
      description: cfg.description?.trim() || undefined,
      counterMode: cfg.counter_mode ?? 'since',
      displayFormat: cfg.display_format ?? 'card',
      kind: cfg.kind,
    }
  }

  if (fallbackDate?.trim()) {
    const iso = fallbackDate.trim()
    const datePart = iso.includes('T') ? iso.slice(0, 10) : iso
    return {
      enabled: true,
      date: datePart,
      counterMode: 'since',
      displayFormat: 'card',
    }
  }

  return null
}

export function specialDateIso(config: ResolvedSpecialDateConfig | null): string | null {
  if (!config?.enabled) return null
  return buildSpecialDateIso(config.date, config.time)
}

export function formatSpecialDateLabel(config: ResolvedSpecialDateConfig | null): string {
  const iso = specialDateIso(config)
  if (!iso) return ''
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(config?.time ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(parsed)
}

export function defaultSpecialDateTitle(config: ResolvedSpecialDateConfig): string {
  if (config.title) return config.title
  const labels: Record<string, string> = {
    first_meeting: 'Nosso primeiro encontro',
    first_kiss: 'Nosso primeiro beijo',
    dating_proposal: 'Pedido de namoro',
    wedding: 'Casamento',
    anniversary: 'Aniversário',
    custom: 'Data especial',
  }
  return labels[config.kind ?? ''] ?? 'Data especial'
}

export function shouldShowWizardSpecialDate(content: ExperienceContent): boolean {
  return Boolean(content.specialDateConfig?.enabled && content.specialDate)
}

export function filterSectionsForSpecialDate<T extends { type: string }>(
  sections: T[],
  content: ExperienceContent,
): T[] {
  if (!shouldShowWizardSpecialDate(content)) return sections
  return sections.filter((section) => section.type !== 'countdown')
}

export type ExperienceFlowItem =
  | { kind: 'section'; key: string; section: SectionInstance }
  | { kind: 'special-date'; key: string }

/** Monta a ordem de renderização inserindo a data especial logo após a capa (hero). */
export function buildScrollFlowItems(
  sections: SectionInstance[],
  content: ExperienceContent,
): ExperienceFlowItem[] {
  const items: ExperienceFlowItem[] = []
  let inserted = false

  for (const section of sections) {
    items.push({ kind: 'section', key: section.id, section })

    if (!inserted && section.type === 'hero' && shouldShowWizardSpecialDate(content)) {
      items.push({ kind: 'special-date', key: 'wizard-special-date' })
      inserted = true
    }
  }

  if (!inserted && shouldShowWizardSpecialDate(content)) {
    const anchor = items.findIndex((item) => item.kind === 'section')
    const insertAt = anchor >= 0 ? anchor + 1 : 0
    items.splice(insertAt, 0, { kind: 'special-date', key: 'wizard-special-date' })
  }

  return items
}
