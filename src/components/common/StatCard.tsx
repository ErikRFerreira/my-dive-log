import { Card, CardContent } from '@/components/ui/card';

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  bg?: string;
};

function StatCard({ title, value, description, icon, color, bg }: StatCardProps) {
  const cardClass = bg
    ? `${bg} shadow-lg hover:shadow-xl transition-shadow`
    : 'bg-gradient-to-br from-card to-slate-50 dark:to-slate-900 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-sm transition-shadow';

  return (
    <Card className={cardClass}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
            <h3 className="text-2xl font-bold text-foreground mt-2">{value}</h3>
            {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
          </div>
          {icon && (
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white`}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
