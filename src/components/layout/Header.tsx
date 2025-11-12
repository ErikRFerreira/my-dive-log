import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { LogOut } from 'lucide-react';

import Button from '../ui/button';
import DarkModeToggle from '../ui/DarkModeToggle';

function Header() {
  return (
    <header className="col-start-2 row-start-1 h-20 border-b border-border bg-card flex items-center justify-between px-8 shadow-sm">
      <p className="text-muted-foreground mt-1">Track, explore, and master your dives</p>
      <div className="flex items-center gap-4">
        <DarkModeToggle />
        <Avatar className="w-10 h-10">
          <AvatarImage src="/abstract-profile.png" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" aria-label="Log out" title="Log out">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}

export default Header;
