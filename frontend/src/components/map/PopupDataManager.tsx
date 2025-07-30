import { type RouteData } from './useRouteStore';
import { useColorMapStore } from './useRouteStore';

export const populateFarePopupLegs = (routeData: RouteData) => {
    const { routeColors } = useColorMapStore.getState();

    return Object.entries(routeData.fareData.legs).map(([routeId, fareInfo]) => {
        const matchingLeg = routeData.legs.find(
            leg => leg.type === 'jeepney' && leg.routeId === routeId
        );

        return {
            type: matchingLeg?.type,
            name: matchingLeg?.routeName ?? routeId,
            fare: fareInfo?.fare ?? 0,
            color: routeColors[routeId] ?? '#000000', // fallback if not set
            destination: '...'
        };
    });
};