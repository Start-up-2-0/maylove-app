# MayLov App

Frontend Vue 3 do MayLov (dashboard, auth e página pública).

## Stack

- Vue 3 + TypeScript + Vite
- Pinia + Vue Router
- Axios com header `x-maylove-token`
- Tailwind CSS v4 + Flowbite + flowbite-vue

## Desenvolvimento

```bash
cp .env.example .env
npm install
npm run dev
```

App em `http://localhost:5173` com proxy `/api` → `http://localhost:8080`.

### Modo mockado (sem backend)

Para desenvolver o layout sem subir `maylove-api` (8080) nem `maylove-storages` (8081),
use o [MSW](https://mswjs.io) ativado por variável de ambiente:

```bash
# .env.local (já ignorado pelo git)
VITE_USE_MOCKS=true
```

Com a flag ligada, o app inicia com um token semeado no `localStorage`, cai direto no
`/dashboard` e todas as chamadas (auth, catálogo, wizard, upload e página pública) são
respondidas por dados em memória de `src/mocks/`. Com `VITE_USE_MOCKS=false` (ou ausente)
o app volta a falar com o backend real, sem nenhuma outra mudança.

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/login`, `/register` | Autenticação |
| `/verify-email?token=` | Confirmação de e-mail |
| `/dashboard` | Lista de homenagens com views |
| `/dashboard/tributes/new` | Escolher tipo + template e criar homenagem |
| `/dashboard/tributes/:id/edit` | Wizard multi-step (fotos → textos → música → efeitos → preview → publicar) |
| `/dashboard/tributes/:id` | Analytics (views, first/last viewed) |
| `/h/:slug` | Página pública SPA |

## Variáveis

| Variável | Exemplo |
|----------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` |
| `VITE_AUTH_TOKEN_HEADER` | `x-maylove-token` |
| `VITE_STORAGE_UPLOAD_URL` | `http://localhost:8081/api/v1` |

## Flowbite

O projeto usa [Flowbite](https://flowbite.com) com Tailwind CSS v4 e componentes Vue de `flowbite-vue`.

Exemplo de uso:

```vue
<script setup lang="ts">
import { FwbButton, FwbCard } from 'flowbite-vue'
</script>

<template>
  <FwbCard>
    <FwbButton color="pink">Salvar</FwbButton>
  </FwbCard>
</template>
```

Componentes interativos via `data-*` são reinicializados em `App.vue` após cada navegação.
