import React from "react";

type HamburgerProps = {
  isOpen: boolean;
  toggle: () => void;
};

const Hamburger: React.FC<HamburgerProps> = ({ isOpen, toggle }) => {
  return (
    <button
      onClick={toggle}
      className="block md:hidden p-2 rounded hover:bg-komyut-grey/10 transition-colors"
      aria-label="Toggle menu"
    >
      <div className="relative w-6 h-6 transition-all duration-300">
        <span
          className={`absolute left-0 h-0.5 w-full bg-black transform transition duration-300 ease-in-out ${
            isOpen ? "rotate-45 top-2.5" : "top-1"
          }`}
        />
        <span
          className={`absolute left-0 h-0.5 w-full bg-black transition-opacity duration-300 ease-in-out ${
            isOpen ? "opacity-0 top-2.5" : "top-2.5"
          }`}
        />
        <span
          className={`absolute left-0 h-0.5 w-full bg-black transform transition duration-300 ease-in-out ${
            isOpen ? "-rotate-45 top-2.5" : "top-4"
          }`}
        />
      </div>
    </button>
  );
};

export default Hamburger;
