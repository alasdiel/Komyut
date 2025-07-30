import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
      {/* Chevron inside circle */}
      <div className="mt-1 shrink-0 w-8 h-8 flex items-center justify-center rounded-full border-2 border-orange-500 text-orange-500">
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {/* Title + Description */}
      <div className="flex-1">
        <h3 className="text-[#1E429F] font-bold text-base md:text-lg mb-1">
          {title}
        </h3>
        <p className="text-gray-700 text-sm leading-snug">
          {expanded ? fullDesc : shortDesc}
        </p>
      </div>
    </div>
  );
};

const featuresData: FeatureItemProps[] = [
  {
    title: "Name Feature 1",
    shortDesc: "Lorem ipsum dolor sit amet...",
    fullDesc:
      "Full description 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit.",
  },
  {
    title: "Name Feature 2",
    shortDesc: "Lorem ipsum dolor sit amet...",
    fullDesc:
      "Full description 2: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit.",
  },
  {
    title: "Name Feature 3",
    shortDesc: "Lorem ipsum dolor sit amet...",
    fullDesc:
      "Full description 3: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit.",
  },
  {
    title: "Name Feature 4",
    shortDesc: "Lorem ipsum dolor sit amet...",
    fullDesc:
      "Full description 4: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit.",
  },
];

const FeatureSection = () => {
  return (
    <section className="px-4 md:px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto md:text-left">
        {/* Section Heading */}
        <h2 className="text-komyut-green font-extrabold uppercase text-lg tracking-wider mb-4">
          Features
        </h2>

        {/* Feature Items Grid */}
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
