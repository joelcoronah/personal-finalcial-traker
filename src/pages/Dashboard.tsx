import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { RatesCard } from '../components/rates/RatesCard';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { useSummary } from '../hooks/useSummary';
import { getCurrentMonthRange } from '../lib/dates';

export default function Dashboard() {
  const { from, to } = getCurrentMonthRange();
  const { data: summary, isLoading, isError, refetch } = useSummary(from, to);

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
        <SummaryCards summary={summary} isLoading={isLoading} />
      )}

      <CategoryChart summary={summary} isLoading={isLoading} />

      <RecentTransactions />
    </div>
  );
}
