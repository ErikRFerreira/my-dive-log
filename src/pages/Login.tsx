import { LoginForm } from '@/features/authentication';
import { Waves } from 'lucide-react';

function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Waves className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Dive Master</span>
          </div>
        </div>
        {/* Login form*/}
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;
