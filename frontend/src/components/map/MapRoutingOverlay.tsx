import { Button } from '@/components/ui/button'
import { useRouteHandlers } from '@/components/map/useRouteHandlers'

export default function MapRoutingOverlay() {
  const { startPos, endPos, handleClick, handlePositionChange } = useRouteHandlers();
  return (
    <div className="flex items-center justify-center flex-col h-1/3 bg-indigo-950">

        <div className="text-white m-2">
          <h3 className="font-epilogue">Start Position</h3>
          <div>
            <label>
              Latitude:
              <input className="bg-white text-black"
                value={startPos.lat}
                onChange={(e) => handlePositionChange(e, 'start', 'lat')}
              />
            </label>
            <br />
            <label>
              Longitude:
              <input className="bg-white text-black"
                value={startPos.lng}
                onChange={(e) => handlePositionChange(e, 'start', 'lng')}
              />
            </label>
          </div>
        </div>

        <div className="text-white m-2">
          <h3 className="font-epilogue">End Position</h3>
          <div>
            <label>
              Latitude:
              <input className="bg-white text-black"
                value={endPos.lat}
                onChange={(e) => handlePositionChange(e, 'end', 'lat')}
              />
            </label>
            <br />
            <label>
              Longitude:
              <input className="bg-white text-black"
                value={endPos.lng}
                onChange={(e) => handlePositionChange(e, 'end', 'lng')}
              />
            </label>
          </div>
        </div>
        <Button className="py-4 m-2" onClick={handleClick}>
          Calc
        </Button>
      </div>
  )
}
