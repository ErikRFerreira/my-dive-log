import { Plus } from 'lucide-react';
import Button from './button';

function AddMediaButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="mt-2 rounded-full border-slate-600/60 bg-slate-900/40 px-5 text-slate-200 hover:bg-slate-900/70 hover:text-white"
    >
      <Plus className="h-4 w-4" />
      Add Media
    </Button>
  );
}

export default AddMediaButton;
