import { LogOut } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Button from '../ui/button';
import DarkModeToggle from '../ui/DarkModeToggle';
import { useLogout } from '@/features/authentication/hooks/useLogout';
import InlineSpinner from '../common/InlineSpinner';
import { useUser } from '@/features/authentication/hooks/useUser';
import { getUserAvatarData } from '@/shared/utils/userAvatar';
import { useGetProfile } from '@/features/profile/hooks/useGetProfile';
import { useAvatarSignedUrl } from '@/features/profile/hooks/useAvatarSignedUrl';
import { getAvatarDisplay } from '@/shared/utils/avatarDisplay';
import { useEffect, useState } from 'react';

function Header() {
  const { logout, isLoggingOut } = useLogout();
  const { user, isLoading, isError } = useUser();

  const { profile, isLoading: isProfileLoading } = useGetProfile(user?.id);
  const { signedUrl, isLoading: isLoadingSignedUrl } = useAvatarSignedUrl(profile?.avatar_path);

  const { avatarUrl: fallbackAvatarUrl, initials } = getUserAvatarData(user);
  const isProfileResolved = profile !== undefined && !isProfileLoading;
  const hasStoredAvatar = !!profile?.avatar_path;
  const { avatarUrl, isPending } = getAvatarDisplay({
    isProfileResolved,
    hasStoredAvatar,
    signedUrl,
    isLoadingSignedUrl,
    googleAvatarUrl: fallbackAvatarUrl,
  });

  const [imageStatus, setImageStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');

  useEffect(() => {
    if (!avatarUrl) {
      setImageStatus('idle');
      return;
    }
    setImageStatus('loading');
  }, [avatarUrl]);

  const showSpinner = !!user && !isError && (isPending || imageStatus === 'loading');

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Diver';
  const certLevel = profile?.cert_level;

  return (
    <header className="col-start-2 row-start-1 h-20 border-b border-[#1e2936] bg-[#0f1419]/20 backdrop-blur-[20px] flex items-center justify-between px-8 shadow-sm relative z-20">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={avatarUrl || undefined}
            alt="User avatar"
            referrerPolicy="no-referrer"
            onLoadingStatusChange={(status) => {
              if (status === 'idle') setImageStatus('idle');
              if (status === 'loading') setImageStatus('loading');
              if (status === 'loaded') setImageStatus('loaded');
              if (status === 'error') setImageStatus('error');
            }}
          />
          <AvatarFallback>
            {showSpinner || isLoading ? (
              <InlineSpinner size={18} style={{ marginLeft: 0 }} />
            ) : (
              initials || 'U'
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-foreground font-medium">{userName}</p>
          {certLevel && <p className="text-xs text-muted-foreground">{certLevel}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DarkModeToggle />
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
