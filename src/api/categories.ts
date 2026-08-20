import { apiClient } from './client';
import type { Category, CategoriesQuery, CategoryInput } from '../types';

export async function getCategories(query: CategoriesQuery = {}): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories', { params: query });
  return data;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data } = await apiClient.post<Category>('/categories', input);
  return data;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, input);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
