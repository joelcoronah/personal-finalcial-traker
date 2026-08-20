import { useQuery } from '@tanstack/react-query';
import { getBudgetPlan } from '../api/budgetPlans';
import { queryKeys } from './queryKeys';

export function useBudgetPlan(month: string) {
  return useQuery({
    queryKey: queryKeys.budgetPlan(month),
    queryFn: () => getBudgetPlan(month),
  });
}
