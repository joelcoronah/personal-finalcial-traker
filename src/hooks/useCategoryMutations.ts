import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, deleteCategory, updateCategory } from '../api/categories';
import type { CategoryInput } from '../types';

/** Todas las mutaciones invalidan 'categories' para refrescar selects y la página de CRUD. */
function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['categories'] });
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) =>
      updateCategory(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: invalidate,
  });
}
