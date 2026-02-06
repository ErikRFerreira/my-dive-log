import { Card, CardContent } from '@/components/ui/card';

import type { Dive } from '@/features/dives/types';
import { Area, AreaChart, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSettingsStore } from '@/store/settingsStore';
import { useMemo, useState } from 'react';
import { convertValue, getUnitLabel } from '@/shared/utils/units';

type DepthChartProps = {
  dives: Dive[];
};

function DepthChart({ dives }: DepthChartProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  const [viewMode, setViewMode] = useState<'last10' | 'month'>('last10');

  const { chartData, averageDepth, changeLabel, changePositive, labels, comparisonLabel } =
    useMemo(() => {
      const sortedDives = [...dives].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      if (sortedDives.length === 0) {
        return {
          chartData: [] as Array<{ index: number; depth: number; label: string }>,
          averageDepth: 0,
          changeLabel: 0,
          changePositive: true,
          totalCountLabel: '0 Dives',
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
          depth: convertValue(dive.depth, 'depth', unitSystem),
        };
      });

      const averageDepth =
        chartData.reduce((sum, item) => sum + item.depth, 0) / (chartData.length || 1);
      const comparisonAvg =
        comparisonDives.reduce(
          (sum, dive) => sum + convertValue(dive.depth, 'depth', unitSystem),
          0
        ) / (comparisonDives.length || 1);
      const changePercent =
        comparisonDives.length > 0 ? ((averageDepth - comparisonAvg) / comparisonAvg) * 100 : 0;
      const changeLabel = Number.isFinite(changePercent) ? Math.round(changePercent) : 0;
      const changePositive = changeLabel >= 0;

      const totalCountLabel =
        viewMode === 'month' ? `${chartData.length} Dives` : `Last ${chartData.length} Dives`;
      const labels = chartData.map((item) => item.label);

      const comparisonLabel = viewMode === 'month' ? 'vs last month' : 'vs last 10 dives';

      return {
        chartData,
        averageDepth,
        changeLabel,
        changePositive,
        totalCountLabel,
        labels,
        comparisonLabel,
      };
    }, [dives, unitSystem, viewMode]);

  const isMonthView = viewMode === 'month';

  return (
    <Card className="border-border/60 bg-[#0f1c23]">
      <CardContent className="p-6 max-[991px]:p-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-white max-[991px]:text-sm">Depth Trend</h2>
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setViewMode('last10')}
              className={`px-4 py-1 rounded-full font-semibold transition-colors ${
                viewMode === 'last10'
                  ? 'bg-[#0f3a52] text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Last dives
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                isMonthView
                  ? 'bg-[#0f3a52] text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a3b44] bg-[#1f3440] px-6 py-5 max-[991px]:p-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-300">Average Depth</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{Math.round(averageDepth)}</span>
                <span className="text-slate-300 text-sm">{getUnitLabel('depth', unitSystem)}</span>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`flex items-center justify-end gap-2 text-lg font-semibold ${
                  changePositive ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                <span>{changePositive ? '↗' : '↘'}</span>
                <span>{Math.abs(changeLabel)}%</span>
              </div>
              <p className="text-xs text-slate-400">{comparisonLabel}</p>
            </div>
          </div>

          <div className="h-[220px] min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
              <AreaChart data={chartData} margin={{ left: 24, right: 24, top: 8 }}>
                <defs>
                  <linearGradient id="depthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1aa7ff" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1aa7ff" stopOpacity={0} />
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
                  formatter={(value) => [
                    `${Math.round(Number(value))} ${getUnitLabel('depth', unitSystem)}`,
                    'Depth',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="depth"
                  stroke="#1aa7ff"
                  strokeWidth={4}
                  fill="url(#depthFill)"
                  dot={{ r: 4, strokeWidth: 3, stroke: '#ffffff', fill: '#0f1c23' }}
                  activeDot={{ r: 5, strokeWidth: 3, stroke: '#ffffff', fill: '#1aa7ff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DepthChart;
