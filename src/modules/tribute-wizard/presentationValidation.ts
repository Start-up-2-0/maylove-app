import type { useTributeWizard } from '@/composables/useTributeWizard'
import type { TributeDetail } from '@/api/types'
import {
  layoutUsesOptionalTextBlocks,
  MOMENT_LAYOUTS,
  resolvePresentationSchema,
} from '@/templates/presentationSchema'
import type { TemplateDefinition } from '@/templates/types'
import { timelineItemHasContent } from '@/utils/timeline'

export interface SchemaIssue {
  field: string
  code: string
  message: string
}

export interface PresentationValidationInput {
  presentation?: string | null
  title?: string | null
  message?: string | null
  question?: string | null
  include_opening_message?: boolean
  include_closing_message?: boolean
  timeline?: ReadonlyArray<{ title?: string | null; description?: string | null; photo_media_id?: string | null; photo_url?: string | null }>
}

function hasText(value?: string | null): boolean {
  return Boolean(value && value.replace(/<[^>]*>/g, '').trim())
}

export function collectPresentationSchemaIssues(
  input: PresentationValidationInput,
  definition: TemplateDefinition | null | undefined,
  photosCount: number,
): SchemaIssue[] {
  const schema = resolvePresentationSchema(input.presentation, definition)
  const issues: SchemaIssue[] = []

  if (schema.required.includes('title') && !hasText(input.title)) {
    issues.push({ field: 'title', code: 'REQUIRED', message: 'Defina um título para a homenagem.' })
  }

  if (schema.required.includes('message')) {
    const optionalBlocks = layoutUsesOptionalTextBlocks(schema.layout)
    if (optionalBlocks) {
      if (input.include_opening_message && !hasText(input.message)) {
        issues.push({
          field: 'message',
          code: 'REQUIRED',
          message: `Escreva ${schema.text.messageLabel.toLowerCase()}.`,
        })
      }
    } else if (!hasText(input.message)) {
      issues.push({
        field: 'message',
        code: 'REQUIRED',
        message: `Escreva ${schema.text.messageLabel.toLowerCase()}.`,
      })
    }
  }

  if (schema.layout === 'proposal' && !hasText(input.question)) {
    issues.push({ field: 'question', code: 'REQUIRED', message: 'Informe a pergunta do pedido.' })
  }

  const usesMoments = MOMENT_LAYOUTS.includes(schema.layout)
  const timeline = input.timeline ?? []
  if (usesMoments) {
    const filledMoments = timeline.filter((item) =>
      timelineItemHasContent({
        title: item.title ?? undefined,
        description: item.description ?? undefined,
        photo_url: item.photo_url ?? undefined,
        photo_media_id: item.photo_media_id ?? undefined,
      }),
    )
    if (filledMoments.length === 0 && photosCount === 0) {
      issues.push({
        field: 'moments',
        code: 'MIN_MOMENTS',
        message: 'Adicione ao menos um trecho com texto (ou uma foto) para esta experiência.',
      })
    }
  } else if (schema.limits.minPhotos > 0 && photosCount < schema.limits.minPhotos) {
    issues.push({
      field: 'photos',
      code: 'MIN_PHOTOS',
      message: `Envie pelo menos ${schema.limits.minPhotos} foto(s) para este estilo.`,
    })
  }

  return issues
}

export function collectPresentationSchemaIssuesFromTribute(
  tribute: TributeDetail,
  definition: TemplateDefinition | null | undefined,
): SchemaIssue[] {
  const photoCount = (tribute.media ?? []).filter((m) => m.media_type === 'photo').length
  return collectPresentationSchemaIssues(
    {
      presentation: tribute.content_json?.presentation,
      title: tribute.title,
      message: tribute.message,
      question: tribute.content_json?.question,
      include_opening_message: tribute.content_json?.include_opening_message,
      include_closing_message: tribute.content_json?.include_closing_message,
      timeline: tribute.content_json?.timeline,
    },
    definition,
    photoCount,
  )
}

export function collectPresentationSchemaIssuesFromForm(
  form: ReturnType<typeof useTributeWizard>['form'],
  definition: TemplateDefinition | null | undefined,
  photosCount: number,
): SchemaIssue[] {
  return collectPresentationSchemaIssues(
    {
      presentation: form.presentation,
      title: form.title,
      message: form.message,
      question: form.question,
      include_opening_message: form.include_opening_message,
      include_closing_message: form.include_closing_message,
      timeline: form.timeline,
    },
    definition,
    photosCount,
  )
}

const TEXT_FIELDS = new Set(['title', 'message', 'question'])
const STORY_FIELDS = new Set(['moments', 'photos'])

export function issuesForWizardStep(
  step: 'texts' | 'story' | 'basics',
  issues: SchemaIssue[],
): SchemaIssue[] {
  const fields =
    step === 'texts' ? TEXT_FIELDS : step === 'story' ? STORY_FIELDS : new Set(['photos'])
  return issues.filter((issue) => fields.has(issue.field))
}

export function firstIssueMessage(issues: SchemaIssue[]): string | undefined {
  return issues[0]?.message
}
