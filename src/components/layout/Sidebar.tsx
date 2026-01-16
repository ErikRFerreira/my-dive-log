import Logo from '../common/Logo';
import MainNav from './MainNav';

function Sidebar() {
  return (
    <aside className="col-start-1 row-start-1 row-span-2 bg-[#0f1419] border-r border-[#1e2936] flex flex-col relative z-20">
      <div className="p-6">
        <Logo />
      </div>
      <MainNav />
    </aside>
  );
}

export default Sidebar;
