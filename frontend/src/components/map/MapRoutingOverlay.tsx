import { Button } from '@/components/ui/button'
import { useRouteHandlers } from '@/components/map/useRouteHandlers'

export default function MapRoutingOverlay() {
  const { handleClick } = useRouteHandlers();
  return (
    <div className="flex items-center justify-center flex-col h-1/3 bg-indigo-950">        
        <Button className="py-4 m-2" onClick={handleClick}>
          Calc
        </Button>
      </div>
  )
}
