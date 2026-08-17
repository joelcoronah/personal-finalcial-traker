import { useNavigate, useParams } from 'react-router-dom';
import { TransactionForm, type TransactionFormValues } from '../components/transactions/TransactionForm';
import { useTransaction } from '../hooks/useTransactions';
import { useUpdateTransaction } from '../hooks/useTransactionMutations';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';

export default function EditTransaction() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: transaction, isLoading, isError, refetch } = useTransaction(id);
  const updateTransaction = useUpdateTransaction();

  function handleSubmit({ input }: TransactionFormValues) {
    if (!id) return;
    updateTransaction.mutate({ id, input }, { onSuccess: () => navigate('/transacciones') });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Editar transacción</h1>
        <p className="text-sm text-slate-400">Actualiza los datos y guarda los cambios</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError || !transaction ? (
        <ErrorState message="No se pudo cargar la transacción." onRetry={refetch} />
      ) : (
        <TransactionForm
          initialData={transaction}
          onSubmit={handleSubmit}
          isSubmitting={updateTransaction.isPending}
          errorMessage={updateTransaction.isError ? 'No se pudo guardar el cambio.' : null}
          submitLabel="Guardar cambios"
          hideImageUpload
        />
      )}
    </div>
  );
}
