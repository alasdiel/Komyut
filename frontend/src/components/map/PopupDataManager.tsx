import type { JeepneyLeg } from '../FarePopUp';
import { type RouteData } from './useRouteStore';

export const populateFarePopupLegs = (routeData: RouteData, routeColors: Record<string, string>): JeepneyLeg[] => {
    return routeData.legs.map((leg, index) => {        
        const fareInfo = 
            leg.type === 'jeepney' ? routeData.fareData.legs[leg.routeId] : undefined;

        let destinationCoord: [number, number] | null = null;

        const isLastLeg = index === routeData.legs.length - 1;
        const isLastWalkLeg = leg.type === 'walk' && index === routeData.legs.length - 2;

        if (!isLastLeg && !isLastWalkLeg) {
            destinationCoord = routeData.legs[index + 1].coordinates[0] ?? null;            
        }

        return {
            type: (leg.type) as 'jeepney' | 'walk',
            name: leg.routeName ?? leg.routeId,
            fare: fareInfo?.fare ?? 0,
            color: routeColors[leg.routeId] ?? '#000000',
            // destination: destinationCoord ? `${destinationCoord[0]},${destinationCoord[1]}` : 'to your destination.',
            destination: destinationCoord ? '[GEOCODING NOT AVAILABLE]' : 'to your destination.',
        }
    });
};

function getDistance(routeData: RouteData) {
    let totalDistance = 0;

    Object.entries(routeData.fareData.legs).forEach((l: [string, { distance: number; fare: number; }]) => {
        const leg = l[1];

        totalDistance += leg.distance;
    });

    return totalDistance;
}

export const displayTotalDistance = (routeData: RouteData) => {
    const totalDistance = getDistance(routeData);

    return `${totalDistance.toFixed(2)} km`;
}

const ESTIMATED_JEEP_SPEED = 30; //In KPH
export const displayEstimatedTime = (routeData: RouteData) => {
    const totalDistance = getDistance(routeData);
    const totalTime = (totalDistance / ESTIMATED_JEEP_SPEED) * 60;

    return `${(totalTime+5).toFixed(0)} mins`;
}