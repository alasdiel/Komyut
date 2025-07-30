import type { JeepneyLeg } from '../FarePopUp';
import { type RouteData } from './useRouteStore';

export const populateFarePopupLegs = (routeData: RouteData, routeColors: Record<string, string>): JeepneyLeg[] => {
    return routeData.legs.map(leg => {        
        const fareInfo = 
            leg.type === 'jeepney' ? routeData.fareData.legs[leg.routeId] : undefined;

        return {
            type: (leg.type) as 'jeepney' | 'walk',
            name: leg.routeName,
            fare: fareInfo?.fare ?? 0,
            color: routeColors[leg.routeId] ?? '#000000',
            destination: '...',
        }
    });
};

export const displayTotalDistance = (routeData: RouteData) => {
    let totalDistance = 0;

    Object.entries(routeData.fareData.legs).forEach((l: [string, { distance: number; fare: number; }]) => {
        const leg = l[1];

        totalDistance += leg.distance;
    });

    return `${totalDistance} km`
}