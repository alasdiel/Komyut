import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet"

export default function Map() {

  return (
    <div className="h-screen w-screen"> 
    {
    // @ts-expect-error leaflet being removed soon
    <MapContainer 
      center={[7.0647, 125.6088]} 
      zoom={13}
      className="h-full w-full"
      zoomControl={false}
      >
    }
    {
          // @ts-expect-error leaflet being removed soon          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          
            />
           <ZoomControl position="bottomright" />
      </MapContainer>
    }
    </div>
  )
}



