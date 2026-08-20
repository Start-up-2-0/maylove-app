<template>
  <div class="view help-view ml-fade-up">
    <header class="help-head">
      <p class="eyebrow">Central de ajuda</p>
      <h1 class="section-title">Como podemos ajudar?</h1>
      <p class="text-muted">Respostas rápidas para criar, publicar e compartilhar seu presente digital.</p>
    </header>

    <section class="help-grid" aria-label="Perguntas frequentes">
      <details v-for="item in questions" :key="item.question" class="ml-card help-item">
        <summary>{{ item.question }}</summary>
        <p>{{ item.answer }}</p>
      </details>
    </section>

    <section class="ml-card help-contact">
      <div>
        <h2>Ainda precisa de ajuda?</h2>
        <p class="text-muted">Informe o produto, a etapa e a mensagem exibida para facilitar o atendimento.</p>
      </div>
      <a class="ml-btn ml-btn--secondary" href="mailto:suporte@maylove.com.br">Falar com o suporte</a>
    </section>
  </div>
</template>

<script setup lang="ts">
const questions = [
  {
    question: 'Como começo uma nova criação?',
    answer: 'Escolha um formato no menu — Romance, Álbum, Mapa ou Buquê — e siga as etapas. O conteúdo é salvo automaticamente enquanto você avança.',
  },
  {
    question: 'Quais arquivos posso enviar?',
    answer: 'Fotos em JPEG, PNG ou WebP e mídias indicadas pelo próprio editor. O limite e a quantidade aparecem na etapa de upload.',
  },
  {
    question: 'Posso editar depois de publicar?',
    answer: 'Não. Revise o preview antes de publicar, pois a edição fica bloqueada após a publicação.',
  },
  {
    question: 'Como compartilho meu presente?',
    answer: 'Depois de publicar, use “Copiar link” no dashboard ou na tela de analytics e envie o endereço para quem você quiser.',
  },
  {
    question: 'O que fazer se uma tela não carregar?',
    answer: 'Atualize a página e tente novamente. Se continuar, envie ao suporte o nome da tela e a mensagem apresentada.',
  },
] as const
</script>

<style scoped>
.help-head { max-width: 48rem; margin-bottom: 28px; }
.help-head .text-muted { margin-top: 8px; }
.help-grid { display: grid; gap: 12px; max-width: 860px; }
.help-item { padding: 0; overflow: hidden; }
.help-item summary { cursor: pointer; padding: 20px 22px; font-weight: 700; color: var(--ink); }
.help-item p { padding: 0 22px 20px; color: var(--muted); line-height: 1.65; }
.help-contact { max-width: 860px; margin-top: 22px; padding: 22px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px; }
.help-contact h2 { font-size: 1.2rem; margin-bottom: 4px; }
</style>
