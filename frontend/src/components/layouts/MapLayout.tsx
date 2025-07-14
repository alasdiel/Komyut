import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/MapSidebar"
import SidebarToggleControl from "@/components/SidebarToggleControl" 

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    // #TODO: Style this
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 h-full relative">
        <SidebarToggleControl />
        {children}
        </main>
      </div>
    </SidebarProvider>
  )
}


