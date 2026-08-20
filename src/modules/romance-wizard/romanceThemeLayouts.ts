import { defineAsyncComponent, defineComponent, h, type Component } from 'vue'

type ImmersiveCollectionVariant =
  | 'floral'
  | 'cassette'
  | 'polaroid'
  | 'book'
  | 'bouquet'
  | 'treasure'
  | 'diary'
  | 'fairytale'
  | 'series'

const SpotifyThemeLayout = defineAsyncComponent(
  () => import('@/components/experience/romance-themes/SpotifyThemeLayout.vue'),
)
const CinemaThemeLayout = defineAsyncComponent(
  () => import('@/components/experience/romance-themes/CinemaThemeLayout.vue'),
)
const CurtainThemeLayout = defineAsyncComponent(
  () => import('@/components/experience/romance-themes/CurtainThemeLayout.vue'),
)
const GiftBoxThemeLayout = defineAsyncComponent(
  () => import('@/components/experience/romance-themes/GiftBoxThemeLayout.vue'),
)
const EnvelopeStoryThemeLayout = defineAsyncComponent(
  () => import('@/components/experience/romance-themes/EnvelopeStoryThemeLayout.vue'),
)
const RetrospectiveThemeLayout = defineAsyncComponent(
  () => import('@/components/experience/romance-themes/RetrospectiveThemeLayout.vue'),
)

const ImmersiveCollectionLayout = defineAsyncComponent(
  () => import('@/components/experience/romance-themes/ImmersiveCollectionLayout.vue'),
)

function immersiveLayout(variant: ImmersiveCollectionVariant): Component {
  return defineComponent({
    name: `ImmersiveCollection_${variant}`,
    inheritAttrs: false,
    setup(_, { attrs }) {
      return () => h(ImmersiveCollectionLayout as Component, { ...attrs, variant } as never)
    },
  })
}

export const ROMANCE_THEME_LAYOUTS: Record<string, Component> = {
  'estilo-spotify': SpotifyThemeLayout,
  'estilo-cinema': CinemaThemeLayout,
  'cortina-amor': CurtainThemeLayout,
  'caixa-presente': GiftBoxThemeLayout,
  'envelope-story': EnvelopeStoryThemeLayout,
  retrospectiva: RetrospectiveThemeLayout,
  'poesia-floral': immersiveLayout('floral'),
  'retro-cassete': immersiveLayout('cassette'),
  polaroid: immersiveLayout('polaroid'),
  livro: immersiveLayout('book'),
  buque: immersiveLayout('bouquet'),
  'mapa-tesouro': immersiveLayout('treasure'),
  diario: immersiveLayout('diary'),
  disney: immersiveLayout('fairytale'),
  'nossa-serie': immersiveLayout('series'),
}

const INLINE_PLAYER_THEMES = new Set([
  'estilo-spotify',
  'estilo-cinema',
  'cortina-amor',
  'caixa-presente',
  'envelope-story',
  'retrospectiva',
])

export function getRomanceThemeLayout(themeId?: string | null): Component | null {
  if (!themeId) return null
  return ROMANCE_THEME_LAYOUTS[themeId] ?? null
}

export function romanceThemeUsesInlinePlayer(themeId?: string | null): boolean {
  return Boolean(themeId && INLINE_PLAYER_THEMES.has(themeId))
}
