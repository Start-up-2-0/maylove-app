<template>
  <div class="auth">
    <!-- Painel de branding -->
    <aside class="auth__brand">
      <div class="auth__brand-inner">
        <RouterLink to="/" class="auth__logo">
          <span class="auth__logo-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 21s-7.5-4.6-10-9.2C.6 8.9 2 5.5 5.2 5.1 7 4.9 8.7 5.8 12 8.6c3.3-2.8 5-3.7 6.8-3.5C22 5.5 23.4 8.9 22 11.8 19.5 16.4 12 21 12 21Z" />
            </svg>
          </span>
          May<span class="auth__logo-accent">Love</span>
        </RouterLink>

        <div class="auth__pitch">
          <h2 class="auth__headline">
            Homenagens digitais que emocionam.
          </h2>
          <p class="auth__lead">
            Crie páginas afetivas com fotos, música e efeitos — prontas para
            compartilhar em minutos.
          </p>
          <ul class="auth__features">
            <li v-for="feature in features" :key="feature">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ feature }}
            </li>
          </ul>
        </div>

        <p class="auth__quote">
          “Foi o presente mais especial que já dei.”
          <span>— Marina, sobre a homenagem da mãe</span>
        </p>
      </div>
    </aside>

    <!-- Slot do formulario -->
    <main class="auth__panel">
      <div class="auth__card ml-fade-up">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const features = [
  'Editor guiado em poucos passos',
  'Biblioteca de músicas e efeitos',
  'Página pública responsiva e rápida',
]
</script>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
}

.auth__brand {
  position: relative;
  overflow: hidden;
  color: #fff;
  padding: 48px;
  display: flex;
  background:
    radial-gradient(700px 400px at 80% 0%, rgba(217, 79, 122, 0.55) 0%, transparent 60%),
    radial-gradient(600px 500px at 0% 100%, rgba(124, 92, 255, 0.4) 0%, transparent 55%),
    linear-gradient(160deg, #2a1826, #1c1420);
}
.auth__brand::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: linear-gradient(180deg, transparent, black 30%, black 70%, transparent);
  pointer-events: none;
}
.auth__brand-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: min(440px, 100%);
  margin: auto;
}

.auth__logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
}
.auth__logo-mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(150deg, var(--primary-hover), var(--primary-strong));
  box-shadow: var(--shadow-primary);
}
.auth__logo-accent {
  color: var(--primary);
}

.auth__pitch {
  margin: 48px 0;
}
.auth__headline {
  color: #fff;
  font-size: clamp(2rem, 3.4vw, 2.9rem);
  line-height: 1.08;
}
.auth__lead {
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 1.05rem;
  max-width: 40ch;
}
.auth__features {
  list-style: none;
  margin: 28px 0 0;
  padding: 0;
  display: grid;
  gap: 13px;
}
.auth__features li {
  display: flex;
  align-items: center;
  gap: 11px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}
.auth__features svg {
  flex-shrink: 0;
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  padding: 4px;
  width: 24px;
  height: 24px;
}

.auth__quote {
  color: rgba(255, 255, 255, 0.72);
  font-style: italic;
  border-left: 2px solid var(--primary);
  padding-left: 16px;
  line-height: 1.5;
}
.auth__quote span {
  display: block;
  margin-top: 6px;
  font-style: normal;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.auth__panel {
  display: grid;
  place-items: center;
  padding: 40px 24px;
}
.auth__card {
  width: 100%;
  max-width: 420px;
}

@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .auth__brand {
    display: none;
  }
}
</style>
