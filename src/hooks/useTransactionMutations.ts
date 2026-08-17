import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  uploadTransaction,
} from '../api/transactions';
import type { TransactionInput } from '../types';

/**
 * Todas las mutaciones invalidan 'transactions' y 'summary' para que las
 * listas, el dashboard y los reportes reflejen el cambio de inmediato.
 * No invalidan 'rates': el snapshot ya quedó fijo en el backend.
 */
function useInvalidateAfterMutation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
  };
}

export function useCreateTransaction() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: (input: TransactionInput) => createTransaction(input),
    onSuccess: invalidate,
  });
}

export function useUploadTransaction() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: ({ input, file }: { input: TransactionInput; file: File }) =>
      uploadTransaction(input, file),
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TransactionInput> }) =>
      updateTransaction(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: invalidate,
  });
}
