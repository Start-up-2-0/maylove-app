<template>
  <article class="collection" :data-variant="variant">
    <header class="collection__hero">
      <span class="collection__symbol" aria-hidden="true">{{ config.symbol }}</span>
      <p class="collection__eyebrow">{{ config.eyebrow }}</p>
      <h1>{{ content.title || coupleLabel }}</h1>
      <p class="collection__subtitle">{{ content.subtitle || config.subtitle }}</p>

      <div v-if="variant === 'cassette'" class="collection__cassette" aria-hidden="true">
        <span class="collection__cassette-label">MayLov mixtape</span>
        <div class="collection__cassette-window">
          <i></i><b>60</b><i></i>
        </div>
        <span class="collection__cassette-track">{{ coupleLabel }}</span>
      </div>

      <div v-else-if="variant === 'series'" class="collection__series-meta" aria-label="Informações da série">
        <span>98% de sintonia</span>
        <b>T1</b>
        <span>Para todos os apaixonados</span>
      </div>

      <div v-else-if="variant === 'polaroid'" class="collection__polaroid-note" aria-hidden="true">
        <span>feito à mão</span>
        <i>♥</i>
        <span>para guardar</span>
      </div>

      <div v-else-if="variant === 'book'" class="collection__book-cover" aria-hidden="true">
        <span>Volume I</span>
        <i>❦</i>
        <b>{{ coupleLabel }}</b>
        <small>Uma edição MayLov</small>
      </div>

      <div v-else-if="variant === 'bouquet'" class="collection__bouquet-art" aria-hidden="true">
        <i v-for="flower in 7" :key="flower">✿</i>
        <span></span>
      </div>

      <div v-else-if="variant === 'treasure'" class="collection__compass" aria-hidden="true">
        <span>N</span><span>L</span><i>◆</i><span>S</span><span>O</span>
      </div>

      <div v-else-if="variant === 'diary'" class="collection__diary-tab" aria-hidden="true">
        <span>{{ formattedToday }}</span>
        <b>confidencial</b>
      </div>

      <div v-else-if="variant === 'fairytale'" class="collection__fairytale-gate" aria-hidden="true">
        <span>✦</span><i></i><b>✧</b><i></i><span>✦</span>
      </div>

      <div v-if="coverPhoto" class="collection__cover-wrap">
        <img
          v-if="!failedMedia.has(coverMediaKey)"
          :src="coverPhoto"
          :alt="`Capa de ${coupleLabel}`"
          class="collection__cover"
          decoding="async"
          fetchpriority="high"
          @error="markMediaFailed(coverMediaKey)"
        />
        <div v-else class="collection__media-fallback collection__media-fallback--cover" role="img" :aria-label="`Foto de capa de ${coupleLabel} indisponível`">
          <span aria-hidden="true">♡</span>
          <small>Memória indisponível</small>
        </div>
      </div>
    </header>

    <RomanceCountdownGrid
      v-if="content.specialDate && content.specialDateConfig?.enabled !== false"
      :content="content"
      root-class="collection__countdown"
    />

    <section v-if="messageText" class="collection__message">
      <span aria-hidden="true">{{ config.messageSymbol }}</span>
      <p>{{ messageText }}</p>
      <strong v-if="content.signature">{{ content.signature }}</strong>
    </section>

    <section v-if="content.photos.length" class="collection__memories">
      <p class="collection__eyebrow">{{ config.galleryLabel }}</p>
      <h2>{{ config.galleryTitle }}</h2>
      <div class="collection__gallery">
        <figure v-for="(photo, index) in content.photos" :key="photo.id">
          <img
            v-if="!failedMedia.has(mediaKey(photo.id, index))"
            :src="photo.thumbnail || photo.url"
            :alt="`Memória ${index + 1} de ${content.photos.length}`"
            loading="lazy"
            decoding="async"
            @error="markMediaFailed(mediaKey(photo.id, index))"
          />
          <div v-else class="collection__media-fallback" role="img" :aria-label="`Memória ${index + 1} indisponível`">
            <span aria-hidden="true">♡</span>
            <small>Memória indisponível</small>
          </div>
          <figcaption>{{ captionFor(index) }}</figcaption>
        </figure>
      </div>
    </section>

    <section v-if="timelineItems.length" class="collection__journey">
      <p class="collection__eyebrow">{{ config.timelineLabel }}</p>
      <h2>{{ config.timelineTitle }}</h2>
      <ol>
        <li v-for="(item, index) in timelineItems" :key="`${item.title}-${index}`">
          <span>{{ index + 1 }}</span>
          <div>
            <small v-if="item.date">{{ formatDate(item.date) }}</small>
            <h3>{{ item.title }}</h3>
            <p v-if="item.description">{{ item.description }}</p>
            <em v-if="item.location">{{ item.location }}</em>
          </div>
        </li>
      </ol>
    </section>

    <footer class="collection__final">
      <span aria-hidden="true">{{ config.finalSymbol }}</span>
      <p>{{ content.closingMessage || config.finalMessage }}</p>
      <strong>{{ coupleLabel }}</strong>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import RomanceCountdownGrid from './RomanceCountdownGrid.vue'
import type { ExperienceContent, LayoutConfig, ResolvedTheme, TemplateDefinition } from '@/templates/types'
import { plainTimelineText } from '@/utils/timeline'

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

const props = defineProps<{
  definition: TemplateDefinition
  content: ExperienceContent
  theme: ResolvedTheme
  variant: ImmersiveCollectionVariant
  mode?: 'full' | 'preview'
  shareUrl?: string
  config?: LayoutConfig
}>()

const VARIANTS = {
  floral: { symbol: '❀', eyebrow: 'Poesia em flor', subtitle: 'Palavras que florescem para sempre', messageSymbol: '❝', galleryLabel: 'Jardim de memórias', galleryTitle: 'Cada instante, uma flor', timelineLabel: 'Estações', timelineTitle: 'Como nosso amor floresceu', finalSymbol: '❀', finalMessage: 'Onde existe amor, sempre é primavera.' },
  cassette: { symbol: '◉', eyebrow: 'Lado A · Nossa história', subtitle: 'Uma mixtape feita de memórias', messageSymbol: '▶', galleryLabel: 'Faixas favoritas', galleryTitle: 'Momentos em alta rotação', timelineLabel: 'Tracklist', timelineTitle: 'A trilha até aqui', finalSymbol: '⏹', finalMessage: 'Rebobine sempre que sentir saudade.' },
  polaroid: { symbol: '▣', eyebrow: 'Arquivo instantâneo', subtitle: 'Momentos revelados com carinho', messageSymbol: '✎', galleryLabel: 'Nosso mural', galleryTitle: 'Fotografias que contam tudo', timelineLabel: 'Anotações', timelineTitle: 'Datas no verso das fotos', finalSymbol: '♡', finalMessage: 'Algumas fotos guardam uma vida inteira.' },
  book: { symbol: '❦', eyebrow: 'Edição única', subtitle: 'Uma história escrita a quatro mãos', messageSymbol: '§', galleryLabel: 'Ilustrações', galleryTitle: 'Páginas que queremos reler', timelineLabel: 'Capítulos', timelineTitle: 'Nosso livro até agora', finalSymbol: '∞', finalMessage: 'O melhor capítulo ainda está por vir.' },
  bouquet: { symbol: '✿', eyebrow: 'Buquê digital', subtitle: 'Uma coleção de afetos escolhida para você', messageSymbol: '❁', galleryLabel: 'Flores e lembranças', galleryTitle: 'Tudo que cultivo ao seu lado', timelineLabel: 'Pétalas', timelineTitle: 'Momentos que perfumam a memória', finalSymbol: '💐', finalMessage: 'Este carinho nunca vai murchar.' },
  treasure: { symbol: '✦', eyebrow: 'Mapa secreto', subtitle: 'Coordenadas para o nosso maior tesouro', messageSymbol: '⌖', galleryLabel: 'Pistas encontradas', galleryTitle: 'Relíquias da nossa jornada', timelineLabel: 'Rota', timelineTitle: 'O caminho que nos trouxe aqui', finalSymbol: '◆', finalMessage: 'O tesouro sempre foi encontrar você.' },
  diary: { symbol: '⌇', eyebrow: 'Página reservada', subtitle: 'Confissões, lembranças e pequenos detalhes', messageSymbol: '✍', galleryLabel: 'Recortes', galleryTitle: 'Coisas que colei para não esquecer', timelineLabel: 'Entradas', timelineTitle: 'Trechos do nosso diário', finalSymbol: '🔒', finalMessage: 'Guarde esta página entre nós.' },
  fairytale: { symbol: '✧', eyebrow: 'Era uma vez nós dois', subtitle: 'Um conto feito de encontros reais', messageSymbol: '♕', galleryLabel: 'Reino de memórias', galleryTitle: 'Cenas do nosso encantamento', timelineLabel: 'Aventura', timelineTitle: 'Capítulos deste conto', finalSymbol: '🏰', finalMessage: 'E escolheram viver felizes, todos os dias.' },
  series: { symbol: '▶', eyebrow: 'MayLov apresenta', subtitle: 'Uma série original baseada em fatos reais', messageSymbol: '●', galleryLabel: 'Cenas', galleryTitle: 'Episódios inesquecíveis', timelineLabel: 'Temporadas', timelineTitle: 'Anteriormente em nossa história', finalSymbol: '★', finalMessage: 'Renovada para muitas temporadas.' },
} satisfies Record<ImmersiveCollectionVariant, Record<string, string>>

const config = computed(() => VARIANTS[props.variant])
const coupleLabel = computed(() => [props.content.senderName, props.content.honoreeName].filter(Boolean).join(' & ') || props.content.honoreeName || 'Nossa história')
const coverPhoto = computed(() => props.content.photos[0]?.url || props.content.photos[0]?.thumbnail || '')
const coverMediaKey = computed(() => mediaKey(props.content.photos[0]?.id, 0, 'cover'))
const messageText = computed(() => plainTimelineText(props.content.message))
const timelineItems = computed(() => props.content.timeline.filter((item) => item.title?.trim()))
const formattedToday = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())
const failedMedia = ref(new Set<string>())

function mediaKey(id: string | undefined, index: number, prefix = 'gallery') {
  return `${prefix}:${id || index}`
}

function markMediaFailed(key: string) {
  failedMedia.value = new Set([...failedMedia.value, key])
}

function captionFor(index: number) {
  const item = timelineItems.value[index]
  return item?.title || `Memória ${String(index + 1).padStart(2, '0')}`
}

function formatDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('pt-BR')
}
</script>

<style scoped>
.collection { --c-accent: #db2777; --c-bg: #fff7fb; --c-card: rgb(255 255 255 / 78%); --c-ink: #3f2433; --c-display: var(--c-ink); min-height: 100%; padding: clamp(24px, 6cqi, 72px) clamp(16px, 5cqi, 56px); background: var(--c-bg); color: var(--c-ink); font-family: var(--exp-font-body, Georgia, serif); font-size:var(--exp-type-body,1rem); overflow: hidden; }
.collection * { box-sizing: border-box; min-width: 0; }
.collection__hero, .collection__final { max-width: 820px; margin: 0 auto; text-align: center; }
.collection__hero { min-height:min(var(--exp-first-fold,760px),760px); }
.collection__symbol { display: block; color: var(--c-accent); font-size: 2rem; }
.collection__eyebrow { margin: 8px 0; color: var(--c-accent); font: 800 .72rem/1.2 system-ui; letter-spacing: .16em; text-transform: uppercase; }
.collection h1 { max-width: 100%; margin: 10px 0; color: var(--c-display); font: 600 var(--exp-type-display,clamp(1.8rem,10cqi,5.6rem))/.95 var(--exp-font-display, Georgia, serif); overflow-wrap: anywhere; }
.collection__subtitle { color: color-mix(in srgb, var(--c-display) 78%, transparent); font-style: italic; }
.collection__cassette { width:min(100%,430px); margin:30px auto 8px; padding:18px 24px 16px; border:3px solid #d7a76d; border-radius:18px; background:linear-gradient(155deg,#f0c58e,#b77d43); color:#3b2415; box-shadow:0 20px 45px rgb(0 0 0 / 32%),inset 0 0 0 2px rgb(255 255 255 / 22%); transform:rotate(-1deg); }
.collection__cassette-label,.collection__cassette-track { display:block; font:700 .7rem/1.2 'Courier New',monospace; letter-spacing:.14em; text-transform:uppercase; }
.collection__cassette-window { display:grid; grid-template-columns:56px 1fr 56px; align-items:center; gap:16px; margin:14px 0 12px; padding:10px 20px; border-radius:10px; background:#3a281e; color:#f5d7ae; }
.collection__cassette-window i { aspect-ratio:1; border:8px dotted #f5d7ae; border-radius:50%; box-shadow:inset 0 0 0 5px #735035; animation:collection-reel 5s linear infinite; }
.collection__cassette-window b { font-size:.75rem; }
.collection__series-meta { display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:8px 14px; margin:20px auto 6px; font:700 .75rem/1.3 Inter,system-ui,sans-serif; }
.collection__series-meta span:first-child { color:#46d369; }
.collection__series-meta b { padding:2px 6px; border:1px solid currentColor; }
.collection__series-meta span:last-child { color:#d1d5db; }
.collection__polaroid-note { display:flex; justify-content:center; align-items:center; gap:12px; margin:20px auto 4px; color:#57534e; font:600 .76rem/1.2 'Courier New',monospace; letter-spacing:.08em; transform:rotate(-1deg); }
.collection__polaroid-note i { color:#be123c; font:normal 1.1rem/1 Georgia,serif; }
.collection__book-cover { width:min(82%,390px); min-height:250px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; margin:28px auto 8px; padding:34px 30px; border:1px solid #d8bd72; outline:4px double #9d772d; outline-offset:-16px; border-radius:3px 14px 14px 3px; background:linear-gradient(90deg,#10291e 0 18px,#234c39 19px 24px,#183628 25px); color:#fff7df; box-shadow:14px 18px 0 #0d2118,0 30px 60px rgb(0 0 0 / 30%); }
.collection__book-cover span,.collection__book-cover small { font:700 .68rem/1.2 system-ui; letter-spacing:.18em; text-transform:uppercase; }
.collection__book-cover i { color:#e7bc62; font:normal 2.2rem/1 Georgia,serif; }
.collection__book-cover b { font:600 clamp(1.4rem,6cqi,2.4rem)/1.1 var(--exp-font-display,Georgia,serif); overflow-wrap:anywhere; }
.collection__bouquet-art { position:relative; width:220px; height:180px; margin:22px auto 0; }
.collection__bouquet-art i { position:absolute; left:50%; top:48%; color:#e11d74; font:normal 3.2rem/1 Georgia,serif; filter:drop-shadow(0 8px 12px rgb(190 24 93 / 20%)); transform-origin:50% 120px; }
.collection__bouquet-art i:nth-child(1) { transform:translate(-50%,-50%) rotate(-45deg) translateY(-48px); color:#fb7185; }
.collection__bouquet-art i:nth-child(2) { transform:translate(-50%,-50%) rotate(-30deg) translateY(-56px); color:#f9a8d4; }
.collection__bouquet-art i:nth-child(3) { transform:translate(-50%,-50%) rotate(-15deg) translateY(-62px); color:#e11d74; }
.collection__bouquet-art i:nth-child(4) { transform:translate(-50%,-50%) translateY(-66px); color:#fda4af; }
.collection__bouquet-art i:nth-child(5) { transform:translate(-50%,-50%) rotate(15deg) translateY(-62px); color:#be185d; }
.collection__bouquet-art i:nth-child(6) { transform:translate(-50%,-50%) rotate(30deg) translateY(-56px); color:#f472b6; }
.collection__bouquet-art i:nth-child(7) { transform:translate(-50%,-50%) rotate(45deg) translateY(-48px); color:#fb7185; }
.collection__bouquet-art span { position:absolute; left:50%; bottom:8px; width:70px; height:72px; border-radius:8px 8px 50% 50%; background:linear-gradient(145deg,#f8cddd,#d96b94); clip-path:polygon(0 0,100% 0,72% 100%,28% 100%); transform:translateX(-50%); }
.collection__compass { position:relative; display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(3,1fr); place-items:center; width:170px; aspect-ratio:1; margin:26px auto 8px; border:2px solid #79521d; border-radius:50%; background:radial-gradient(circle,#f8e7b9 0 34%,#d8b76c 35% 38%,#f2d99c 39%); color:#533713; box-shadow:0 18px 38px rgb(91 62 22 / 24%); transform:rotate(-4deg); }
.collection__compass::before,.collection__compass::after { content:''; position:absolute; background:#9a6700; }
.collection__compass::before { width:2px; height:82%; }
.collection__compass::after { width:82%; height:2px; }
.collection__compass span:nth-child(1) { grid-column:2; grid-row:1; }.collection__compass span:nth-child(2) { grid-column:3; grid-row:2; }.collection__compass i { z-index:1; grid-column:2; grid-row:2; color:#9a1e1e; font-size:2.2rem; transform:rotate(45deg); }.collection__compass span:nth-child(4) { grid-column:2; grid-row:3; }.collection__compass span:nth-child(5) { grid-column:1; grid-row:2; }
.collection__diary-tab { display:flex; justify-content:space-between; align-items:center; width:min(100%,560px); margin:24px auto 4px; padding:10px 16px 10px 54px; border-bottom:2px solid #a78bfa; background:linear-gradient(90deg,#fda4af 0 38px,transparent 39px); color:#5b477a; font:700 .7rem/1.2 'Courier New',monospace; letter-spacing:.1em; text-transform:uppercase; transform:rotate(-.7deg); }
.collection__diary-tab b { padding:5px 8px; border:1px solid #7c3aed; transform:rotate(2deg); }
.collection__fairytale-gate { display:flex; align-items:center; justify-content:center; gap:10px; width:min(100%,430px); margin:28px auto 4px; color:#ffd978; }
.collection__fairytale-gate i { width:90px; height:55px; border-top:2px solid currentColor; border-radius:50% 50% 0 0; box-shadow:0 -12px 28px rgb(255 217 120 / 16%); }
.collection__fairytale-gate span { animation:collection-star 2.8s ease-in-out infinite alternate; }.collection__fairytale-gate b { font-size:2rem; }
.collection__cover-wrap { width: min(100%, 620px); margin: 30px auto; padding: 12px; background: var(--c-card); box-shadow: 0 24px 70px rgb(49 20 36 / 18%); transform: rotate(-1deg); }
.collection__cover { display: block; width: 100%; max-height: 62vh; object-fit: cover; }
.collection__media-fallback { display:grid; place-items:center; align-content:center; gap:8px; width:100%; aspect-ratio:4/5; padding:20px; background:linear-gradient(145deg,color-mix(in srgb,var(--c-accent) 12%,var(--c-card)),var(--c-card)); color:color-mix(in srgb,var(--c-accent) 72%,var(--c-ink)); text-align:center; }
.collection__media-fallback span { font:normal clamp(1.8rem,8cqi,3.5rem)/1 Georgia,serif; }.collection__media-fallback small { font:700 var(--exp-type-caption,.75rem)/1.3 system-ui; letter-spacing:.08em; text-transform:uppercase; }
.collection__media-fallback--cover { min-height:clamp(220px,55cqi,560px); aspect-ratio:auto; }
.collection__countdown, .collection__message, .collection__memories, .collection__journey { max-width: 920px; margin: var(--exp-space-section,42px) auto; }
.collection__message { padding: clamp(24px, 6vw, 64px); background: var(--c-card); border: 1px solid color-mix(in srgb, var(--c-accent) 22%, transparent); text-align: center; box-shadow: 0 18px 50px rgb(49 20 36 / 10%); }
.collection__message > span { color: var(--c-accent); font-size: 2rem; }
.collection__message p { white-space: pre-wrap; font-size: clamp(1.05rem, 2.5vw, 1.35rem); line-height: 1.8; }
.collection h2 { margin: 6px 0 22px; font: 600 var(--exp-type-title,clamp(1.55rem,6cqi,3rem))/1 var(--exp-font-display, Georgia, serif); overflow-wrap: anywhere; }
.collection__gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr)); gap: 18px; }
.collection__gallery figure { margin: 0; padding: 10px 10px 18px; background: var(--c-card); box-shadow: 0 14px 35px rgb(49 20 36 / 12%); }
.collection__gallery figure:nth-child(even) { transform: rotate(1.5deg); }
.collection__gallery img { width: 100%; aspect-ratio: 4/5; object-fit: cover; transition:transform var(--exp-motion-base,420ms) var(--exp-ease-standard,ease); }
.collection__gallery figure:hover img { transform:scale(1.025); }
.collection__gallery figcaption { padding-top: 10px; text-align: center; font-style: italic; overflow-wrap: anywhere; }
.collection__journey ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.collection__journey li { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 14px; padding: 18px; background: var(--c-card); border-radius: 14px; overflow-wrap: anywhere; }
.collection__journey li > span { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: var(--c-accent); color: white; font-weight: 800; }
.collection__journey h3, .collection__journey p { margin: 3px 0; }
.collection__journey small, .collection__journey em { opacity: .66; }
.collection__final { padding: 60px 12px 24px; }
.collection__final span { font-size: 2.4rem; }
.collection__final { color: var(--c-display); }
.collection__final p { font: italic 1.2rem/1.6 var(--exp-font-display, Georgia, serif); }
.collection[data-variant='cassette'] { --c-accent:#ff9a44; --c-bg:linear-gradient(135deg,#23150e,#0e0907); --c-card:#332016; --c-ink:#ffe4c7; --c-display:#fff0dc; font-family:'Courier New',monospace; }
.collection[data-variant='cassette'] .collection__cover-wrap { width:min(100%,520px); margin-top:22px; padding:8px; border:1px solid #8b5b35; border-radius:2px; transform:none; }
.collection[data-variant='cassette'] .collection__gallery { grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr)); }
.collection[data-variant='cassette'] .collection__gallery figure { border-left:4px solid var(--c-accent); transform:none; }
.collection[data-variant='cassette'] .collection__journey li { border-radius:2px; border-bottom:1px dashed #865a3b; }
.collection[data-variant='cassette'] .collection__journey li > span { border-radius:2px; }
.collection[data-variant='polaroid'] { --c-accent:#475569; --c-bg:#e7e5e4; --c-card:#fff; --c-ink:#292524; }
.collection[data-variant='polaroid'] .collection__cover-wrap { width:min(88%,500px); padding:14px 14px 54px; transform:rotate(-2.2deg); }
.collection[data-variant='polaroid'] .collection__gallery { display:flex; flex-wrap:wrap; justify-content:center; gap:clamp(12px,3vw,28px); padding:22px 0; }
.collection[data-variant='polaroid'] .collection__gallery figure { flex:0 1 230px; padding:10px 10px 34px; }
.collection[data-variant='polaroid'] .collection__gallery figure:nth-child(3n+1) { transform:rotate(-2.5deg); }
.collection[data-variant='polaroid'] .collection__gallery figure:nth-child(3n+2) { transform:translateY(14px) rotate(2deg); }
.collection[data-variant='polaroid'] .collection__gallery figure:nth-child(3n) { transform:rotate(-1deg); }
.collection[data-variant='book'] { --c-accent:#e7bc62; --c-bg:#183628; --c-card:#f5eedc; --c-ink:#f8edcf; --c-display:#fff7df; }
.collection[data-variant='book'] .collection__message, .collection[data-variant='book'] .collection__memories, .collection[data-variant='book'] .collection__journey { color:#2f2619; }
.collection[data-variant='book'] .collection__message { border-radius:2px; box-shadow:8px 10px 0 #d8ccb0; text-align:left; }
.collection[data-variant='book'] .collection__gallery { grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr)); }
.collection[data-variant='book'] .collection__gallery figure { border:1px solid #ded2b8; box-shadow:6px 8px 0 #d8ccb0; transform:none; }
.collection[data-variant='book'] .collection__journey li { border-radius:0; border-left:4px double #b68a3a; }
.collection[data-variant='bouquet'] { --c-accent:#e11d74; --c-bg:radial-gradient(circle at top,#fff,#ffe4ef); --c-card:rgb(255 255 255 / 82%); --c-ink:#5b213d; }
.collection[data-variant='bouquet'] .collection__message { border-radius:48% 52% 44% 56% / 12% 14% 10% 13%; }
.collection[data-variant='bouquet'] .collection__gallery figure { border-radius:50% 50% 8px 8px; overflow:hidden; transform:none; }
.collection[data-variant='bouquet'] .collection__gallery img { border-radius:50% 50% 3px 3px; }
.collection[data-variant='treasure'] { --c-accent:#9a6700; --c-bg:#ead39b; --c-card:#f5e5b8; --c-ink:#4b3215; background-image:repeating-linear-gradient(12deg,transparent 0 30px,rgb(91 62 22 / 5%) 31px); }
.collection[data-variant='treasure'] .collection__message,.collection[data-variant='treasure'] .collection__journey li { border:1px dashed #8a642b; border-radius:2px; box-shadow:4px 6px 0 rgb(91 62 22 / 12%); }
.collection[data-variant='treasure'] .collection__journey ol { position:relative; }.collection[data-variant='treasure'] .collection__journey ol::before { content:''; position:absolute; left:18px; top:20px; bottom:20px; border-left:2px dashed #9a6700; }
.collection[data-variant='diary'] { --c-accent:#7c3aed; --c-bg:repeating-linear-gradient(#faf5ff 0 31px,#ddd6fe 32px); --c-card:rgb(255 255 255 / 88%); --c-ink:#3b2558; }
.collection[data-variant='diary'] .collection__message { position:relative; padding-left:clamp(44px,8vw,76px); border:0; border-left:2px solid #fda4af; box-shadow:none; text-align:left; transform:rotate(-.4deg); }
.collection[data-variant='diary'] .collection__gallery figure { box-shadow:3px 4px 0 rgb(91 71 122 / 14%); }
.collection[data-variant='diary'] .collection__journey li { border-radius:0; border-bottom:1px solid #c4b5fd; background:rgb(255 255 255 / 68%); }
.collection[data-variant='fairytale'] { --c-accent:#ffd978; --c-bg:radial-gradient(circle at top,#31347c,#11132f 70%); --c-card:rgb(255 255 255 / 12%); --c-ink:#f8f8ff; --c-display:#fff; }
.collection[data-variant='fairytale'] .collection__cover-wrap { border:1px solid #ffd978; border-radius:50% 50% 8px 8px; overflow:hidden; box-shadow:0 0 60px rgb(255 217 120 / 20%); transform:none; }
.collection[data-variant='fairytale'] .collection__gallery figure { border:1px solid rgb(255 217 120 / 32%); border-radius:120px 120px 8px 8px; overflow:hidden; transform:none; }
.collection[data-variant='fairytale'] .collection__gallery img { border-radius:110px 110px 0 0; }
.collection[data-variant='fairytale'] .collection__journey li { border:1px solid rgb(255 217 120 / 24%); }
.collection[data-variant='series'] { --c-accent:#ff3340; --c-bg:#080808; --c-card:#181818; --c-ink:#f5f5f5; --c-display:#fff; font-family:Inter,system-ui,sans-serif; }
.collection[data-variant='series'] h1 { text-transform:uppercase; letter-spacing:-.04em; }
.collection[data-variant='series'] .collection__hero { position:relative; max-width:1100px; min-height:min(var(--exp-first-fold,720px),720px); display:flex; flex-direction:column; justify-content:flex-end; padding:clamp(140px,28vh,300px) clamp(12px,5vw,64px) 44px; text-align:left; }
.collection[data-variant='series'] .collection__hero::after { content:''; position:absolute; inset:auto 0 0; height:45%; background:linear-gradient(transparent,#080808); pointer-events:none; }
.collection[data-variant='series'] .collection__hero > * { position:relative; z-index:1; }
.collection[data-variant='series'] .collection__cover-wrap { position:absolute; z-index:0; inset:0; width:100%; margin:0; padding:0; background:#111; box-shadow:none; transform:none; }
.collection[data-variant='series'] .collection__cover-wrap::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,rgb(8 8 8 / 82%) 0%,rgb(8 8 8 / 22%) 70%),linear-gradient(0deg,#080808 0%,transparent 55%); }
.collection[data-variant='series'] .collection__cover { height:100%; max-height:none; object-fit:cover; }
.collection[data-variant='series'] .collection__series-meta { justify-content:flex-start; }
.collection[data-variant='series'] .collection__gallery { display:flex; gap:10px; overflow-x:auto; scroll-snap-type:x mandatory; padding:8px 2px 20px; }
.collection[data-variant='series'] .collection__gallery figure { flex:0 0 min(72vw,310px); padding:0; background:#181818; box-shadow:none; transform:none; scroll-snap-align:start; }
.collection[data-variant='series'] .collection__gallery img { aspect-ratio:16/9; }
.collection[data-variant='series'] .collection__gallery figcaption { padding:12px; text-align:left; font-style:normal; }
@keyframes collection-reel { to { transform:rotate(1turn); } }
@keyframes collection-star { to { opacity:.42; transform:translateY(-4px) scale(.8); } }
@container (max-width: 420px) {
  .collection { width: 100%; max-width: 100%; padding: 24px 14px; }
  .collection__message { padding: 24px 18px; }
  .collection__gallery figure { transform: none; }
}
@media (max-width:600px) { .collection { padding-inline:14px; } .collection__message { padding:24px 18px; } .collection__gallery { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (prefers-reduced-motion:reduce) { .collection__cassette-window i,.collection__fairytale-gate span { animation:none; } }
</style>
