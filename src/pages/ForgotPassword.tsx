import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { Waves } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InlineSpinner from '@/components/common/InlineSpinner';
import { requestPasswordReset } from '@/services/apiAuth';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/authentication/schemas/authSchemas';

function ForgotPassword() {
  const navigate = useNavigate();
  const [didSubmit, setDidSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const { mutate: sendResetEmail, isPending } = useMutation({
    mutationFn: (emailAddress: string) => requestPasswordReset({ email: emailAddress }),
    onSuccess: () => {
      setDidSubmit(true);
      toast.success('Password reset email sent. Check your inbox.');
    },
    onError: (error: Error) => {
      console.error('Password reset request error:', error);
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    },
  });

  const isBusy = isPending || isSubmitting;
  const currentEmail = watch('email').trim();

  const onSubmit = (values: ForgotPasswordFormValues) => {
    sendResetEmail(values.email.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Waves className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Dive Master</span>
          </div>
        </div>

        <Card className="bg-white dark:bg-slate-800 border-blue-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-slate-900 dark:text-white">
              Forgot your password?
            </CardTitle>
            <CardDescription>We’ll email you a link to reset it.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  disabled={isBusy || didSubmit}
                  className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  {...register('email')}
                />
                {errors.email?.message && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isBusy || didSubmit || !currentEmail}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Send reset link
                {isBusy && <InlineSpinner />}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Remembered it?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Back to sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPassword;
