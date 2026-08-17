import { apiClient } from './client';
import type { Summary } from '../types';

export async function getSummary(from: string, to: string): Promise<Summary> {
  const { data } = await apiClient.get<Summary>('/summary', { params: { from, to } });
  return data;
}
