# Deploy no Railway — maylove-app

## Branches e ambientes

| Branch Git | Ambiente Railway | Workflow |
|------------|------------------|----------|
| `staging` | staging | `.github/workflows/deploy-staging.yml` |
| `main` | production | `.github/workflows/deploy-production.yml` |

PRs e pushes em `main`/`staging` executam **CI** (`.github/workflows/ci.yml`).

## Secrets GitHub (Settings → Secrets)

| Secret | Descrição |
|--------|-----------|
| `RAILWAY_TOKEN_STAGING` | Project token do environment **staging** no Railway |
| `RAILWAY_TOKEN_PRODUCTION` | Project token do environment **production** no Railway |

Crie os tokens em: Railway → Project → Settings → Tokens (um por environment).

**Desative** o auto-deploy nativo do Railway no serviço; o deploy é feito só via GitHub Actions.

## Variáveis no Railway (build do Vite)

Configure em cada environment do serviço **maylove-app**:

| Variável | Exemplo staging |
|----------|-----------------|
| `VITE_API_BASE_URL` | `https://api-staging.seudominio.com/api/v1` |
| `VITE_AUTH_TOKEN_HEADER` | `x-maylove-token` |
| `VITE_STORAGE_UPLOAD_URL` | `https://storage-staging.seudominio.com/api/v1` |
| `VITE_BILLING_ENABLED` | `false` em teste; `true` quando checkout estiver ativo |
| `MAYLOVE_API_ORIGIN` | URL interna do Symfony, por exemplo `http://maylove-api.railway.internal:8080` |

`MAYLOVE_API_ORIGIN` é usada em runtime pelo nginx para encaminhar `/h/{slug}` ao Symfony. Essa rota injeta os metadados Open Graph no `index.html` compilado antes de entregá-lo ao navegador ou crawler.

## Build local

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8080/api/v1 \
  --build-arg VITE_STORAGE_UPLOAD_URL=http://localhost:8081/api/v1 \
  -t maylove-app .
docker run -p 8080:8080 -e PORT=8080 maylove-app
```

## Healthcheck

`GET /health` — definido em `railway.toml`.

## Fluxo Git recomendado

```
feature/* → PR → staging → PR → main
```

- Merge em `staging` → deploy automático no Railway staging.
- Merge em `main` → deploy automático no Railway production.
