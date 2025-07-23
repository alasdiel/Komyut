import { FarePopup } from "../components/FarePopUp";

export function TestPage() {
  return (
      <div className="p-8 relative min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        
        <div className="fixed top-4 right-4 z-50">
          <FarePopup 
            eta="2 hrs 5 mins" 
            distance="65.2 km" 
            legs={[
              { name: "Mintal Jeep", fare: 15 },
              { name: "Matina Jeep", fare: 20 },
              { name: "Lanang Jeep", fare: 13 }
            ]} 
          />
        </div>
    </div>
  );
}