import type { Currency, RatesSnapshot } from '../types';

/** Símbolo/prefijo a mostrar por cada moneda. */
export const CURRENCY_SYMBOL: Record<Currency, string> = {
  VES: 'Bs.',
  USD: '$',
  EUR: '€',
  USDT: 'USDT',
};

export const CURRENCY_LABEL: Record<Currency, string> = {
  VES: 'Bolívares',
  USD: 'USD (BCV)',
  EUR: 'EUR (BCV)',
  USDT: 'USDT',
};

/**
 * Formatea un monto con separador de miles y el símbolo correspondiente.
 * Ej: formatCurrency(1234.5, 'VES') -> "Bs. 1.234,50"
 *     formatCurrency(12.5, 'USD')   -> "$12,50"
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

  const symbol = CURRENCY_SYMBOL[currency];
  return currency === 'VES' ? `${symbol} ${formatted}` : `${symbol}${formatted}`;
}

/** Igual que formatCurrency pero sin decimales, útil para totales grandes. */
export function formatCurrencyCompact(amount: number, currency: Currency): string {
  const formatted = new Intl.NumberFormat('es-VE', {
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
  const symbol = CURRENCY_SYMBOL[currency];
  return currency === 'VES' ? `${symbol} ${formatted}` : `${symbol}${formatted}`;
}

/** Formatea solo el número, sin símbolo (para inputs). */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

/**
 * Convierte un monto en `currency` a su equivalente en VES usando un
 * snapshot de tasas dado (puede ser el snapshot histórico de una
 * transacción o las tasas del día para previsualizar).
 */
export function toVES(amount: number, currency: Currency, rates: RatesSnapshot): number {
  switch (currency) {
    case 'VES':
      return amount;
    case 'USD':
      return amount * rates.usdBcv;
    case 'EUR':
      return amount * rates.eurBcv;
    case 'USDT':
      return amount * rates.usdt;
    default:
      return amount;
  }
}
