import { apiClient, unwrap } from './client'
import type { ApiEnvelope, MusicTrackList, Template, TributeType } from './types'

export async function listTributeTypes(): Promise<TributeType[]> {
  const response = await apiClient.get<ApiEnvelope<TributeType[]>>('/tribute-types')
  return unwrap(response)
}

export async function listTemplates(tributeTypeId?: string): Promise<Template[]> {
  const response = await apiClient.get<ApiEnvelope<Template[]>>('/templates', {
    params: tributeTypeId ? { tribute_type_id: tributeTypeId } : undefined,
  })
  return unwrap(response)
}

export async function listMusicTracks(category?: string): Promise<MusicTrackList> {
  const response = await apiClient.get<ApiEnvelope<MusicTrackList>>('/music-tracks', {
    params: category ? { category } : undefined,
  })
  return unwrap(response)
}
