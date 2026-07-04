import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Zap, ArrowLeft } from 'lucide-react';
import { apiService } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function VerifyOTP() {
  const { setAuth } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const location = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // We assume the previous page passed the email in the route state
  const email = location.state?.email || 'your email';

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      // Focus last filled input
      const lastIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the full 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      await apiService.verifyOTP({ email, otp: code });
      toast.success('Email verified successfully!');
      
      const token = location.state?.token;
      const user = location.state?.user;

      if (token && user) {
        setAuth(user, token);
        navigate('/onboarding');
      } else {
        navigate('/login');
      }
    } catch {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await apiService.resendOTP({ email });
      toast.success('A new OTP has been sent.');
      setResendTimer(30);
    } catch {
      toast.error('Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-10">
          <Link to="/signup" className="inline-flex items-center gap-2 mb-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium">
            <ArrowLeft className="size-4" /> Back
          </Link>
          <div className="flex justify-center mb-4 mt-2">
            <div className="size-12 rounded-xl bg-surface border border-outline flex items-center justify-center shadow-sm">
              <Zap className="size-6 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-semibold text-on-surface tracking-tight">Check your email</h1>
          <p className="text-on-surface-variant mt-2 text-sm px-4">
            We've sent a 6-digit verification code to <span className="font-semibold text-on-surface">{email}</span>.
          </p>
        </div>

        <div className="bg-surface-container rounded-2xl p-8 border border-outline shadow-sm">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-10 sm:w-12 h-14 text-center text-2xl font-semibold bg-surface border border-outline rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-mono"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-on-surface text-surface font-medium rounded-lg hover:bg-on-surface/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-4"
            >
              {loading ? (
                <><span className="size-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />Verifying…</>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-on-surface-variant">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0}
                className="font-medium text-primary hover:text-inverse-primary disabled:text-on-surface-variant/50 transition-colors"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Click to resend'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
