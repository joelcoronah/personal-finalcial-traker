import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveBudgetPlan } from '../api/budgetPlans';
import { queryKeys } from './queryKeys';
import type { BudgetPlanInput } from '../types';

export function useSaveBudgetPlan(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BudgetPlanInput) => saveBudgetPlan(month, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.budgetPlan(month) }),
  });
}
