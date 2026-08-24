import axios from 'axios';
import { apiClient } from './client';
import type { BudgetPlan, BudgetPlanInput, BudgetPlanProgress } from '../types';

/** Devuelve null si el mes no tiene plan guardado (404) en vez de lanzar. */
export async function getBudgetPlan(month: string): Promise<BudgetPlan | null> {
  try {
    const { data } = await apiClient.get<BudgetPlan>(`/budget-plans/${month}`);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

/** Crea o reemplaza (upsert) el plan de un mes. */
export async function saveBudgetPlan(month: string, input: BudgetPlanInput): Promise<BudgetPlan> {
  const { data } = await apiClient.put<BudgetPlan>(`/budget-plans/${month}`, input);
  return data;
}

/** Meta vs. real del mes, ya calculado por el backend (ver types/index.ts). */
export async function getBudgetPlanProgress(month: string): Promise<BudgetPlanProgress> {
  const { data } = await apiClient.get<BudgetPlanProgress>(`/budget-plans/${month}/progress`);
  return data;
}
