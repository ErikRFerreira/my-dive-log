import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

function AddDive() {
  const navigate = useNavigate();

  return (
    <div>
      <Button
        onClick={() => navigate('/log-dive')}
        className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
      >
        <Plus className="w-5 h-5" />
        Add Dive
      </Button>
    </div>
  );
}

export default AddDive;
