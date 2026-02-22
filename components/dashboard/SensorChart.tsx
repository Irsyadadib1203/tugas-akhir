import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { SensorReading } from '@/data/mockSensorData';

interface SensorChartProps {
  title: string;
  data: SensorReading[];
  dataKey: 'ph' | 'temperature' | 'turbidity';
  color: string;
  unit: string;
}

const formatHour = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

export const SensorChart = ({ title, data, dataKey, color, unit }: SensorChartProps) => {
  const chartData = data.map((reading) => ({
    time: formatHour(reading.timestamp),
    value: reading[dataKey],
  }));

  return (
    <div className="bg-card rounded-2xl p-6 sensor-card-shadow border border-border/50 animate-fade-in">
      <h3 className="font-display font-semibold text-lg text-foreground mb-6">{title}</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, title]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, fill: 'hsl(var(--card))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
