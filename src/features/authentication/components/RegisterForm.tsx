import InlineSpinner from '@/components/common/InlineSpinner';
import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GoogleLogo from '@/components/ui/GoogleLogo';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { useRegister } from '../hooks/useRegister';
import { registerSchema } from '../schemas/authSchemas';

import type { RegisterFormValues } from '../schemas/authSchemas';

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isRegistering } = useRegister();
  const { loginWithGoogle, isGoogleLoggingIn } = useGoogleLogin();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const isBusy = isRegistering || isGoogleLoggingIn || isSubmitting;

  const onSubmit = (values: RegisterFormValues) => {
    registerUser(
      { fullName: values.fullName, email: values.email, password: values.password },
      { onSettled: () => reset() }
    );
  };

  return (
    <Card className="flex flex-col gap-5 w-full p-8 bg-slate-800/80 backdrop-blur-xl border-slate-700/50 shadow-2xl">
      {/* Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full" noValidate>
        {/* Full Name Field */}
        <label className="flex flex-col gap-2 group">
          <span className="text-white text-sm font-semibold ml-1">
            Full Name
          </span>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <User className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              aria-invalid={!!errors.fullName}
              disabled={isBusy}
              className="border-transparent shadow-sm transition-all bg-slate-800 text-white placeholder:text-slate-500 ring-transparent pl-10 pr-4"
              {...register('fullName')}
            />
          </div>
          {errors.fullName?.message && (
            <p className="text-xs text-red-400 ml-1">{errors.fullName.message}</p>
          )}
        </label>

        {/* Email Field */}
        <label className="flex flex-col gap-2 group">
          <span className="text-white text-sm font-semibold ml-1">Email</span>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <Mail className="w-5 h-5" />
            </div>
            <Input
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={isBusy}
              className="border-transparent shadow-sm transition-all bg-slate-800 text-white placeholder:text-slate-500 ring-transparent pl-10 pr-4"
              {...register('email')}
            />
          </div>
          {errors.email?.message && (
            <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>
          )}
        </label>

        {/* Password Field */}
        <label className="flex flex-col gap-2 group">
          <span className="text-white text-sm font-semibold ml-1">
            Password
          </span>
          <div className="relative flex items-center">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              disabled={isBusy}
              className="border-transparent shadow-sm transition-all bg-slate-800 text-white placeholder:text-slate-500 ring-transparent pl-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 text-slate-500 hover:text-blue-400 transition-colors flex items-center justify-center cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password?.message && (
            <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>
          )}
        </label>

        {/* Confirm Password Field */}
        <label className="flex flex-col gap-2 group">
          <span className="text-white text-sm font-semibold ml-1">
            Confirm Password
          </span>
          <div className="relative flex items-center">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              disabled={isBusy}
              className="border-transparent shadow-sm transition-all bg-slate-800 text-white placeholder:text-slate-500 ring-transparent pl-10 pr-10"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-4 text-slate-500 hover:text-blue-400 transition-colors flex items-center justify-center cursor-pointer"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword?.message && (
            <p className="text-xs text-red-400 ml-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </label>

        {/* Register Button */}
        <Button
          type="submit"
          disabled={isBusy}
          className="w-full overflow-hidden font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20 mt-2 disabled:hover:scale-100"
        >
          {isRegistering ? 'Creating account...' : 'Create Account'}
          {isRegistering && <InlineSpinner />}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center py-2 opacity-80">
        <div className="flex-grow border-t border-slate-700"></div>
        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">
          Or continue with
        </span>
        <div className="flex-grow border-t border-slate-700"></div>
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={() => loginWithGoogle()}
        disabled={isBusy}
        className="flex w-full cursor-pointer items-center justify-center gap-3 h-10 rounded-md bg-slate-800 text-white text-base font-bold border border-slate-700 hover:bg-slate-750 hover:border-slate-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleLogo />
        <span>Google</span>
        {isGoogleLoggingIn && <InlineSpinner />}
      </button>

      {/* Footer Link */}
      <div className="flex items-center justify-center mt-6">
        <p className="text-slate-400 text-sm">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-bold text-blue-400 hover:text-blue-300 ml-1 transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>
    </Card>
  );
}

export default RegisterForm;

