import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodayRates, updateUsdtRate } from '../api/rates';
import { queryKeys } from './queryKeys';

const FIVE_MINUTES = 5 * 60 * 1000;

/**
 * Trae /rates/today y la mantiene disponible para toda la app (equivalencias
 * en tiempo real, tarjeta de tasas del dashboard, etc.).
 * Se refresca sola cada 5 min por si la tasa BCV cambió en el backend.
 */
export function useRates() {
  return useQuery({
    queryKey: queryKeys.rates,
    queryFn: getTodayRates,
    staleTime: FIVE_MINUTES,
    refetchInterval: FIVE_MINUTES,
  });
}

/** Actualiza manualmente la tasa USDT (no hay API automática para esta). */
export function useUpdateUsdtRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rate: number) => updateUsdtRate(rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rates });
    },
  });
}
