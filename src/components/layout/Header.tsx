import { LogOut } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Button from '../ui/button';
import DarkModeToggle from '../ui/DarkModeToggle';
import { useLogout } from '@/features/authentication/hooks/useLogout';
import InlineSpinner from '../common/InlineSpinner';
import { useUser } from '@/features/authentication/hooks/useUser';
import { getUserAvatarData } from '@/shared/utils/userAvatar';

function Header() {
  const { logout, isLoggingOut } = useLogout();
  const { user, isLoading, isError } = useUser();

  const { avatarUrl, initials } = getUserAvatarData(user);

  return (
    <header className="col-start-2 row-start-1 h-20 border-b border-border bg-card flex items-center justify-between px-8 shadow-sm">
      <p className="text-muted-foreground mt-1">Track, explore, and master your dives</p>
      <div className="flex items-center gap-4">
        <DarkModeToggle />
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={avatarUrl || undefined}
            alt="User avatar"
            referrerPolicy="no-referrer"
          />
          <AvatarFallback>{isLoading || isError ? '…' : initials || 'U'}</AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Log out"
          title="Log out"
          onClick={() => logout()}
          disabled={isLoggingOut}
        >
          <LogOut className="w-5 h-5" />
          {isLoggingOut && <InlineSpinner />}
        </Button>
      </div>
    </header>
  );
}

export default Header;
