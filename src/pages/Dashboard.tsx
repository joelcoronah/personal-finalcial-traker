import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { RatesCard } from '../components/rates/RatesCard';
import { SummaryCards, type StatRow } from '../components/dashboard/SummaryCards';
import { SavingsCard } from '../components/dashboard/SavingsCard';
import { DebtSummaryCard } from '../components/debts/DebtSummaryCard';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { CurrencySwitcher } from '../components/common/CurrencySwitcher';
import { useSummary } from '../hooks/useSummary';
import { getCurrentMonthRange } from '../lib/dates';
import type { Currency, Summary } from '../types';

const ZERO_TOTALS = { VES: 0, USD: 0, EUR: 0, USDT: 0 };

// Devuelve las mismas 6 filas (con ceros de relleno) aunque `summary`
// todavía no haya llegado, para que SummaryCards sepa cuántos renglones de
// skeleton dibujar mientras carga en vez de mostrar tarjetas vacías.
function buildSummaryRows(summary: Summary | undefined): StatRow[] {
  return [
    { key: 'income', label: 'Ingresos totales', value: summary?.totals.income ?? ZERO_TOTALS, tone: 'positive' },
    {
      key: 'debtContribution',
      label: 'Aporte a deudas',
      value: summary?.debt.monthContribution ?? ZERO_TOTALS,
    },
    {
      key: 'assigned',
      label: 'Asignado para presupuesto',
      value: summary?.assignment.totalAssigned ?? ZERO_TOTALS,
    },
    {
      key: 'readyToAssign',
      label: 'Pendiente por asignar',
      value: summary?.assignment.readyToAssign ?? ZERO_TOTALS,
      tone: 'warning',
    },
    {
      key: 'availableToSpend',
      label: 'Disponible para gastar',
      value: summary?.assignment.availableToSpend ?? ZERO_TOTALS,
    },
    { key: 'expense', label: 'Gastado hasta ahora', value: summary?.totals.expense ?? ZERO_TOTALS, tone: 'negative' },
  ];
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

          <SummaryCards rows={buildSummaryRows(summary)} isLoading={isLoading} currency={currency} />

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
