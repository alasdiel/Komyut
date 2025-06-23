function haversine(lat1, long1, lat2, long2) {
    function toRad(deg) {
        return deg * Math.PI / 180;
    }

    const lat1Rad = toRad(lat1);
    const long1Rad = toRad(long1);
    const lat2Rad = toRad(lat2);
    const long2Rad = toRad(long2);

    const R = 6731;

    const dLat = lat2Rad - lat1Rad;
    const dLong = long2Rad - long1Rad;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d * 1000;
}