import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Zap, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { apiService } from '../../lib/api';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const email = searchParams.get('email') || '';

  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    if (!email) {
      toast.error('Invalid or expired reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      await apiService.resetPassword({ email, password: data.password });
      setSuccess(true);
      toast.success('Password reset successful! You can now log in.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-[420px] relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="size-12 rounded-xl bg-surface border border-outline flex items-center justify-center shadow-sm">
              <Zap className="size-6 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-semibold text-on-surface tracking-tight">
            Reset your password
          </h1>
          <p className="text-on-surface-variant mt-2 text-sm px-4">
            Enter a strong, secure new password for <span className="font-semibold text-on-surface">{email || 'your account'}</span>.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container rounded-2xl p-8 border border-outline shadow-sm">
          {!success ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-on-surface mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 bg-surface border border-outline rounded-lg text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-on-surface mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-surface border border-outline rounded-lg text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>
                {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-on-surface text-surface font-medium rounded-lg hover:bg-on-surface/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <><span className="size-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />Resetting…</>
                ) : (
                  'Reset password'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-2">
              <div className="flex flex-col items-center justify-center gap-3">
                <CheckCircle className="size-12 text-emerald-500" />
                <h3 className="font-display font-medium text-lg text-on-surface">Password Updated Successfully</h3>
                <p className="text-sm text-on-surface-variant max-w-[280px]">
                  Your credentials have been securely updated. You can now use your new password to sign in.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 mt-4 bg-primary text-slate-950 font-medium rounded-lg hover:opacity-90 transition-all text-sm uppercase tracking-wider font-semibold"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
