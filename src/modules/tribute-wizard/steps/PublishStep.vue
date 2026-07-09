<template>
  <div class="publish-step">
    <WizardStepHeader
      title="Publicar"
      :description="billingEnabled
        ? 'Valide os requisitos e publique ou inicie o pagamento avulso.'
        : 'Valide os requisitos e publique a homenagem.'"
    />

    <div v-if="paymentMessage" class="ml-alert mb-4" :class="paymentAlertClass">
      {{ paymentMessage }}
    </div>

    <div v-if="loadingValidation" class="validation-loading">
      <span class="ml-spinner" />
      Validando homenagem...
    </div>

    <section v-else class="validation">
      <div v-if="!publishBlocked" class="ml-alert ml-alert--success">
        <svg class="ml-alert__icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>Tudo certo para publicar.</span>
      </div>
      <div v-if="validation?.errors.length || schemaIssues.length" class="ml-alert ml-alert--danger">
        <ul class="issue-list">
          <li v-for="issue in schemaIssues" :key="issue.field + issue.code">{{ issue.message }}</li>
          <li v-for="issue in validation?.errors ?? []" :key="issue.field + issue.code">{{ issue.message }}</li>
        </ul>
      </div>
      <div v-if="validation?.warnings.length" class="ml-alert ml-alert--warning mt-3">
        <ul class="issue-list">
          <li v-for="issue in validation.warnings" :key="issue.field + issue.code">{{ issue.message }}</li>
        </ul>
      </div>
    </section>

    <div v-if="tribute?.status === 'published'" class="ml-card published-card">
      <h3 class="published-card__title">Homenagem publicada! 🎉</h3>
      <p class="text-muted published-card__sub">Compartilhe o link com quem você ama.</p>
      <div class="published-card__row">
        <input :value="publicUrl" readonly class="ml-input" />
        <button class="ml-btn ml-btn--primary" @click="copyLink">
          {{ copied ? 'Copiado!' : 'Copiar link' }}
        </button>
      </div>
      <a :href="publicUrl" target="_blank" class="ml-btn ml-btn--secondary">Abrir página</a>
    </div>

    <div v-else class="publish-actions">
      <button
        class="ml-btn ml-btn--primary ml-btn--lg"
        :disabled="publishBlocked || publishing"
        @click="publish"
      >
        <span v-if="publishing" class="ml-spinner ml-spinner--sm" />
        {{ publishButtonLabel }}
      </button>
      <button
        v-if="billingEnabled && !hasSubscription"
        class="ml-btn ml-btn--secondary ml-btn--lg"
        :disabled="publishBlocked || checkingOut"
        @click="startCheckout"
      >
        <span v-if="checkingOut" class="ml-spinner ml-spinner--sm" />
        Pagar R$ {{ priceLabel }} e publicar
      </button>
    </div>

    <p v-if="actionError" class="ml-alert ml-alert--danger mt-3">{{ actionError }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  checkoutTribute,
  fetchSubscription,
  publishTribute,
  validateTribute,
} from '@/api/tributes'
import type { TributeDetail, TributeValidation } from '@/api/types'
import { getTemplateDefinition } from '@/templates/registry'
import { resolvePresentationSchema } from '@/templates/presentationSchema'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  tributeId: string
  tribute: TributeDetail | null
}>()

const MOMENT_LAYOUTS = ['envelope', 'timeline', 'album', 'storytelling', 'cinematic', 'proposal']

// Validações derivadas do schema da apresentação (obrigatórios e mínimos), além
// da validação do backend. Bloqueiam a publicação no cliente com mensagens claras.
const schemaIssues = computed<{ field: string; code: string; message: string }[]>(() => {
  const tribute = props.tribute
  if (!tribute) return []
  const definition = getTemplateDefinition(tribute.template.slug)
  const schema = resolvePresentationSchema(tribute.content_json?.presentation, definition)
  const issues: { field: string; code: string; message: string }[] = []

  const hasText = (value?: string | null) => Boolean(value && value.replace(/<[^>]*>/g, '').trim())
  if (schema.required.includes('title') && !hasText(tribute.title)) {
    issues.push({ field: 'title', code: 'REQUIRED', message: 'Defina um título para a homenagem.' })
  }
  if (schema.required.includes('message') && !hasText(tribute.message)) {
    issues.push({ field: 'message', code: 'REQUIRED', message: 'Escreva a mensagem principal.' })
  }

  const photoCount = (tribute.media ?? []).filter((m) => m.media_type === 'photo').length
  const usesMoments = MOMENT_LAYOUTS.includes(schema.layout)

  if (usesMoments) {
    const moments = tribute.content_json?.timeline ?? []
    const filledMoments = moments.filter(
      (m) => hasText(m.description) || hasText(m.title),
    )
    if (filledMoments.length === 0 && photoCount === 0) {
      issues.push({
        field: 'moments',
        code: 'MIN_MOMENTS',
        message: 'Adicione ao menos um trecho com texto (ou uma foto) para esta experiência.',
      })
    }
  } else if (schema.limits.minPhotos > 0 && photoCount < schema.limits.minPhotos) {
    issues.push({
      field: 'photos',
      code: 'MIN_PHOTOS',
      message: `Envie pelo menos ${schema.limits.minPhotos} foto(s) para este estilo.`,
    })
  }

  return issues
})

const publishBlocked = computed(
  () => !validation.value?.valid || schemaIssues.value.length > 0,
)

const canPublishDirectly = computed(() => !billingEnabled.value || hasSubscription.value)

const publishButtonLabel = computed(() => {
  if (!billingEnabled.value) return 'Publicar agora'
  return hasSubscription.value ? 'Publicar agora' : 'Publicar (assinante)'
})

const emit = defineEmits<{ published: [] }>()

const route = useRoute()
const validation = ref<TributeValidation | null>(null)
const loadingValidation = ref(true)
const billingEnabled = ref(true)
const hasSubscription = ref(false)
const publishing = ref(false)
const checkingOut = ref(false)
const actionError = ref('')
const copied = ref(false)

const priceLabel = '5,99'

const publicUrl = computed(() => {
  const slug = props.tribute?.slug
  if (!slug) return ''
  return `${window.location.origin}/h/${slug}`
})

const paymentStatus = computed(() => route.query.payment)
const paymentMessage = computed(() => {
  if (paymentStatus.value === 'success')
    return 'Pagamento aprovado! Sua homenagem será publicada em instantes.'
  if (paymentStatus.value === 'failure')
    return 'Pagamento não concluído. Você pode tentar novamente.'
  if (paymentStatus.value === 'pending') return 'Pagamento pendente. Aguarde a confirmação.'
  return ''
})

const paymentAlertClass = computed(() => {
  if (paymentStatus.value === 'success') return 'ml-alert--success'
  if (paymentStatus.value === 'failure') return 'ml-alert--danger'
  return 'ml-alert--warning'
})

onMounted(async () => {
  try {
    const [validationResult, subscription] = await Promise.all([
      validateTribute(props.tributeId),
      fetchSubscription(),
    ])
    validation.value = validationResult
    billingEnabled.value = subscription.billing_enabled !== false
    hasSubscription.value = subscription.has_subscription
    if (paymentStatus.value === 'success') {
      emit('published')
    }
  } catch {
    actionError.value = 'Não foi possível validar a homenagem.'
  } finally {
    loadingValidation.value = false
  }
})

async function publish() {
  publishing.value = true
  actionError.value = ''
  try {
    await publishTribute(props.tributeId)
    emit('published')
  } catch {
    actionError.value = canPublishDirectly.value
      ? 'Não foi possível publicar a homenagem.'
      : 'Publicação indisponível. Verifique assinatura ou use o pagamento avulso.'
  } finally {
    publishing.value = false
  }
}

async function startCheckout() {
  checkingOut.value = true
  actionError.value = ''
  try {
    const checkout = await checkoutTribute(props.tributeId)
    if (checkout.checkout_url) {
      window.location.href = checkout.checkout_url
      return
    }
    actionError.value = 'Checkout indisponível no momento.'
  } catch {
    actionError.value = 'Não foi possível iniciar o checkout.'
  } finally {
    checkingOut.value = false
  }
}

async function copyLink() {
  if (!publicUrl.value) return
  await navigator.clipboard.writeText(publicUrl.value)
  copied.value = true
}
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.mt-3 {
  margin-top: 12px;
}
.validation-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  padding: 16px 0;
}
.validation {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}
.issue-list {
  list-style: disc;
  padding-left: 18px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.published-card {
  padding: 24px;
}
.published-card__title {
  font-size: 1.25rem;
}
.published-card__sub {
  margin: 6px 0 16px;
}
.published-card__row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  margin-bottom: 12px;
}

.publish-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 560px) {
  .published-card__row {
    grid-template-columns: 1fr;
  }
  .publish-actions .ml-btn {
    flex: 1;
  }
}
</style>
