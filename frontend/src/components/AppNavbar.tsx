"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import Hamburger from "@/components/ui/hamburger";
import komyutLogo from "@/assets/komyut-logo.svg";

const navLinks = [
  { to: "#about", label: "About Us" },
  { to: "#services", label: "Services" },
  { to: "#contact", label: "Contact Us" },
  { to: "/premium", label: "Premium" }, 
];

const linkClasses =
  "font-epilogue text-base md:text-lg text-komyut-grey hover:text-komyut-blue tracking-wider";
const mobileLinkClasses =
  "font-epilogue text-base text-komyut-grey hover:text-komyut-blue tracking-wider";
const buttonClasses =
  "bg-komyut-orange hover:bg-orange-600 text-komyut-white text-base md:text-lg px-6 py-3 rounded-full font-extrabold tracking-wider";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // 👇 Automatically close mobile menu when screen is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="sticky top-0 bg-white shadow-md px-6 py-4 border-b font-epilogue font-light z-10">
      <div className="flex items-center justify-between flex-wrap">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0 w-[7rem]">
          <img
            src={komyutLogo}
            alt="Komyut Logo"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Hamburger (Mobile Only) */}
        <Hamburger isOpen={open} toggle={() => setOpen((prev) => !prev)} />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 xl:gap-10 z-10">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6 items-center">
              {navLinks.map(({ to, label }) => (
                <NavigationMenuItem key={to}>
                  {to.startsWith("#") ? (
                    <a href={to} className={linkClasses}>
                      {label}
                    </a>
                  ) : (
                    <Link to={to} className={linkClasses}>
                      {label}
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button asChild className={buttonClasses}>
            <Link to="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown (Only when open AND screen is mobile) */}
      {open && (
        <div className="mt-4 flex flex-col gap-4 md:hidden">
          {navLinks.map(({ to, label }) =>
            to.startsWith("#") ? (
              <a key={to} href={to} className={mobileLinkClasses} onClick={() => setOpen(false)}>
                {label}
              </a>
            ) : (
              <Link key={to} to={to} className={mobileLinkClasses}>
                {label}
              </Link>
            )
          )}
          ...
        </div>
      )}

    </nav>
  );
}
