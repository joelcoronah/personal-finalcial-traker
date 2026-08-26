import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategoryAssignment, saveCategoryAssignment } from '../api/budgetPlans';
import type { CategoryAssignmentInput } from '../types';

/**
 * Los sobres de presupuesto por categoría se leen desde `assignment.byCategory`
 * en /summary y /budget-plans/:month/progress, así que cualquier cambio acá
 * tiene que invalidar ambos para que las tarjetas y la tabla del plan se
 * refresquen.
 */
function useInvalidateAfterAssignmentMutation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['summary'] });
    queryClient.invalidateQueries({ queryKey: ['budget-plans'] });
  };
}

export function useSaveCategoryAssignment(month: string) {
  const invalidate = useInvalidateAfterAssignmentMutation();
  return useMutation({
    mutationFn: ({ categoryId, input }: { categoryId: string; input: CategoryAssignmentInput }) =>
      saveCategoryAssignment(month, categoryId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCategoryAssignment(month: string) {
  const invalidate = useInvalidateAfterAssignmentMutation();
  return useMutation({
    mutationFn: (categoryId: string) => deleteCategoryAssignment(month, categoryId),
    onSuccess: invalidate,
  });
}
