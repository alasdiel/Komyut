import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App'
import Map from './pages/Map'
import NotFoundPage from './pages/NotFoundPage'
import TestPage from './pages/TestPage'
import SignIn from './pages/SignIn'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // Landing Page
  },
  {
    path: '/app',
    element: <Map />, // The actual usable app page
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
  {
    path: '/test-env',
    element: <TestPage />,
  },
  {
    path: '/sign-in',
    element: <SignIn />,
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
