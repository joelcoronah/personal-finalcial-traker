import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/categories';
import { queryKeys } from './queryKeys';
import type { CategoriesQuery } from '../types';

export function useCategories(query: CategoriesQuery = {}) {
  return useQuery({
    queryKey: queryKeys.categories(query),
    queryFn: () => getCategories(query),
  });
}
