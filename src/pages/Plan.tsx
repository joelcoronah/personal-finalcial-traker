import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ErrorState } from '../components/common/ErrorState';
import { Skeleton } from '../components/common/Skeleton';
import { useBudgetPlan } from '../hooks/useBudgetPlan';
import { useSaveBudgetPlan } from '../hooks/useBudgetPlanMutations';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';
import { currentMonthKey, formatMonthLabel, getMonthRange, shiftMonthKey } from '../lib/dates';
import { formatCurrency } from '../lib/currency';
import {
  BUDGET_GROUP_LABEL,
  BUDGET_GROUPS,
  DEFAULT_BUDGET_PLAN,
  type BudgetGroup,
  type Category,
  type Transaction,
} from '../types';

// El plan solo se mide contra gastos: las 3 categorías del 50/30/20
// (necesidades/gustos/ahorro) son, por diseño, categorías de tipo "expense"
// (ver la nota en Category dentro de src/types/index.ts).
const GROUP_COLOR: Record<BudgetGroup, string> = {
  needs: '#0ea5e9',
  wants: '#f59e0b',
  savings: '#10b981',
};

interface ActualTotals {
  needs: number;
  wants: number;
  savings: number;
  unclassified: number;
  total: number;
}

/**
 * Suma amountVES por grupo, cruzando las transacciones de gasto del mes con
 * el budgetGroup de cada categoría. Categorías sin grupo (o borradas/no
 * encontradas) caen en "unclassified".
 */
function computeActualTotals(transactions: Transaction[], categories: Category[]): ActualTotals {
  const groupByCategory = new Map(categories.map((c) => [c.name, c.budgetGroup ?? null]));
  const totals: ActualTotals = { needs: 0, wants: 0, savings: 0, unclassified: 0, total: 0 };

  for (const tx of transactions) {
    totals.total += tx.amountVES;
    const group = groupByCategory.get(tx.category);
    if (group === 'needs' || group === 'wants' || group === 'savings') {
      totals[group] += tx.amountVES;
    } else {
      totals.unclassified += tx.amountVES;
    }
  }

  return totals;
}

export default function Plan() {
  const [month, setMonth] = useState(currentMonthKey());
  const range = useMemo(() => getMonthRange(month), [month]);

  const { data: plan, isLoading: planLoading, isError: planError, refetch: refetchPlan } = useBudgetPlan(month);
  // Sin filtro `active`: una transacción vieja puede apuntar a una categoría
  // ya archivada y aun así debe contar para el mes en que ocurrió.
  const { data: categories } = useCategories({ type: 'expense' });
  const {
    data: txPage,
    isLoading: txLoading,
    isError: txError,
    refetch: refetchTx,
  } = useTransactions({ from: range.from, to: range.to, type: 'expense', page: 1, limit: 200 });

  const [needsPct, setNeedsPct] = useState(DEFAULT_BUDGET_PLAN.needsPct);
  const [wantsPct, setWantsPct] = useState(DEFAULT_BUDGET_PLAN.wantsPct);
  const [savingsPct, setSavingsPct] = useState(DEFAULT_BUDGET_PLAN.savingsPct);

  // `plan` es undefined mientras carga, null si el mes no tiene plan
  // guardado (404) y un objeto si sí lo tiene. Solo pisamos el form una vez
  // se sabe cuál de los dos casos aplica, para no parpadear valores.
  useEffect(() => {
    if (plan) {
      setNeedsPct(plan.needsPct);
      setWantsPct(plan.wantsPct);
      setSavingsPct(plan.savingsPct);
    } else if (plan === null) {
      setNeedsPct(DEFAULT_BUDGET_PLAN.needsPct);
      setWantsPct(DEFAULT_BUDGET_PLAN.wantsPct);
      setSavingsPct(DEFAULT_BUDGET_PLAN.savingsPct);
    }
  }, [plan, month]);

  const saveBudgetPlan = useSaveBudgetPlan(month);

  const actual = useMemo(
    () => computeActualTotals(txPage?.data ?? [], categories ?? []),
    [txPage, categories],
  );

  const targetByGroup: Record<BudgetGroup, number> = {
    needs: needsPct,
    wants: wantsPct,
    savings: savingsPct,
  };
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

  const isLoading = planLoading || txLoading;
  const isError = planError || txError;

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
        <ErrorState
          onRetry={() => {
            refetchPlan();
            refetchTx();
          }}
        />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {actual.total === 0 ? (
            <p className="text-sm text-slate-400">Sin gastos registrados este mes.</p>
          ) : (
            <>
              {BUDGET_GROUPS.map((g) => (
                <GroupBar
                  key={g}
                  label={BUDGET_GROUP_LABEL[g]}
                  color={GROUP_COLOR[g]}
                  target={targetByGroup[g]}
                  actual={(actual[g] / actual.total) * 100}
                />
              ))}

              {actual.unclassified > 0 && (
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-500">Sin categorizar</span>
                    <span className="text-xs text-slate-400">
                      {formatCurrency(actual.unclassified, 'VES')} ·{' '}
                      {((actual.unclassified / actual.total) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-300"
                      style={{ width: `${(actual.unclassified / actual.total) * 100}%` }}
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
            </>
          )}
        </div>
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
}: {
  label: string;
  color: string;
  target: number;
  actual: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="text-xs text-slate-400">
          Meta {target}% · Real <span className="font-semibold text-slate-600">{actual.toFixed(0)}%</span>
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
