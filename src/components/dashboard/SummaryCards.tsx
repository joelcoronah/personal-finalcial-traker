import type { Currency, CurrencyTotals } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { Skeleton } from '../common/Skeleton';

export interface SummaryStats {
  income: CurrencyTotals;
  expense: CurrencyTotals;
  debtContribution: CurrencyTotals;
  assigned: CurrencyTotals;
  readyToAssign: CurrencyTotals;
  availableToSpend: CurrencyTotals;
}

interface SummaryCardsProps extends SummaryStats {
  isLoading: boolean;
  /** Moneda elegida en el CurrencySwitcher de la página. */
  currency: Currency;
}

/**
 * Tarjeta de resumen del período, en la moneda elegida por el usuario. La
 * jerarquía visual es intencional: Ingresos totales y Disponible para
 * gastar son las cifras que más se consultan de un vistazo, así que van
 * arriba y grandes; Aporte a deudas/Asignado/Pendiente por asignar son de
 * apoyo y van en una lista compacta; Gastado hasta ahora cierra la tarjeta
 * con su propia barra de progreso sobre el ingreso.
 */
export function SummaryCards({
  currency,
  isLoading,
  income,
  expense,
  debtContribution,
  assigned,
  readyToAssign,
  availableToSpend,
}: SummaryCardsProps) {
  const incomeValue = income[currency];
  const expenseValue = expense[currency];
  const spentPct = incomeValue > 0 ? Math.min((expenseValue / incomeValue) * 100, 100) : 0;
  const isOverAssigned = readyToAssign[currency] < 0;
  const isOverspent = availableToSpend[currency] < 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <Hero
          label="Ingresos totales"
          value={incomeValue}
          currency={currency}
          isLoading={isLoading}
          tone="text-emerald-600"
        />
        <Hero
          label="Disponible para gastar"
          value={availableToSpend[currency]}
          currency={currency}
          isLoading={isLoading}
          tone={isOverspent ? 'text-red-500' : 'text-slate-800'}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 text-sm">
        <Row label="Aporte a deudas" value={debtContribution[currency]} currency={currency} isLoading={isLoading} />
        <Row
          label="Asignado para presupuesto"
          value={assigned[currency]}
          currency={currency}
          isLoading={isLoading}
        />
        <Row
          label="Pendiente por asignar"
          value={readyToAssign[currency]}
          currency={currency}
          isLoading={isLoading}
          valueClassName={isOverAssigned ? 'text-red-500' : undefined}
        />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-500">Gastado hasta ahora</span>
          {isLoading ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <span className="font-semibold text-red-500">{formatCurrency(expenseValue, currency)}</span>
          )}
        </div>
        {!isLoading && (
          <>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-red-400" style={{ width: `${spentPct}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {spentPct.toFixed(0)}% de {formatCurrency(incomeValue, currency)} de ingresos
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Hero({
  label,
  value,
  currency,
  isLoading,
  tone,
}: {
  label: string;
  value: number;
  currency: Currency;
  isLoading: boolean;
  tone: string;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs font-medium text-slate-400">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-1.5 h-7 w-24" />
      ) : (
        <p className={`mt-0.5 truncate text-2xl font-bold ${tone}`}>{formatCurrency(value, currency)}</p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  currency,
  isLoading,
  valueClassName,
}: {
  label: string;
  value: number;
  currency: Currency;
  isLoading: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-slate-500">{label}</span>
      {isLoading ? (
        <Skeleton className="h-4 w-16 shrink-0" />
      ) : (
        <span className={`shrink-0 font-medium text-slate-700 ${valueClassName ?? ''}`}>
          {formatCurrency(value, currency)}
        </span>
      )}
    </div>
  );
}
