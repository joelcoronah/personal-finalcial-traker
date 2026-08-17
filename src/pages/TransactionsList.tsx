import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TransactionsFilters } from '../components/transactions/TransactionsFilters';
import { TransactionRow } from '../components/transactions/TransactionRow';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { useTransactions } from '../hooks/useTransactions';
import { useDeleteTransaction } from '../hooks/useTransactionMutations';
import type { TransactionsQuery } from '../types';

const PAGE_SIZE = 15;

export default function TransactionsList() {
  const [filters, setFilters] = useState<TransactionsQuery>({ page: 1, limit: PAGE_SIZE });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isPlaceholderData } = useTransactions(filters);
  const deleteTransaction = useDeleteTransaction();

  const totalPages = data?.meta.totalPages ?? 1;
  const page = filters.page ?? 1;

  function goToPage(nextPage: number) {
    setFilters((prev) => ({ ...prev, page: nextPage }));
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;
    deleteTransaction.mutate(pendingDeleteId, { onSuccess: () => setPendingDeleteId(null) });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Historial</h1>
        <p className="text-sm text-slate-400">Todas tus transacciones</p>
      </div>

      <TransactionsFilters filters={filters} onChange={setFilters} />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState title="No hay transacciones" description="Prueba ajustando los filtros o registra una nueva." />
        ) : (
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            {data.data.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} onDelete={setPendingDeleteId} />
            ))}
          </div>
        )}
      </div>

      {data && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Eliminar transacción"
        description="Esta acción no se puede deshacer."
        isConfirming={deleteTransaction.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
