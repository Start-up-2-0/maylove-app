<template>
  <div class="texts-step wiz-step-content">
    <WizardStepHeader
      v-if="!embedded"
      title="Textos"
      description="Os campos se ajustam ao estilo de apresentação escolhido na etapa anterior."
    />

    <div class="wiz-card-stack">
      <section class="wiz-card tx-context">
        <span class="tx-context__emoji" aria-hidden="true">{{ presentationEmoji }}</span>
        <span class="tx-context__text">
          Estilo de apresentação:
          <strong>{{ presentationLabel }}</strong>
          <span class="tx-context__hint">— {{ copy.contextHint }}</span>
        </span>
      </section>

      <section class="wiz-card">
        <h3 class="wiz-card__title">{{ copy.titleLabel }}</h3>
        <p class="wiz-card__hint">Como a homenagem se apresenta na página.</p>
        <div class="wiz-field-grid">
          <label class="ml-field span-2">
            <span class="ml-label">{{ copy.titleLabel }}<template v-if="titleRequired"> *</template></span>
            <input
              v-model="form.title"
              class="ml-input"
              maxlength="120"
              :placeholder="copy.titlePlaceholder"
            />
          </label>
          <label v-if="copy.showSubtitle" class="ml-field span-2">
            <span class="ml-label">{{ copy.subtitleLabel }}</span>
            <input
              v-model="form.subtitle"
              class="ml-input"
              maxlength="160"
              :placeholder="copy.subtitlePlaceholder"
            />
            <span class="ml-hint">{{ copy.subtitleHint }}</span>
          </label>
        </div>
      </section>

      <section v-if="copy.showProposal" class="wiz-card">
        <h3 class="wiz-card__title">O pedido</h3>
        <p class="wiz-card__hint">A grande pergunta e a comemoração — o coração do estilo Pedido Interativo.</p>
        <div class="wiz-field-grid">
          <label class="ml-field span-2">
            <span class="ml-label">Pergunta do pedido *</span>
            <input
              v-model="form.question"
              class="ml-input"
              maxlength="160"
              placeholder="Ex.: Aceita namorar comigo?"
            />
            <span class="ml-hint">Aparece em destaque no final, junto dos botões “Sim” e “Não”.</span>
          </label>
          <label class="ml-field span-2">
            <span class="ml-label">Mensagem ao aceitar</span>
            <input
              v-model="form.celebration"
              class="ml-input"
              maxlength="160"
              placeholder="Ex.: Você disse SIM! 🎉"
            />
            <span class="ml-hint">Exibida logo após a pessoa tocar em “Sim”.</span>
          </label>
        </div>
      </section>

      <section class="wiz-card">
        <h3 class="wiz-card__title">{{ copy.messageSectionTitle }}</h3>
        <p class="wiz-card__hint">{{ copy.messageSectionHint }}</p>

        <template v-if="usesOptionalBlocks">
          <label class="tx-toggle">
            <input v-model="form.include_opening_message" type="checkbox" />
            <span>
              <strong>{{ copy.openingToggleLabel }}</strong>
              <small>{{ copy.openingToggleHint }}</small>
            </span>
          </label>
          <div v-if="form.include_opening_message" class="tx-grid tx-grid--toggled">
            <label class="ml-field span-2">
              <span class="ml-label">{{ copy.messageLabel }}</span>
              <RichTextEditor v-model="form.message" :placeholder="copy.messagePlaceholder" />
            </label>
          </div>

          <label class="tx-toggle">
            <input v-model="form.include_closing_message" type="checkbox" />
            <span>
              <strong>{{ copy.closingToggleLabel }}</strong>
              <small>{{ copy.closingToggleHint }}</small>
            </span>
          </label>
          <div v-if="form.include_closing_message" class="tx-grid tx-grid--toggled">
            <label class="ml-field span-2">
              <span class="ml-label">{{ copy.closingLabel }}</span>
              <RichTextEditor v-model="form.closing_message" :placeholder="copy.closingPlaceholder" />
              <span class="ml-hint">{{ copy.closingHint }}</span>
            </label>
          </div>
        </template>

        <div v-else class="wiz-field-grid">
          <label class="ml-field span-2">
            <span class="ml-label">
              {{ copy.messageLabel }}<template v-if="messageRequired"> *</template>
            </span>
            <RichTextEditor v-model="form.message" :placeholder="copy.messagePlaceholder" />
          </label>

          <label class="ml-field span-2">
            <span class="ml-label">{{ copy.closingLabel }}</span>
            <RichTextEditor v-model="form.closing_message" :placeholder="copy.closingPlaceholder" />
            <span class="ml-hint">{{ copy.closingHint }}</span>
          </label>
        </div>
      </section>

      <section class="wiz-card">
        <h3 class="wiz-card__title">Assinatura</h3>
        <p class="wiz-card__hint">Quem envia a homenagem — aparece ao final da experiência.</p>
        <div class="wiz-field-grid">
          <label class="ml-field">
            <span class="ml-label">De (remetente)</span>
            <input
              v-model="form.sender_name"
              class="ml-input"
              maxlength="120"
              placeholder="Ex.: João"
            />
          </label>
          <label class="ml-field">
            <span class="ml-label">Assinatura</span>
            <input
              v-model="form.signature"
              class="ml-input"
              maxlength="120"
              placeholder="Ex.: Com amor, para sempre"
            />
          </label>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { resolvePresentationSchema, layoutUsesOptionalTextBlocks } from '@/templates/presentationSchema'
import type { TemplateDefinition } from '@/templates/types'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import RichTextEditor from '@/components/wizard/RichTextEditor.vue'

const props = withDefaults(
  defineProps<{
    form: ReturnType<typeof useTributeWizard>['form']
    definition: TemplateDefinition | null | undefined
    embedded?: boolean
  }>(),
  { embedded: false },
)

const schema = computed(() => resolvePresentationSchema(props.form.presentation, props.definition))

const copy = computed(() => schema.value.text)
const titleRequired = computed(() => schema.value.required.includes('title'))
const messageRequired = computed(() => schema.value.required.includes('message'))
const usesOptionalBlocks = computed(() => layoutUsesOptionalTextBlocks(schema.value.layout))
const presentationLabel = computed(() => schema.value.presentationLabel)
const presentationEmoji = computed(() => schema.value.presentationEmoji)

function messageHasText(value?: string | null): boolean {
  return Boolean(value && value.replace(/<[^>]*>/g, '').trim())
}

watch(
  () => props.form.message,
  (value) => {
    if (usesOptionalBlocks.value && messageHasText(value)) {
      props.form.include_opening_message = true
    }
  },
)
</script>

<style scoped>
.tx-context {
  display: flex;
  align-items: center;
  gap: 10px;
}
.tx-context__emoji {
  font-size: 1.2rem;
  line-height: 1;
}
.tx-context__text {
  font-size: 0.9rem;
  color: var(--text);
}
.tx-context__text strong {
  color: var(--ink);
}
.tx-context__hint {
  color: var(--muted);
}

.tx-toggle {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 14px 0 0;
  cursor: pointer;
}
.tx-toggle input {
  margin-top: 4px;
  accent-color: var(--primary);
}
.tx-toggle strong {
  display: block;
  font-size: 0.92rem;
  color: var(--ink);
}
.tx-toggle small {
  display: block;
  margin-top: 2px;
  font-size: 0.82rem;
  color: var(--muted);
  line-height: 1.45;
}
.tx-grid--toggled {
  margin: 10px 0 18px;
  padding-left: 12px;
  border-left: 2px solid var(--border);
}
.span-2 {
  grid-column: 1 / -1;
}
</style>
