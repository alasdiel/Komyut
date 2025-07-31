import type { RouteLeg } from "./useRouteStore";

const colors = [
    '#007aff',
    '#ff9500',
    '#34c759',
    '#ff3b30',
    '#af52de',
];
let colorIdx = 0;

export function getPathlineStyle(leg: RouteLeg) {
    if(leg.type === 'walk') {
        return {
            'line-color': '#888',
            'line-width': 3,
            'line-dasharray': [2,2]
        };
    } else if(leg.type === 'jeepney') {
        colorIdx++;

        return {
            'line-color': colors[colorIdx % colors.length],
            'line-width': 5,            
        };
    }
}