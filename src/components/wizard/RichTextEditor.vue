<template>
  <div class="rte" :class="{ 'rte--focused': focused }">
    <div class="rte__toolbar" role="toolbar" aria-label="Formatação">
      <button
        v-for="tool in tools"
        :key="tool.id"
        type="button"
        class="rte__btn"
        :class="{ 'rte__btn--active': tool.cmd && activeStates[tool.cmd] }"
        :title="tool.label"
        :aria-label="tool.label"
        @mousedown.prevent
        @click="run(tool)"
      >
        <span class="rte__ico" v-html="tool.icon" />
      </button>
    </div>

    <div
      ref="editable"
      class="rte__area"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      :data-placeholder="placeholder"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keyup="syncStates"
      @mouseup="syncStates"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
  }>(),
  { modelValue: '', placeholder: 'Escreva sua mensagem...' },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const editable = ref<HTMLElement | null>(null)
const focused = ref(false)

interface Tool {
  id: string
  label: string
  icon: string
  cmd?: string
  action?: () => void
}

const activeStates = ref<Record<string, boolean>>({})

const tools: Tool[] = [
  { id: 'bold', label: 'Negrito', cmd: 'bold', icon: '<b>B</b>' },
  { id: 'italic', label: 'Itálico', cmd: 'italic', icon: '<i>I</i>' },
  { id: 'underline', label: 'Sublinhado', cmd: 'underline', icon: '<u>U</u>' },
  { id: 'strike', label: 'Tachado', cmd: 'strikeThrough', icon: '<s>S</s>' },
  {
    id: 'ul',
    label: 'Lista com marcadores',
    cmd: 'insertUnorderedList',
    icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" stroke-linecap="round"/></svg>',
  },
  {
    id: 'ol',
    label: 'Lista numerada',
    cmd: 'insertOrderedList',
    icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 6h11M10 12h11M10 18h11M4 6V4l-1 .5M3 18h2M3 12h2l-2 2.5h2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    id: 'link',
    label: 'Inserir link',
    action: insertLink,
    icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    id: 'clear',
    label: 'Limpar formatação',
    action: clearFormatting,
    icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h12M9 4l-2 16M15 4l1 8M5 20h6M14 15l6 6M20 15l-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
]

function emitValue() {
  const el = editable.value
  if (!el) return
  const html = el.innerHTML
  // Trata conteúdo "vazio" gerado pelo navegador (ex.: <br>).
  const isEmpty = el.textContent?.trim() === '' && !el.querySelector('img, li')
  emit('update:modelValue', isEmpty ? '' : html)
}

function onInput() {
  emitValue()
  syncStates()
}

function onFocus() {
  focused.value = true
}

function onBlur() {
  focused.value = false
  emitValue()
}

function run(tool: Tool) {
  editable.value?.focus()
  if (tool.action) {
    tool.action()
  } else if (tool.cmd) {
    document.execCommand(tool.cmd, false)
  }
  emitValue()
  syncStates()
}

function insertLink() {
  const url = window.prompt('URL do link (ex.: https://...)')
  if (!url) return
  const safe = /^(https?:|mailto:)/i.test(url) ? url : `https://${url}`
  document.execCommand('createLink', false, safe)
}

function clearFormatting() {
  document.execCommand('removeFormat', false)
  document.execCommand('unlink', false)
}

function syncStates() {
  const states: Record<string, boolean> = {}
  for (const tool of tools) {
    if (!tool.cmd) continue
    try {
      states[tool.cmd] = document.queryCommandState(tool.cmd)
    } catch {
      states[tool.cmd] = false
    }
  }
  activeStates.value = states
}

function syncFromModel() {
  const el = editable.value
  if (!el) return
  if (el.innerHTML !== (props.modelValue || '')) {
    el.innerHTML = props.modelValue || ''
  }
}

// Só sincroniza a partir do modelo quando o editor não está em foco,
// para não atrapalhar a digitação/posição do cursor.
watch(
  () => props.modelValue,
  () => {
    if (!focused.value) syncFromModel()
  },
)

onMounted(() => {
  syncFromModel()
  try {
    document.execCommand('styleWithCSS', false, 'false')
  } catch {
    /* noop */
  }
})

onBeforeUnmount(() => {
  /* nada a limpar */
})
</script>

<style scoped>
.rte {
  border: 1px solid var(--border-input, var(--border-strong));
  border-radius: var(--radius-md);
  background: var(--surface);
  overflow: hidden;
  transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.rte--focused {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.rte__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-3);
}
.rte__btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: background var(--dur) var(--ease), color var(--dur) var(--ease);
}
.rte__btn:hover {
  color: var(--ink);
  background: var(--surface);
}
.rte__btn--active {
  color: var(--primary-strong);
  background: var(--primary-soft, color-mix(in srgb, var(--primary) 16%, transparent));
}
.rte__ico {
  display: grid;
  place-items: center;
  font-size: 0.95rem;
  line-height: 1;
  width: 16px;
  height: 16px;
}
.rte__area {
  min-height: 120px;
  padding: 14px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text);
  outline: none;
}
.rte__area:empty::before {
  content: attr(data-placeholder);
  color: var(--placeholder, var(--muted));
  pointer-events: none;
}
.rte__area :deep(ul),
.rte__area :deep(ol) {
  padding-left: 1.5em;
  margin: 0.4em 0;
}
.rte__area :deep(a) {
  color: var(--primary-strong);
  text-decoration: underline;
}
.rte__area :deep(strong),
.rte__area :deep(b) {
  font-weight: 700;
}
</style>
