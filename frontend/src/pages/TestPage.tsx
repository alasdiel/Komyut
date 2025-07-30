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
                  { type: "walk", destination: "Mintal Terminal" },
                  { type: "jeepney", name: "Mintal Jeep", fare: 15, color: "#00FFFF"},
                  { type: "jeepney", name: "Matina Jeep", fare: 20 },
                  { type: "walk", destination: "SM Lanang" },
                  { type: "jeepney", name: "Lanang Jeep", fare: 13 },
                  { type: "walk", destination: "Your Location" }
            ]} 
          />
        </div>
    </div>
  );
}