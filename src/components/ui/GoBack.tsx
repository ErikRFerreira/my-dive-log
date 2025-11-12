import { ArrowLeftFromLine } from 'lucide-react';
import Button from './button';
import { useNavigate } from 'react-router';

function GoBack() {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate(-1)} variant="outline" className="gap-2 mb-6 bg-transparent">
      <ArrowLeftFromLine className="w-4 h-4" />
      Back
    </Button>
  );
}

export default GoBack;
