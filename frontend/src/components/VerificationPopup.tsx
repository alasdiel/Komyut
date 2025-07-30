import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import Draggable from 'react-draggable';

interface VerificationProps {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResendCode: () => Promise<void>;
  onClose: () => void;
}

export function VerificationPopup({ email, onVerify, onResendCode, onClose }: VerificationProps) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const dragRef = useRef(null);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
        if (code.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            await onVerify(code);
        } catch (err) {
            setError((err as Error).message || 'Verification failed, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const [canResend, setCanResend] = useState(true);
    const [countdown, setCountdown] = useState(0);

    const handleResend = async () => {
        try {
            setResendLoading(true);
            await onResendCode();
            setCanResend(false);
            setCountdown(30); // 30s delay
                
        // Start the countdown timer
        const timer = setInterval(() => {
        setCountdown((prev) => {
            if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
            }
            return prev - 1;
        });
        }, 1000);

        } catch (err) {
        setError((err as Error).message || 'Failed to resend code');
        } finally {
        setResendLoading(false);
        }
    };

  return (
    <Draggable nodeRef={dragRef} handle=".popup-header">
      <div 
        ref={dragRef}
        className="fixed right-4 top-4 w-96 bg-white shadow-lg z-50 border border-gray-300 rounded-lg"
      >
        <div className="popup-header p-4 border-b border-gray-200 cursor-move bg-gray-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Verify Your Email</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            We've sent a 6-digit verification code to <span className="font-medium">{email}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setCode(value);
                  if (error) setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 6-digit code"
                autoFocus
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isLoading || code.length !== 6
                  ? 'bg-orange-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-700'
              }`}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Trouble receiving verification code?{' '}
              <button
                onClick={handleResend}
                disabled={!canResend || resendLoading}
                className="text-orange-600 hover:text-orange-800 disabled:text-blue-400 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Sending...' : canResend ? 'Resend code' : `Resend in ${countdown}s`}
              </button>
            </p>
          </div>
        </div>
      </div>
    </Draggable>
  );
}