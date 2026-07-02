// src/pages/auth/Signup.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Zap, Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../lib/api';

const signupSchema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Invalid email address'),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      const response = await apiService.signup(data);
      setAuth(response.user, response.token);
      toast.success('Account created! Let\'s calibrate your energy profile.');
      navigate('/onboarding');
    } catch {
      toast.error('Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-headline">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="size-10 rounded-lg bg-primary-container/20 border border-primary/30 flex items-center justify-center">
              <Zap className="size-5 text-primary-container" />
            </div>
            <span className="font-display text-2xl font-bold text-sky-400 tracking-tighter">VOLTIFY</span>
          </Link>
          <p className="text-on-surface-variant mt-2 text-sm">Create your free energy analytics account</p>
        </div>

        <div className="glass rounded-2xl p-8 animate-slide-up border border-outline-variant/30 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  placeholder="Ravi Kumar"
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/50 rounded-lg text-on-surface placeholder-outline/50 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-all text-sm font-sans"
                />
              </div>
              {errors.name && <p className="text-rose-400 text-xs mt-1 font-sans">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Email Address</label>
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
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-1 font-sans">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant/50 rounded-lg text-on-surface placeholder-outline/50 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-all text-sm font-sans"
                />
              </div>
              {errors.confirmPassword && <p className="text-rose-400 text-xs mt-1 font-sans">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-container text-on-primary-container font-semibold font-display rounded-lg hover:bg-primary-container/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 uppercase text-xs tracking-wider"
            >
              {loading
                ? <><span className="size-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />Creating Account…</>
                : <>Create Account <Zap className="size-4" /></>}
            </button>
          </form>

          <p className="text-center text-on-surface-variant text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export { Signup };
