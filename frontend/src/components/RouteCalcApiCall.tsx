import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Position {
  lat: number;
  lng: number;
}

interface RouteData {
  distance?: string;
  duration?: string;
  legs?: any[];
  path?: number[][];
  error?: string;
}

export function RouteCalcButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startPos: Position = { lat: 7.0636, lng: 125.5945 };
  const endPos: Position = { lat: 7.0639, lng: 125.6229 };

  const calculateRoute = async () => {
    setIsLoading(true);
    setError(null);
    setRouteData(null);

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

      const data: RouteData = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setRouteData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate route');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p><strong>Start:</strong> {startPos.lat}, {startPos.lng}</p>
      <p><strong>End:</strong> {endPos.lat}, {endPos.lng}</p>

      <Button onClick={calculateRoute} disabled={isLoading}>
        {isLoading ? "Calculating..." : "Calculate Route"}
      </Button>

      {error && (
        <div>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      )}

      {routeData && (
        <div>
          {routeData.distance && <p><strong>Distance:</strong> {routeData.distance}</p>}
          {routeData.duration && <p><strong>Duration:</strong> {routeData.duration}</p>}
          <pre>{JSON.stringify(routeData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
