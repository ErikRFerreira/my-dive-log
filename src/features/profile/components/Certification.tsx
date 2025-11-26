import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';

function Certification() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Diving Certification</CardTitle>
        <CardDescription>Your certification details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cert">Certification Level</Label>
            <Input
              id="cert"
              value="Advanced Open Water Diver"
              disabled
              className="bg-slate-900/50 border-slate-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agency">Certifying Agency</Label>
            <Input id="agency" value="PADI" disabled className="bg-slate-900/50 border-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Certification;
