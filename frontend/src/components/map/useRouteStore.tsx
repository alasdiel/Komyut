import { create } from 'zustand'

export interface RouteLeg {
  type: string;
  routeId: string;
  routeName: string;
  coordinates: [number, number][];
};

export interface RouteData {
  legs: RouteLeg[];
  fareData: { 
    totalFare: number, 
    legs: { [routeId: string]: { distance: number, fare: number }}
  };
};

interface Position { 
  lat: number; 
  lng: number 
}

interface RouteState {
  startPos: Position
  endPos: Position
  setStartPos: (pos: Position) => void
  setEndPos: (pos: Position) => void
  routeData: RouteData | null;
  setRouteData: (data: RouteData) => void
}

interface JeepColorMapState {
  routeColors: Record<string, string>;
  setRouteColor: (routeId: string, color: string) => void;
}

export const useColorMapStore = create<JeepColorMapState>(set => ({
  routeColors: {},
  setRouteColor: (routeId, color) =>
    set(state => ({
      routeColors: { ...state.routeColors, [routeId]: color }
    })),
}));

export const useRouteStore = create<RouteState>((set) => ({
  startPos: { lat: 0, lng: 0 },
  endPos: { lat: 0, lng: 0 },
  setStartPos: (pos) => set({ startPos: pos }),
  setEndPos: (pos) => set({ endPos: pos }),
  routeData: null,
  setRouteData: (data: RouteData) => set({ routeData: data })
}))

