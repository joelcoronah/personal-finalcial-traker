import { CURRENCIES } from '../../types';
import type { Summary } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { Skeleton } from '../common/Skeleton';

interface TotalsGridProps {
  summary?: Summary;
  isLoading: boolean;
}

export function TotalsGrid({ summary, isLoading }: TotalsGridProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3">Moneda</th>
            <th className="px-4 py-3">Ingresos</th>
            <th className="px-4 py-3">Gastos</th>
            <th className="px-4 py-3">Balance</th>
          </tr>
        </thead>
        <tbody>
          {CURRENCIES.map((currency) => (
            <tr key={currency} className="border-b border-slate-50 last:border-0">
              <td className="px-4 py-3 font-semibold text-slate-600">{currency}</td>
              {isLoading || !summary ? (
                <td colSpan={3} className="px-4 py-3">
                  <Skeleton className="h-4 w-full" />
                </td>
              ) : (
                <>
                  <td className="px-4 py-3 text-emerald-600">
                    {formatCurrency(summary.totals.income[currency], currency)}
                  </td>
                  <td className="px-4 py-3 text-red-500">
                    {formatCurrency(summary.totals.expense[currency], currency)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {formatCurrency(summary.totals.balance[currency], currency)}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
