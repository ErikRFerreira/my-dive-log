import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { LogOut } from 'lucide-react';
import DarkModeToggle from '../ui/DarkModeToggle';
import Button from '../ui/button';

function Header() {
  return (
    <header className="col-start-2 row-start-1 h-16 border-b border-border bg-card flex items-center justify-between px-8 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Here's your dive summary</p>
      </div>

      <div className="flex items-center gap-4">
        <DarkModeToggle />
        <Avatar className="w-10 h-10">
          <AvatarImage src="/abstract-profile.png" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}

export default Header;
