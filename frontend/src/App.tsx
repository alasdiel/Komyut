import Navbar from "./components/ui/navbar"; // or "@/components/Navbar" if you set that up

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="p-6">
        <h2 className="text-2xl font-semibold">Hello, world!</h2>
      </main>
    </div>
  );
}
