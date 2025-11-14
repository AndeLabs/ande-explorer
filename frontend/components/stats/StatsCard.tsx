import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: string;
  loading?: boolean;
  className?: string;
}

export function StatsCard({ title, value, icon, trend, loading, className }: StatsCardProps) {
  if (loading) {
    return (
      <Card className={cn('p-6', className)}>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        {trend && <Skeleton className="mt-2 h-3 w-16" />}
      </Card>
    );
  }

  return (
    <Card className={cn('p-6 transition-all hover:shadow-lg', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                trend.startsWith('+') ? 'text-green-600' : trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'
              )}
            >
              {trend}
            </p>
          )}
        </div>
        {icon && <span className="text-4xl">{icon}</span>}
      </div>
    </Card>
  );
}
