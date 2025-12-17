import { ArrowLeftFromLine } from 'lucide-react';
import { useNavigate } from 'react-router';

import Button from './button';

function GoBack({ disabled = false }: { disabled?: boolean }) {
  const navigate = useNavigate();

  return (
    <Button
      disabled={disabled}
      onClick={() => navigate(-1)}
      variant="outline"
      className="gap-2 mb-6 bg-transparent"
    >
      <ArrowLeftFromLine className="w-4 h-4" />
      Back
    </Button>
  );
}

export default GoBack;
