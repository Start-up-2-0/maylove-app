<template>
  <div class="publish-step">
    <WizardStepHeader
      title="Publicar mapa"
      :description="billingEnabled
        ? 'Valide os requisitos e pague com PIX para publicar.'
        : 'Valide os requisitos e publique para compartilhar o link.'"
    />

    <div v-if="loadingValidation" class="validation-loading">
      <span class="ml-spinner" />
      Validando mapa...
    </div>

    <section v-else class="validation">
      <div v-if="!publishBlocked" class="ml-alert ml-alert--success">
        Tudo certo para publicar.
      </div>
      <div v-if="validation?.errors.length" class="ml-alert ml-alert--danger">
        <ul class="issue-list">
          <li v-for="issue in validation.errors" :key="issue.field + issue.code">{{ issue.message }}</li>
        </ul>
      </div>
    </section>

    <div v-if="map?.status === 'published'" class="ml-card published-card">
      <h3>Mapa publicado!</h3>
      <p class="text-muted">Compartilhe o link com quem você ama.</p>
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
        v-if="!billingEnabled"
        class="ml-btn ml-btn--primary ml-btn--lg"
        :disabled="publishBlocked || publishing"
        @click="publish"
      >
        <span v-if="publishing" class="ml-spinner ml-spinner--sm" />
        Publicar agora
      </button>
      <button
        v-else
        class="ml-btn ml-btn--primary ml-btn--lg"
        :disabled="publishBlocked || checkingOut"
        @click="startCheckout"
      >
        <span v-if="checkingOut" class="ml-spinner ml-spinner--sm" />
        Pagar R$ {{ priceLabel }} com PIX
      </button>
    </div>

    <PixCheckoutPanel :checkout="checkout" @paid="onPixPaid" />
    <p v-if="actionError" class="ml-alert ml-alert--danger mt-3">{{ actionError }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { checkoutMap, publishMap, validateMap } from '@/api/maps'
import { fetchBillingProduct } from '@/api/billing'
import { fetchSubscription } from '@/api/tributes'
import type { CheckoutResponse, CoupleMapDetail, CoupleMapValidation } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import PixCheckoutPanel from '@/components/billing/PixCheckoutPanel.vue'

const props = defineProps<{ mapId: string; map: CoupleMapDetail | null }>()
const emit = defineEmits<{ published: [] }>()

const validation = ref<CoupleMapValidation | null>(null)
const loadingValidation = ref(true)
const publishing = ref(false)
const checkingOut = ref(false)
const actionError = ref('')
const copied = ref(false)
const billingEnabled = ref(false)
const checkout = ref<CheckoutResponse | null>(null)
const priceLabel = ref('5,99')

const publishBlocked = computed(() => !validation.value?.valid)

const publicUrl = computed(() => {
  const slug = props.map?.slug
  if (!slug) return ''
  return `${window.location.origin}/map/${slug}`
})

onMounted(async () => {
  try {
    const [result, subscription, product] = await Promise.all([
      validateMap(props.mapId),
      fetchSubscription().catch(() => ({ billing_enabled: false, has_subscription: false })),
      fetchBillingProduct().catch(() => null),
    ])
    validation.value = result
    billingEnabled.value = subscription.billing_enabled !== false && !subscription.has_subscription
    const mapPrice = product?.prices.find((p) => p.billing_mode === 'per_map')
    if (mapPrice) {
      priceLabel.value = (mapPrice.price_cents / 100).toFixed(2).replace('.', ',')
    }
  } catch {
    actionError.value = 'Não foi possível validar o mapa.'
  } finally {
    loadingValidation.value = false
  }
})

async function publish() {
  publishing.value = true
  actionError.value = ''
  try {
    const result = await validateMap(props.mapId)
    validation.value = result
    if (!result.valid) {
      actionError.value = 'Corrija os itens pendentes antes de publicar.'
      return
    }
    await publishMap(props.mapId)
    emit('published')
  } catch (err) {
    actionError.value = resolveApiError(err, 'Não foi possível publicar o mapa.')
  } finally {
    publishing.value = false
  }
}

async function startCheckout() {
  checkingOut.value = true
  actionError.value = ''
  try {
    const result = await validateMap(props.mapId)
    validation.value = result
    if (!result.valid) {
      actionError.value = 'Corrija os itens pendentes antes de pagar.'
      return
    }
    checkout.value = await checkoutMap(props.mapId)
    if (!checkout.value.pix?.qr_code && !checkout.value.checkout_url) {
      actionError.value = 'Checkout PIX indisponível no momento.'
    }
  } catch (err) {
    actionError.value = resolveApiError(err, 'Não foi possível iniciar o checkout.')
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
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<style scoped>
.validation-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  margin-bottom: 16px;
}
.issue-list {
  margin: 0;
  padding-left: 18px;
}
.published-card {
  padding: 20px;
  margin-top: 16px;
}
.published-card__row {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}
.publish-actions {
  margin-top: 16px;
}
</style>
