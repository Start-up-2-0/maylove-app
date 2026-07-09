import type { Directive } from 'vue'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

let observer: IntersectionObserver | null = null

function getObserver(): IntersectionObserver {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer?.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )
  return observer
}

/**
 * Diretiva de animacao de entrada. Uso: v-reveal ou v-reveal="delayMs".
 * A duracao e controlada pela CSS var --exp-reveal-dur (definida pelo tema).
 */
export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add('exp-reveal')
    if (typeof binding.value === 'number' && binding.value > 0) {
      el.style.transitionDelay = `${binding.value}ms`
    }
    if (prefersReducedMotion()) {
      el.classList.add('is-visible')
      return
    }
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
