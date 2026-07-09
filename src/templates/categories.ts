import type { TemplateDefinition } from './types'

/**
 * Categoria da homenagem (ocasião). É a primeira escolha do usuário: ao selecionar
 * uma categoria, mostramos apenas os templates desenvolvidos para aquele tema.
 *
 * O campo `category` de cada TemplateDefinition guarda o `slug` de uma categoria
 * daqui. Adicionar uma nova categoria = acrescentar um item neste array e apontar
 * o `category` dos templates para o slug correspondente. Nada mais precisa mudar.
 */
export interface TemplateCategory {
  slug: string
  label: string
  icon: string
  description: string
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    slug: 'amor',
    label: 'Declaração de Amor',
    icon: '🥰',
    description: 'Diga tudo o que sente com uma experiência romântica e marcante.',
  },
  {
    slug: 'pedido-namoro',
    label: 'Pedido de Namoro',
    icon: '❤️',
    description: 'Um convite especial para começar uma história a dois.',
  },
  {
    slug: 'pedido-casamento',
    label: 'Pedido de Casamento',
    icon: '💍',
    description: 'Transforme o "sim" em um momento inesquecível.',
  },
  {
    slug: 'casamento',
    label: 'Casamento',
    icon: '👰',
    description: 'Celebre a união com elegância e emoção.',
  },
  {
    slug: 'aniversario',
    label: 'Aniversário',
    icon: '🎂',
    description: 'Uma comemoração cheia de alegria e boas lembranças.',
  },
  {
    slug: 'dia-das-maes',
    label: 'Dia das Mães',
    icon: '💐',
    description: 'Uma homenagem cheia de carinho para quem cuida de tudo.',
  },
  {
    slug: 'dia-dos-pais',
    label: 'Dia dos Pais',
    icon: '👨',
    description: 'Um tributo à força e ao amor do pai.',
  },
  {
    slug: 'cha-de-bebe',
    label: 'Chá de Bebê',
    icon: '👶',
    description: 'Dê as boas-vindas a quem está chegando.',
  },
  {
    slug: 'formatura',
    label: 'Formatura',
    icon: '🎓',
    description: 'Celebre uma grande conquista e o começo de uma nova fase.',
  },
  {
    slug: 'natal',
    label: 'Natal',
    icon: '🎄',
    description: 'Espalhe o espírito natalino com mensagens acolhedoras.',
  },
  {
    slug: 'ano-novo',
    label: 'Ano Novo',
    icon: '🎆',
    description: 'Comece o ano desejando o melhor a quem você ama.',
  },
  {
    slug: 'memorial',
    label: 'Memorial',
    icon: '🕊️',
    description: 'Uma homenagem delicada para eternizar memórias.',
  },
  {
    slug: 'agradecimento',
    label: 'Agradecimento',
    icon: '✨',
    description: 'Reconheça e agradeça a quem fez a diferença.',
  },
  {
    slug: 'datas',
    label: 'Datas Comemorativas',
    icon: '🎉',
    description: 'Marque as ocasiões especiais do calendário.',
  },
  {
    slug: 'outras',
    label: 'Outras Homenagens',
    icon: '❤️',
    description: 'Uma experiência versátil para qualquer tipo de homenagem.',
  },
]

export const CATEGORY_MAP: Record<string, TemplateCategory> = Object.fromEntries(
  TEMPLATE_CATEGORIES.map((cat) => [cat.slug, cat]),
)

export function categoryLabel(slug: string | null | undefined): string {
  if (!slug) return 'Homenagem'
  return CATEGORY_MAP[slug]?.label ?? slug
}

export function categoryIcon(slug: string | null | undefined): string {
  if (!slug) return '❤️'
  return CATEGORY_MAP[slug]?.icon ?? '❤️'
}

/**
 * Categorias que possuem ao menos um template, na ordem canônica. Usado para
 * montar os filtros/coleções sem exibir categorias vazias.
 */
export function categoriesWithTemplates(defs: TemplateDefinition[]): TemplateCategory[] {
  const present = new Set(defs.map((def) => def.category))
  return TEMPLATE_CATEGORIES.filter((cat) => present.has(cat.slug))
}
