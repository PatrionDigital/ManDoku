import { create } from 'zustand';

type ViewMode = 'grid' | 'carousel';

interface CollectionState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  expandedSeries: string | null;
  setExpandedSeries: (seriesName: string | null) => void;
}

const savedViewMode = typeof window !== 'undefined'
  ? (localStorage.getItem('manga-shelf-view') as ViewMode | null) ?? 'grid'
  : 'grid';

export const useCollectionStore = create<CollectionState>((set) => ({
  viewMode: savedViewMode,
  setViewMode: (mode) => {
    localStorage.setItem('manga-shelf-view', mode);
    set({ viewMode: mode });
  },
  expandedSeries: null,
  setExpandedSeries: (seriesName) => set({ expandedSeries: seriesName }),
}));
