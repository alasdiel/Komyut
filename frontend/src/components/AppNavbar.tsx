"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import Hamburger from "@/components/ui/hamburger";
import komyutLogo from "@/assets/komyut-logo.svg";

const navLinks = [
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact Us" },
  { to: "/premium", label: "Premium" },
];

const linkClasses = "font-epilogue text-base md:text-lg text-komyut-grey hover:text-komyut-blue tracking-wider";
const mobileLinkClasses = "font-epilogue text-base text-komyut-grey hover:text-komyut-blue tracking-wider";
const buttonClasses = "bg-komyut-orange hover:bg-orange-600 text-komyut-white text-base md:text-lg px-6 py-3 rounded-full font-extrabold tracking-wider";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md px-6 py-4 border-b font-epilogue font-light">
      <div className="flex items-center justify-between flex-wrap">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src={komyutLogo}
            alt="Komyut Logo"
            className="w-22 sm:w-24 md:w-26 lg:w-28 xl:w-30 h-auto object-contain"
          />
        </div>

        {/* Hamburger (Mobile Only) */}
        <Hamburger isOpen={open} toggle={() => setOpen(prev => !prev)} />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 xl:gap-10">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6 items-center">
              {navLinks.map(({ to, label }) => (
                <NavigationMenuItem key={to}>
                  <Link to={to} className={linkClasses}>
                    {label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Sign In */}
          <Button asChild className={buttonClasses}>
            <Link to="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="mt-4 flex flex-col gap-4 md:hidden">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={mobileLinkClasses}>
              {label}
            </Link>
          ))}
          <div className="flex justify-center mt-2">
            <Button asChild className={buttonClasses}>
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
