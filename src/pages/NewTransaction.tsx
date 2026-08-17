import { useNavigate } from 'react-router-dom';
import { TransactionForm, type TransactionFormValues } from '../components/transactions/TransactionForm';
import { useCreateTransaction, useUploadTransaction } from '../hooks/useTransactionMutations';

export default function NewTransaction() {
  const navigate = useNavigate();
  const createTransaction = useCreateTransaction();
  const uploadTransaction = useUploadTransaction();

  const isSubmitting = createTransaction.isPending || uploadTransaction.isPending;
  const errorMessage =
    createTransaction.isError || uploadTransaction.isError
      ? 'No se pudo guardar la transacción. Intenta de nuevo.'
      : null;

  function handleSubmit({ input, file }: TransactionFormValues) {
    const onSuccess = () => navigate('/');

    if (file) {
      uploadTransaction.mutate({ input, file }, { onSuccess });
    } else {
      createTransaction.mutate(input, { onSuccess });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Nueva transacción</h1>
        <p className="text-sm text-slate-400">Registra un ingreso o gasto</p>
      </div>

      <TransactionForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        submitLabel="Registrar transacción"
      />
    </div>
  );
}
