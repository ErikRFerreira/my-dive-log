import { X } from 'lucide-react';
import Logo from '../common/Logo';
import Button from '../ui/button';
import MainNav from './MainNav';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const mobileStateClass = isOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <aside
      className={`col-start-1 row-start-1 row-span-2 bg-[#0f1419] border-r border-[#1e2936] flex flex-col z-50 fixed inset-y-0 left-0 w-[90vw] max-w-[360px] transition-transform duration-300 ${mobileStateClass} min-[992px]:static min-[992px]:translate-x-0 min-[992px]:w-auto`}
    >
      <div className="p-6 flex items-center justify-between">
        <Logo />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close sidebar"
          title="Close sidebar"
          onClick={onClose}
          className="min-[992px]:hidden"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      <MainNav />
    </aside>
  );
}

export default Sidebar;
