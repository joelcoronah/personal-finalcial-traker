import { apiClient } from './client';
import type {
  PaginatedResponse,
  Transaction,
  TransactionInput,
  TransactionsQuery,
} from '../types';

export async function getTransactions(
  query: TransactionsQuery,
): Promise<PaginatedResponse<Transaction>> {
  const { data } = await apiClient.get<PaginatedResponse<Transaction>>('/transactions', {
    params: query,
  });
  return data;
}

export async function getTransaction(id: string): Promise<Transaction> {
  const { data } = await apiClient.get<Transaction>(`/transactions/${id}`);
  return data;
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>('/transactions', input);
  return data;
}

/** Crea una transacción adjuntando comprobante (imagen) vía multipart/form-data. */
export async function uploadTransaction(
  input: TransactionInput,
  file: File,
): Promise<Transaction> {
  const formData = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  formData.append('file', file);

  const { data } = await apiClient.post<Transaction>('/transactions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateTransaction(
  id: string,
  input: Partial<TransactionInput>,
): Promise<Transaction> {
  const { data } = await apiClient.patch<Transaction>(`/transactions/${id}`, input);
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/transactions/${id}`);
}
