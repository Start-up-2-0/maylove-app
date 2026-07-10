<template>
  <div class="auth">
    <aside class="auth__brand" aria-hidden="false">
      <div class="auth__brand-inner">
        <Logo to="/" variant="light" size="lg" />

        <div class="auth__pitch">
          <p class="auth__tagline">Para quem você ama</p>
          <h2 class="auth__headline">
            Um lugar para guardar o que o coração sente.
          </h2>
          <p class="auth__lead">
            Crie homenagens com fotos, música e palavras — memórias bonitas,
            prontas para emocionar quem você mais ama.
          </p>
          <ul class="auth__features">
            <li v-for="feature in features" :key="feature">
              <span class="auth__feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 21s-7.5-4.6-10-9.2C.6 8.9 2 5.5 5.2 5.1 7 4.9 8.7 5.8 12 8.6c3.3-2.8 5-3.7 6.8-3.5C22 5.5 23.4 8.9 22 11.8 19.5 16.4 12 21 12 21Z" />
                </svg>
              </span>
              {{ feature }}
            </li>
          </ul>
        </div>

        <blockquote class="auth__quote">
          “Foi o presente mais especial que já dei.”
          <cite>— Marina, sobre a homenagem da mãe</cite>
        </blockquote>
      </div>
    </aside>

    <main class="auth__panel">
      <div class="auth__card ml-fade-up">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Logo from '@/components/brand/Logo.vue'

const features = [
  'Editor guiado, passo a passo',
  'Músicas e efeitos que emocionam',
  'Página pronta para compartilhar',
]
</script>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: var(--bg);
}

.auth__brand {
  position: relative;
  overflow: hidden;
  padding: clamp(32px, 5vw, 56px);
  display: flex;
  background: var(--primary-soft);
  border-right: 1px solid color-mix(in srgb, var(--primary) 12%, var(--border));
}

.auth__brand::before {
  content: '';
  position: absolute;
  top: -120px;
  right: -80px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: #ffffff;
  opacity: 0.55;
  pointer-events: none;
}

.auth__brand::after {
  content: '';
  position: absolute;
  bottom: -100px;
  left: -60px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: var(--primary-softer);
  opacity: 0.9;
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
  min-height: min(640px, calc(100vh - 64px));
}

.auth__tagline {
  margin: 20px 0 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary-strong);
}

.auth__pitch {
  margin: 28px 0;
  flex: 1;
}

.auth__headline {
  color: var(--ink);
  font-size: clamp(1.85rem, 3.2vw, 2.65rem);
  line-height: 1.12;
  font-weight: 600;
}

.auth__lead {
  margin-top: 18px;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.65;
  max-width: 38ch;
}

.auth__features {
  list-style: none;
  margin: 28px 0 0;
  padding: 0;
  display: grid;
  gap: 14px;
}

.auth__features li {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text);
  font-weight: 500;
  font-size: 0.95rem;
}

.auth__feature-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: var(--primary);
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(225, 29, 122, 0.1);
}

.auth__quote {
  margin: 0;
  color: var(--muted);
  font-style: italic;
  font-size: 1rem;
  line-height: 1.55;
  border-left: 3px solid var(--primary);
  padding-left: 18px;
}

.auth__quote cite {
  display: block;
  margin-top: 8px;
  font-style: normal;
  font-size: 0.85rem;
  color: var(--subtle);
}

.auth__panel {
  display: grid;
  place-items: center;
  padding: clamp(24px, 4vw, 48px);
  background: var(--bg);
}

.auth__card {
  width: 100%;
  max-width: 420px;
  padding: clamp(28px, 4vw, 40px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }

  .auth__brand {
    display: none;
  }

  .auth__card {
    border: none;
    box-shadow: none;
    padding: 0;
    background: transparent;
  }
}
</style>
