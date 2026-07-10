<template>
  <component
    :is="tag"
    class="logo"
    :class="[`logo--${size}`, `logo--${variant}`, attrs.class]"
    v-bind="rootAttrs"
  >
    <LogoMark :size="markSize" :variant="markVariant" class="logo__mark" />
    <span v-if="showText" class="logo__text">
      May<span class="logo__accent">Lov</span>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { RouterLink } from 'vue-router'
import LogoMark from './LogoMark.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    variant?: 'light' | 'dark' | 'sidebar'
    showText?: boolean
    to?: string
  }>(),
  {
    size: 'md',
    variant: 'light',
    showText: true,
    to: undefined,
  },
)

const attrs = useAttrs()

const tag = computed(() => (props.to ? RouterLink : 'span'))

const rootAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  if (props.to) return { to: props.to, ...rest }
  return rest
})

const markSize = computed(() => {
  if (props.size === 'sm') return 18
  if (props.size === 'lg') return 28
  return 22
})

const markVariant = computed(() => {
  if (props.variant === 'sidebar') return 'mono'
  return props.variant
})
</script>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
}

.logo__text {
  font-family: var(--font-display);
  font-size: 1.22rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--ink);
}

.logo--sm .logo__text {
  font-size: 1.05rem;
}

.logo--lg .logo__text {
  font-size: 1.45rem;
}

.logo__accent {
  color: var(--primary);
}

.logo--dark .logo__text {
  color: #faf8fa;
}

.logo--dark .logo__accent {
  color: #ffffff;
}

.logo--sidebar .logo__text {
  color: var(--sidebar-text);
}

.logo--sidebar .logo__accent {
  color: var(--primary);
}

.logo--sidebar .logo__mark {
  color: var(--primary);
}
</style>
