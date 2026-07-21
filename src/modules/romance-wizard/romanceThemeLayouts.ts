import { defineAsyncComponent, type Component } from 'vue'

const SpotifyThemeLayout = defineAsyncComponent(
  () => import('@/components/experience/romance-themes/SpotifyThemeLayout.vue'),
)
const CinemaThemeLayout = defineAsyncComponent(
  () => import('@/components/experience/romance-themes/CinemaThemeLayout.vue'),
)
const CurtainThemeLayout = defineAsyncComponent(
  () => import('@/components/experience/romance-themes/CurtainThemeLayout.vue'),
)

export const ROMANCE_THEME_LAYOUTS: Record<string, Component> = {
  'estilo-spotify': SpotifyThemeLayout,
  'estilo-cinema': CinemaThemeLayout,
  'cortina-amor': CurtainThemeLayout,
}

export function getRomanceThemeLayout(themeId?: string | null): Component | null {
  if (!themeId) return null
  return ROMANCE_THEME_LAYOUTS[themeId] ?? null
}

export function romanceThemeUsesInlinePlayer(themeId?: string | null): boolean {
  return Boolean(themeId && ROMANCE_THEME_LAYOUTS[themeId])
}
