import Logo from '../common/Logo';
import MainNav from './MainNav';

function Sidebar() {
  return (
    <aside className="col-start-1 row-start-1 row-span-2 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 flex flex-col">
      <Logo />
      <MainNav />
    </aside>
  );
}

export default Sidebar;
