import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Archive, ArchiveRestore, ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { DebtForm } from '../components/debts/DebtForm';
import { TransactionRow } from '../components/transactions/TransactionRow';
import { useDebt } from '../hooks/useDebts';
import { useDeleteDebt, useUpdateDebt } from '../hooks/useDebtMutations';
import { formatCurrency, formatMultiCurrency } from '../lib/currency';
import type { DebtInput } from '../types';

export default function DebtDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: debt, isLoading, isError, refetch } = useDebt(id);

  const updateDebt = useUpdateDebt();
  const deleteDebt = useDeleteDebt();

  const [formOpen, setFormOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  function handleSubmit(input: DebtInput) {
    if (!id) return;
    updateDebt.mutate({ id, input }, { onSuccess: () => setFormOpen(false) });
  }

  function handleToggleActive() {
    if (!debt) return;
    updateDebt.mutate({ id: debt.id, input: { isActive: !debt.isActive } });
  }

  function confirmDelete() {
    if (!id) return;
    deleteDebt.mutate(id, { onSuccess: () => navigate('/deudas') });
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={() => navigate('/deudas')}
        className="flex w-fit items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ChevronLeft size={16} />
        Deudas
      </button>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError || !debt ? (
        <ErrorState message="No se pudo cargar la deuda." onRetry={refetch} />
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold text-slate-800">{debt.name}</h1>
                {!debt.isActive && (
                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                    Archivada
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setFormOpen(true)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={handleToggleActive}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label={debt.isActive ? 'Archivar' : 'Reactivar'}
                >
                  {debt.isActive ? <Archive size={16} /> : <ArchiveRestore size={16} />}
                </button>
                <button
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
                <span className="font-medium">{debt.percentPaid.toFixed(0)}% pagado</span>
                <span>Saldo: {formatMultiCurrency(debt.remainingBalance)}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(debt.percentPaid, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Stat label="Total" value={formatCurrency(debt.totalAmount[debt.currencyOriginal], debt.currencyOriginal)} />
              <Stat label="Pagado" value={formatCurrency(debt.paidAmount[debt.currencyOriginal], debt.currencyOriginal)} />
              {debt.minPayment && (
                <Stat
                  label="Mín. mensual"
                  value={formatCurrency(debt.minPayment[debt.currencyOriginal], debt.currencyOriginal)}
                />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-slate-700">Pagos vinculados</h2>
            {debt.payments.length === 0 ? (
              <EmptyState
                title="Sin pagos vinculados"
                description="Vincula un gasto a esta deuda desde el formulario de transacciones."
              />
            ) : (
              <div>
                {debt.payments.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} compact />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {debt && (
        <>
          <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Editar deuda">
            <DebtForm
              initialData={debt}
              onSubmit={handleSubmit}
              isSubmitting={updateDebt.isPending}
              errorMessage={updateDebt.isError ? 'No se pudo guardar el cambio.' : null}
            />
          </Modal>

          <ConfirmDialog
            open={confirmDeleteOpen}
            title="Eliminar deuda"
            description="Las transacciones ya vinculadas no se borran: solo se desvinculan (su debtId pasa a null)."
            isConfirming={deleteDebt.isPending}
            onConfirm={confirmDelete}
            onCancel={() => setConfirmDeleteOpen(false)}
          />
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-700">{value}</p>
    </div>
  );
}
