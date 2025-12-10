import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Dive } from '@/features/dives';

type MonthlyChartProps = {
  dives: Dive[];
};

function MonthlyChart({ dives }: MonthlyChartProps) {
  const monthlyActivityData = dives.reduce(
    (acc, dive) => {
      const diveDate = new Date(dive.date);
      const month = diveDate.toLocaleString('en-US', { month: 'long' });
      const year = diveDate.getFullYear();
      const monthYear = `${month} ${year}`;

      const existingMonth = acc.find((data) => data.month === monthYear);
      if (existingMonth) {
        existingMonth.dives += 1;
      } else {
        acc.push({ month: monthYear, dives: 1 });
      }
      return acc;
    },
    [] as { month: string; dives: number }[]
  );

  return (
    <Card className="bg-card border-slate-200 dark:border-slate-700">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-foreground">Monthly Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyActivityData} barSize={60}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--foreground))"
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <YAxis stroke="hsl(var(--foreground))" tick={{ fill: 'hsl(var(--foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar
              dataKey="dives"
              fill="hsl(174, 62%, 55%)"
              radius={[8, 8, 0, 0]}
              name="Number of Dives"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default MonthlyChart;
