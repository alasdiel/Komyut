import { useRouteStore } from './useRouteStore.tsx'

export const handleClick = async () => {
  const { startPos, endPos, setRouteData } = useRouteStore();
  console.log(startPos, endPos);
  const response = await fetch(import.meta.env.ROUTECALC_API_CALL,
    {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ startPos, endPos })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(data);

  if (!data.legs) {
    throw new Error("No route data returned");
  }

  setRouteData(data);
};


export const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end', coord: 'lat' | 'lng') => {
  const value = parseFloat(e.target.value);
  const { setStartPos, setEndPos, startPos, endPos } = useRouteStore();
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
}



