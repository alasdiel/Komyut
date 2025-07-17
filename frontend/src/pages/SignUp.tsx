import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react'; // Import eye icons from Lucide React

function SignUp() {
  const [formData, setFormData] = useState({
    accountName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    general: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const checkUserExists = async (username: string) => {
    try {
      // Replace with actual API endpoint
      const response = await fetch('/api/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({ username: '', password: '', general: '' });

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, password: 'Passwords do not match' }));
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      setIsSubmitting(false);
      return;
    }

    // Check if user exists
    const userExists = await checkUserExists(formData.username);
    if (userExists) {
      setErrors(prev => ({ ...prev, username: 'Username already taken' }));
      setIsSubmitting(false);
      return;
    }

    // If all validations pass, proceed with registration
    try {
      // Replace with Actual registration API endpoint
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      // Registration successful - redirect or show success message
      alert('Registration successful!');
      //CHANGE THIS TO REDIRECT TO SIGN IN PAGE
    } catch{
      setErrors(prev => ({ ...prev, general: 'Registration failed. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-500 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-300 mb-2"></div>
          <h1 className="text-2xl font-bold text-center text-blue-800">
            Sign up for Komyut!
          </h1>
        </div>

        {/* Form */}
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Create Account Name
            </label>
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              placeholder="ex. Juan Dela Cruz"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Create Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`mt-1 w-full rounded-md border ${errors.username ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
              required
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-700">
              Create Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none pr-10`}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-700">
              Repeat Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none pr-10`}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-sm text-red-500">{errors.general}</p>
          )}

          <Button
            type="submit"
            className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create New Account!'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;