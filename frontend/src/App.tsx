import React from "react";
import Navbar from "./components/AppNavbar";
import Footer from "./components/AppFooter";
import HeroSection from "./components/HeroSection";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* <main className="flex-grow p-6">
        <h2 className="text-2xl font-semibold">Hello, world!</h2>
      </main> */}
      <main className="flex-grow p-6">
        <HeroSection />
      </main>

      {/*TODO: Our Work Section*/}

      {/*TODO: Features Section*/}

      {/* Footer */}
      <Footer />
    </div>
    
    
  );
}

