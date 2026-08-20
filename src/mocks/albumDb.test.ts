import { describe, expect, it } from 'vitest'
import { albumDb } from './albumDb'

describe('albumDb', () => {
  it('mantém conteúdo rico ao atualizar um álbum', () => {
    const album = albumDb.create({ title: 'Álbum de teste' })

    albumDb.update(album.id, {
      content_json: { effects: ['stars'], future_option: { enabled: true } },
    })
    const updated = albumDb.update(album.id, {
      content_json: { presentation: 'memorial-luz' },
    })

    expect(updated?.content_json).toEqual({
      presentation: 'memorial-luz',
      effects: ['stars'],
      future_option: { enabled: true },
    })
  })

  it('cria capítulos, memórias e resolve fotos anexadas', () => {
    const album = albumDb.create({ title: 'Memorial de teste', category: 'memorial' })
    const media = albumDb.addMedia(album.id, 'photo-test', 'photo', 'foto.jpg')
    const chapter = albumDb.createChapter(album.id, { title: 'Recordações' })
    expect(media).toBeDefined()
    expect(chapter).toBeDefined()

    const memory = albumDb.createMemory(album.id, chapter!.id, {
      title: 'Um dia especial',
      content_json: { media_ids: [media!.id] },
    })

    expect(memory?.media_ids).toEqual([media!.id])
    expect(memory?.media).toEqual([
      expect.objectContaining({ id: media!.id, media_type: 'photo' }),
    ])
  })

  it('bloqueia publicação sem foto e publica um álbum válido', () => {
    const album = albumDb.create({ title: 'Publicação de teste' })
    expect(albumDb.validate(album.id)).toEqual({
      valid: false,
      errors: [
        expect.objectContaining({ field: 'photos', code: 'MIN_PHOTOS' }),
      ],
      warnings: [expect.objectContaining({ code: 'COVER_RECOMMENDED' })],
    })

    albumDb.addMedia(album.id, 'photo-publish', 'photo', 'capa.jpg')
    expect(albumDb.publish(album.id)?.status).toBe('published')
  })

  it('exige conteúdo essencial de um memorial', () => {
    const album = albumDb.create({ title: 'Em memória', category: 'memorial' })
    albumDb.update(album.id, { presentation: 'memorial-luz', content_json: { presentation: 'memorial-luz' } })
    albumDb.addMedia(album.id, 'photo-memorial-validation', 'photo', 'capa.jpg')

    const validation = albumDb.validate(album.id)
    expect(validation?.valid).toBe(false)
    expect(validation?.errors.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'MEMORIAL_HONOREE_REQUIRED',
      'MEMORIAL_BIOGRAPHY_REQUIRED',
      'MEMORIAL_CHAPTER_REQUIRED',
      'MEMORIAL_MEMORY_REQUIRED',
    ]))
  })

  it('rejeita período de vida cronologicamente inválido no memorial', () => {
    const album = albumDb.create({ title: 'Em memória', category: 'memorial' })
    albumDb.update(album.id, {
      honoree_names: 'Maria', dedication: 'Uma história de vida contada com muito carinho.',
      content_json: { presentation: 'memorial-luz', life_dates: { birth_date: '2020-01-01', death_date: '2019-01-01' } },
    })
    albumDb.addMedia(album.id, 'photo-life-dates', 'photo', 'capa.jpg')
    const chapter = albumDb.createChapter(album.id, { title: 'Recordações' })!
    albumDb.createMemory(album.id, chapter.id, { title: 'Memória' })

    expect(albumDb.validate(album.id)?.errors).toContainEqual(expect.objectContaining({ code: 'MEMORIAL_LIFE_DATES_INVALID' }))
  })

  it('atualiza os metadados editoriais de uma foto', () => {
    const album = albumDb.create({ title: 'Galeria editorial' })
    albumDb.addMedia(album.id, 'photo-metadata', 'photo', 'foto.jpg')
    const updated = albumDb.updateMedia(album.id, 'photo-metadata', {
      title: 'Nosso começo', caption: 'Um dia inesquecível.', memory_date: '2024-02-10', place_name: 'Recife, PE',
    })
    expect(updated).toMatchObject({ title: 'Nosso começo', caption: 'Um dia inesquecível.', memory_date: '2024-02-10', place_name: 'Recife, PE' })
  })

  it('substitui foto sem perder capa, ordem, metadados ou referências narrativas', () => {
    const album = albumDb.create({ title: 'Substituição segura' })
    const first = albumDb.addMedia(album.id, 'photo-old', 'photo', 'antiga.jpg')!
    albumDb.addMedia(album.id, 'photo-second', 'photo', 'segunda.jpg')
    const replacement = albumDb.addMedia(album.id, 'photo-new', 'photo', 'nova.jpg')!
    albumDb.updateMedia(album.id, first.id, {
      title: 'Momento principal', caption: 'Legenda preservada', memory_date: '2025-01-03', place_name: 'São Paulo',
    })
    albumDb.update(album.id, { book_config: { cover: { media_id: first.id } } })
    const chapter = albumDb.createChapter(album.id, { title: 'História' })!
    albumDb.createMemory(album.id, chapter.id, { title: 'Começo', content_json: { media_ids: [first.id] } })

    const result = albumDb.replaceMedia(album.id, first.id, replacement.id)
    const updated = albumDb.get(album.id)!

    expect(result).toMatchObject({ id: replacement.id, sort_order: first.sort_order, title: 'Momento principal', caption: 'Legenda preservada' })
    expect(updated.media.map((media) => media.id)).not.toContain(first.id)
    expect((updated.book_config as { cover?: { media_id?: string } }).cover?.media_id).toBe(replacement.id)
    expect(albumDb.memories(album.id, chapter.id)?.[0]?.media_ids).toEqual([replacement.id])
  })
})
