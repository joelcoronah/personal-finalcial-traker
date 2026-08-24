import { useQuery } from '@tanstack/react-query';
import { getBudgetPlan, getBudgetPlanProgress } from '../api/budgetPlans';
import { queryKeys } from './queryKeys';

export function useBudgetPlan(month: string) {
  return useQuery({
    queryKey: queryKeys.budgetPlan(month),
    queryFn: () => getBudgetPlan(month),
  });
}

/** Meta vs. real del mes, ya calculado por el backend. */
export function useBudgetPlanProgress(month: string) {
  return useQuery({
    queryKey: queryKeys.budgetPlanProgress(month),
    queryFn: () => getBudgetPlanProgress(month),
  });
}
