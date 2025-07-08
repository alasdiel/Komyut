import { SidebarTrigger } from "@/components/ui/sidebar"
import { Menu } from "lucide-react"

export default function SidebarToggleControl() {
  return (
    <div className="leaflet-top leaflet-left z-[1000] m-4 absolute">
      <div className="leaflet-control leaflet-bar bg-white rounded shadow overflow-hidden">
        {/*TODO: Fix the trigger for mobile view*/}
        <SidebarTrigger className="w-9 h-9">

        </SidebarTrigger>
      </div>
    </div>
  )
}

