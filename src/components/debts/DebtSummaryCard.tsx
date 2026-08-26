import { Link } from 'react-router-dom';
import { ArrowRight, Landmark } from 'lucide-react';
import type { Currency, DebtSummary } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { Skeleton } from '../common/Skeleton';

interface DebtSummaryCardProps {
  debt?: DebtSummary;
  isLoading: boolean;
  currency: Currency;
}

/** Resumen compacto de deudas para Dashboard y Plan; el detalle vive en /deudas. */
export function DebtSummaryCard({ debt, isLoading, currency }: DebtSummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Landmark size={16} />
          </span>
          <p className="text-sm font-semibold text-slate-700">Deudas</p>
        </div>
        <Link
          to="/deudas"
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
        >
          Ver deudas
          <ArrowRight size={13} />
        </Link>
      </div>

      {isLoading || !debt ? (
        <div className="mt-3 flex flex-col gap-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : (
        <div className="mt-2 flex flex-col gap-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Saldo pendiente</span>
            <span className="font-semibold text-slate-700">
              {formatCurrency(debt.totalRemainingDebt[currency], currency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Aporte del mes</span>
            <span className="font-medium text-slate-600">
              {formatCurrency(debt.monthContribution[currency], currency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Deudas activas</span>
            <span className="font-medium text-slate-600">{debt.activeDebtCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
