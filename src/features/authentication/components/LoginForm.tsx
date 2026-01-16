import InlineSpinner from '@/components/common/InlineSpinner';
import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GoogleLogo from '@/components/ui/GoogleLogo';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { useLogin } from '../hooks/useLogin';
import { loginSchema } from '../schemas/authSchemas';

import type { LoginFormValues } from '../schemas/authSchemas';

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLogingIn } = useLogin();
  const { loginWithGoogle, isGoogleLoggingIn } = useGoogleLogin();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const isBusy = isLogingIn || isGoogleLoggingIn || isSubmitting;

  const onSubmit = (values: LoginFormValues) => {
    login(values, {
      onSettled: () => reset(),
    });
  };

  return (
    <Card className="flex flex-col gap-5 w-full p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
      {/* Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full" noValidate>
        {/* Email Field */}
        <label className="flex flex-col gap-2 group">
          <span className="text-slate-700 dark:text-white text-sm font-semibold ml-1">Email</span>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <Mail className="w-5 h-5" />
            </div>
            <Input
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={isBusy}
              className="border-transparent bg-slate-50 shadow-sm ring-1 ring-slate-200 transition-all placeholder:text-slate-400 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:ring-transparent pl-10 pr-4"
              {...register('email')}
            />
          </div>
          {errors.email?.message && (
            <p className="text-xs text-red-600 dark:text-red-400 ml-1">{errors.email.message}</p>
          )}
        </label>

        {/* Password Field */}
        <label className="flex flex-col gap-2 group">
          <span className="text-slate-700 dark:text-white text-sm font-semibold ml-1">
            Password
          </span>
          <div className="relative flex items-center">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              disabled={isBusy}
              className="border-transparent bg-slate-50 shadow-sm ring-1 ring-slate-200 transition-all placeholder:text-slate-400 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:ring-transparent pl-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password?.message && (
            <p className="text-xs text-red-600 dark:text-red-400 ml-1">{errors.password.message}</p>
          )}
        </label>

        {/* Forgot Password */}
        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors underline decoration-transparent hover:decoration-blue-600/30 dark:hover:decoration-blue-400/30 underline-offset-4"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          disabled={isBusy}
          className="w-full overflow-hidden font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20 mt-2 disabled:hover:scale-100"
        >
          {isLogingIn ? 'Signing in...' : 'Log In'}
          {isLogingIn && <InlineSpinner />}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center py-2 opacity-80">
        <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
        <span className="flex-shrink-0 mx-4 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
          Or continue with
        </span>
        <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={() => loginWithGoogle()}
        disabled={isBusy}
        className="flex w-full cursor-pointer items-center justify-center gap-3 h-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-white text-base font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleLogo />
        <span>Google</span>
        {isGoogleLoggingIn && <InlineSpinner />}
      </button>

      {/* Footer Link */}
      <div className="flex items-center justify-center mt-6">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ml-1 transition-colors"
          >
            Sign Up
          </button>
        </p>
      </div>
    </Card>
  );
}

export default LoginForm;
