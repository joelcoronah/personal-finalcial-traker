import { apiClient } from './client';
import type { Rates } from '../types';

export async function getTodayRates(): Promise<Rates> {
  const { data } = await apiClient.get<Rates>('/rates/today');
  return data;
}

export async function updateUsdtRate(rate: number): Promise<Rates> {
  const { data } = await apiClient.post<Rates>('/rates/usdt', { rate });
  return data;
}
