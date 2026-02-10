import DiverIcon from '@/assets/icons/diver.svg';
import { LoginForm } from '@/features/authentication';

function Login() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 overflow-x-hidden bg-slate-900">
      {/* Subtle Ambient Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-15%] w-[60vw] h-[60vw] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-[400px] flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center gap-5 pt-4 pb-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-600/5 shadow-lg ring-1 ring-white/10">
            <img
              src={DiverIcon}
              alt="Diver"
              className="w-10 h-10"
              style={{
                filter:
                  'invert(42%) sepia(94%) saturate(1876%) hue-rotate(195deg) brightness(98%) contrast(101%)',
              }}
            />
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <h1 className="text-[28px] font-bold tracking-tight text-white leading-tight">
              Dive Log
            </h1>
            <p className="text-slate-400 text-base font-normal">
              Welcome back, Diver.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;

