import { Card } from '@/components/ui/card';

function SkeletonCard() {
  return (
    <Card className="app-card skeleton-card col-span-1 relative overflow-hidden flex flex-col justify-center gap-3 min-h-[140px]"></Card>
  );
}

export default SkeletonCard;
