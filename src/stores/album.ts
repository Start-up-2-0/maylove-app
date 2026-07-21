import { defineStore } from 'pinia'
import * as albumsApi from '@/api/albums'
import type {
  AlbumChapter,
  AlbumDetail,
  AlbumExperience,
  AlbumMemory,
  AlbumQr,
  AlbumSummary,
  AlbumTimeline,
} from '@/api/types'

interface AlbumState {
  list: AlbumSummary[]
  current: AlbumDetail | null
  chapters: AlbumChapter[]
  experiences: AlbumExperience[]
  loading: boolean
  saving: boolean
  error: string | null
}

export const useAlbumStore = defineStore('album', {
  state: (): AlbumState => ({
    list: [],
    current: null,
    chapters: [],
    experiences: [],
    loading: false,
    saving: false,
    error: null,
  }),

  getters: {
    albumId: (state) => state.current?.id ?? null,
    isEditing: (state) => state.current?.status === 'draft',
    memories: (state): AlbumMemory[] =>
      state.chapters.flatMap((chapter) => chapter.memories),
  },

  actions: {
    async fetchList(status?: string) {
      this.loading = true
      this.error = null
      try {
        this.list = await albumsApi.listAlbums(status)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Falha ao carregar álbuns.'
      } finally {
        this.loading = false
      }
    },

    async loadAlbum(id: string) {
      this.loading = true
      this.error = null
      try {
        this.current = await albumsApi.fetchAlbum(id)
        await Promise.all([this.loadChapters(id), this.loadExperiences(id)])
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Falha ao carregar o álbum.'
      } finally {
        this.loading = false
      }
    },

    async createAlbum(payload?: {
      category?: import('@/api/types').AlbumCategory
      title?: string
      honoree_names?: string
      theme?: string
    }) {
      this.saving = true
      this.error = null
      try {
        const album = await albumsApi.createAlbum(payload)
        this.current = album
        this.chapters = []
        this.experiences = []
        return album
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Falha ao criar o álbum.'
        throw err
      } finally {
        this.saving = false
      }
    },

    async updateAlbum(payload: Record<string, unknown>) {
      if (!this.current) return
      this.saving = true
      this.error = null
      try {
        this.current = await albumsApi.updateAlbum(this.current.id, payload)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Falha ao atualizar o álbum.'
        throw err
      } finally {
        this.saving = false
      }
    },

    async publishAlbum() {
      if (!this.current) return
      this.saving = true
      this.error = null
      try {
        this.current = await albumsApi.publishAlbum(this.current.id)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Falha ao publicar o álbum.'
        throw err
      } finally {
        this.saving = false
      }
    },

    async deleteAlbum(id: string) {
      await albumsApi.deleteAlbum(id)
      this.list = this.list.filter((album) => album.id !== id)
    },

    // ---- Capítulos ----

    async loadChapters(albumId: string) {
      this.chapters = await albumsApi.loadAlbumChaptersWithMemories(albumId)
    },

    async createChapter(payload: { title: string; sort_order?: number }) {
      if (!this.current) return
      const chapter = await albumsApi.createAlbumChapter(this.current.id, payload)
      this.chapters.push({ ...chapter, memories: chapter.memories ?? [] })
      return chapter
    },

    async updateChapter(chapterId: string, payload: { title?: string; sort_order?: number }) {
      if (!this.current) return
      const updated = await albumsApi.updateAlbumChapter(this.current.id, chapterId, payload)
      const index = this.chapters.findIndex((c) => c.id === chapterId)
      if (index !== -1) {
        this.chapters[index] = {
          ...updated,
          memories: this.chapters[index].memories ?? [],
        }
      }
      return updated
    },

    async removeChapter(chapterId: string) {
      if (!this.current) return
      await albumsApi.deleteAlbumChapter(this.current.id, chapterId)
      this.chapters = this.chapters.filter((c) => c.id !== chapterId)
    },

    // ---- Memórias ----

    async createMemory(chapterId: string, payload: import('@/api/types').AlbumMemoryPayload) {
      if (!this.current) return
      const memory = await albumsApi.createAlbumMemory(this.current.id, chapterId, payload)
      const chapter = this.chapters.find((c) => c.id === chapterId)
      if (chapter) chapter.memories.push(memory)
      return memory
    },

    async updateMemory(
      chapterId: string,
      memoryId: string,
      payload: Partial<import('@/api/types').AlbumMemoryPayload>,
    ) {
      if (!this.current) return
      const chapter = this.chapters.find((c) => c.id === chapterId)
      const existing = chapter?.memories.find((m) => m.id === memoryId)
      const memory = await albumsApi.updateAlbumMemory(
        this.current.id,
        chapterId,
        memoryId,
        payload,
        existing?.content_json,
      )
      if (chapter) {
        const index = chapter.memories.findIndex((m) => m.id === memoryId)
        if (index !== -1) chapter.memories[index] = memory
      }
      return memory
    },

    async removeMemory(chapterId: string, memoryId: string) {
      if (!this.current) return
      await albumsApi.deleteAlbumMemory(this.current.id, chapterId, memoryId)
      const chapter = this.chapters.find((c) => c.id === chapterId)
      if (chapter) chapter.memories = chapter.memories.filter((m) => m.id !== memoryId)
    },

    // ---- Experiências ----

    async loadExperiences(albumId: string) {
      this.experiences = await albumsApi.listAlbumExperiences(albumId)
    },

    async createExperience(payload: {
      type: import('@/api/types').ExperienceType
      memory_id?: string
      config: Record<string, unknown>
    }) {
      if (!this.current) return
      const experience = await albumsApi.createAlbumExperience(this.current.id, payload)
      this.experiences.push(experience)
      return experience
    },

    async updateExperience(
      experienceId: string,
      payload: {
        type?: import('@/api/types').ExperienceType
        config?: Record<string, unknown>
      },
    ) {
      if (!this.current) return
      const updated = await albumsApi.updateAlbumExperience(this.current.id, experienceId, payload)
      const index = this.experiences.findIndex((e) => e.id === experienceId)
      if (index !== -1) this.experiences[index] = updated
      return updated
    },

    async removeExperience(experienceId: string) {
      if (!this.current) return
      await albumsApi.deleteAlbumExperience(this.current.id, experienceId)
      this.experiences = this.experiences.filter((e) => e.id !== experienceId)
    },

    // ---- Linha do tempo / QR ----

    async fetchTimeline(range?: { from?: string; to?: string }): Promise<AlbumTimeline> {
      if (!this.current) throw new Error('Álbum não carregado.')
      return albumsApi.fetchAlbumTimeline(this.current.id, range)
    },

    async fetchQr(memoryId?: string): Promise<AlbumQr> {
      if (!this.current) throw new Error('Álbum não carregado.')
      return albumsApi.fetchAlbumQr(this.current.id, memoryId)
    },

    reset() {
      this.current = null
      this.chapters = []
      this.experiences = []
      this.error = null
    },
  },
})
