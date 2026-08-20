<template>
  <div class="share">
    <button class="share__btn" @click="copyLink">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      {{ copied ? 'Link copiado!' : 'Copiar link' }}
    </button>
    <a class="share__btn" :href="whatsappUrl" target="_blank" rel="noopener" @click="trackShare">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.7 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2s-1.1.2-3.6-.9-4-3.6-4.2-3.8-1.3-1.7-1.3-3.3.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.5l.9 2.1c.1.2.1.4 0 .6l-.4.6c-.2.2-.4.4-.2.8s.8 1.3 1.6 2c1.1.9 1.9 1.2 2.2 1.3.2.1.4.1.6-.1l.8-.9c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3.1.2.1.7-.1 1.2Z" />
      </svg>
      WhatsApp
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { recordPublicShare } from '@/api/tributes'

const props = defineProps<{ url: string; text?: string }>()

const copied = ref(false)

const whatsappUrl = computed(() => {
  const message = `${props.text ? props.text + ' ' : ''}${props.url}`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
})

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url)
    trackShare()
    copied.value = true
    setTimeout(() => (copied.value = false), 2200)
  } catch {
    /* ignore */
  }
}

function trackShare() {
  const match = new URL(props.url, window.location.origin).pathname.match(/^\/h\/([^/]+)$/)
  if (!match?.[1]) return
  const key = 'maylove_view_session'
  const sessionId = sessionStorage.getItem(key) ?? crypto.randomUUID()
  sessionStorage.setItem(key, sessionId)
  void recordPublicShare(decodeURIComponent(match[1]), sessionId).catch(() => undefined)
}
</script>

<style scoped>
.share {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.share__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--exp-ink, #241820);
  background: var(--exp-surface, #fff);
  border: 1px solid var(--exp-border, rgba(0, 0, 0, 0.1));
  transition: border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}
.share__btn:hover {
  border-color: var(--exp-primary, #e11d7a);
  color: var(--exp-primary, #e11d7a);
  transform: translateY(-1px);
}
</style>
