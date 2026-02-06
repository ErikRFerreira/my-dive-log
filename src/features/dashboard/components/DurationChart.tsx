import { Card, CardContent } from '@/components/ui/card';

import type { Dive } from '@/features/dives/types';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useMemo, useState } from 'react';

type DurationChartProps = {
  dives: Dive[];
};

function DurationChart({ dives }: DurationChartProps) {
  const [viewMode, setViewMode] = useState<'last10' | 'month'>('last10');

  const { chartData, averageDuration, changeLabel, changePositive, labels, comparisonLabel } =
    useMemo(() => {
      const sortedDives = [...dives].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      if (sortedDives.length === 0) {
        return {
          chartData: [] as Array<{ index: number; duration: number; label: string }>,
          averageDuration: 0,
          changeLabel: 0,
          changePositive: true,
          labels: [] as string[],
        };
      }

      const lastTen = sortedDives.slice(-10);
      const previousTen = sortedDives.slice(-20, -10);

      const latestDate = new Date(sortedDives[sortedDives.length - 1].date);
      const latestMonth = latestDate.getMonth();
      const latestYear = latestDate.getFullYear();

      const monthDives = sortedDives.filter((dive) => {
        const date = new Date(dive.date);
        return date.getFullYear() === latestYear && date.getMonth() === latestMonth;
      });

      const previousMonth = latestMonth === 0 ? 11 : latestMonth - 1;
      const previousMonthYear = latestMonth === 0 ? latestYear - 1 : latestYear;
      const previousMonthDives = sortedDives.filter((dive) => {
        const date = new Date(dive.date);
        return date.getFullYear() === previousMonthYear && date.getMonth() === previousMonth;
      });

      const selectedDives = viewMode === 'month' ? monthDives : lastTen;
      const comparisonDives = viewMode === 'month' ? previousMonthDives : previousTen;

      const chartData = selectedDives.map((dive, index) => {
        const date = new Date(dive.date);
        const label =
          viewMode === 'month'
            ? date.toLocaleString('en-US', { month: 'short', day: 'numeric' })
            : `Dive ${index + 1}`;
        return {
          index: index + 1,
          label,
          duration: dive.duration,
        };
      });

      const averageDuration =
        chartData.reduce((sum, item) => sum + item.duration, 0) / (chartData.length || 1);
      const comparisonAvg =
        comparisonDives.reduce((sum, dive) => sum + dive.duration, 0) /
        (comparisonDives.length || 1);
      const changePercent =
        comparisonDives.length > 0 ? ((averageDuration - comparisonAvg) / comparisonAvg) * 100 : 0;
      const changeLabel = Number.isFinite(changePercent) ? Math.round(changePercent) : 0;
      const changePositive = changeLabel >= 0;
      const labels = chartData.map((item) => item.label);

      const comparisonLabel = viewMode === 'month' ? 'vs last month' : 'vs last 10 dives';

      return {
        chartData,
        averageDuration,
        changeLabel,
        changePositive,
        labels,
        comparisonLabel,
      };
    }, [dives, viewMode]);

  const isMonthView = viewMode === 'month';

  return (
    <Card className="border-border/60 bg-[#0f1c23]">
      <CardContent className="p-6 max-[991px]:p-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-white max-[991px]:text-sm">Duration Trend</h2>
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setViewMode('last10')}
              className={`px-4 py-1 rounded-full font-semibold transition-colors ${
                viewMode === 'last10'
                  ? 'bg-[#3b1a1a] text-[#ff6b6b]'
                  : 'text-muted-foreground hover:text-[#ff6b6b]'
              }`}
            >
              Last dives
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                isMonthView
                  ? 'bg-[#3b1a1a] text-[#ff6b6b]'
                  : 'text-muted-foreground hover:text-[#ff6b6b]'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a3b44] bg-[#1f3440] px-6 py-5 max-[991px]:p-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-300">Average Duration</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{Math.round(averageDuration)}</span>
                <span className="text-slate-300 text-sm">min</span>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`flex items-center justify-end gap-2 text-lg font-semibold ${
                  changePositive ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                <span>{changePositive ? '▲' : '▼'}</span>
                <span>{Math.abs(changeLabel)}%</span>
              </div>
              <p className="text-xs text-slate-400">{comparisonLabel}</p>
            </div>
          </div>

          <div className="h-[220px] min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
              <AreaChart data={chartData} margin={{ left: 14, right: 24, top: 8 }}>
                <defs>
                  <linearGradient id="durationFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  padding={{ left: 12, right: 12 }}
                  tick={{ fill: '#6b7a86', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) => {
                    if (labels.length <= 3) return value;
                    const first = labels[0];
                    const middleIndex =
                      labels.length % 2 === 0
                        ? Math.max(0, labels.length / 2 - 1)
                        : Math.floor(labels.length / 2);
                    const middle = labels[middleIndex];
                    const last = labels[labels.length - 1];
                    if (value === first || value === middle || value === last) {
                      return value;
                    }
                    return '';
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f1c23',
                    border: '1px solid #2a3b44',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                  }}
                  labelFormatter={() => ''}
                  formatter={(value) => [`${Math.round(Number(value))} min`, 'Duration']}
                />
                <Area
                  type="monotone"
                  dataKey="duration"
                  stroke="#ff6b6b"
                  strokeWidth={4}
                  fill="url(#durationFill)"
                  dot={{ r: 4, strokeWidth: 3, stroke: '#ffffff', fill: '#0f1c23' }}
                  activeDot={{ r: 5, strokeWidth: 3, stroke: '#ffffff', fill: '#ff6b6b' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DurationChart;
