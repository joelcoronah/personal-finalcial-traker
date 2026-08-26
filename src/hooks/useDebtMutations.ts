import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDebt, deleteDebt, updateDebt } from '../api/debts';
import type { DebtInput, DebtUpdateInput } from '../types';

/**
 * Todas las mutaciones invalidan 'debts' (lista y detalle) y también
 * 'summary'/'budget-plans': el bloque `debt` de esos endpoints (saldo total,
 * aporte del mes, cantidad de deudas activas) cambia con cualquier alta,
 * edición, archivado o borrado.
 */
function useInvalidateAfterDebtMutation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['debts'] });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
    queryClient.invalidateQueries({ queryKey: ['budget-plans'] });
  };
}

export function useCreateDebt() {
  const invalidate = useInvalidateAfterDebtMutation();
  return useMutation({
    mutationFn: (input: DebtInput) => createDebt(input),
    onSuccess: invalidate,
  });
}

export function useUpdateDebt() {
  const invalidate = useInvalidateAfterDebtMutation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DebtUpdateInput }) => updateDebt(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteDebt() {
  const invalidate = useInvalidateAfterDebtMutation();
  return useMutation({
    mutationFn: (id: string) => deleteDebt(id),
    onSuccess: invalidate,
  });
}
