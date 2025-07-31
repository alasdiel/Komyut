import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import jeepney from "@/assets/jeepney-hero-sec.svg";

function HeroSection() {
  return (
    <section className="relative w-full max-w-[95%] mx-auto mt-5 z-0">
      {/* Desktop View */}
      <div className="hidden lg:block relative">
        {/* Jeepney - cropped and rotated upright */}
        <div className="absolute right-[-3rem] xl:right-[-4rem] top-1/2 -translate-y-1/2 z-10 overflow-hidden pointer-events-none">
          <img
            src={jeepney}
            alt="Jeepney"
            aria-hidden="true"
            className="w-[570px] rotate-[-90deg] origin-center"
          />
        </div>

        {/* Grey Box Content */}
        <div className="relative bg-gray-200 rounded-[40px] shadow-md overflow-hidden min-h-[350px] py-20">
          <div className="px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between">
                {/* Left: Text */}
                <div className="max-w-xl space-y-8 text-center md:text-left z-10">
                  <h3 className="font-epilogue text-komyut-grey text-lg tracking-wide">
                    Helping commuters navigate smarter, <strong>one ride at a time.</strong>
                  </h3>
                  <h1 className="font-epilogue text-4xl md:text-5xl font-extrabold text-komyut-blue leading-tight tracking-wider">
                    Komyut with ease, <br /> no more worries!
                  </h1>
                  <Link to="/app">
                    <Button className="font-epilogue bg-komyut-orange hover:bg-orange-600 text-white font-bold text-xl px-12 py-8 rounded-full tracking-wider cursor-pointer">
                      Get Started Now!
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="bg-gray-200 rounded-[40px] shadow-md py-12 px-6 text-center">
          <h3 className="font-epilogue text-komyut-grey text-base tracking-wide mb-2">
            Helping commuters navigate smarter, <br /><strong>one ride at a time.</strong>
          </h3>
          <h1 className="font-epilogue text-3xl font-extrabold text-komyut-blue leading-snug mb-6">
            Komyut with ease, <br /> no more worries!
          </h1>
          <Link to="/app">
            <Button className="font-epilogue bg-komyut-orange hover:bg-orange-600 text-white font-bold text-base px-6 py-4 rounded-full tracking-wide mb-8">
              Get Started Now!
            </Button>
          </Link>
          <div className="flex justify-center">
            <img
              src={jeepney}
              alt="Jeepney"
              aria-hidden="true"
              className="w-[350px] rotate-[-90deg]"
            />
          </div>
        </div>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden">
        <div className="relative bg-gray-200 rounded-[40px] shadow-md py-16 px-8 min-h-[350px] overflow-hidden">
          <div className="flex items-center justify-between max-w-5xl mx-auto gap-6">
            {/* Text */}
            <div className="max-w-lg space-y-6 text-left">
              <h3 className="font-epilogue text-komyut-grey text-lg tracking-wide">
                Helping commuters navigate smarter, <strong>one ride at a time.</strong>
              </h3>
              <h1 className="font-epilogue text-4xl font-extrabold text-komyut-blue leading-tight tracking-wider">
                Komyut with ease, <br /> no more worries!
              </h1>
              <Link to="/app">
                <Button className="font-epilogue bg-komyut-orange hover:bg-orange-600 text-white font-bold text-xl px-10 py-7 rounded-full tracking-wider">
                  Get Started Now!
                </Button>
              </Link>
            </div>
            {/* Jeepney */}
            <div className="shrink-0">
              <img
                src={jeepney}
                alt="Jeepney"
                aria-hidden="true"
                className="w-[400px] rotate-[-90deg]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
