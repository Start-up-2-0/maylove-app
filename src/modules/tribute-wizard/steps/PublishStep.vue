<template>
  <div class="publish-step wiz-step-content">
    <WizardStepHeader
      title="Publicar"
      :description="billingEnabled
        ? 'Valide os requisitos e pague com PIX para publicar a homenagem.'
        : 'Valide os requisitos e publique a homenagem.'"
    />

    <div class="wiz-card-stack">
      <div v-if="paymentMessage" class="ml-alert" :class="paymentAlertClass">
        {{ paymentMessage }}
      </div>

      <section class="wiz-card">
        <h3 class="wiz-card__title">Validação</h3>

        <div v-if="loadingValidation" class="validation-loading">
          <span class="ml-spinner" />
          Validando homenagem...
        </div>

        <div v-else class="validation">
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
          <div v-if="validation?.warnings.length" class="ml-alert ml-alert--warning">
            <ul class="issue-list">
              <li v-for="issue in validation.warnings" :key="issue.field + issue.code">{{ issue.message }}</li>
            </ul>
          </div>
        </div>
      </section>

      <section v-if="tribute?.status === 'published'" class="wiz-card published-card">
        <h3 class="published-card__title">Homenagem publicada!</h3>
        <p class="text-muted published-card__sub">Compartilhe o link com quem você ama.</p>
        <div class="published-card__row">
          <input :value="publicUrl" readonly class="ml-input" />
          <button class="ml-btn ml-btn--primary" @click="copyLink">
            {{ copied ? 'Copiado!' : 'Copiar link' }}
          </button>
        </div>
        <a :href="publicUrl" target="_blank" class="ml-btn ml-btn--secondary">Abrir página publicada</a>

        <div v-if="showQrCode" class="published-card__qr">
          <h4>QR Code</h4>
          <img :src="qrCodeUrl" width="180" height="180" alt="QR Code da homenagem" />
          <p class="text-muted">Escaneie para abrir a homenagem no celular.</p>
        </div>
      </section>

      <section v-else class="wiz-card">
        <h3 class="wiz-card__title">Publicação</h3>
        <p class="wiz-card__hint">Quando estiver pronto, publique ou pague para colocar no ar.</p>

        <div class="publish-actions">
          <button
            v-if="canPublishDirectly"
            class="ml-btn ml-btn--primary ml-btn--lg"
            :disabled="publishBlocked || publishing"
            @click="publish"
          >
            <span v-if="publishing" class="ml-spinner ml-spinner--sm" />
            {{ publishButtonLabel }}
          </button>
          <button
            v-if="billingEnabled && !hasSubscription"
            class="ml-btn ml-btn--primary ml-btn--lg"
            :disabled="publishBlocked || checkingOut"
            @click="startCheckout"
          >
            <span v-if="checkingOut" class="ml-spinner ml-spinner--sm" />
            Pagar R$ {{ priceLabel }} com PIX
          </button>
        </div>

        <PixCheckoutPanel :checkout="checkout" @paid="onPixPaid" />

        <p v-if="actionError" class="ml-alert ml-alert--danger publish-error">{{ actionError }}</p>
      </section>
    </div>
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
import { fetchBillingProduct } from '@/api/billing'
import type { CheckoutResponse, TributeDetail, TributeValidation } from '@/api/types'
import { getTemplateDefinition } from '@/templates/registry'
import { collectPresentationSchemaIssuesFromTribute } from '@/modules/tribute-wizard/presentationValidation'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import PixCheckoutPanel from '@/components/billing/PixCheckoutPanel.vue'

const props = defineProps<{
  tributeId: string
  tribute: TributeDetail | null
}>()

const schemaIssues = computed(() => {
  const tribute = props.tribute
  if (!tribute) return []
  const definition = getTemplateDefinition(tribute.template.slug)
  return collectPresentationSchemaIssuesFromTribute(tribute, definition)
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
const checkout = ref<CheckoutResponse | null>(null)
const priceLabel = ref('4,99')

const publicUrl = computed(() => {
  const slug = props.tribute?.slug
  if (!slug) return ''
  return `${window.location.origin}/h/${slug}`
})

const showQrCode = computed(
  () => props.tribute?.content_json?.modules?.qr_code !== false && Boolean(publicUrl.value),
)

const qrCodeUrl = computed(() =>
  publicUrl.value
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(publicUrl.value)}`
    : '',
)

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
    const [validationResult, subscription, product] = await Promise.all([
      validateTribute(props.tributeId),
      fetchSubscription(),
      fetchBillingProduct().catch(() => null),
    ])
    validation.value = validationResult
    billingEnabled.value = subscription.billing_enabled !== false
    hasSubscription.value = subscription.has_subscription
    const tributePrice = product?.prices.find((p) => p.billing_mode === 'per_tribute')
    if (tributePrice) {
      priceLabel.value = (tributePrice.price_cents / 100).toFixed(2).replace('.', ',')
    }
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
      : 'Publicação indisponível. Verifique assinatura ou use o pagamento PIX.'
  } finally {
    publishing.value = false
  }
}

async function startCheckout() {
  checkingOut.value = true
  actionError.value = ''
  try {
    checkout.value = await checkoutTribute(props.tributeId)
    if (!checkout.value.pix?.qr_code && !checkout.value.checkout_url) {
      actionError.value = 'Checkout PIX indisponível no momento.'
    }
  } catch {
    actionError.value = 'Não foi possível gerar o PIX.'
  } finally {
    checkingOut.value = false
  }
}

function onPixPaid() {
  emit('published')
}

async function copyLink() {
  if (!publicUrl.value) return
  await navigator.clipboard.writeText(publicUrl.value)
  copied.value = true
}
</script>

<style scoped>
.validation-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  padding: 8px 0;
}
.validation {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.issue-list {
  list-style: disc;
  padding-left: 18px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.published-card__title {
  font-size: 1.25rem;
  font-weight: 600;
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
.published-card__qr {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  text-align: center;
}
.published-card__qr h4 {
  font-size: 0.94rem;
  margin-bottom: 12px;
}
.published-card__qr img {
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: #fff;
}
.publish-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.publish-error {
  margin-top: 12px;
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
