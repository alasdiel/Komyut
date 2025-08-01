import MapComponent from "@/components/map/MapComponent"
import GeocodingComponent from "@/components/map/GeocodingComponent"
export default function Map() {

  return (
    <>
      <MapComponent />
      <div className="absolute top-[10px] left-[10px]">
        <GeocodingComponent />
      </div>
    </>  
  )
}



