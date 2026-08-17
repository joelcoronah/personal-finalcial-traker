import type { Summary } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

interface CategoryBreakdownProps {
  summary?: Summary;
  isLoading: boolean;
}

export function CategoryBreakdown({ summary, isLoading }: CategoryBreakdownProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // El backend da el neto (ingresos - gastos) por categoría y moneda, no un
  // desglose separado. Negativo = la categoría es de gasto; positivo = de ingreso.
  const rows = (summary?.byCategory ?? [])
    .filter((item) => item.VES !== 0)
    .sort((a, b) => Math.abs(b.VES) - Math.abs(a.VES));

  if (rows.length === 0) {
    return <EmptyState title="Sin movimientos en este periodo" />;
  }

  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.VES)), 1);

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => {
        const isExpense = row.VES < 0;
        return (
          <div key={row.category} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{row.category}</span>
              <span className={`font-semibold ${isExpense ? 'text-red-500' : 'text-emerald-600'}`}>
                {isExpense ? '-' : '+'}
                {formatCurrency(Math.abs(row.VES), 'VES')}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${isExpense ? 'bg-red-400' : 'bg-emerald-400'}`}
                style={{ width: `${Math.min((Math.abs(row.VES) / maxAbs) * 100, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
