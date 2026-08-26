import { apiClient } from './client';
import type { Debt, DebtDetail, DebtInput, DebtUpdateInput, DebtsQuery } from '../types';

export async function getDebts(query: DebtsQuery = {}): Promise<Debt[]> {
  const { data } = await apiClient.get<Debt[]>('/debts', { params: query });
  return data;
}

/** Incluye `payments`: las transacciones vinculadas más recientes. */
export async function getDebt(id: string): Promise<DebtDetail> {
  const { data } = await apiClient.get<DebtDetail>(`/debts/${id}`);
  return data;
}

export async function createDebt(input: DebtInput): Promise<Debt> {
  const { data } = await apiClient.post<Debt>('/debts', input);
  return data;
}

export async function updateDebt(id: string, input: DebtUpdateInput): Promise<Debt> {
  const { data } = await apiClient.patch<Debt>(`/debts/${id}`, input);
  return data;
}

/** Desvincula (no borra) los pagos ya registrados: su debtId pasa a null. */
export async function deleteDebt(id: string): Promise<void> {
  await apiClient.delete(`/debts/${id}`);
}
