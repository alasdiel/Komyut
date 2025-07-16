import { Button } from "@/components/ui/button";
import { useState } from "react";

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

  // HARDCODED POSITIONS
  // Should be replaced with actual user input or dynamic values
  const startPos: Position = { lat: 7.0636, lng: 125.5945 };
  const endPos: Position = { lat: 7.0639, lng: 125.6229 };

  const calculateRoute = async () => {
    setIsLoading(true);
    setError(null);
    setLegs(null);

    try {
      const response = await fetch(
        'https://4a76qvkzyd.execute-api.ap-southeast-1.amazonaws.com/prod/calc-route',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
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

  return (
    <div>
      <p>Start: {startPos.lat}, {startPos.lng}</p>
      <p>End: {endPos.lat}, {endPos.lng}</p>

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
