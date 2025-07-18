"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md px-6 py-4 border-b font-epilogue font-light">
      <div className="flex items-center justify-between flex-wrap">
        {/* Logo and Title */}
        <div className="flex items-center gap-2">
          <img
            src="https://img.freepik.com/free-vector/butterfly-colorful-logo-template_361591-1587.jpg"
            alt="Logo"
            className="w-12 h-12 rounded-full"
          />
          <div className="text-2xl font-bold text-gray-900 font-sans">KOMYUT</div>
        </div>

        {/* Hamburger (only shows on small screens) */}
        <button
          onClick={() => setOpen(!open)}
          className="block md:hidden p-2 rounded hover:bg-gray-100"
        >
          {open ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>

        {/* Navigation & Sign In (visible from md and up) */}
        <div className="hidden md:flex items-center gap-6 xl:gap-10">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6 items-center">
              <NavigationMenuItem>
                <Link to="/about" className="text-base md:text-lg text-gray-600 hover:text-black">
                  About Us
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/services" className="text-base md:text-lg text-gray-600 hover:text-black">
                  Services
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/contact" className="text-base md:text-lg text-gray-600 hover:text-black">
                  Contact Us
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/premium" className="text-base md:text-lg text-gray-600 hover:text-black">
                  Premium
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Sign In Button */}
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white text-base md:text-lg px-6 py-3 rounded-full font-extrabold">
            <Link to="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu (only shows when open and on small screens) */}
      {open && (
        <div className="mt-4 flex flex-col gap-4 md:hidden">
          <Link to="/about" className="text-base text-gray-600 hover:text-black">About Us</Link>
          <Link to="/services" className="text-base text-gray-600 hover:text-black">Services</Link>
          <Link to="/contact" className="text-base text-gray-600 hover:text-black">Contact Us</Link>
          <Link to="/premium" className="text-base text-gray-600 hover:text-black">Premium</Link>
          <div className="flex justify-center mt-2">
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white text-base px-6 py-3 rounded-full font-extrabold">
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
