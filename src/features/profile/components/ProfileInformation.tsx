import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, User as UserIcon, Calendar } from 'lucide-react';

type ProfileProps = {
  user: User | undefined;
};

function ProfileInformation({ user }: ProfileProps) {
  if (!user) return null;

  const { email } = user;

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
            <AvatarFallback className="text-white font-bold text-lg">JD</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" className="gap-2 bg-transparent">
              Change Avatar
            </Button>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF (max 2MB)</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="John Diver"
              defaultValue="John Diver"
              className="bg-slate-900/50 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
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
              value="January 15, 2023"
              disabled
              className="bg-slate-900/50 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              placeholder="Tell us about your diving experience..."
              defaultValue="Passionate scuba diver with 10+ years of experience exploring the world's most beautiful coral reefs."
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={4}
            />
          </div>
        </div>

        <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProfileInformation;
