import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dive } from '@/features/dives';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSettingsStore } from '@/store/settingsStore';
import { convertValue, getUnitLabel } from '@/shared/utils/units';

type DepthChartProps = {
  dives: Dive[];
};

function DepthChart({ dives }: DepthChartProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  const depthTrendData = dives.map((dive) => {
    const diveDate = new Date(dive.date);
    const formattedDate = `${diveDate.toLocaleString('en-US', { month: 'short' })} ${diveDate.getDate()}`;
    return {
      date: formattedDate,
      depth: convertValue(dive.depth, 'depth', unitSystem),
      duration: dive.duration,
    };
  });

  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-foreground">Depth/Time Progression</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={depthTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="depth"
              stroke="hsl(20, 90%, 56%)"
              strokeWidth={2}
              name={`Max Depth (${getUnitLabel('depth', unitSystem)})`}
              dot={{ fill: 'hsl(20, 90%, 56%)', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="duration"
              stroke="hsl(199, 89%, 48%)"
              strokeWidth={2}
              name="Duration (min)"
              dot={{ fill: 'hsl(199, 89%, 48%)', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default DepthChart;
