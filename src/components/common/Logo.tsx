import { LogIn } from 'lucide-react';

function Logo() {
  const loggedIn = false; // Placeholder for actual authentication logic

  return (
    <div className="p-6 border-b border-slate-700">
      <div className="flex items-center gap-3">
        {loggedIn && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
            <LogIn className="w-6 h-6 text-white" />
          </div>
        )}
        <h1 className="text-xl font-bold text-white">Dive Log</h1>
      </div>
    </div>
  );
}

export default Logo;
