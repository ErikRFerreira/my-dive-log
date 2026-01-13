import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

function AddDive() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/log-dive')}
      className="group fixed bottom-8 right-8 z-50 flex items-center justify-center gap-0 bg-primary hover:bg-primary/90 rounded-full w-14 h-14 p-0 shadow-lg transition-all duration-300 hover:w-48 hover:gap-2 hover:px-4 hover:shadow-xl"
    >
      <Plus className="w-6 h-6 flex-shrink-0" />
      <span className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:w-auto group-hover:opacity-100">
        Log New Dive
      </span>
    </Button>
  );
}

export default AddDive;
