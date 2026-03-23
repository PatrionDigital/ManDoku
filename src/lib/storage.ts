import { supabase } from './supabase';
import type { MangaVolume, StorageAdapter } from './types';

/** PostgreSQL unique constraint violation */
const PG_UNIQUE_VIOLATION = '23505';
export const DUPLICATE_ERROR = 'DUPLICATE';

interface VolumeRow {
  id: string;
  isbn: string;
  title: string;
  title_reading: string | null;
  title_en: string | null;
  series_name: string;
  volume_number: number;
  author: string;
  publisher: string;
  publish_date: string | null;
  thumbnail_url: string;
  added_at: string;
  added_by: string;
  household_id: string;
}

function mapRowToVolume(row: VolumeRow): MangaVolume {
  return {
    id: row.id,
    isbn: row.isbn,
    title: row.title,
    titleReading: row.title_reading ?? undefined,
    titleEn: row.title_en ?? undefined,
    seriesName: row.series_name,
    volumeNumber: row.volume_number,
    author: row.author,
    publisher: row.publisher,
    publishDate: row.publish_date ?? undefined,
    thumbnailUrl: row.thumbnail_url,
    addedAt: row.added_at,
    addedBy: row.added_by,
    householdId: row.household_id,
  };
}

function mapVolumeToRow(vol: Omit<MangaVolume, 'id'>): Omit<VolumeRow, 'id'> {
  return {
    isbn: vol.isbn,
    title: vol.title,
    title_reading: vol.titleReading ?? null,
    title_en: vol.titleEn ?? null,
    series_name: vol.seriesName,
    volume_number: vol.volumeNumber,
    author: vol.author,
    publisher: vol.publisher,
    publish_date: vol.publishDate ?? null,
    thumbnail_url: vol.thumbnailUrl,
    added_at: vol.addedAt,
    added_by: vol.addedBy,
    household_id: vol.householdId,
  };
}

export class SupabaseAdapter implements StorageAdapter {
  async getAllVolumes(householdId: string): Promise<MangaVolume[]> {
    const { data, error } = await supabase
      .from('manga_volumes')
      .select('*')
      .eq('household_id', householdId)
      .order('series_name')
      .order('volume_number');

    if (error) throw error;
    return (data as VolumeRow[]).map(mapRowToVolume);
  }

  async addVolume(volume: Omit<MangaVolume, 'id'>): Promise<MangaVolume> {
    const { data, error } = await supabase
      .from('manga_volumes')
      .insert(mapVolumeToRow(volume))
      .select()
      .single();

    if (error) {
      if (error.code === PG_UNIQUE_VIOLATION) {
        throw new Error(DUPLICATE_ERROR);
      }
      throw error;
    }
    return mapRowToVolume(data as VolumeRow);
  }

  async removeVolume(id: string): Promise<void> {
    const { error } = await supabase
      .from('manga_volumes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async hasVolume(isbn: string, householdId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('manga_volumes')
      .select('*', { count: 'exact', head: true })
      .eq('isbn', isbn)
      .eq('household_id', householdId);

    if (error) throw error;
    return (count ?? 0) > 0;
  }
}
