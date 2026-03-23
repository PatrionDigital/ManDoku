export interface MangaVolume {
  id: string;
  isbn: string;
  title: string;
  titleReading?: string;
  titleEn?: string;
  seriesName: string;
  volumeNumber: number;
  author: string;
  publisher: string;
  publishDate?: string;
  thumbnailUrl: string;
  addedAt: string;
  addedBy: string;
  householdId: string;
}

export interface Household {
  id: string;
  name: string;
  createdBy: string;
  inviteCode: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  householdId: string | null;
  avatarUrl?: string;
  locale: 'ja' | 'en';
}

export interface MangaSeries {
  seriesName: string;
  volumes: MangaVolume[];
  latestVolume: MangaVolume;
  totalOwned: number;
}

export interface StorageAdapter {
  getAllVolumes(householdId: string): Promise<MangaVolume[]>;
  addVolume(volume: Omit<MangaVolume, 'id'>): Promise<MangaVolume>;
  removeVolume(id: string): Promise<void>;
  hasVolume(isbn: string, householdId: string): Promise<boolean>;
}

export interface NdlMetadata {
  title: string;
  titleReading?: string;
  author: string;
  publisher: string;
  publishDate?: string;
  volumeNumber: number;
  seriesName: string;
  thumbnailUrl: string;
}
