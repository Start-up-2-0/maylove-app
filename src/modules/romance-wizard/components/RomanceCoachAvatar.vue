<template>
  <div class="rom-coach-avatar" :class="{ 'rom-coach-avatar--lg': large }" aria-hidden="true">
    <div class="rom-coach-avatar__ring">
      <svg class="rom-coach-avatar__svg" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="url(#romCoachBg)" />
        <ellipse cx="32" cy="38" rx="14" ry="12" fill="#fecdd3" />
        <circle cx="32" cy="26" r="11" fill="#ffe4e6" />
        <circle cx="28" cy="24" r="1.5" fill="#881337" />
        <circle cx="36" cy="24" r="1.5" fill="#881337" />
        <path d="M28 30c2 2 6 2 8 0" stroke="#be123c" stroke-width="1.5" stroke-linecap="round" />
        <path
          d="M12 28c8-6 16-2 18 6M52 28c-8-6-16-2-18 6"
          stroke="#fb7185"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path d="M44 18c6 0 10 4 8 8-2 4-8 2-10-2" fill="#f43f5e" opacity="0.85" />
        <defs>
          <linearGradient id="romCoachBg" x1="8" y1="8" x2="56" y2="56">
            <stop stop-color="#fff1f2" />
            <stop offset="1" stop-color="#ffe4e6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <span v-if="showBadge" class="rom-coach-avatar__badge">♥</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    large?: boolean
    showBadge?: boolean
  }>(),
  {
    large: false,
    showBadge: true,
  },
)
</script>

<style scoped>
.rom-coach-avatar {
  position: relative;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
}
.rom-coach-avatar--lg {
  width: 64px;
  height: 64px;
}
.rom-coach-avatar__ring {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  padding: 3px;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--rom-accent, #e11d48) 35%, #fff),
    color-mix(in srgb, var(--rom-accent, #e11d48) 8%, #fff)
  );
  box-shadow:
    0 12px 28px -14px color-mix(in srgb, var(--rom-accent, #e11d48) 55%, transparent),
    inset 0 0 0 1px color-mix(in srgb, #fff 60%, transparent);
}
.rom-coach-avatar__svg {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}
.rom-coach-avatar__badge {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  font-size: 0.62rem;
  color: #fff;
  background: var(--rom-accent, #e11d48);
  border: 2px solid var(--surface, #fff);
  box-shadow: 0 4px 10px -4px color-mix(in srgb, var(--rom-accent, #e11d48) 70%, transparent);
}
</style>
