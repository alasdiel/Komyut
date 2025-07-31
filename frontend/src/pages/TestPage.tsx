import { useState } from 'react';
import { RouteSearchPopup } from '../components/RouteSearchPopup';
import type { LocationResult } from '../components/RouteSearchPopup';

export function TestPage() {
  const [isOpen, setIsOpen] = useState(false);

  const handleRouteSubmit = async (start: LocationResult, end: LocationResult) => {
    try {
      const response = await fetch('https://3ant8fvf5i.execute-api.ap-southeast-1.amazonaws.com/prod/calc-route',{ // Edit this URL later
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startPos: {
              lat: start.coordinates[1], 
              lng: start.coordinates[0] 
            },
            endPos: {
              lat: end.coordinates[1],
              lng: end.coordinates[0]
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Route calculation result:', data);
      
      return data;
    } catch (error) {
      console.error('Error calculating route:', error);
      throw error; 
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Route Search Test</h1>
      
      <button
        onClick={() => setIsOpen(true)}
        className="bg-orange-500 text-white rounded-md hover:bg-orange-600"
      >
        Open Route Search
      </button>

      <RouteSearchPopup 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onRouteSubmit={handleRouteSubmit}
      />
    </div>
  );
}