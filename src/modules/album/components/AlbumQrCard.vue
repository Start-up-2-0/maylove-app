<template>
  <section class="qr-card ml-card">
    <header class="qr-card__head">
      <span class="qr-card__icon" aria-hidden="true">📱</span>
      <div>
        <h3 class="qr-card__title">{{ title }}</h3>
        <p class="qr-card__desc text-muted">{{ description }}</p>
      </div>
    </header>

    <div v-if="loading" class="qr-card__loading text-muted">Gerando QR Code...</div>
    <div v-else-if="error" class="ml-alert ml-alert--danger">{{ error }}</div>
    <template v-else-if="qrUrl">
      <div class="qr-card__body">
        <QrCode :value="qrUrl" :label="qrLabel" color="1c1814" />
        <div class="qr-card__side">
          <div class="qr-card__copy">
            <input :value="qrUrl" readonly class="ml-input" />
            <button type="button" class="ml-btn ml-btn--secondary ml-btn--sm" @click="copyLink">
              {{ copied ? 'Copiado!' : 'Copiar link' }}
            </button>
          </div>
          <div class="qr-card__exports">
            <button
              type="button"
              class="ml-btn ml-btn--primary ml-btn--sm"
              :disabled="!!exporting"
              @click="exportPng"
            >
              {{ exporting === 'png' ? 'Gerando…' : 'Baixar PNG (alta res.)' }}
            </button>
            <button
              type="button"
              class="ml-btn ml-btn--secondary ml-btn--sm"
              :disabled="!!exporting"
              @click="exportPdf"
            >
              {{ exporting === 'pdf' ? 'Gerando…' : 'Baixar PDF para impressão' }}
            </button>
          </div>
          <p v-if="exportError" class="qr-card__export-error">{{ exportError }}</p>
        </div>
      </div>
      <ul v-if="tips.length" class="qr-card__tips">
        <li v-for="tip in tips" :key="tip">{{ tip }}</li>
      </ul>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchAlbumQr } from '@/api/albums'
import { resolveApiError } from '@/api/errors'
import QrCode from '@/components/experience/shared/QrCode.vue'
import { downloadQrPdf, downloadQrPng, type QrExportLayout } from '../utils/exportQrAsset'

const props = withDefaults(
  defineProps<{
    albumId: string
    variant?: 'memorial' | 'default'
    headline?: string | null
    subtitle?: string | null
  }>(),
  { variant: 'default' },
)

const loading = ref(true)
const error = ref('')
const qrUrl = ref('')
const copied = ref(false)
const exporting = ref<'png' | 'pdf' | null>(null)
const exportError = ref('')

const title = computed(() =>
  props.variant === 'memorial' ? 'QR Code para lápide' : 'QR Code do álbum',
)

const description = computed(() =>
  props.variant === 'memorial'
    ? 'Baixe em alta resolução para gravar em medalhão, placa ou lápide — visitantes escaneiam e acessam o memorial.'
    : 'Baixe o QR Code ou compartilhe o link para abrir o álbum no celular.',
)

const qrLabel = computed(() =>
  props.variant === 'memorial' ? 'Escaneie para ver o memorial' : 'Escaneie para abrir',
)

const tips = computed(() =>
  props.variant === 'memorial'
    ? [
        'PNG 2400×2400 px — ideal para gravação a laser ou CNC.',
        'PDF formato A6 — pronto para impressão em gráfica.',
        'O link permanece ativo enquanto o memorial estiver publicado.',
      ]
    : [],
)

const exportLayout = computed((): QrExportLayout => ({
  url: qrUrl.value,
  headline:
    props.headline?.trim() ||
    (props.variant === 'memorial' ? 'Em memória' : undefined),
  subtitle: props.subtitle?.trim() || undefined,
  caption: qrLabel.value,
  qrColor: '1c1814',
}))

onMounted(async () => {
  try {
    const data = await fetchAlbumQr(props.albumId)
    qrUrl.value = data.url || data.public_url || ''
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível gerar o QR Code.')
  } finally {
    loading.value = false
  }
})

async function copyLink() {
  if (!qrUrl.value) return
  await navigator.clipboard.writeText(qrUrl.value)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 2000)
}

async function exportPng() {
  if (!qrUrl.value || exporting.value) return
  exporting.value = 'png'
  exportError.value = ''
  try {
    await downloadQrPng(exportLayout.value)
  } catch (err) {
    exportError.value = resolveApiError(err, 'Não foi possível gerar o PNG.')
  } finally {
    exporting.value = null
  }
}

async function exportPdf() {
  if (!qrUrl.value || exporting.value) return
  exporting.value = 'pdf'
  exportError.value = ''
  try {
    await downloadQrPdf(exportLayout.value)
  } catch (err) {
    exportError.value = resolveApiError(err, 'Não foi possível gerar o PDF.')
  } finally {
    exporting.value = null
  }
}
</script>

<style scoped>
.qr-card {
  padding: 22px;
  margin-top: 16px;
}

.qr-card__head {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.qr-card__icon {
  font-size: 1.5rem;
  line-height: 1;
}

.qr-card__title {
  margin: 0 0 4px;
  font-size: 1.1rem;
}

.qr-card__desc {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.qr-card__loading {
  padding: 12px 0;
}

.qr-card__body {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
}

.qr-card__side {
  flex: 1;
  min-width: 220px;
  display: grid;
  gap: 14px;
}

.qr-card__copy {
  display: grid;
  gap: 10px;
}

.qr-card__exports {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.qr-card__export-error {
  margin: 0;
  font-size: 0.84rem;
  color: var(--error, #c0392b);
}

.qr-card__tips {
  margin: 18px 0 0;
  padding-left: 18px;
  color: var(--muted);
  font-size: 0.86rem;
  line-height: 1.55;
}

.qr-card__tips li + li {
  margin-top: 6px;
}
</style>
