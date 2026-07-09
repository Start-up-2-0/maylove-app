<template>
  <div class="texts-step">
    <WizardStepHeader
      title="Textos e identidade"
      description="Alterações são salvas automaticamente após 2 segundos. Os campos abaixo se ajustam ao estilo de apresentação escolhido."
    />

    <div class="tx-context">
      <span class="tx-context__emoji" aria-hidden="true">{{ presentationEmoji }}</span>
      <span class="tx-context__text">
        Estilo de apresentação:
        <strong>{{ presentationLabel }}</strong>
        <span class="tx-context__hint">— {{ copy.contextHint }}</span>
      </span>
    </div>

    <section class="tx-section">
      <h3 class="tx-title">Identidade</h3>
      <p class="tx-hint">Como a homenagem se apresenta e onde ela vai morar.</p>
      <div class="tx-grid">
        <div class="ml-field">
          <label class="ml-label" for="t-title">{{ copy.titleLabel }}</label>
          <input
            id="t-title"
            v-model="form.title"
            class="ml-input"
            maxlength="120"
            :placeholder="copy.titlePlaceholder"
          />
        </div>
        <div v-if="copy.showSubtitle" class="ml-field">
          <label class="ml-label" for="t-subtitle">{{ copy.subtitleLabel }}</label>
          <input
            id="t-subtitle"
            v-model="form.subtitle"
            class="ml-input"
            maxlength="160"
            :placeholder="copy.subtitlePlaceholder"
          />
          <span class="ml-hint">{{ copy.subtitleHint }}</span>
        </div>

        <div class="ml-field span-2">
          <label class="ml-label" for="t-honoree">Nome do homenageado *</label>
          <input id="t-honoree" v-model="form.honoree_name" class="ml-input" required maxlength="120" placeholder="Para quem é a homenagem" />
        </div>

        <div class="ml-field span-2">
          <label class="ml-label" for="t-slug">Slug público</label>
          <input id="t-slug" v-model="form.slug" class="ml-input" placeholder="para-maria" />
          <span class="ml-hint">O endereço será /h/{{ form.slug || 'sua-homenagem' }}</span>
        </div>
      </div>
    </section>

    <section v-if="copy.showProposal" class="tx-section">
      <h3 class="tx-title">O pedido</h3>
      <p class="tx-hint">A grande pergunta e a comemoração — o coração do estilo Pedido Interativo.</p>
      <div class="tx-grid">
        <div class="ml-field span-2">
          <label class="ml-label" for="t-question">Pergunta do pedido *</label>
          <input
            id="t-question"
            v-model="form.question"
            class="ml-input"
            maxlength="160"
            placeholder="Ex.: Aceita namorar comigo?"
          />
          <span class="ml-hint">Aparece em destaque no final, junto dos botões “Sim” e “Não”.</span>
        </div>
        <div class="ml-field span-2">
          <label class="ml-label" for="t-celebration">Mensagem ao aceitar</label>
          <input
            id="t-celebration"
            v-model="form.celebration"
            class="ml-input"
            maxlength="160"
            placeholder="Ex.: Você disse SIM! 🎉"
          />
          <span class="ml-hint">Exibida logo após a pessoa tocar em “Sim”.</span>
        </div>
      </div>
    </section>

    <section class="tx-section">
      <h3 class="tx-title">{{ copy.messageSectionTitle }}</h3>
      <p class="tx-hint">{{ copy.messageSectionHint }}</p>
      <div class="tx-grid">
        <div class="ml-field span-2">
          <label class="ml-label">{{ copy.messageLabel }} *</label>
          <RichTextEditor v-model="form.message" :placeholder="copy.messagePlaceholder" />
        </div>

        <div class="ml-field span-2">
          <label class="ml-label">{{ copy.closingLabel }}</label>
          <RichTextEditor v-model="form.closing_message" :placeholder="copy.closingPlaceholder" />
          <span class="ml-hint">{{ copy.closingHint }}</span>
        </div>
      </div>
    </section>

    <section class="tx-section">
      <h3 class="tx-title">Assinatura</h3>
      <p class="tx-hint">Quem envia a homenagem — aparece ao final, fechando a mensagem.</p>
      <div class="tx-grid">
        <div class="ml-field">
          <label class="ml-label" for="t-sender">De (remetente)</label>
          <input
            id="t-sender"
            v-model="form.sender_name"
            class="ml-input"
            maxlength="120"
            placeholder="Ex.: João"
          />
        </div>
        <div class="ml-field">
          <label class="ml-label" for="t-signature">Assinatura</label>
          <input
            id="t-signature"
            v-model="form.signature"
            class="ml-input"
            maxlength="120"
            placeholder="Ex.: Com amor, para sempre"
          />
        </div>
      </div>
    </section>

    <section v-if="copy.showDate" class="tx-section">
      <h3 class="tx-title">Detalhes</h3>
      <p class="tx-hint">{{ copy.dateHint }}</p>
      <div class="tx-grid">
        <div class="ml-field">
          <label class="ml-label" for="t-date">{{ copy.dateLabel }}</label>
          <input id="t-date" v-model="form.special_date" class="ml-input" type="date" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { resolvePresentationSchema } from '@/templates/presentationSchema'
import type { TemplateDefinition } from '@/templates/types'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import RichTextEditor from '@/components/wizard/RichTextEditor.vue'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  definition: TemplateDefinition
}>()

// A configuração da apresentação define quais campos de texto fazem sentido.
const schema = computed(() => resolvePresentationSchema(props.form.presentation, props.definition))

const copy = computed(() => schema.value.text)
const presentationLabel = computed(() => schema.value.presentationLabel)
const presentationEmoji = computed(() => schema.value.presentationEmoji)
</script>

<style scoped>
.tx-context {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 22px;
  border-radius: var(--radius-md);
  background: var(--surface-3);
  border: 1px solid var(--border);
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

.tx-section {
  margin-top: 26px;
}
.tx-section:first-of-type {
  margin-top: 4px;
}
.tx-title {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--ink);
}
.tx-hint {
  font-size: 0.86rem;
  color: var(--muted);
  margin: 2px 0 14px;
}

.tx-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.span-2 {
  grid-column: 1 / -1;
}

@media (max-width: 560px) {
  .tx-grid {
    grid-template-columns: 1fr;
  }
  .span-2 {
    grid-column: auto;
  }
}
</style>
