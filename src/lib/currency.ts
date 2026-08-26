import type { Currency, CurrencyTotals, RatesSnapshot } from '../types';

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

/**
 * Formatea un monto multi-moneda (ej. `assigned`, `debt.totalRemainingDebt`)
 * como "Bs. X · $Y · USDT Z": VES como monto principal y USD/USDT como
 * equivalencia rápida, sin repetir EUR (poco usado fuera del monto original
 * de una transacción). Estos montos ya vienen convertidos por el backend
 * (con su propia tasa histórica o la de hoy, según el endpoint), así que acá
 * solo se formatea — no se convierte nada.
 */
export function formatMultiCurrency(amount: CurrencyTotals): string {
  return `${formatCurrency(amount.VES, 'VES')} · ${formatCurrency(amount.USD, 'USD')} · ${formatCurrency(amount.USDT, 'USDT')}`;
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

/**
 * Inversa de toVES: convierte un monto en VES a su equivalente en
 * `currency` usando las tasas del día. Útil para mostrar equivalencias
 * (ej. cuánto de un monto en Bs. representa en USD/USDT) sin depender de un
 * snapshot histórico. Devuelve 0 si la tasa no está disponible aún.
 */
export function fromVES(amountVES: number, currency: Currency, rates: RatesSnapshot): number {
  switch (currency) {
    case 'VES':
      return amountVES;
    case 'USD':
      return rates.usdBcv ? amountVES / rates.usdBcv : 0;
    case 'EUR':
      return rates.eurBcv ? amountVES / rates.eurBcv : 0;
    case 'USDT':
      return rates.usdt ? amountVES / rates.usdt : 0;
    default:
      return amountVES;
  }
}
