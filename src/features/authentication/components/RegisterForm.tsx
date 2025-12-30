import InlineSpinner from '@/components/common/InlineSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Chrome, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { useRegister } from '../hooks/useRegister';
import { registerSchema, type RegisterFormValues } from '../schemas/authSchemas';
import { useState } from 'react';

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
    <Card className="bg-white dark:bg-slate-800 border-blue-200 dark:border-slate-700 shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-slate-900 dark:text-white">Create Account</CardTitle>
        <CardDescription>Sign up with your details or use Google</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              aria-invalid={!!errors.fullName}
              disabled={isBusy}
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              {...register('fullName')}
            />
            {errors.fullName?.message && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={isBusy}
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              {...register('email')}
            />
            {errors.email?.message && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                disabled={isBusy}
                className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 pr-10"
                {...register('password')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password?.message && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                disabled={isBusy}
                className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 pr-10"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 p-1"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword?.message && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isBusy}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isRegistering ? 'Creating account...' : 'Create Account'}
            {isRegistering && <InlineSpinner />}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-500 dark:text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        <Button
          type="button"
          variant="default"
          onClick={() => loginWithGoogle()}
          disabled={isBusy}
          className="w-full"
        >
          <Chrome />
          Continue with Google
          {isGoogleLoggingIn && <InlineSpinner />}
        </Button>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Sign in
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default RegisterForm;
