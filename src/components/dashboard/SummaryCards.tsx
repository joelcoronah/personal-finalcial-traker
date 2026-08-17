import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { CURRENCIES } from '../../types';
import type { Summary } from '../../types';
import { formatCurrencyCompact } from '../../lib/currency';
import { Skeleton } from '../common/Skeleton';

interface SummaryCardsProps {
  summary?: Summary;
  isLoading: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CURRENCIES.map((currency) => (
        <div key={currency} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {currency}
          </p>

          {isLoading || !summary ? (
            <div className="mt-2 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <Row
                icon={<TrendingUp size={13} className="text-emerald-500" />}
                value={formatCurrencyCompact(summary.totals.income[currency], currency)}
                className="text-emerald-600"
              />
              <Row
                icon={<TrendingDown size={13} className="text-red-500" />}
                value={formatCurrencyCompact(summary.totals.expense[currency], currency)}
                className="text-red-500"
              />
              <Row
                icon={<Scale size={13} className="text-slate-400" />}
                value={formatCurrencyCompact(summary.totals.balance[currency], currency)}
                className="font-semibold text-slate-700"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Row({
  icon,
  value,
  className,
}: {
  icon: React.ReactNode;
  value: string;
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-1 truncate ${className ?? ''}`}>
      {icon}
      {value}
    </span>
  );
}
