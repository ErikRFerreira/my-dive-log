import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, User as UserIcon, Calendar } from 'lucide-react';
import { getUserAvatarData } from '@/shared/utils/userAvatar';
import { useEffect, useRef, useState } from 'react';
import type { UserProfile } from '@/features/profile';
import toast from 'react-hot-toast';
import { AVATAR_ALLOWED_MIME_TYPES, prepareAvatarUpload } from '@/shared/utils/avatarUpload';
import { useUploadAvatar } from '../hooks/useUploadAvatar';
import { useAvatarSignedUrl } from '../hooks/useAvatarSignedUrl';
import InlineSpinner from '@/components/common/InlineSpinner';
import { getAvatarDisplay } from '@/shared/utils/avatarDisplay';

type ProfileProps = {
  user: User | undefined;
  profile: UserProfile | null | undefined;
  isLoading: boolean;
  isSaving: boolean;
  onUpsert: (profileData: Partial<UserProfile>) => void;
};

function ProfileInformation({ user, profile, isLoading, isSaving, onUpsert }: ProfileProps) {
  const [bio, setBio] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { signedUrl, isLoading: isLoadingAvatarUrl } = useAvatarSignedUrl(profile?.avatar_path);
  const { isPending: isUploadingAvatar, uploadAvatar } = useUploadAvatar(user?.id);
  const [imageStatus, setImageStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');

  useEffect(() => {
    setBio(profile?.bio ?? '');
  }, [profile?.bio]);

  const handleSave = () => {
    const normalizedBio = bio.trim();
    onUpsert({ bio: normalizedBio ? normalizedBio : null });
  };

  const handlePickAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!user) return;

    try {
      const prepared = await prepareAvatarUpload(file, { maxBytes: 100_000, maxDimension: 256 });
      await uploadAvatar(prepared);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process avatar image.';
      toast.error(message);
    }
  };

  const { avatarUrl: fallbackAvatarUrl, initials } = getUserAvatarData(user);

  const hasStoredAvatar = !!profile?.avatar_path;
  const isProfileResolved = profile !== undefined && !isLoading;
  const { avatarUrl, isPending } = getAvatarDisplay({
    isProfileResolved,
    hasStoredAvatar,
    signedUrl,
    isLoadingSignedUrl: isLoadingAvatarUrl,
    googleAvatarUrl: fallbackAvatarUrl,
  });

  useEffect(() => {
    if (!avatarUrl) {
      setImageStatus('idle');
      return;
    }
    setImageStatus('loading');
  }, [avatarUrl]);

  const showSpinner = isUploadingAvatar || isPending || imageStatus === 'loading';

  if (!user) return null;

  const { email } = user;
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-600">
            <AvatarImage
              src={avatarUrl || undefined}
              alt="User Avatar"
              referrerPolicy="no-referrer"
              onLoadingStatusChange={(status) => {
                if (status === 'idle') setImageStatus('idle');
                if (status === 'loading') setImageStatus('loading');
                if (status === 'loaded') setImageStatus('loaded');
                if (status === 'error') setImageStatus('error');
              }}
            />
            <AvatarFallback className="bg-transparent text-white font-semibold">
              {showSpinner ? (
                <InlineSpinner size={22} style={{ marginLeft: 0 }} />
              ) : (
                initials || 'U'
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_ALLOWED_MIME_TYPES.join(',')}
              onChange={handleAvatarChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={handlePickAvatar}
              disabled={isLoading || isSaving || isUploadingAvatar || isLoadingAvatarUrl}
            >
              {isUploadingAvatar ? 'Uploading…' : 'Change Avatar'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG, or WebP (max 100KB)</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Full Name
            </Label>
            <Input id="name" className="bg-slate-900/50 border-slate-700" defaultValue={fullName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              disabled
              placeholder={email}
              defaultValue={email}
              className="bg-slate-900/50 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Member Since
            </Label>
            <Input
              id="joinDate"
              type="text"
              value={joinDate}
              disabled
              className="bg-slate-900/50 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isLoading || isSaving}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={4}
            />
          </div>
        </div>

        <Button disabled={isLoading || isSaving} className="w-full" onClick={handleSave}>
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProfileInformation;
