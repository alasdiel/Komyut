import { Link } from "react-router-dom"
import { Button } from "../components/ui/button.tsx"
import Footer from "../components/AppFooter.tsx"
import CantFind from '../assets/cant-find.svg'
const NotFoundPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      
      <div className="flex flex-1 flex-col items-center justify-center px-4 space-y-4 gap-2">
      <div className="space-y-2">
        <img src={CantFind} alt="Not Found" className="h-64 w-64 mx-auto" />
        <h1 className="font-epilogue font-bold text-8xl text-center drop-shadow-lg/30">404</h1>
        <p className="font-epilogue font-extralight text-2xl text-center">Page does not exist.</p>
      </div>  


        <div className="flex space-x-4" id="button-container">
          
          <Link to="/">
            <Button className="bg-primary py-10 rounded-full font-epilogue font-extrabold text-lg w-72 drop-shadow-xl/20"> Return to the home page </Button>
          </Link>
          <Link to="/app">
            <Button className="bg-primary py-10 rounded-full font-epilogue font-extrabold text-lg w-72 drop-shadow-xl/20"> Return to the app </Button>
          </Link>

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default NotFoundPage;
