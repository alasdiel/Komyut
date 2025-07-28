import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import jeepney from "@/assets/jeepney-hero-sec.svg"; // Use the upright jeepney image here

function HeroSection() {
  return (
    <div className="relative w-full max-w-[95%] mx-auto mt-5">
      {/* Jeepney Image - Positioned outside the grey box */}
      <img
        src={jeepney}
        alt="Jeepney"
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] rotate-[-90deg] z-10"
      />

      {/* Grey Box Content */}
      <div className="bg-gray-200 px-10 py-16 rounded-[40px] w-full min-h-[350px] shadow-md relative z-0 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left: Text Section */}
          <div className="space-y-6 max-w-xl text-center md:text-left">
            <h3 className="font-epilogue text-komyut-grey text-lg tracking-wider">
              Here is a caption.
            </h3>
            <h1 className="font-epilogue text-4xl md:text-5xl font-extrabold text-komyut-blue leading-tight tracking-wider">
              Lorem ipsum <br /> dolor sit amet!
            </h1>
            <Link to="/app">
              <Button className="font-epilogue bg-komyut-orange hover:bg-orange-600 text-white font-bold text-xl px-10 py-7 rounded-full tracking-wider cursor-pointer">
                Get Started Now!
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
