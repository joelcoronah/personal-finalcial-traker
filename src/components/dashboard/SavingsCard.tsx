import { PiggyBank } from 'lucide-react';
import type { Currency, CurrencyTotals } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { Skeleton } from '../common/Skeleton';

interface SavingsCardProps {
  savingsAccumulated?: CurrencyTotals;
  isLoading: boolean;
  currency: Currency;
}

/**
 * Total histórico puesto en categorías de grupo "savings", valorado hoy.
 * Solo crece: todavía no existe un flujo para registrar retiros de ahorro,
 * así que lo dejamos explícito acá en vez de dar a entender que es un saldo
 * disponible que se puede gastar.
 */
export function SavingsCard({ savingsAccumulated, isLoading, currency }: SavingsCardProps) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <PiggyBank size={16} />
        </span>
        <p className="text-sm font-semibold text-emerald-800">Ahorro acumulado</p>
      </div>

      {isLoading || !savingsAccumulated ? (
        <Skeleton className="mt-3 h-5 w-2/3" />
      ) : (
        <p className="mt-2 text-sm font-medium text-emerald-700">
          {formatCurrency(savingsAccumulated[currency], currency)}
        </p>
      )}

      <p className="mt-2 text-xs text-emerald-700/70">
        Este monto solo crece: el retiro de ahorros aún no está soportado.
      </p>
    </div>
  );
}
