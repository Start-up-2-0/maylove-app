<template>
  <div class="publish-step">
    <WizardStepHeader
      title="Publicar"
      description="Valide os requisitos e publique ou inicie o pagamento avulso."
    />

    <FwbAlert
      v-if="paymentMessage"
      :type="paymentAlertType"
      class="mb-4"
    >
      {{ paymentMessage }}
    </FwbAlert>

    <div v-if="loadingValidation" class="flex items-center gap-2 text-gray-500 py-4">
      <FwbSpinner size="6" />
      Validando homenagem...
    </div>

    <section v-else class="mb-4">
      <FwbAlert v-if="validation?.valid" type="success">
        Tudo certo para publicar.
      </FwbAlert>
      <FwbAlert v-if="validation?.errors.length" type="danger">
        <ul class="list-disc pl-4">
          <li v-for="issue in validation.errors" :key="issue.field + issue.code">
            {{ issue.message }}
          </li>
        </ul>
      </FwbAlert>
      <FwbAlert v-if="validation?.warnings.length" type="warning" class="mt-3">
        <ul class="list-disc pl-4">
          <li v-for="issue in validation.warnings" :key="issue.field + issue.code">
            {{ issue.message }}
          </li>
        </ul>
      </FwbAlert>
    </section>

    <FwbCard v-if="tribute?.status === 'published'" class="p-5">
      <h3 class="text-lg font-semibold mb-2">Homenagem publicada!</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        Compartilhe o link com quem você ama.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-3">
        <FwbInput :model-value="publicUrl" readonly />
        <FwbButton color="pink" @click="copyLink">
          {{ copied ? 'Copiado!' : 'Copiar link' }}
        </FwbButton>
      </div>
      <FwbButton :href="publicUrl" tag="a" target="_blank" color="alternative">
        Abrir página
      </FwbButton>
    </FwbCard>

    <div v-else class="flex flex-wrap gap-3">
      <FwbButton
        color="pink"
        :disabled="!validation?.valid || publishing"
        :loading="publishing"
        @click="publish"
      >
        {{ hasSubscription ? 'Publicar agora' : 'Publicar (assinante)' }}
      </FwbButton>
      <FwbButton
        v-if="!hasSubscription"
        color="alternative"
        :disabled="!validation?.valid || checkingOut"
        :loading="checkingOut"
        @click="startCheckout"
      >
        Pagar R$ {{ priceLabel }} e publicar
      </FwbButton>
    </div>

    <p v-if="actionError" class="text-red-600 text-sm mt-3">{{ actionError }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { FwbAlert, FwbButton, FwbCard, FwbInput, FwbSpinner } from 'flowbite-vue'
import {
  checkoutTribute,
  fetchSubscription,
  publishTribute,
  validateTribute,
} from '@/api/tributes'
import type { TributeDetail, TributeValidation } from '@/api/types'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  tributeId: string
  tribute: TributeDetail | null
}>()

const emit = defineEmits<{ published: [] }>()

const route = useRoute()
const validation = ref<TributeValidation | null>(null)
const loadingValidation = ref(true)
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

const paymentAlertType = computed(() => {
  if (paymentStatus.value === 'success') return 'success'
  if (paymentStatus.value === 'failure') return 'danger'
  return 'warning'
})

onMounted(async () => {
  try {
    const [validationResult, subscription] = await Promise.all([
      validateTribute(props.tributeId),
      fetchSubscription(),
    ])
    validation.value = validationResult
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
    actionError.value =
      'Publicação indisponível. Verifique assinatura ou use o pagamento avulso.'
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
