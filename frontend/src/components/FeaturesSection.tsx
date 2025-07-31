import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

type FeatureItemProps = {
  title: string;
  shortDesc: string;
  fullDesc: string;
};

const FeatureItem = ({ title, shortDesc, fullDesc }: FeatureItemProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="flex items-start gap-4 cursor-pointer transition-opacity hover:opacity-90"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Chevron with rotation */}
      <div
        className={clsx(
          "mt-1 shrink-0 w-8 h-8 flex items-center justify-center rounded-full border-2 border-orange-500 text-orange-500 transition-transform duration-300 ease-in-out hover:bg-orange-100",
          expanded ? "rotate-180" : "rotate-0"
        )}
      >
        <ChevronDown size={16} />
      </div>

      {/* Title + Animated Description */}
      <div className="flex-1">
        <h3 className="font-epilogue text-[#1E429F] font-bold text-base md:text-lg mb-1 tracking-wider">
          {title}
        </h3>

        <AnimatePresence initial={false}>
          <motion.div
            key={expanded ? "full" : "short"}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <p className="font-epilogue text-komyut-grey text-sm md:text-lg tracking-wider leading-relaxed">
              {expanded ? fullDesc : shortDesc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const featuresData: FeatureItemProps[] = [
  {
    title: "Fare Calculation",
    shortDesc: "Get a quick estimate of your jeepney fare...",
    fullDesc:
      "Get a quick estimate of your jeepney fare. Know exactly how much to pay for your route. Komyut calculates your jeepney fare based on LTFRB’s fare matrix, including base fare.",
  },
  {
    title: "Estimated Time of Arrival",
    shortDesc: "Plan your trip better with arrival estimates...",
    fullDesc:
      "Plan your trip better with arrival estimates. Avoid long waits and unexpected delays. Komyut gives you an estimate of how long your route will take based on your location, time of day, and common traffic conditions in Davao.",
  },
  {
    title: "What Jeepney to Ride",
    shortDesc: "Get clear route suggestions based on your destination...",
    fullDesc:
      "Get clear route suggestions based on your destination. Confused about which jeepney to take? Komyut suggests the best route from Point A to B, including specific jeepney codes, stops, and where to transfer if needed.",
  },
  {
    title: "Map View",
    shortDesc: "Visualize your route with an interactive map...",
    fullDesc:
      "Visualize your route with an interactive map. See the full picture. Our map shows your current location, nearby terminals, routes, and stops so you can navigate Davao’s jeepney system with confidence.",
  },
];

const FeatureSection = () => {
  return (
    <section className="px-4 md:px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto md:text-left">
        <h2 className="font-epilogue text-komyut-green font-extrabold uppercase text-lg tracking-wider mb-4">
          Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {featuresData.map((feature, idx) => (
            <FeatureItem key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
