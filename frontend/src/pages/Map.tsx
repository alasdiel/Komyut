import MapLayout from "@/components/layouts/MapLayout"
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet"
export default function Map() {

  return (
    <MapLayout>
    <div className="h-full w-full">
      <MapContainer 
      center={[7.0647, 125.6088]} 
      zoom={13}
      className="h-full w-full"
      >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          
            />
      </MapContainer>
    </div>
    </MapLayout>
  )
}



