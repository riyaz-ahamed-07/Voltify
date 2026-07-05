import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Zap, ArrowLeft } from 'lucide-react';
import { apiService } from '../../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    
    setLoading(true);
    try {
      await apiService.forgotPassword({ email });
      setSubmitted(true);
      toast.success('Password reset link sent!');
    } catch {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-[420px] relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/login" className="inline-flex items-center gap-2 mb-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium">
            <ArrowLeft className="size-4" /> Back to login
          </Link>
          <div className="flex justify-center mb-4 mt-2">
            <img src="/logo.gif" alt="Voltify Logo" className="size-14 object-contain" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-on-surface tracking-tight">Forgot password?</h1>
          <p className="text-on-surface-variant mt-2 text-sm px-4">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container rounded-2xl p-8 border border-outline shadow-sm">
          {!submitted ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-on-surface mb-1.5">Email</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-surface border border-outline rounded-lg text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-on-surface text-surface font-medium rounded-lg hover:bg-on-surface/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <><span className="size-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />Sending…</>
                ) : (
                  'Reset password'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="p-4 bg-primary/10 rounded-xl text-primary border border-primary/20">
                <p className="text-sm">
                  We've sent an email to <span className="font-semibold">{email}</span> with a link to reset your password.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-primary hover:text-inverse-primary transition-colors"
              >
                Return to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
