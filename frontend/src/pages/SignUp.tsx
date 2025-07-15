import { Button } from '@/components/ui/button';

function SignIn() {
  return (
    <div className="min-h-screen bg-orange-500 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        {/* Logo and Heading */}
        <div className="flex flex-col items-center mb-6">
          {/* Replace with an <img src=""> if needed */}
          <div className="w-10 h-10 rounded-full bg-gray-300 mb-2"></div>
          <h1 className="text-2xl font-bold text-center text-blue-800">
            Sign up for Komyut!
          </h1>
        </div>

        {/* Form */}
        <form className="flex flex-col space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Create Account Name
            </label>
            <input
              type="text"
              name="accountName"
              placeholder="ex. Juan Dela Cruz"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Create Username
            </label>
            <input
              type="text"
              name="username"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Create Password
            </label>
            <input
              type="password"
              name="password"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Repeat Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-full"
          >
            Create New Account!
          </Button>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
