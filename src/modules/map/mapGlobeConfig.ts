export const MAP_GLOBE_TEXTURE_URL =
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
export const MAP_GLOBE_BUMP_URL =
  'https://unpkg.com/three-globe/example/img/earth-topology.png'

export function resolveMapGlobeErrorMessage(error: unknown): string {
  if (error instanceof Error && /fetch|network|import|load/i.test(error.message)) {
    return 'Não foi possível carregar o globo 3D. Verifique sua conexão e tente novamente.'
  }
  return 'O globo 3D está temporariamente indisponível. Você ainda pode explorar os locais pelo mapa.'
}
