export function haversine(from: [number, number], to: [number, number]) {
    const toRadians = (deg: number) => deg * (Math.PI / 180);
    const R = 6371e3; // Earth radius in meters

    const φ1 = toRadians(from[0]);
    const φ2 = toRadians(to[0]);
    const Δφ = toRadians(to[0] - from[0]);
    const Δλ = toRadians(to[1] - from[1]);

    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}