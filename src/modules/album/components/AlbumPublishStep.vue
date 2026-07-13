<template>
  <div class="publish-step">
    <WizardStepHeader
      title="Publicar"
      description="Valide os requisitos e publique o livro digital para compartilhar o link."
    />

    <div v-if="loadingValidation" class="validation-loading">
      <span class="ml-spinner" />
      Validando álbum...
    </div>

    <section v-else class="validation">
      <div v-if="!publishBlocked" class="ml-alert ml-alert--success">
        <svg class="ml-alert__icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>Tudo certo para publicar.</span>
      </div>
      <div v-if="validation?.errors.length" class="ml-alert ml-alert--danger">
        <ul class="issue-list">
          <li v-for="issue in validation.errors" :key="issue.field + issue.code">{{ issue.message }}</li>
        </ul>
      </div>
    </section>

    <div v-if="album?.status === 'published'" class="ml-card published-card">
      <h3 class="published-card__title">Livro publicado!</h3>
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
        Publicar agora
      </button>
    </div>

    <p v-if="actionError" class="ml-alert ml-alert--danger mt-3">{{ actionError }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { publishAlbum, validateAlbum } from '@/api/albums'
import type { AlbumDetail, AlbumValidation } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  albumId: string
  album: AlbumDetail | null
}>()

const emit = defineEmits<{ published: [] }>()

const validation = ref<AlbumValidation | null>(null)
const loadingValidation = ref(true)
const publishing = ref(false)
const actionError = ref('')
const copied = ref(false)

const publishBlocked = computed(() => !validation.value?.valid)

const publicUrl = computed(() => {
  const slug = props.album?.slug
  if (!slug) return ''
  return `${window.location.origin}/a/${slug}`
})

onMounted(async () => {
  try {
    validation.value = await validateAlbum(props.albumId)
  } catch {
    actionError.value = 'Não foi possível validar o álbum.'
  } finally {
    loadingValidation.value = false
  }
})

async function publish() {
  publishing.value = true
  actionError.value = ''
  try {
    const result = await validateAlbum(props.albumId)
    validation.value = result
    if (!result.valid) {
      actionError.value = 'Corrija os itens pendentes antes de publicar.'
      return
    }
    await publishAlbum(props.albumId)
    emit('published')
  } catch (err) {
    actionError.value = resolveApiError(err, 'Não foi possível publicar o álbum.')
  } finally {
    publishing.value = false
  }
}

async function copyLink() {
  if (!publicUrl.value) return
  await navigator.clipboard.writeText(publicUrl.value)
  copied.value = true
}
</script>

<style scoped>
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
