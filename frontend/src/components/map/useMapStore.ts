import { create } from 'zustand';
import { Map } from 'maplibre-gl';

type MapStore = {
  map: Map | null;
  setMap: (map: Map) => void;

  mapController: any;
  setMapController: (controller: any) => void;
};

export const useMapStore = create<MapStore>((set) => ({
  map: null,
  setMap: (map) => set({ map }),

  mapController: null,
  setMapController: (controller) => set({ mapController: controller }),
}));

