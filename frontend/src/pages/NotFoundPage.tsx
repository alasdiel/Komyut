import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.tsx";
import Footer from "../components/AppFooter.tsx";
import CantFind from "../assets/cant-find.svg";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <div className="flex-grow px-4 md:px-8 py-16 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-8">
          <img
            src={CantFind}
            alt="Not Found"
            className="w-64 h-64 object-contain"
          />

          <div>
            <h1 className="text-6xl md:text-8xl font-epilogue font-extrabold text-komyut-grey">
              404
            </h1>
            <p className="mt-4 font-epilogue text-komyut-grey text-lg md:text-xl tracking-wide leading-relaxed">
              Page does not exist.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link to="/" className="w-full sm:w-auto">
              <Button className="w-full sm:w-72 bg-komyut-orange hover:bg-orange-600 text-white py-6 rounded-full font-epilogue font-extrabold text-lg tracking-wider cursor-pointer">
                Return to the home page
              </Button>
            </Link>
            <Link to="/app" className="w-full sm:w-auto">
              <Button className="w-full sm:w-72 bg-komyut-orange hover:bg-orange-600 text-white py-6 rounded-full font-epilogue font-extrabold text-lg tracking-wider cursor-pointer">
                Return to the app
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotFoundPage;
