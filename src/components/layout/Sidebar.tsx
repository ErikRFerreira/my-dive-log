import Logo from '../common/Logo';
import MainNav from './MainNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/features/authentication';

function Sidebar() {
  const { user } = useUser();
  const userMetadata = user?.user_metadata;
  const fullName = userMetadata?.full_name || 'User';
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="col-start-1 row-start-1 row-span-2 bg-[#0f1419] border-r border-[#1e2936] flex flex-col">
      <div className="p-6">
        <Logo />
      </div>
      <MainNav />
      <div className="p-4 border-t border-[#1e2936]">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a2028] hover:bg-[#1e2936] transition-colors cursor-pointer">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={userMetadata?.avatar_url} alt={fullName} />
              <AvatarFallback className="bg-[#00d9ff] text-[#0f1419] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a2028]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{fullName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
