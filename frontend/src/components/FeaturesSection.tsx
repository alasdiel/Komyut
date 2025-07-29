import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Define the props type for FeatureItem
type FeatureItemProps = {
  title: string;
  shortDesc: string;
  fullDesc: string;
};

const FeatureItem = ({ title, shortDesc, fullDesc }: FeatureItemProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className="flex items-start gap-4 p-0 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Chevron icon */}
      <div className="text-black mt-1">
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-bold text-black text-lg mb-2">{title}</h3>
        {!expanded && <p className="text-gray-700 text-sm">{shortDesc}</p>}
        {expanded && <p className="text-gray-700 text-sm">{fullDesc}</p>}
      </div>
    </div>
  );
};

// Sample feature data
const featuresData: FeatureItemProps[] = [
  {
    title: "Name Feature 1",
    shortDesc: "Lorem ipsum dolor sit amet...",
    fullDesc:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    title: "Name Feature 1",
    shortDesc: "Lorem ipsum dolor sit amet...",
    fullDesc:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    title: "Name Feature 1",
    shortDesc: "Lorem ipsum dolor sit amet...",
    fullDesc:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    title: "Name Feature 1",
    shortDesc: "Lorem ipsum dolor sit amet...",
    fullDesc:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  
  
];

// Main section component
const FeatureSection = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-px-4 md:px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto text-center md:text-left">
        <h2 className="text-green-700 font-bold uppercase text-lg tracking-wider mb-4 max-w-7xl mx-auto text-center md:text-left">FEATURES</h2>

        <div className="flex flex-col gap-8">
          {featuresData.map((feature, idx) => (
            <FeatureItem key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;