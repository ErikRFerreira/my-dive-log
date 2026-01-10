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
import { useEffect, useMemo, useState } from 'react';

type MonthlyChartProps = {
  dives: Dive[];
};

function MonthlyChart({ dives }: MonthlyChartProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const years = dives.map((dive) => new Date(dive.date).getFullYear());
    const mostRecentDiveYear = Array.from(new Set(years)).sort((a, b) => b - a)[0];
    return (mostRecentDiveYear ?? currentYear).toString();
  });

  // Get all available years from dives
  const availableYears = useMemo(() => {
    const years = dives.map((dive) => new Date(dive.date).getFullYear());
    const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a);
    return uniqueYears;
  }, [dives]);

  useEffect(() => {
    if (availableYears.length === 0) return;

    const selectedYearNumber = parseInt(selectedYear);
    if (!availableYears.includes(selectedYearNumber)) {
      setSelectedYear(availableYears[0].toString());
    }
  }, [availableYears, selectedYear]);

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
        {monthlyActivityData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No dives logged for {selectedYear}.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyActivityData} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                stroke="var(--chart-text)"
                tick={{ fill: 'var(--chart-text)' }}
              />
              <YAxis
                stroke="var(--chart-text)"
                tick={{ fill: 'var(--chart-text)' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--chart-text)',
                }}
                labelStyle={{ color: 'var(--chart-text)' }}
                itemStyle={{ color: 'var(--chart-text)' }}
              />
              <Bar
                dataKey="dives"
                fill="hsl(174, 62%, 55%)"
                radius={[8, 8, 0, 0]}
                name="Number of Dives"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default MonthlyChart;
