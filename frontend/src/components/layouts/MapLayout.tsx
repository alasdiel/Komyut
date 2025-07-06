import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/MapSidebar"

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    // #TODO: Style this
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}


