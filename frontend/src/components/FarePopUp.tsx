import { useState, useEffect, useRef } from 'react';
import { X, BusIcon, ArrowUpIcon } from 'lucide-react';
import Draggable from 'react-draggable';


interface JeepneyLeg {
  name: string;
  fare: number;
}

interface FarePopupProps {
  eta: string;
  distance: string;
  legs: JeepneyLeg[];
}

export function FarePopup({ eta, distance, legs }: FarePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const [startY, setStartY] = useState(0);

  // Reference for the draggable element
  const dragRef = useRef(null);

  // Calculate the total fare
  const totalFare = legs.reduce((sum, leg) => sum + leg.fare, 0);

  // Check if device being used is mobile, resize if detected
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust if needed
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Mobile drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    setDragPosition(diff > 0 ? diff : 0);
  };

  const handleTouchEnd = () => {
    if (dragPosition > 100) { // Closes window if dragged down enough
      setIsOpen(false);
    }
    setDragPosition(0);
  };

  // DESKTOP/TABLET VIEWING
  if (!isMobile) {
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-4 p-3 rounded-lg shadow-md z-10 hover:shadow-lg transition-shadow"
      >
        {isOpen ? <BusIcon className="w-6 h-6 text-gray-500"/> : <BusIcon className="w-6 h-6" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <Draggable nodeRef={dragRef} handle=".popup">
        <div ref={dragRef} className="fixed right-4 w-112 bg-white shadow-[0_20px_20px_-5px_rgba(0,0,0,0.5)] z-20 border border-orange-400 rounded-lg flex flex-col transform transition-all duration-300 ease-out origin-right translate-x-0">
          <div className="popup p-6 h-full overflow-y-auto pb-6">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-black hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="">
              <h2 className="text-lg text-gray-500 text-center font-epilogue">ETA</h2>
              <h2 className="text-3xl font-bold text-red-600 text-center font-epilogue">{eta}</h2>
              <p className="text-lg text-gray-500 text-center font-epilogue">{distance}</p>

              <div className="space-y-4 mt-4">
                {legs.map((leg, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <img 
                        src="https://cdnb.artstation.com/p/assets/images/images/009/744/673/large/nica-jan-alvarez-pinoy-pride-short-boi.jpg?1520644862" // Change later, image is placeholder
                        alt="Jeepney" 
                        className="w-16 h-10"
                      />
                      <span className="text-lg font-epilogue">{leg.name}</span>
                    </div>
                    <span className="text-lg font-semibold font-epilogue ">₱ {leg.fare}</span>
                  </div>
                ))}
              </div>

                <div className="bg-orange-500 text-white p-5 w-full mt-4">
                    <div className="flex justify-between max-w-md mx-auto">
                    <span className="text-2xl font-bold font-epilogue">TOTAL FARE</span>
                    <span className="text-2xl font-bold font-epilogue">₱ {totalFare}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
        </Draggable>
      )}
    </div>
  );
}

  // MOBILE VIEWING
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-0 left-0 right-0 bg-orange-500 text-white py-3 px-6 rounded-t-lg shadow-lg"
      >
        <ArrowUpIcon className="w-6 h-6 inline-block mr-2" />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-opacity-0 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 transition-transform ${dragPosition > 0 ? '' : 'transform translate-y-0'}`}
            style={{ transform: `translateY(${dragPosition}px)` }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag handling */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div className="">
              <h2 className="text-md text-gray-500 text-center font-epilogue">ETA</h2>
              <h2 className="text-2xl text-red-500 text-center font-bold font-epilogue">{eta}</h2>
              <p className="text-md text-gray-500 text-center font-epilogue">{distance}</p>

              <div className="space-y-4 mt-4">
                {legs.map((leg, index) => (
                  <div key={index} className="flex items-center justify-between ">
                    <div className="flex items-center gap-2">
                      <img 
                        src="https://cdnb.artstation.com/p/assets/images/images/009/744/673/large/nica-jan-alvarez-pinoy-pride-short-boi.jpg?1520644862" // Change later, image is placeholder
                        alt="Jeepney" 
                        className="w-12 h-8"
                      />
                      <span className="font-medium font-epilogue">{leg.name}</span>
                    </div>
                    <span className="font-medium font-epilogue">₱ {leg.fare}</span>
                  </div>
                ))}
              </div>

              <div className="bg-orange-500 text-white p-4 w-full mt-4">
                <div className="flex justify-between max-w-md mx-auto">
                    <span className="font-bold text-2xl">TOTAL FARE</span>
                    <span className="font-bold text-2xl">₱ {totalFare}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}