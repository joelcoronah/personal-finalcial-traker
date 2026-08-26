import type { Currency, Summary } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { Skeleton } from '../common/Skeleton';

interface TotalsGridProps {
  summary?: Summary;
  isLoading: boolean;
  /** Moneda elegida en el CurrencySwitcher de la página. */
  currency: Currency;
}

export function TotalsGrid({ summary, isLoading, currency }: TotalsGridProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {isLoading || !summary ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          <Row label="Ingresos" value={formatCurrency(summary.totals.income[currency], currency)} valueClassName="text-emerald-600" />
          <Row label="Gastos" value={formatCurrency(summary.totals.expense[currency], currency)} valueClassName="text-red-500" />
          <Row
            label="Balance"
            value={formatCurrency(summary.totals.balance[currency], currency)}
            valueClassName="font-semibold text-slate-700"
          />
        </div>
      )}
    </div>
  );
}

function Row({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="font-medium text-slate-500">{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}
