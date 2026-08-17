import { Link } from 'react-router-dom';
import { useRecentTransactions } from '../../hooks/useTransactions';
import { TransactionRow } from '../transactions/TransactionRow';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';

export function RecentTransactions() {
  const { data, isLoading, isError, refetch } = useRecentTransactions(8);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Últimas transacciones</h3>
        <Link to="/transacciones" className="text-xs font-medium text-emerald-600 hover:underline">
          Ver todas
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3 py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="Aún no hay transacciones" description="Registra tu primer ingreso o gasto." />
      ) : (
        <div>
          {data.data.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} compact />
          ))}
        </div>
      )}
    </div>
  );
}
