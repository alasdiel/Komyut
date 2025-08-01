"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import Hamburger from "@/components/ui/hamburger";
import komyutLogo from "@/assets/komyut-logo.svg";
import avatarImg from "@/assets/user-icon.svg";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [user, setUser] = useState<{ //HARD CODED USER FOR NOW
    name: string;
    email: string;
    avatar: string;
  } | null>({
    name: "Anthony James",
    email: "ajmoran@up.edu.ph",
    avatar: avatarImg,
  });

  // Auto-close mobile menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown when clicking outside (desktop)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".user-dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

        {/* Hamburger (Mobile) */}
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

          {/* User Avatar or Sign In */}
          {user ? (
            <div className="relative user-dropdown">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="rounded-full w-10 h-10 overflow-hidden focus:outline-none cursor-pointer hover:opacity-80 transition-opacity duration-200"
              >
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-6 w-80 bg-white rounded-xl shadow-xxl p-5 z-50">
                  <p className="text-gray-500 text-s mb-2 tracking-wider ">Hello there!</p>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="tracking-wider font-bold text-komyut-grey">{user.name}</p>
                      <p className="tracking-wider text-sm text-komyut-grey hover:text-komyut-blue">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-2 tracking-wider ">Your Account</div>
                  <button
                    onClick={() => {
                      setUser(null);
                      setDropdownOpen(false);
                    }}
                    className="text-komyut-blue font-bold hover:underline tracking-wider "
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button asChild className={buttonClasses}>
              <Link to="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div className="mt-4 flex flex-col gap-4 md:hidden">
          {navLinks.map(({ to, label }) =>
            to.startsWith("#") ? (
              <a
                key={to}
                href={to}
                className={mobileLinkClasses}
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ) : (
              <Link
                key={to}
                to={to}
                className={mobileLinkClasses}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            )
          )}

          {/* Mobile User Info (if logged in) */}
          {user && (
            <div className="mt-6 px-2 py-4 bg-gray-100 rounded-xl">
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-base font-bold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-1">Your Account</div>
              <button
                onClick={() => {
                  setUser(null);
                  setOpen(false);
                }}
                className="text-komyut-blue font-bold hover:underline"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
