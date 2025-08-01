import { create } from 'zustand';
import { Map } from 'maplibre-gl';
import type { MapController } from "@maptiler/geocoding-control/types";

type MapStore = {
  map: Map | null;
  setMap: (map: Map) => void;

  mapController: MapController | null;
  setMapController: (controller: MapController) => void;
};

export const useMapStore = create<MapStore>((set) => ({
  map: null,
  setMap: (map) => set({ map }),

  mapController: null,
  setMapController: (controller) => set({ mapController: controller }),
}));

