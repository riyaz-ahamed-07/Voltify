// src/pages/auth/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Zap, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';
import { apiService } from '../../lib/api';

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { isOnboarded } = useDashboardStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await apiService.login(data);
      setAuth(response.user, response.token);
      toast.success('Welcome back to Voltify!');
      
      // If already onboarded, send to dashboard. Otherwise send to onboarding!
      if (isOnboarded) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch {
      toast.error('Invalid credentials. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-headline">
      {/* Background glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="size-10 rounded-lg bg-primary-container/20 border border-primary/30 flex items-center justify-center">
              <Zap className="size-5 text-primary-container" />
            </div>
            <span className="font-display text-2xl font-bold text-sky-400 tracking-tighter">VOLTIFY</span>
          </Link>
          <p className="text-on-surface-variant mt-2 text-sm">Sign in to your clean energy dashboard</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 animate-slide-up border border-outline-variant/30 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="ravi@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/50 rounded-lg text-on-surface placeholder-outline/50 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-all text-sm font-sans"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs mt-1 font-sans">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant/50 rounded-lg text-on-surface placeholder-outline/50 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-all text-sm font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-1 font-sans">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-container text-on-primary-container font-semibold font-display rounded-lg hover:bg-primary-container/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase text-xs tracking-wider"
            >
              {loading ? (
                <><span className="size-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />Signing in…</>
              ) : (
                <>Sign In <Zap className="size-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-on-surface-variant text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export { Login };
