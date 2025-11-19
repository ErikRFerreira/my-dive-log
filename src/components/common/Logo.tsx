import { Waves } from 'lucide-react';

function Logo() {
  return (
    <div className="p-6 border-b border-slate-700">
      <div className="flex items-center gap-3">
        <Waves className="w-8 h-8 text-white" />
        <h2 className="text-xl font-bold text-white">Dive Master</h2>
      </div>
    </div>
  );
}

export default Logo;
