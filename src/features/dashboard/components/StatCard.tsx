import { Card, CardContent } from '@/components/ui/card';

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
  color?: string;
};

function StatCard({ title, value, description, icon, color }: StatCardProps) {
  return (
    <Card className="bg-linear-to-br from-card to-slate-50 dark:to-slate-900 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          </div>
          {icon && (
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white p-2`}
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
