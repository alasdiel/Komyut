import { type RouteData } from './useRouteStore';

export const populateFarePopupLegs = (routeData: RouteData) => {
    return Object.entries(routeData.fareData.legs).map(([routeId, fareInfo]) => {
        const matchingLeg = routeData.legs.find(
            leg => leg.type === 'jeepney' && leg.routeId === routeId
        );

        return {
            name: matchingLeg?.routeName ?? routeId,
            fare: fareInfo?.fare ?? 0
        };
    });
};