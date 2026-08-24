import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveBudgetPlan } from '../api/budgetPlans';
import type { BudgetPlanInput } from '../types';

export function useSaveBudgetPlan(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BudgetPlanInput) => saveBudgetPlan(month, input),
    // Prefijo compartido ['budget-plans', month, ...]: invalida tanto el
    // plan crudo como su /progress derivado.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget-plans', month] }),
  });
}
