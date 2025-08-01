import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '@/components/PasswordInput';
import { VerificationPopup } from '@/components/VerificationPopup';
import komyutLogo from "@/assets/komyut-logo.svg";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    password: '',
    general: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const checkUserExists = async (username: string) => {
    try {
      const response = await fetch('/api/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      return data.exists;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({ username: '', password: '', general: '' });

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setErrors(prev => ({ ...prev, general: 'Please enter a valid email' }));
      setIsSubmitting(false);
      return;
    }

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

    const userExists = await checkUserExists(formData.username);
    if (userExists) {
      setErrors(prev => ({ ...prev, username: 'Username already taken' }));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('https://hd8kev8grc.execute-api.ap-southeast-1.amazonaws.com/prod/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'UsernameExistsException') {
          throw new Error('Username already exists');
        }
        throw new Error(data.error || 'Registration failed');
      }

      setShowVerification(true);

    } catch (error: unknown) {
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (code: string) => {
    try {
      const response = await fetch('https://hd8kev8grc.execute-api.ap-southeast-1.amazonaws.com/prod/confirm-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code }),
      });

      if (!response.ok) throw new Error('Verification failed');

      alert('Email verified successfully! You may now sign in with your new account.');
      navigate('/sign-in');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch('https://hd8kev8grc.execute-api.ap-southeast-1.amazonaws.com/prod/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!response.ok) throw new Error('Failed to resend code');

      alert('Verification code resent successfully!');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-orange-500 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-800">Sign up for</h1>
          <img src={komyutLogo} alt="Komyut Logo" className="h-6 sm:h-8 object-contain" />
        </div>

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-700">Create Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Create Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`mt-1 w-full rounded-md border ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
              required
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <PasswordInput
            label="Create Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <PasswordInput
            label="Repeat Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.password}
          />

          {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}

          <Button
            type="submit"
            className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create New Account!'}
          </Button>

          <div className="text-sm text-center text-blue-600 hover:underline">
            <Link to="/sign-in">Already have an account? Login here!</Link>
          </div>
        </form>

        {showVerification && (
          <VerificationPopup
            email={formData.email}
            onVerify={handleVerify}
            onResendCode={handleResendCode}
            onClose={() => {
              setShowVerification(false);
              navigate('/sign-in');
            }}
          />
        )}
      </div>
    </div>
  );
}

export default SignUp;
