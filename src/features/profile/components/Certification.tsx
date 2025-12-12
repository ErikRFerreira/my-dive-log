import InlineSpinner from '@/components/common/InlineSpinner';
import Loading from '@/components/common/Loading';
import Button from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CERTIFICATION_LEVELS, CERTIFYING_AGENCIES } from '@/shared/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@radix-ui/react-label';
import { useEffect, useState } from 'react';

import { useGetProfile } from '../hooks/useGetProfile';
import { useUpsertProfile } from '../hooks/useUpsertProfile';

function Certification() {
  const { profile, isLoading } = useGetProfile();
  const { isPending, mutateUpsert } = useUpsertProfile();
  const levelFromProfile = profile?.cert_level ?? '';
  const agencyFromProfile = profile?.agency ?? '';
  const [level, setLevel] = useState('');
  const [agency, setAgency] = useState('');

  useEffect(() => {
    if (levelFromProfile) setLevel(levelFromProfile);
    if (agencyFromProfile) setAgency(agencyFromProfile);
  }, [agencyFromProfile, levelFromProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    mutateUpsert({ cert_level: level, agency: agency });
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
              <Select onValueChange={(value) => setLevel(value)} value={level}>
                <SelectTrigger id="cert" className="border-slate-700">
                  <SelectValue placeholder="Select certification level" />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFICATION_LEVELS.map((cert) => (
                    <SelectItem key={cert} value={cert}>
                      {cert}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agency">Certifying Agency</Label>
              <Select onValueChange={(value) => setAgency(value)} value={agency}>
                <SelectTrigger id="agency" className="border-slate-700">
                  <SelectValue placeholder="Select certifying agency" />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFYING_AGENCIES.map((agency) => (
                    <SelectItem key={agency} value={agency}>
                      {agency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
          >
            {isPending ? (
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
