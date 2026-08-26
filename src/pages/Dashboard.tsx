import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { RatesCard } from '../components/rates/RatesCard';
import { SummaryCards, type SummaryStats } from '../components/dashboard/SummaryCards';
import { SavingsCard } from '../components/dashboard/SavingsCard';
import { DebtSummaryCard } from '../components/debts/DebtSummaryCard';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { CurrencySwitcher } from '../components/common/CurrencySwitcher';
import { useSummary } from '../hooks/useSummary';
import { getCurrentMonthRange } from '../lib/dates';
import type { Currency, Summary } from '../types';

const ZERO_TOTALS = { VES: 0, USD: 0, EUR: 0, USDT: 0 };

// Devuelve las mismas 6 métricas (con ceros de relleno) aunque `summary`
// todavía no haya llegado, para que SummaryCards siempre reciba la forma
// completa mientras carga en vez de tarjetas vacías.
function buildSummaryStats(summary: Summary | undefined): SummaryStats {
  return {
    income: summary?.totals.income ?? ZERO_TOTALS,
    expense: summary?.totals.expense ?? ZERO_TOTALS,
    debtContribution: summary?.debt.monthContribution ?? ZERO_TOTALS,
    assigned: summary?.assignment.totalAssigned ?? ZERO_TOTALS,
    readyToAssign: summary?.assignment.readyToAssign ?? ZERO_TOTALS,
    availableToSpend: summary?.assignment.availableToSpend ?? ZERO_TOTALS,
  };
}

export default function Dashboard() {
  const { from, to } = getCurrentMonthRange();
  const { data: summary, isLoading, isError, refetch } = useSummary(from, to);
  const [currency, setCurrency] = useState<Currency>('USDT');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Hola 👋</h1>
          <p className="text-sm text-slate-400">Resumen del mes actual</p>
        </div>
        <Link
          to="/nueva"
          className="hidden items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 sm:flex"
        >
          <Plus size={16} />
          Nueva transacción
        </Link>
      </div>

      <RatesCard />

      {isError ? (
        <button
          onClick={() => refetch()}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          No se pudo cargar el resumen. Reintentar.
        </button>
      ) : (
        <>
          <CurrencySwitcher value={currency} onChange={setCurrency} />

          <SummaryCards {...buildSummaryStats(summary)} isLoading={isLoading} currency={currency} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SavingsCard
              savingsAccumulated={summary?.savingsAccumulated}
              isLoading={isLoading}
              currency={currency}
            />
            <DebtSummaryCard debt={summary?.debt} isLoading={isLoading} currency={currency} />
          </div>
        </>
      )}

      <CategoryChart summary={summary} isLoading={isLoading} />

      <RecentTransactions />
    </div>
  );
}
