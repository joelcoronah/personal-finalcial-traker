import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ErrorState } from '../components/common/ErrorState';
import { Skeleton } from '../components/common/Skeleton';
import { SummaryCards, type StatRow } from '../components/dashboard/SummaryCards';
import { SavingsCard } from '../components/dashboard/SavingsCard';
import { DebtSummaryCard } from '../components/debts/DebtSummaryCard';
import { CategoryEnvelopes } from '../components/plan/CategoryEnvelopes';
import { CurrencySwitcher } from '../components/common/CurrencySwitcher';
import { useBudgetPlanProgress } from '../hooks/useBudgetPlan';
import { useSaveBudgetPlan } from '../hooks/useBudgetPlanMutations';
import { currentMonthKey, formatMonthLabel, shiftMonthKey } from '../lib/dates';
import { formatCurrency, formatMultiCurrency } from '../lib/currency';
import {
  BUDGET_GROUP_LABEL,
  BUDGET_GROUPS,
  DEFAULT_BUDGET_PLAN,
  type BudgetGroup,
  type BudgetPlanProgress,
  type Currency,
  type CurrencyTotals,
} from '../types';

function buildSummaryRows(progress: BudgetPlanProgress): StatRow[] {
  return [
    { key: 'income', label: 'Ingresos totales', value: progress.income, tone: 'positive' },
    { key: 'debtContribution', label: 'Aporte a deudas', value: progress.debt.monthContribution },
    { key: 'assigned', label: 'Asignado para presupuesto', value: progress.assignment.totalAssigned },
    {
      key: 'readyToAssign',
      label: 'Pendiente por asignar',
      value: progress.assignment.readyToAssign,
      tone: 'warning',
    },
    {
      key: 'availableToSpend',
      label: 'Disponible para gastar',
      value: progress.assignment.availableToSpend,
    },
    { key: 'expense', label: 'Gastado hasta ahora', value: progress.expense, tone: 'negative' },
  ];
}

// El plan solo se mide contra gastos: las 3 categorías del 50/30/20
// (necesidades/gustos/ahorro) son, por diseño, categorías de tipo "expense"
// (ver la nota en Category dentro de src/types/index.ts).
const GROUP_COLOR: Record<BudgetGroup, string> = {
  needs: '#0ea5e9',
  wants: '#f59e0b',
  savings: '#10b981',
};

export default function Plan() {
  const [month, setMonth] = useState(currentMonthKey());
  const [currency, setCurrency] = useState<Currency>('USDT');

  const { data: progress, isLoading, isError, refetch } = useBudgetPlanProgress(month);

  const [needsPct, setNeedsPct] = useState(DEFAULT_BUDGET_PLAN.needsPct);
  const [wantsPct, setWantsPct] = useState(DEFAULT_BUDGET_PLAN.wantsPct);
  const [savingsPct, setSavingsPct] = useState(DEFAULT_BUDGET_PLAN.savingsPct);

  // Solo pisamos el form una vez se sabe si el mes tiene plan guardado o
  // no, para no parpadear valores mientras carga.
  useEffect(() => {
    if (!progress) return;
    if (progress.targetPct) {
      setNeedsPct(progress.targetPct.needs);
      setWantsPct(progress.targetPct.wants);
      setSavingsPct(progress.targetPct.savings);
    } else {
      setNeedsPct(DEFAULT_BUDGET_PLAN.needsPct);
      setWantsPct(DEFAULT_BUDGET_PLAN.wantsPct);
      setSavingsPct(DEFAULT_BUDGET_PLAN.savingsPct);
    }
  }, [progress, month]);

  const saveBudgetPlan = useSaveBudgetPlan(month);

  const targetByGroup: Record<BudgetGroup, number> = useMemo(
    () => ({ needs: needsPct, wants: wantsPct, savings: savingsPct }),
    [needsPct, wantsPct, savingsPct],
  );
  const setPctByGroup: Record<BudgetGroup, (v: number) => void> = {
    needs: setNeedsPct,
    wants: setWantsPct,
    savings: setSavingsPct,
  };

  const sum = needsPct + wantsPct + savingsPct;
  const isValidSum = sum === 100;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidSum) return;
    saveBudgetPlan.mutate({ needsPct, wantsPct, savingsPct });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Plan del mes</h1>
          <p className="text-sm text-slate-400">Objetivo vs. gasto real por grupo</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-1 py-1 shadow-sm">
          <button
            onClick={() => setMonth((m) => shiftMonthKey(m, -1))}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[8.5rem] text-center text-sm font-medium text-slate-700">
            {formatMonthLabel(month)}
          </span>
          <button
            onClick={() => setMonth((m) => shiftMonthKey(m, 1))}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading || !progress ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <>
          <CurrencySwitcher value={currency} onChange={setCurrency} />

          <SummaryCards rows={buildSummaryRows(progress)} isLoading={false} currency={currency} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SavingsCard savingsAccumulated={progress.savingsAccumulated} isLoading={false} currency={currency} />
            <DebtSummaryCard debt={progress.debt} isLoading={false} currency={currency} />
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {progress.income.VES === 0 ? (
              <p className="text-sm text-slate-400">Sin ingresos registrados este mes: el % real se mide sobre el ingreso.</p>
            ) : (
              <>
                {BUDGET_GROUPS.map((g) => (
                  <div key={g}>
                    <GroupBar
                      label={BUDGET_GROUP_LABEL[g]}
                      color={GROUP_COLOR[g]}
                      target={targetByGroup[g]}
                      actual={progress.groups[g].actualPct}
                      amount={progress.groups[g].amount}
                      currency={currency}
                      // El backend ya la calcula cuando hay plan guardado; si no
                      // (hasPlan: false), caemos en el mismo cálculo % × ingreso
                      // que ya usa el marcador de la barra.
                      targetAmount={
                        progress.groups[g].targetAmount ?? {
                          VES: (targetByGroup[g] / 100) * progress.income.VES,
                          USD: (targetByGroup[g] / 100) * progress.income.USD,
                          EUR: (targetByGroup[g] / 100) * progress.income.EUR,
                          USDT: (targetByGroup[g] / 100) * progress.income.USDT,
                        }
                      }
                    />
                    <CategoryEnvelopes
                      group={g}
                      month={month}
                      byCategory={progress.assignment.byCategory}
                      color={GROUP_COLOR[g]}
                      currency={currency}
                    />
                  </div>
                ))}

                {progress.unclassified.amount.VES > 0 && (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500">Sin categorizar</span>
                      <span className="text-xs text-slate-400">{progress.unclassified.actualPct.toFixed(0)}%</span>
                    </div>
                    <p className="mb-1 text-xs text-slate-400">
                      {formatCurrency(progress.unclassified.amount[currency], currency)}
                    </p>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-300"
                        style={{ width: `${Math.min(progress.unclassified.actualPct, 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Asigna un grupo a esas categorías en{' '}
                      <Link to="/categorias" className="font-medium text-emerald-600 hover:underline">
                        Categorías
                      </Link>{' '}
                      para que cuenten en el plan.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Total gastado</span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(progress.expense.VES, 'VES')}
                    </span>
                  </div>
                  <p className="-mt-1 text-right text-xs text-slate-400">
                    {formatCurrency(progress.expense.USD, 'USD')} · {formatCurrency(progress.expense.USDT, 'USDT')}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Ingreso del mes</span>
                    <span>{formatMultiCurrency(progress.income)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <form
        onSubmit={handleSave}
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-700">Objetivo para {formatMonthLabel(month)}</h2>
        <div className="grid grid-cols-3 gap-3">
          {BUDGET_GROUPS.map((g) => (
            <PctInput
              key={g}
              label={BUDGET_GROUP_LABEL[g]}
              color={GROUP_COLOR[g]}
              value={targetByGroup[g]}
              onChange={setPctByGroup[g]}
            />
          ))}
        </div>
        <p className={clsx('text-xs font-medium', isValidSum ? 'text-slate-400' : 'text-red-500')}>
          Suma: {sum}% {isValidSum ? '' : '— debe sumar 100%'}
        </p>
        {saveBudgetPlan.isError && (
          <p className="text-sm text-red-600">No se pudo guardar el plan. Intenta de nuevo.</p>
        )}
        <button
          type="submit"
          disabled={!isValidSum || saveBudgetPlan.isPending}
          className="rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {saveBudgetPlan.isPending ? 'Guardando…' : 'Guardar objetivo'}
        </button>
      </form>
    </div>
  );
}

function GroupBar({
  label,
  color,
  target,
  actual,
  amount,
  targetAmount,
  currency,
}: {
  label: string;
  color: string;
  target: number;
  actual: number;
  amount: CurrencyTotals;
  /** Meta en monto ya calculada por el backend; null si el mes no tiene plan guardado. */
  targetAmount: CurrencyTotals | null;
  currency: Currency;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="text-xs text-slate-400">
          Meta {target}% · Real{' '}
          <span className="font-semibold text-slate-600">{actual.toFixed(0)}%</span>
        </span>
      </div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>
          Objetivo:{' '}
          <span className="font-medium text-slate-600">
            {targetAmount ? formatCurrency(targetAmount[currency], currency) : '—'}
          </span>
        </span>
        <span>
          Real: <span className="font-medium text-slate-600">{formatCurrency(amount[currency], currency)}</span>
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(actual, 100)}%`, backgroundColor: color }}
        />
        {/* Marcador vertical: dónde debería quedar la barra si cumples la meta. */}
        <div
          className="absolute top-0 h-full w-0.5 bg-slate-500"
          style={{ left: `${Math.min(target, 100)}%` }}
        />
      </div>
    </div>
  );
}

function PctInput({
  label,
  color,
  value,
  onChange,
}: {
  label: string;
  color: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-300 px-2.5 py-2 pr-6 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          %
        </span>
      </div>
    </label>
  );
}
