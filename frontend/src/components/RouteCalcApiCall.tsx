import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface Position {
  lat: number;
  lng: number;
}

interface Leg {
  type: string;
  routeId: string | null;
  coordinates: [number, number][];
}

export function RouteCalcButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [legs, setLegs] = useState<Leg[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startPos, setStartPos] = useState<Position>({ lat: 0, lng: 0 });
  const [endPos, setEndPos] = useState<Position>({ lat: 0, lng: 0 });

  // Use .env variable for the API URL
  const apiUrl = import.meta.env.VITE_ROUTECALC_API;

  const calculateRoute = async () => {
    // Validate inputs
    if (!isValidPosition(startPos) || !isValidPosition(endPos)) {
      setError("Please enter valid coordinates for start and end positions!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLegs(null);

    try {
      const response = await fetch(apiUrl,
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

      if (!data.legs) {
        throw new Error("No route data returned");
      }

      setLegs(data.legs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate route');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidPosition = (pos: Position): boolean => {
    return !isNaN(pos.lat) && !isNaN(pos.lng) && 
           pos.lat >= -90 && pos.lat <= 90 && 
           pos.lng >= -180 && pos.lng <= 180;
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end', coord: 'lat' | 'lng') => {
    const value = parseFloat(e.target.value);
    if (type === 'start') {
      setStartPos(prev => ({ ...prev, [coord]: value }));
    } else {
      setEndPos(prev => ({ ...prev, [coord]: value }));
    }
  };

  return (
    <div>
      <div>
        <h3>Start Position</h3>
        <div>
          <label>
            Latitude:
            <input
              type="number"
              value={startPos.lat}
              onChange={(e) => handlePositionChange(e, 'start', 'lat')}
              step="any"
              placeholder="Start lat"
            />
          </label>
          <label>
            Longitude:
            <input
              type="number"
              value={startPos.lng}
              onChange={(e) => handlePositionChange(e, 'start', 'lng')}
              step="any"
              placeholder="Start long"
            />
          </label>
        </div>
      </div>

      <div>
        <h3>End Position</h3>
        <div>
          <label>
            Latitude:
            <input
              type="number"
              value={endPos.lat}
              onChange={(e) => handlePositionChange(e, 'end', 'lat')}
              step="any"
              placeholder="End lat"
            />
          </label>
          <label>
            Longitude:
            <input
              type="number"
              value={endPos.lng}
              onChange={(e) => handlePositionChange(e, 'end', 'lng')}
              step="any"
              placeholder="End long"
            />
          </label>
        </div>
      </div>

      <Button onClick={calculateRoute} disabled={isLoading}>
        {isLoading ? "Calculating..." : "Calculate Route"}
      </Button>

      {error && (
        <div>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      )}

      {legs && (
        <div>
          {legs.map((leg, index) => (
            <div key={index}>
              <p><strong>Leg {index + 1}:</strong> {leg.type} {leg.routeId ? `(${leg.routeId})` : ""}</p>
              <p>Coordinates: {leg.coordinates.length} points</p>
            </div>
          ))}
          <pre>{JSON.stringify(legs, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}