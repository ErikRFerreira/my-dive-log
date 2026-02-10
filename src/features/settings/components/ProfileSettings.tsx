import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

import type { User as SupabaseUser } from '@supabase/supabase-js';
import Loading from '@/components/common/Loading';
import { useEffect, useMemo, useState } from 'react';
import InlineSpinner from '@/components/common/InlineSpinner';
import {
  userHasEmailPasswordIdentity,
  userIsGoogleOnly,
} from '@/features/authentication/utils/userAuthProviders';
import { useUpdateEmail } from '@/features/authentication/hooks/useUpdateEmail';
import { useUpdatePassword } from '@/features/authentication/hooks/useUpdatePassword';

type ProfileSettingsProps = {
  isUserLoading: boolean;
  user: SupabaseUser | null;
};

function ProfileSettings({ isUserLoading, user }: ProfileSettingsProps) {
  const { saveEmail, isPending: isUpdatingEmail } = useUpdateEmail();
  const { savePassword, isPending: isUpdatingPassword } = useUpdatePassword();

  const canEditCredentials = useMemo(() => userHasEmailPasswordIdentity(user), [user]);
  const helperText = useMemo(() => {
    if (!user) return '';
    if (canEditCredentials) return '';
    return userIsGoogleOnly(user) ? 'Managed by Google' : 'Managed by your sign-in provider';
  }, [canEditCredentials, user]);

  const [emailDraft, setEmailDraft] = useState('');
  const [confirmEmailDraft, setConfirmEmailDraft] = useState('');
  const [passwordDraft, setPasswordDraft] = useState('');
  const [confirmPasswordDraft, setConfirmPasswordDraft] = useState('');

  useEffect(() => {
    setEmailDraft(user?.email ?? '');
    setConfirmEmailDraft('');
  }, [user?.email]);

  const emailValue = user?.email ?? '';
  const isBusy = isUserLoading || isUpdatingEmail || isUpdatingPassword;
  const normalizedEmailDraft = emailDraft.trim();
  const normalizedConfirmEmailDraft = confirmEmailDraft.trim();
  const emailsMatch =
    normalizedEmailDraft.toLowerCase() === normalizedConfirmEmailDraft.toLowerCase();
  const passwordsMatch = passwordDraft === confirmPasswordDraft;

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!canEditCredentials) return;
    const nextEmail = normalizedEmailDraft;
    if (!nextEmail || nextEmail === emailValue) return;
    if (!emailsMatch) return;
    saveEmail(nextEmail);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!canEditCredentials) return;
    const nextPassword = passwordDraft.trim();
    if (nextPassword.length < 6) return;
    if (!passwordsMatch) return;
    savePassword(nextPassword);
    setPasswordDraft('');
    setConfirmPasswordDraft('');
  };

  return (
    <Card>
      <CardHeader className="max-[991px]:p-4">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>Manage your personal information and account settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-[991px]:p-4">
        {isUserLoading ? (
          <Loading />
        ) : !user ? (
          <p>No user information available.</p>
        ) : (
          <>
            <form className="space-y-3" onSubmit={handleSaveEmail}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  disabled={!canEditCredentials || isBusy}
                />
                {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmEmail">Confirm new email</Label>
                <Input
                  id="confirmEmail"
                  type="email"
                  value={confirmEmailDraft}
                  onChange={(e) => setConfirmEmailDraft(e.target.value)}
                  disabled={!canEditCredentials || isBusy}
                />
                {canEditCredentials &&
                normalizedEmailDraft &&
                normalizedConfirmEmailDraft &&
                !emailsMatch ? (
                  <p className="text-xs text-destructive">Emails do not match.</p>
                ) : null}
              </div>
              <Button
                type="submit"
                disabled={
                  !canEditCredentials ||
                  isBusy ||
                  !normalizedEmailDraft ||
                  !normalizedConfirmEmailDraft ||
                  !emailsMatch ||
                  normalizedEmailDraft === emailValue
                }
              >
                Update email
                {isUpdatingEmail && <InlineSpinner />}
              </Button>
            </form>

            <form className="space-y-3" onSubmit={handleSavePassword}>
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordDraft}
                  onChange={(e) => setPasswordDraft(e.target.value)}
                  disabled={!canEditCredentials || isBusy}
                />
                {helperText ? (
                  <p className="text-xs text-muted-foreground">{helperText}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">At least 6 characters.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPasswordDraft}
                  onChange={(e) => setConfirmPasswordDraft(e.target.value)}
                  disabled={!canEditCredentials || isBusy}
                />
                {canEditCredentials &&
                !helperText &&
                passwordDraft.trim().length > 0 &&
                confirmPasswordDraft.trim().length > 0 &&
                !passwordsMatch ? (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
                ) : null}
              </div>
              <Button
                type="submit"
                disabled={
                  !canEditCredentials ||
                  isBusy ||
                  passwordDraft.trim().length < 6 ||
                  confirmPasswordDraft.trim().length < 6 ||
                  !passwordsMatch
                }
              >
                Update password
                {isUpdatingPassword && <InlineSpinner />}
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ProfileSettings;
