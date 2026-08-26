import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { DebtForm } from '../components/debts/DebtForm';
import { DebtRow } from '../components/debts/DebtRow';
import { useDebts } from '../hooks/useDebts';
import { useCreateDebt, useDeleteDebt, useUpdateDebt } from '../hooks/useDebtMutations';
import type { Debt, DebtInput } from '../types';

export default function Debts() {
  const [showArchived, setShowArchived] = useState(false);
  const { data: debts, isLoading, isError, refetch } = useDebts(
    showArchived ? {} : { active: true },
  );

  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();
  const deleteDebt = useDeleteDebt();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Debt | null>(null);

  const isSubmitting = createDebt.isPending || updateDebt.isPending;
  const hasSubmitError = createDebt.isError || updateDebt.isError;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(debt: Debt) {
    setEditing(debt);
    setFormOpen(true);
  }

  function handleSubmit(input: DebtInput) {
    const onSuccess = () => setFormOpen(false);
    if (editing) {
      updateDebt.mutate({ id: editing.id, input }, { onSuccess });
    } else {
      createDebt.mutate(input, { onSuccess });
    }
  }

  function handleToggleActive(debt: Debt) {
    updateDebt.mutate({ id: debt.id, input: { isActive: !debt.isActive } });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteDebt.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Deudas</h1>
          <p className="text-sm text-slate-400">Da seguimiento a lo que debes y cuánto has pagado</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <Plus size={16} />
          Nueva
        </button>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm text-slate-500">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        Incluir archivadas
      </label>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !debts || debts.length === 0 ? (
        <EmptyState
          title="No hay deudas registradas"
          description="Crea la primera para empezar a hacerles seguimiento."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {debts.map((debt) => (
            <DebtRow
              key={debt.id}
              debt={debt}
              onEdit={openEdit}
              onDelete={setPendingDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar deuda' : 'Nueva deuda'}>
        <DebtForm
          initialData={editing ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errorMessage={hasSubmitError ? 'No se pudo guardar la deuda. Intenta de nuevo.' : null}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Eliminar deuda"
        description="Las transacciones ya vinculadas a esta deuda no se borran: solo se desvinculan (su debtId pasa a null)."
        isConfirming={deleteDebt.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
