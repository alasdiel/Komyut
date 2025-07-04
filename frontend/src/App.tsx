import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"

export default function App() {
  return (
<div className="bg-bg text-gray-dark min-h-screen flex flex-col"> {/* main container */}
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink>Link</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>

  {/* Hero Section */}
      <section className="bg-gray-light p-6 rounded-xl m-4 flex flex-col items-start gap-4 shadow-sm">
        <p className="text-lg">Here is a caption.</p>
        <h1 className="text-3xl font-bold text-blue">
          Lorem ipsum dolor sit amet!
        </h1>
        <button className="bg-primary text-white px-6 py-2 rounded hover:bg-accent transition">
          Get Started
        </button>
      </section>

      {/* Feature Section */}
      <section className="p-6">
        <h2 className="text-xl font-bold text-accent mb-4">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-4 border rounded shadow-sm"
            >
              <div className="text-accent text-xl">✔</div>
              <div>
                <h3 className="text-blue font-semibold">Name Feature {i}</h3>
                <p className="text-sm text-gray-dark">
                  Lorem ipsum dolor sit amet...
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-footer text-white p-6 mt-auto relative overflow-hidden">
        <div className="text-sm">© komyut.ph</div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-footer-accent rounded-full translate-x-1/2 translate-y-1/2 opacity-30" />
      </footer>
    </div>
  );
}


// export default App
