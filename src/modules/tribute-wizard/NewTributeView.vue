<template>
  <div class="page">
    <div class="shell max-w-3xl">
      <header class="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-pink-600 mb-2">MayLove</p>
          <h1>Nova homenagem</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">
            Escolha o tipo e o template para começar.
          </p>
        </div>
        <FwbButton to="/dashboard" tag="router-link" color="alternative">
          Cancelar
        </FwbButton>
      </header>

      <section v-if="loading" class="text-gray-500 py-12 text-center">
        Carregando catálogo...
      </section>
      <section v-else-if="error" class="text-red-600 py-8">{{ error }}</section>

      <form v-else @submit.prevent="submit">
        <FwbCard class="p-6 mb-24">
          <div class="mb-8">
            <h2 class="text-lg font-semibold mb-4">1. Tipo de homenagem</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                v-for="type in tributeTypes"
                :key="type.id"
                type="button"
                class="rounded-2xl border-2 p-4 text-left transition-colors"
                :class="
                  selectedTypeId === type.id
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                "
                @click="selectType(type.id)"
              >
                <span class="text-2xl block mb-2">{{ type.icon || '♥' }}</span>
                <strong class="text-gray-900 dark:text-white">{{ type.name }}</strong>
              </button>
            </div>
          </div>

          <div v-if="selectedTypeId && templates.length">
            <h2 class="text-lg font-semibold mb-2">2. Template visual</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Deslize para escolher o visual da sua homenagem.
            </p>
            <TemplateCarousel v-model="selectedTemplateId" :templates="templates" />

            <div
              v-if="selectedTemplate"
              class="mt-4 rounded-2xl p-5 text-white"
              :style="{
                background: `linear-gradient(135deg, ${selectedTemplate.primary_color}, color-mix(in srgb, ${selectedTemplate.primary_color} 60%, #2a1520))`,
              }"
            >
              <p class="text-sm opacity-90">Prévia do template</p>
              <h3 class="text-xl font-semibold mt-1">{{ selectedTemplate.name }}</h3>
            </div>
          </div>

          <p v-if="submitError" class="text-red-600 text-sm mt-4">{{ submitError }}</p>
        </FwbCard>

        <footer class="wizard-footer-bar">
          <div class="wizard-footer-inner">
            <span class="text-sm text-gray-500 hidden sm:inline">
              {{ selectedTemplate?.name || 'Selecione um template' }}
            </span>
            <FwbButton
              type="submit"
              color="pink"
              class="ml-auto"
              :disabled="!canSubmit || submitting"
              :loading="submitting"
            >
              Começar wizard
            </FwbButton>
          </div>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbCard } from 'flowbite-vue'
import { listTemplates, listTributeTypes } from '@/api/catalog'
import { createTribute } from '@/api/tributes'
import type { Template, TributeType } from '@/api/types'
import TemplateCarousel from '@/components/wizard/TemplateCarousel.vue'

const router = useRouter()

const tributeTypes = ref<TributeType[]>([])
const templates = ref<Template[]>([])
const selectedTypeId = ref('')
const selectedTemplateId = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const submitError = ref('')

const canSubmit = computed(() => Boolean(selectedTypeId.value && selectedTemplateId.value))

const selectedTemplate = computed(() =>
  templates.value.find((template) => template.id === selectedTemplateId.value),
)

onMounted(async () => {
  try {
    tributeTypes.value = await listTributeTypes()
    if (tributeTypes.value[0]) {
      selectedTypeId.value = tributeTypes.value[0].id
    }
  } catch {
    error.value = 'Não foi possível carregar o catálogo.'
  } finally {
    loading.value = false
  }
})

watch(selectedTypeId, async (typeId) => {
  if (!typeId) return
  templates.value = await listTemplates(typeId)
  selectedTemplateId.value = templates.value[0]?.id ?? ''
})

async function selectType(typeId: string) {
  selectedTypeId.value = typeId
}

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  submitError.value = ''
  try {
    const tribute = await createTribute(selectedTypeId.value, selectedTemplateId.value)
    await router.push(`/dashboard/tributes/${tribute.id}/edit`)
  } catch {
    submitError.value =
      'Não foi possível criar a homenagem. Confirme seu e-mail e tente novamente.'
  } finally {
    submitting.value = false
  }
}
</script>
