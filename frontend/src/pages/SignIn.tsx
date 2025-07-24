import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Username, Password } from '@/components/Authentication/InputFields.tsx'


function SignIn() {
  return (
    <div className="min-h-screen bg-orange-500 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-300 mb-2"></div>
          <h1 className="text-2xl font-bold text-center text-blue-800">
            Sign In to Komyut!
          </h1>
        </div>

        <form className="flex flex-col space-y-4">
        
          <Username />

          <Password />
        
          <Button
            type="submit"
   className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-full"
          >
            Sign In
          </Button>

          <Link to="/sign-up" className="text-sm text-center text-blue-600 hover:underline">
            Create a new Komyut Account
          </Link>
        </form>
    </div>
  </div>
  );
}

export default SignIn;
