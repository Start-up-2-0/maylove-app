<template>
  <section v-if="checkout" class="pix-panel">
    <h3 class="pix-panel__title">Pague com PIX</h3>
    <p class="pix-panel__price">{{ formattedPrice }}</p>
    <p class="pix-panel__hint text-muted">
      Escaneie o QR Code ou copie o código. A publicação acontece automaticamente após a confirmação.
    </p>

    <div v-if="qrImageSrc" class="pix-panel__qr">
      <img :src="qrImageSrc" alt="QR Code PIX" width="220" height="220" />
    </div>

    <div v-if="checkout.pix?.qr_code" class="pix-panel__copy">
      <input :value="checkout.pix.qr_code" readonly class="ml-input" />
      <button type="button" class="ml-btn ml-btn--secondary" @click="copyCode">
        {{ copied ? 'Copiado!' : 'Copiar código' }}
      </button>
    </div>

    <a
      v-if="checkout.pix?.ticket_url || checkout.checkout_url"
      :href="checkout.pix?.ticket_url || checkout.checkout_url || undefined"
      target="_blank"
      rel="noopener"
      class="ml-btn ml-btn--ghost"
    >
      Abrir página do PIX
    </a>

    <p class="pix-panel__status" :class="{ 'pix-panel__status--paid': paid }">
      <span v-if="paid">Pagamento confirmado!</span>
      <span v-else>
        <span class="ml-spinner ml-spinner--inline" />
        Aguardando pagamento...
      </span>
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { fetchOrder } from '@/api/billing'
import type { CheckoutResponse } from '@/api/types'

const props = defineProps<{
  checkout: CheckoutResponse | null
}>()

const emit = defineEmits<{ paid: [] }>()

const copied = ref(false)
const paid = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

const formattedPrice = computed(() => {
  const cents = props.checkout?.price_cents ?? 0
  return cents.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
})

const qrImageSrc = computed(() => {
  const b64 = props.checkout?.pix?.qr_code_base64
  if (!b64) return ''
  return b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`
})

watch(
  () => props.checkout?.order_id,
  (orderId) => {
    stopPolling()
    paid.value = false
    if (orderId) startPolling(orderId)
  },
)

onMounted(() => {
  if (props.checkout?.order_id) startPolling(props.checkout.order_id)
})

onUnmounted(() => stopPolling())

const MAX_PIX_POLLS = 200 // 200 × 3 s ≈ 10 minutos
let pollCount = 0

function startPolling(orderId: string) {
  stopPolling()
  pollCount = 0
  pollTimer = setInterval(() => {
    void poll(orderId)
  }, 3000)
  void poll(orderId)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function poll(orderId: string) {
  pollCount++
  if (pollCount > MAX_PIX_POLLS) {
    stopPolling()
    return
  }
  try {
    const order = await fetchOrder(orderId)
    if (order.status === 'paid') {
      paid.value = true
      stopPolling()
      emit('paid')
    }
  } catch {
    // mantém polling
  }
}

async function copyCode() {
  const code = props.checkout?.pix?.qr_code
  if (!code) return
  await navigator.clipboard.writeText(code)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<style scoped>
.pix-panel {
  margin-top: 20px;
  padding: 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-2);
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: stretch;
}
.pix-panel__title {
  margin: 0;
  font-size: 1.1rem;
}
.pix-panel__price {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--primary-strong, #e11d7a);
}
.pix-panel__hint {
  margin: 0;
  font-size: 0.9rem;
}
.pix-panel__qr {
  display: grid;
  place-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  align-self: center;
}
.pix-panel__qr img {
  display: block;
  width: 220px;
  height: 220px;
}
.pix-panel__copy {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}
.pix-panel__status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 0.92rem;
  color: var(--muted);
}
.pix-panel__status--paid {
  color: var(--success, #0a7a45);
  font-weight: 600;
}

@media (max-width: 560px) {
  .pix-panel__copy {
    grid-template-columns: 1fr;
  }
}
</style>
