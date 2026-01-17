import InlineSpinner from '@/components/common/InlineSpinner';
import Loading from '@/components/common/Loading';
import Button from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CERTIFICATION_LEVELS, CERTIFYING_AGENCIES } from '@/shared/constants';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

import type { UserProfile } from '@/features/profile';

function matchOption(rawValue: string | null | undefined, options: readonly string[]) {
  const raw = (rawValue ?? '').trim();
  if (!raw) return '';

  const lower = raw.toLowerCase();
  return options.find((opt) => opt.toLowerCase() === lower) ?? '';
}

type CertificationProps = {
  profile: UserProfile | null | undefined;
  isLoading: boolean;
  isSaving: boolean;
  onUpsert: (profileData: Partial<UserProfile>) => void;
};

function Certification({ profile, isLoading, isSaving, onUpsert }: CertificationProps) {
  const [level, setLevel] = useState('');
  const [agency, setAgency] = useState('');

  useEffect(() => {
    setLevel(matchOption(profile?.cert_level, CERTIFICATION_LEVELS));
    setAgency(matchOption(profile?.agency, CERTIFYING_AGENCIES));
  }, [profile?.agency, profile?.cert_level]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onUpsert({
      cert_level: level || null,
      agency: agency || null,
    });
  };

  if (isLoading) return <Loading />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diving Certification</CardTitle>
        <CardDescription>Your certification details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cert">Certification Level</Label>
              <select
                id="cert"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled={isSaving}
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-700 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  Select certification level
                </option>
                {CERTIFICATION_LEVELS.map((cert) => (
                  <option key={cert} value={cert}>
                    {cert}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agency">Certifying Agency</Label>
              <select
                id="agency"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                disabled={isSaving}
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-700 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  Select certifying agency
                </option>
                {CERTIFYING_AGENCIES.map((agencyOption) => (
                  <option key={agencyOption} value={agencyOption}>
                    {agencyOption}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                saving... <InlineSpinner />
              </>
            ) : (
              'Save Certification'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default Certification;
