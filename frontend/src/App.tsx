import Navbar from "./components/AppNavbar";
import Footer from "./components/AppFooter";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow p-6">
        <h2 className="text-2xl font-semibold">Hello, world!</h2>
      </main>

      {/*TODO: Our Work Section*/}

      {/*TODO: Features Section*/}

      {/* Footer */}
      <Footer />
    </div>
  );
}

