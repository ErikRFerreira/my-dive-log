import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { Dive } from '@/features/dives';
import { useState, useMemo } from 'react';

type MonthlyChartProps = {
  dives: Dive[];
};

function MonthlyChart({ dives }: MonthlyChartProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

  // Get all available years from dives
  const availableYears = useMemo(() => {
    const years = dives.map((dive) => new Date(dive.date).getFullYear());
    const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a);
    return uniqueYears;
  }, [dives]);

  // Prepare monthly activity data
  const monthlyActivityData = useMemo(() => {
    const filteredDives = dives.filter(
      (dive) => new Date(dive.date).getFullYear() === parseInt(selectedYear)
    );

    return filteredDives.reduce(
      (acc, dive) => {
        const diveDate = new Date(dive.date);
        const month = diveDate.toLocaleString('en-US', { month: 'long' });

        const existingMonth = acc.find((data) => data.month === month);
        if (existingMonth) {
          existingMonth.dives += 1;
        } else {
          acc.push({ month, dives: 1 });
        }
        return acc;
      },
      [] as { month: string; dives: number }[]
    );
  }, [dives, selectedYear]);

  return (
    <Card className="bg-card border-slate-200 dark:border-slate-700">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Monthly Activity</CardTitle>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
