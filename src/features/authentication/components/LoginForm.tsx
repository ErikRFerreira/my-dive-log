import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '../hooks/useLogin';
import InlineSpinner from '@/components/common/InlineSpinner';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isLogingIn } = useLogin();

  const navigate = useNavigate();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!email || !password) return;

    login(
      { email, password },
      {
        onSettled: () => {
          setEmail('');
          setPassword('');
        },
      }
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border-blue-200 dark:border-slate-700 shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-slate-900 dark:text-white">Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your dive log</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>

          <Button
            type="submit"
            disabled={isLogingIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLogingIn ? 'Signing in...' : 'Sign In'}
            {isLogingIn && <InlineSpinner />}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Sign up
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
