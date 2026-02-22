import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';


interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  colorClass: string;
  status: 'normal' | 'warning' | 'danger';
  minValue?: number;
  maxValue?: number;
}

const statusColors = {
  normal: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
};

const statusLabels = {
  normal: 'Normal',
  warning: 'Perhatian',
  danger: 'Bahaya',
};

export const SensorCard = ({
  title,
  value,
  unit,
  icon: Icon,
  colorClass,
  status,
  minValue,
  maxValue,
}: SensorCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 sensor-card-shadow border border-border/50 animate-fade-in hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorClass)}>
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', statusColors[status])}>
          {statusLabels[status]}
        </span>
      </div>

      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-display font-bold text-foreground">
          {value.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>

      {minValue !== undefined && maxValue !== undefined && (
        <div className="pt-3 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min: {minValue}</span>
            <span>Max: {maxValue}</span>
          </div>
        </div>
      )}
    </div>
  );
};
