<template>
  <section class="mem-tributes" aria-labelledby="mem-tributes-title">
    <header class="mem-tributes__head">
      <h2 id="mem-tributes-title">Deixe sua homenagem</h2>
      <p>Acenda uma vela, envie flores ou escreva uma mensagem de carinho.</p>
    </header>

    <div class="mem-tributes__actions">
      <button type="button" class="mem-tribute-btn" @click="openModal('candle')">
        <span class="mem-tribute-btn__icon" aria-hidden="true">🕯️</span>
        <span>Acender vela</span>
        <small>Mensagem por 7 dias</small>
      </button>
      <button type="button" class="mem-tribute-btn" @click="openModal('flower')">
        <span class="mem-tribute-btn__icon" aria-hidden="true">💐</span>
        <span>Enviar flores</span>
        <small>Mensagem por 10 dias</small>
      </button>
      <button type="button" class="mem-tribute-btn" @click="openModal('message')">
        <span class="mem-tribute-btn__icon" aria-hidden="true">💌</span>
        <span>Deixar mensagem</span>
        <small>Depoimento de carinho</small>
      </button>
    </div>

    <div v-if="activeTributes.length" class="mem-tributes__list">
      <article
        v-for="item in activeTributes"
        :key="item.id"
        class="mem-tribute-card"
        :class="`mem-tribute-card--${item.type}`"
      >
        <span class="mem-tribute-card__icon" aria-hidden="true">{{ iconFor(item.type) }}</span>
        <div>
          <strong>{{ item.author }}</strong>
          <p>{{ item.message }}</p>
          <time>{{ formatDate(item.createdAt) }}</time>
        </div>
      </article>
    </div>

    <div v-if="modalOpen" class="mem-modal" @click.self="closeModal">
      <form class="mem-modal__panel" @submit.prevent="submitTribute">
        <header class="mem-modal__head">
          <h3>{{ modalTitle }}</h3>
          <button type="button" class="mem-modal__close" aria-label="Fechar" @click="closeModal">
            ×
          </button>
        </header>
        <label class="mem-field">
          <span>Seu nome</span>
          <input v-model="form.author" class="mem-input" maxlength="80" required />
        </label>
        <label class="mem-field">
          <span>Mensagem</span>
          <textarea
            v-model="form.message"
            class="mem-input"
            rows="4"
            maxlength="500"
            required
            placeholder="Escreva com carinho e respeito..."
          />
        </label>
        <footer class="mem-modal__foot">
          <button type="button" class="mem-btn mem-btn--ghost" @click="closeModal">Cancelar</button>
          <button type="submit" class="mem-btn mem-btn--primary">Enviar homenagem</button>
        </footer>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

type TributeType = 'candle' | 'flower' | 'message'

interface StoredTribute {
  id: string
  type: TributeType
  author: string
  message: string
  createdAt: string
  expiresAt: string | null
}

const props = defineProps<{ albumSlug: string }>()

const modalOpen = ref(false)
const modalType = ref<TributeType>('message')
const tributes = ref<StoredTribute[]>([])
const form = reactive({ author: '', message: '' })

const storageKey = computed(() => `maylove_memorial_tributes_${props.albumSlug}`)

const activeTributes = computed(() =>
  tributes.value
    .filter((item) => !item.expiresAt || new Date(item.expiresAt) > new Date())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)

const modalTitle = computed(() => {
  switch (modalType.value) {
    case 'candle':
      return 'Acender uma vela virtual'
    case 'flower':
      return 'Enviar flores virtuais'
    default:
      return 'Deixar uma mensagem'
  }
})

onMounted(() => {
  loadTributes()
})

function loadTributes() {
  try {
    const raw = localStorage.getItem(storageKey.value)
    tributes.value = raw ? (JSON.parse(raw) as StoredTribute[]) : []
  } catch {
    tributes.value = []
  }
}

function persist() {
  localStorage.setItem(storageKey.value, JSON.stringify(tributes.value))
}

function openModal(type: TributeType) {
  modalType.value = type
  form.author = ''
  form.message = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function submitTribute() {
  const now = new Date()
  const days = modalType.value === 'candle' ? 7 : modalType.value === 'flower' ? 10 : null
  const expiresAt = days
    ? new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
    : null

  tributes.value.unshift({
    id: crypto.randomUUID(),
    type: modalType.value,
    author: form.author.trim(),
    message: form.message.trim(),
    createdAt: now.toISOString(),
    expiresAt,
  })
  persist()
  closeModal()
}

function iconFor(type: TributeType): string {
  if (type === 'candle') return '🕯️'
  if (type === 'flower') return '💐'
  return '💌'
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}
</script>

<style scoped>
.mem-tributes {
  max-width: 720px;
  margin: 0 auto;
  padding: clamp(32px, 6vw, 56px) clamp(16px, 4vw, 24px);
}

.mem-tributes__head {
  text-align: center;
  margin-bottom: 28px;
}

.mem-tributes__head h2 {
  margin: 0 0 8px;
  font-family: var(--book-font-display, 'Cormorant Garamond', serif);
  font-size: clamp(1.6rem, 5vw, 2rem);
  font-weight: 500;
  color: var(--mem-ink, #f0ebe3);
}

.mem-tributes__head p {
  margin: 0;
  color: var(--mem-muted, #a89f94);
  font-size: 0.95rem;
}

.mem-tributes__actions {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  margin-bottom: 32px;
}

.mem-tribute-btn {
  display: grid;
  gap: 4px;
  justify-items: center;
  padding: 18px 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--mem-accent, #c9a86a) 28%, transparent);
  background: color-mix(in srgb, var(--mem-accent, #c9a86a) 8%, #1c1814);
  color: var(--mem-ink, #f0ebe3);
  cursor: pointer;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.mem-tribute-btn:hover {
  border-color: color-mix(in srgb, var(--mem-accent, #c9a86a) 50%, transparent);
  background: color-mix(in srgb, var(--mem-accent, #c9a86a) 14%, #1c1814);
  transform: translateY(-2px);
}

.mem-tribute-btn__icon {
  font-size: 1.6rem;
}

.mem-tribute-btn span:nth-child(2) {
  font-weight: 600;
  font-size: 0.92rem;
}

.mem-tribute-btn small {
  color: var(--mem-muted, #a89f94);
  font-size: 0.72rem;
}

.mem-tributes__list {
  display: grid;
  gap: 12px;
}

.mem-tribute-card {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: color-mix(in srgb, #fff 4%, #1c1814);
  border: 1px solid color-mix(in srgb, var(--mem-accent, #c9a86a) 16%, transparent);
}

.mem-tribute-card__icon {
  font-size: 1.4rem;
  line-height: 1;
}

.mem-tribute-card strong {
  display: block;
  color: var(--mem-accent, #c9a86a);
  font-size: 0.88rem;
  margin-bottom: 4px;
}

.mem-tribute-card p {
  margin: 0 0 6px;
  color: var(--mem-ink, #f0ebe3);
  font-size: 0.92rem;
  line-height: 1.55;
}

.mem-tribute-card time {
  font-size: 0.72rem;
  color: var(--mem-muted, #a89f94);
}

.mem-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
}

.mem-modal__panel {
  width: min(440px, 100%);
  padding: 22px;
  border-radius: 16px;
  background: #242018;
  border: 1px solid color-mix(in srgb, var(--mem-accent, #c9a86a) 24%, transparent);
  color: var(--mem-ink, #f0ebe3);
}

.mem-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.mem-modal__head h3 {
  margin: 0;
  font-family: var(--book-font-display, 'Cormorant Garamond', serif);
  font-size: 1.25rem;
}

.mem-modal__close {
  border: none;
  background: transparent;
  color: var(--mem-muted, #a89f94);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.mem-field {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
}

.mem-field span {
  font-size: 0.82rem;
  color: var(--mem-muted, #a89f94);
}

.mem-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--mem-accent, #c9a86a) 20%, transparent);
  background: #14110f;
  color: var(--mem-ink, #f0ebe3);
  font: inherit;
}

.mem-modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.mem-btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
}

.mem-btn--ghost {
  background: transparent;
  color: var(--mem-muted, #a89f94);
}

.mem-btn--primary {
  background: var(--mem-accent, #c9a86a);
  color: #14110f;
}
</style>
