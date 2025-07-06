import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/MapSidebar"

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    // #TODO: Style this
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 h-full relative">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}


