"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md px-6 py-4 border-2 border-b-black-200">
      <div className="flex items-center justify-between">
        {/* Left: Title */}
        <div className="text-5xl font-bold text-gray-900">
          KOMYUT
        </div>

        {/* Right: Hamburger (mobile) */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded hover:bg-gray-100"
        >
          {open ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>

        {/* Middle & Right: Navigation links (desktop) */}
        <div className="hidden lg:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-10">
              <NavigationMenuItem>
                <NavigationMenuLink className="text-4xl text-gray-600 hover:text-black">
                  About Us
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-4xl text-gray-600 hover:text-black">
                  Services
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-4xl text-gray-600 hover:text-black">
                  Contact Us
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-4xl text-gray-600 hover:text-black">
                  Premium
                </NavigationMenuLink>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>


        </div>
          <Button className="bg-primary hidden lg:flex text-4xl px-15 py-10 rounded-full">
            Sign Up
          </Button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="mt-4 flex flex-col gap-4 lg:hidden">
          <a className="text-lg text-gray-600 hover:text-black">
            About Us
          </a>
          <a className="text-lg text-gray-600 hover:text-black">
            Services
          </a>
          <a className="text-lg text-gray-600 hover:text-black">
            Contact Us
          </a>
          <a className="text-lg text-gray-600 hover:text-black">
            Premium
          </a>
          <Button className="bg-primary w-full text-lg rounded-full">
            Sign Up
          </Button>
        </div>
      )}
    </nav>
  );
}

