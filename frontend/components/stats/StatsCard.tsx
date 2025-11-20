import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string | ReactNode;
  trend?: string;
  loading?: boolean;
  updating?: boolean;
  className?: string;
  colorClass?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  loading,
  updating,
  className,
  colorClass = 'bg-primary/10 text-primary'
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className={cn('p-6 border-neutral-light/20', className)}>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-3 w-16" />
      </Card>
    );
  }

  return (
    <Card className={cn(
      'p-6 transition-all hover:shadow-lg hover:scale-105 border-neutral-light/20 bg-card/50 backdrop-blur-sm',
      updating && 'ring-1 ring-blue-400/50',
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-dark/70 dark:text-neutral-light/70">
            {title}
          </p>
          <p className={cn(
            'mt-2 text-2xl sm:text-3xl font-bold text-neutral-dark dark:text-white truncate transition-opacity duration-300',
            updating && 'opacity-70'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-neutral-medium">
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                trend.startsWith('+') ? 'text-success' : trend.startsWith('-') ? 'text-destructive' : 'text-neutral-medium'
              )}
            >
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-transform duration-300',
            colorClass,
            updating && 'animate-pulse'
          )}>
            {typeof icon === 'string' ? (
              <span className="text-2xl">{icon}</span>
            ) : (
              icon
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
