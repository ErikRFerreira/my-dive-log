import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Waves } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InlineSpinner from '@/components/common/InlineSpinner';
import { supabase } from '@/services/supabase';
import { updatePassword } from '@/services/apiAuth';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/authentication/schemas/authSchemas';

function ResetPassword() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    async function bootstrap() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setHasSession(!!data.session);
      } catch (error: unknown) {
        console.error('Reset password session error:', error);
        setHasSession(false);
      } finally {
        setIsReady(true);
      }
    }

    bootstrap();
  }, []);

  const { mutate: savePassword, isPending } = useMutation({
    mutationFn: (nextPassword: string) => updatePassword({ password: nextPassword }),
    onSuccess: async () => {
      toast.success('Password updated. Please sign in again.');
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    },
    onError: (error: Error) => {
      console.error('Update password error:', error);
      toast.error(error.message || 'Failed to update password. Please try again.');
    },
  });

  const isBusy = isPending || isSubmitting;
  const passwordValue = watch('password').trim();
  const confirmValue = watch('confirmPassword').trim();

  const onSubmit = (values: ResetPasswordFormValues) => {
    if (!hasSession) {
      toast.error('This reset link is invalid or expired.');
      return;
    }
    savePassword(values.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Waves className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-white">Dive Master</span>
          </div>
        </div>

        <Card className="bg-slate-800 border-slate-700 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-white">
              Set a new password
            </CardTitle>
            <CardDescription>Choose a password with at least 6 characters.</CardDescription>
          </CardHeader>
          <CardContent>
            {!isReady ? (
              <div className="text-sm text-slate-400">Checking reset link…</div>
            ) : !hasSession ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  This reset link is invalid or expired. Please request a new one.
                </p>
                <Button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate('/forgot-password', { replace: true })}
                >
                  Request new reset link
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    New password
                  </Label>
                  <div className="relative flex items-center">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-invalid={!!errors.password}
                      disabled={isBusy}
                      className="bg-slate-700 border-slate-600 pr-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={isBusy}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password?.message && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">
                    Confirm password
                  </Label>
                  <div className="relative flex items-center">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirmPassword}
                      disabled={isBusy}
                      className="bg-slate-700 border-slate-600 pr-10"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      disabled={isBusy}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword?.message && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={
                    !hasSession ||
                    isBusy ||
                    !passwordValue ||
                    !confirmValue ||
                    !!errors.password ||
                    !!errors.confirmPassword
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update password
                  {isBusy && <InlineSpinner />}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ResetPassword;

