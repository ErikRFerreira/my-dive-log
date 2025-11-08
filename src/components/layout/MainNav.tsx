import { NavLink } from 'react-router';
import { BarChart3, Settings, User, MapPin } from 'lucide-react';

function MainNav() {
  const linkClasses = ({ isActive }: { isActive: boolean }) => {
    const base =
      'group flex items-center gap-3 px-3 py-2 rounded-md transition-colors ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ' +
      'focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950';
    return isActive
      ? `${base} bg-white/15 text-white`
      : `${base} text-slate-200 hover:text-white hover:bg-white/10`;
  };

  const iconCls = 'w-5 h-5 shrink-0 opacity-90 group-hover:opacity-100';

  return (
    <nav className="flex-1 p-4">
      <ul className="space-y-1">
        <li>
          <NavLink to="/dashboard" className={linkClasses}>
            <BarChart3 className={iconCls} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/dives" className={linkClasses}>
            <MapPin className={iconCls} />
            <span>Dives</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/account" className={linkClasses}>
            <User className={iconCls} />
            <span>Account</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={linkClasses}>
            <Settings className={iconCls} />
            <span>Settings</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default MainNav;
