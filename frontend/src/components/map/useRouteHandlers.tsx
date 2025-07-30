import { useRouteStore } from './useRouteStore'

export function useRouteHandlers() {
  const startPos = useRouteStore(s => s.startPos);
  const endPos = useRouteStore(s => s.endPos);
  const setStartPos = useRouteStore(s => s.setStartPos);
  const setEndPos = useRouteStore(s => s.setEndPos);
  const setRouteData = useRouteStore(s => s.setRouteData);

  const handlePositionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'start' | 'end',
    coord: 'lat' | 'lng'
  ) => {
    const value = parseFloat(e.target.value);
    if (type === 'start') {
      setStartPos({
        lat: coord === 'lat' ? value : startPos.lat,
        lng: coord === 'lng' ? value : startPos.lng,
      });
    } else {
      setEndPos({
        lat: coord === 'lat' ? value : endPos.lat,
        lng: coord === 'lng' ? value : endPos.lng,
      });
    }
  };

  const handleClick = async () => {
    const response = await fetch(import.meta.env.ROUTECALC_API_CALL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ startPos, endPos }),
    });

    setStartPos({lat: 7, lng: 120})
    setEndPos({lat: 7.2, lng: 120.2})

    console.log(startPos, endPos)
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.legs) throw new Error("No route data returned");
    setRouteData(data);
  };

  return { handlePositionChange, handleClick, startPos, endPos };
}
