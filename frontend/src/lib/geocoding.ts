
export const getLocFromCoord = async (coord: [number, number]): Promise<string | null> => {
    try {
        const res = await fetch(
            `https://api.maptiler.com/geocoding/${coord[1]},${coord[0]}.json?key=${import.meta.env.VITE_MAPTILER_KEY}`
        );
        const data = await res.json();
        return data.features?.[0]?.place_name ?? "Unknown location";
    } catch (err) {
        console.error(err);
        return "Unknown location";
    }
}