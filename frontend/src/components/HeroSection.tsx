import { Button } from "@/components/ui/button";

function HeroSection() {
  return (
    <div className="bg-gray-200 px-20 py-16 rounded-[40px] w-full max-w-[95%] min-h-[350px] mx-auto mt-5 shadow-md">
      <div className="space-y-8 max-w-2xl">
        <h3 className="text-gray-700 text-lg">Here is a caption.</h3>
        <h1 className="text-5xl font-extrabold text-blue-800 leading-tight">
          Lorem ipsum <br /> dolor sit amet!
        </h1>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl px-10 py-7 rounded-full">
          Get Started Now!
        </Button>
      </div>
    </div>
  );
}

export default HeroSection;
