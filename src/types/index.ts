// ---------------------------------------------------------------------------
// Tipos compartidos con el backend NestJS.
// Si el backend cambia algún shape, este es el único lugar que hay que tocar.
// ---------------------------------------------------------------------------

/** Monedas de referencia que maneja la app. */
export type Currency = 'VES' | 'USD' | 'EUR' | 'USDT';

export const CURRENCIES: Currency[] = ['VES', 'USD', 'EUR', 'USDT'];

export type TransactionType = 'income' | 'expense';

/**
 * Tasas del día, tal como las expone el backend en GET /rates/today.
 * usdBcv y eurBcv vienen de la API del BCV; usdt se actualiza manualmente.
 */
export interface Rates {
  usdBcv: number;
  eurBcv: number;
  usdt: number;
  /** Fecha "humana" que reporta el BCV, ej. "Junio - 2026". */
  date: string;
  /** ISO timestamp de la última actualización. */
  updatedAt: string;
}

/**
 * Snapshot de tasas congelado dentro de cada transacción en el momento en
 * que se creó (campo `rateSnapshot` del backend). Nunca se recalcula: es lo
 * que permite que el histórico no se distorsione cuando la tasa oficial o
 * paralela cambie después.
 */
export interface RatesSnapshot {
  usdBcv: number;
  eurBcv: number;
  usdt: number;
  date: string;
}

/** Categorías sugeridas por defecto (el usuario puede escribir "otra"). */
export const DEFAULT_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Ropa',
  'Ahorro / Inversión',
  'Deudas',
  'Salario',
  'Otros ingresos',
  'Otra',
] as const;

export type PaymentMethod =
  | 'Efectivo Bs.'
  | 'Pago móvil'
  | 'Transferencia'
  | 'Zelle'
  | 'Efectivo USD'
  | 'Tarjeta débito'
  | 'Tarjeta crédito'
  | 'Binance / Cripto'
  | 'Otro';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Efectivo Bs.',
  'Pago móvil',
  'Transferencia',
  'Zelle',
  'Efectivo USD',
  'Tarjeta débito',
  'Tarjeta crédito',
  'Binance / Cripto',
  'Otro',
];

export interface Transaction {
  id: string;
  type: TransactionType;
  amountOriginal: number;
  currencyOriginal: Currency;
  /** Equivalente en VES calculado con el snapshot al momento de crear. */
  amountVES: number;
  date: string; // ISO date
  category: string;
  paymentMethod?: PaymentMethod | string | null;
  description?: string;
  receiptImageUrl?: string | null;
  rateSnapshot: RatesSnapshot;
  createdAt: string;
  updatedAt: string;
}

/** Payload para crear/editar sin campos generados por el backend. */
export interface TransactionInput {
  type: TransactionType;
  amountOriginal: number;
  currencyOriginal: Currency;
  date: string;
  category: string;
  paymentMethod?: string;
  description?: string;
}

export interface TransactionsQuery {
  from?: string;
  to?: string;
  type?: TransactionType;
  category?: string;
  currencyOriginal?: Currency;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Totales en las 4 monedas de referencia. */
export type CurrencyTotals = Record<Currency, number>;

/**
 * Neto por categoría en cada moneda (ingresos - gastos). El backend no separa
 * income/expense por categoría: un monto negativo indica que la categoría es
 * mayormente gasto; positivo, mayormente ingreso.
 */
export interface CategoryBreakdownItem extends CurrencyTotals {
  category: string;
}

export interface Summary {
  period: { from: string; to: string };
  totals: {
    income: CurrencyTotals;
    expense: CurrencyTotals;
    balance: CurrencyTotals;
  };
  byCategory: CategoryBreakdownItem[];
  ratesUsed: RatesSnapshot;
}
