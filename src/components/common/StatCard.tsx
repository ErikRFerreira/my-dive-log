import { Card } from '@/components/ui/card';

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  descriptionColor?: 'default' | 'green' | 'red';
};

function StatCard({
  title,
  value,
  description,
  icon,
  descriptionColor = 'default',
}: StatCardProps) {
  const descriptionColorClass = {
    default: 'text-gray-400',
    green: 'text-green-400',
    red: 'text-red-400',
  }[descriptionColor];

  return (
    <Card className="app-card col-span-1 relative overflow-hidden flex flex-col justify-center gap-3 min-h-[140px]">
      {icon && (
        <div className="absolute -top-2 -right-4 w-42 h-42 text-white/5 rotate-12">{icon}</div>
      )}
      <p className="text-gray-400 text-xs uppercase mb-2 relative z-10 ">{title}</p>
      <h3 className="text-white text-3xl font-bold relative z-10 max-[991px]:text-[26px]">
        {value}
      </h3>
      {description && (
        <p className={`${descriptionColorClass} text-sm relative z-10 mt-2`}>{description}</p>
      )}
    </Card>
  );
}

export default StatCard;
