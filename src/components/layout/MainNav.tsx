import { NavLink } from 'react-router';
import { BarChart3, Settings, User, MapPin, ChartSpline } from 'lucide-react';
import { Button } from '@/components/ui/button';

function MainNav() {
  return (
    <nav className="flex-1 flex flex-col mt-4 p-4 space-y-2">
      <NavLink to="/dashboard">
        {({ isActive }) => (
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 rounded-lg transition-all h-12 ${
              isActive
                ? 'bg-[#1e3a45] text-primary font-medium hover:bg-[#1e3a45] hover:text-primary border border-primary/40'
                : 'text-gray-400 hover:text-primary hover:bg-[#1a2028]'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </Button>
        )}
      </NavLink>

      <NavLink to="/dives">
        {({ isActive }) => (
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 rounded-lg transition-all h-12 ${
              isActive
                ? 'bg-[#1e3a45] text-primary font-medium hover:bg-[#1e3a45] hover:text-primary border border-primary/40'
                : 'text-gray-400 hover:text-primary hover:bg-[#1a2028]'
            }`}
          >
            <ChartSpline className="w-5 h-5" />
            Dives
          </Button>
        )}
      </NavLink>

      <NavLink to="/locations">
        {({ isActive }) => (
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 rounded-lg transition-all h-12 ${
              isActive
                ? 'bg-[#1e3a45] text-primary font-medium hover:bg-[#1e3a45] hover:text-primary border border-primary/40'
                : 'text-gray-400 hover:text-primary hover:bg-[#1a2028]'
            }`}
          >
            <MapPin className="w-5 h-5" />
            Locations
          </Button>
        )}
      </NavLink>

      <NavLink to="/profile">
        {({ isActive }) => (
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 rounded-lg transition-all h-12 ${
              isActive
                ? 'bg-[#1e3a45] text-primary font-medium hover:bg-[#1e3a45] hover:text-primary border border-primary/40'
                : 'text-gray-400 hover:text-primary hover:bg-[#1a2028]'
            }`}
          >
            <User className="w-5 h-5" />
            Profile
          </Button>
        )}
      </NavLink>

      <NavLink to="/settings">
        {({ isActive }) => (
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 rounded-lg transition-all h-12 ${
              isActive
                ? 'bg-[#1e3a45] text-primary font-medium hover:bg-[#1e3a45] hover:text-primary border border-primary/40'
                : 'text-gray-400 hover:text-primary hover:bg-[#1a2028]'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Button>
        )}
      </NavLink>
    </nav>
  );
}

export default MainNav;
