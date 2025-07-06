import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App'
import Map from './pages/Map'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // Landing Page
  },
  {
    path: '/app',
    element: <Map />, // The actual usable app page
  },
  /*
    #TODO: remove in prod
    For future reference:
  {
    path: '/sample-path', //komyut.com/sample-path
    element: <SamplePageComponent />,
  },
  */
]);


const AppRouter = () => <RouterProvider router={router} />

export default AppRouter
