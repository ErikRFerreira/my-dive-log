import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
    <Card className="border-border/60 bg-[#0f1c23]">
      <CardContent className="p-6 max-[991px]:p-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-white max-[991px]:text-sm">Monthly Activity</h2>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] bg-[#0f1c23] border border-[#2a3b44] text-white">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1c23] border border-[#2a3b44] text-white">
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-2xl border border-[#2a3b44] bg-[#1f3440] px-6 py-5 max-[991px]:p-4">
          {monthlyActivityData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-slate-300">
              No dives logged for {selectedYear}.
            </div>
          ) : (
            <div className="h-[300px] min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
                <BarChart data={monthlyActivityData} barSize={48} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="monthlyBarFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7a86', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7a86', fontSize: 12, fontWeight: 600 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      backgroundColor: '#0b1218',
                      border: '1px solid #2a3b44',
                      borderRadius: '12px',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar
                    dataKey="dives"
                    fill="url(#monthlyBarFill)"
                    radius={[10, 10, 6, 6]}
                    name="Dives"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MonthlyChart;
