import type { Currency, CurrencyTotals } from '../../types';
import { formatCurrencyCompact } from '../../lib/currency';
import { Skeleton } from '../common/Skeleton';

export interface StatRow {
  key: string;
  label: string;
  value: CurrencyTotals;
  icon?: React.ReactNode;
  /** 'warning' resalta en rojo (ej. "Pendiente por asignar" negativo = sobre-asignado). */
  tone?: 'positive' | 'negative' | 'neutral' | 'warning';
}

interface SummaryCardsProps {
  rows: StatRow[];
  isLoading: boolean;
  /** Moneda elegida en el CurrencySwitcher de la página; una sola tarjeta muestra solo esa moneda. */
  currency: Currency;
}

const TONE_CLASS: Record<NonNullable<StatRow['tone']>, string> = {
  positive: 'text-emerald-600',
  negative: 'text-red-500',
  warning: 'text-red-500',
  neutral: 'text-slate-700',
};

/**
 * Tarjeta con las filas de estadísticas del período, en la moneda elegida
 * por el usuario (ver CurrencySwitcher). Generaliza lo que antes era un
 * componente fijo a Ingresos/Gastos/Balance para poder reusarlo en
 * Dashboard y Plan del mes con distintos conjuntos de métricas.
 */
export function SummaryCards({ rows, isLoading, currency }: SummaryCardsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{currency}</p>

      {isLoading ? (
        <div className="mt-2 flex flex-col gap-1.5">
          {rows.map((row) => (
            <Skeleton key={row.key} className="h-4 w-3/4" />
          ))}
        </div>
      ) : (
        <div className="mt-2 flex flex-col gap-1 text-sm">
          {rows.map((row) => {
            const negative = row.value[currency] < 0;
            const tone = row.tone === 'warning' && negative ? 'warning' : (row.tone ?? 'neutral');
            return (
              <Row
                key={row.key}
                icon={row.icon}
                label={row.label}
                value={formatCurrencyCompact(row.value[currency], currency)}
                className={TONE_CLASS[tone]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <span className={`flex items-center justify-between gap-2 truncate ${className ?? ''}`} title={label}>
      <span className="flex min-w-0 items-center gap-1 truncate text-slate-500">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 font-medium">{value}</span>
    </span>
  );
}
