<template>
  <div class="letter-step wiz-step-content">
    <h2 class="wiz-card__title">Guarde uma carta</h2>
    <p class="wiz-card__hint">Algumas palavras para florescer ao lado do buquê.</p>

    <label class="ml-field">
      <span>Para</span>
      <input v-model="recipientName" class="ml-input" placeholder="Nome de quem recebe..." />
    </label>

    <label class="ml-field">
      <span>De</span>
      <input v-model="senderName" class="ml-input" placeholder="Seu nome..." />
    </label>

    <label class="ml-field">
      <span>Sua carta</span>
      <textarea
        v-model="letterBody"
        class="ml-input letter-step__textarea"
        rows="6"
        placeholder="Despeje seu coração aqui..."
      />
    </label>

    <p class="letter-step__design-label">Design da carta</p>
    <div class="design-grid">
      <button
        v-for="design in BOUQUET_LETTER_DESIGNS"
        :key="design.id"
        type="button"
        class="design-card"
        :class="[
          `design-card--${design.id}`,
          { 'design-card--active': letterDesign === design.id },
        ]"
        @click="letterDesign = design.id"
      >
        <span class="design-card__emoji">{{ design.emoji }}</span>
        <strong>{{ design.label }}</strong>
        <span>{{ design.tagline }}</span>
      </button>
    </div>

    <div v-if="billingEnabled" class="premium-note">
      <span aria-hidden="true">👑</span>
      Buquês fazem parte do premium. Escolha um plano ou pague R$ {{ priceLabel }} para enviar o seu.
    </div>

    <div v-if="published" class="published-box ml-card">
      <h3>Buquê publicado!</h3>
      <p class="text-muted">Compartilhe o link com quem você ama.</p>
      <div class="published-box__row">
        <input :value="publicUrl" readonly class="ml-input" />
        <button class="ml-btn ml-btn--primary" @click="copyLink">
          {{ copied ? 'Copiado!' : 'Copiar link' }}
        </button>
      </div>
      <a :href="publicUrl" target="_blank" class="ml-btn ml-btn--secondary">Abrir página</a>
    </div>

    <div v-else class="letter-step__actions">
      <button
        v-if="!billingEnabled"
        class="ml-btn ml-btn--primary ml-btn--lg"
        :disabled="publishing || publishBlocked"
        @click="publish"
      >
        <span v-if="publishing" class="ml-spinner ml-spinner--sm" />
        Publicar e compartilhar ♥
      </button>
      <button
        v-else
        class="ml-btn ml-btn--primary ml-btn--lg"
        :disabled="checkingOut || publishBlocked"
        @click="startCheckout"
      >
        <span v-if="checkingOut" class="ml-spinner ml-spinner--sm" />
        Publicar e compartilhar ♥
      </button>
    </div>

    <PixCheckoutPanel :checkout="checkout" @paid="$emit('published')" />
    <p v-if="actionError" class="ml-alert ml-alert--danger">{{ actionError }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { checkoutBouquet, publishBouquet, validateBouquet } from '@/api/bouquets'
import { fetchBillingProduct } from '@/api/billing'
import { fetchSubscription } from '@/api/tributes'
import type { BouquetLetterDesign, CheckoutResponse, DigitalBouquetDetail } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import PixCheckoutPanel from '@/components/billing/PixCheckoutPanel.vue'
import { BOUQUET_LETTER_DESIGNS } from '@/modules/bouquet/bouquetCatalog'

const props = defineProps<{
  bouquetId: string
  bouquet: DigitalBouquetDetail | null
  recipientName: string
  senderName: string
  letterBody: string
  letterDesign: BouquetLetterDesign
  flushAutosave?: () => Promise<boolean>
}>()

const emit = defineEmits<{
  'update:recipientName': [value: string]
  'update:senderName': [value: string]
  'update:letterBody': [value: string]
  'update:letterDesign': [value: BouquetLetterDesign]
  published: []
}>()

const recipientName = computed({
  get: () => props.recipientName,
  set: (value) => emit('update:recipientName', value),
})
const senderName = computed({
  get: () => props.senderName,
  set: (value) => emit('update:senderName', value),
})
const letterBody = computed({
  get: () => props.letterBody,
  set: (value) => emit('update:letterBody', value),
})
const letterDesign = computed({
  get: () => props.letterDesign,
  set: (value) => emit('update:letterDesign', value),
})

const publishBlocked = ref(true)
const publishing = ref(false)
const checkingOut = ref(false)
const actionError = ref('')
const billingEnabled = ref(false)
const checkout = ref<CheckoutResponse | null>(null)
const priceLabel = ref('5,99')
const copied = ref(false)

const published = computed(() => props.bouquet?.status === 'published')

const publicUrl = computed(() => {
  const slug = props.bouquet?.slug
  if (!slug) return ''
  return `${window.location.origin}/bouquet/${slug}`
})

onMounted(async () => {
  try {
    if (props.flushAutosave) {
      await props.flushAutosave()
    }
    const [validation, subscription, product] = await Promise.all([
      validateBouquet(props.bouquetId),
      fetchSubscription().catch(() => ({ billing_enabled: false, has_subscription: false })),
      fetchBillingProduct().catch(() => null),
    ])
    publishBlocked.value = !validation.valid
    billingEnabled.value = subscription.billing_enabled !== false && !subscription.has_subscription
    const bouquetPrice = product?.prices.find((p) => p.billing_mode === 'per_bouquet')
    if (bouquetPrice) {
      priceLabel.value = (bouquetPrice.price_cents / 100).toFixed(2).replace('.', ',')
    }
  } catch {
    actionError.value = 'Não foi possível validar o buquê.'
  }
})

async function ensureSavedAndValid(): Promise<boolean> {
  if (props.flushAutosave) {
    const saved = await props.flushAutosave()
    if (!saved) {
      actionError.value = 'Não foi possível salvar as alterações.'
      return false
    }
  }
  const validation = await validateBouquet(props.bouquetId)
  publishBlocked.value = !validation.valid
  if (!validation.valid) {
    actionError.value = 'Complete flores e carta antes de publicar.'
    return false
  }
  return true
}

async function publish() {
  publishing.value = true
  actionError.value = ''
  try {
    if (!(await ensureSavedAndValid())) return
    await publishBouquet(props.bouquetId)
    emit('published')
  } catch (err) {
    actionError.value = resolveApiError(err, 'Não foi possível publicar o buquê.')
  } finally {
    publishing.value = false
  }
}

async function startCheckout() {
  checkingOut.value = true
  actionError.value = ''
  try {
    if (!(await ensureSavedAndValid())) return
    checkout.value = await checkoutBouquet(props.bouquetId)
  } catch (err) {
    actionError.value = resolveApiError(err, 'Não foi possível iniciar o checkout.')
  } finally {
    checkingOut.value = false
  }
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
.letter-step__textarea {
  resize: vertical;
  min-height: 140px;
}

.letter-step__design-label {
  margin: 18px 0 10px;
  font-weight: 600;
  color: var(--ink);
}

.design-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.design-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: left;
  cursor: pointer;
  background: var(--surface);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.design-card--romantic {
  background: linear-gradient(180deg, #6b1f2b, #4a1420);
  color: white;
}

.design-card--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 15%, transparent);
}

.design-card__emoji {
  display: block;
  margin-bottom: 8px;
}

.premium-note {
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--primary-soft);
  color: var(--primary-strong);
  font-size: 13px;
}

.letter-step__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.published-box {
  margin-top: 20px;
  padding: 18px;
}

.published-box__row {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}
</style>
