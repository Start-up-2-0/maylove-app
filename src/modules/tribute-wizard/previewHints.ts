import type { TributeModulesConfig } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { getPresentation } from '@/templates/presentations'
import type { ExperienceLayout } from '@/templates/types'
import { timelineItemHasContent } from '@/utils/timeline'
import { hasEventInfo } from '@/utils/eventInfo'
import { shouldShowTimelineModule } from '@/utils/tributeModules'

export function buildReviewPreviewHints(
  form: ReturnType<typeof useTributeWizard>['form'],
  templateLayout?: ExperienceLayout,
): string[] {
  const hints: string[] = []
  const presentation = getPresentation(form.presentation)
  const layout = presentation?.layout ?? templateLayout ?? 'scroll'
  const modules = form.modules as TributeModulesConfig
  const momentCount = form.timeline.filter((item) => timelineItemHasContent(item)).length
  const filledTimeline = form.timeline.filter((item) => timelineItemHasContent(item))
  const presentationLabel = presentation?.label ?? 'Padrão do modelo'

  hints.push(`Estilo de exibição: ${presentationLabel}.`)

  if (momentCount > 0) {
    if (layout === 'cinematic') {
      hints.push(
        `Seus ${momentCount} momento(s) aparecem como legenda nos slides e também na linha do tempo abaixo do slider.`,
      )
    } else if (layout === 'letter' || layout === 'envelope') {
      hints.push('Seus momentos aparecem na linha do tempo abaixo do texto da carta.')
    } else if (layout === 'timeline') {
      hints.push('Seus momentos compõem a linha do tempo principal da homenagem.')
    } else if (shouldShowTimelineModule(modules, filledTimeline, layout)) {
      hints.push('Seus momentos aparecem em um bloco de linha do tempo na página.')
    }
  }

  if (layout === 'envelope' && form.message?.trim()) {
    hints.push('Na carta animada, clique em "Abrir carta" para ver o conteúdo completo.')
  }

  if (hasEventInfo(form.event_info)) {
    hints.push('As informações do evento aparecem em um cartão dedicado na homenagem.')
  }

  if (form.video_url?.trim()) {
    hints.push('O vídeo informado será exibido na seção de vídeo da página.')
  }

  return hints
}
