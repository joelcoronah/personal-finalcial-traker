// ---------------------------------------------------------------------------
// Tipos compartidos con el backend NestJS.
// Si el backend cambia algún shape, este es el único lugar que hay que tocar.
// ---------------------------------------------------------------------------

/** Monedas de referencia que maneja la app. */
export type Currency = "VES" | "USD" | "EUR" | "USDT";

export const CURRENCIES: Currency[] = ["VES", "USD", "EUR", "USDT"];

export type TransactionType = "income" | "expense";

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
  "Alimentación",
  "Transporte",
  "Vivienda",
  "Servicios",
  "Salud",
  "Educación",
  "Entretenimiento",
  "Ropa",
  "Ahorro / Inversión",
  "Deudas",
  "Salario",
  "Otros ingresos",
  "Otra",
] as const;

export type PaymentMethod =
  | "Efectivo Bs."
  | "Pago móvil"
  | "Transferencia"
  | "Efectivo USD"
  | "Tarjeta débito"
  | "Tarjeta crédito"
  | "Binance / Cripto"
  | "Cashea"
  | "Otro";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Efectivo Bs.",
  "Pago móvil",
  "Transferencia",
  "Efectivo USD",
  "Tarjeta débito",
  "Tarjeta crédito",
  "Binance / Cripto",
  "Cashea",
  "Otro",
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
  /** Deuda a la que está vinculada esta transacción (solo aplica a gastos). */
  debtId?: string | null;
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
  /** Solo válido cuando type === 'expense'; el backend rechaza el campo en ingresos. */
  debtId?: string | null;
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

// ---------------------------------------------------------------------------
// Categorías (CRUD en /categorias)
// ---------------------------------------------------------------------------

/** Grupo del plan 50/30/20 al que puede pertenecer una categoría. */
export type BudgetGroup = "needs" | "wants" | "savings";

export const BUDGET_GROUPS: BudgetGroup[] = ["needs", "wants", "savings"];

export const BUDGET_GROUP_LABEL: Record<BudgetGroup, string> = {
  needs: "Necesidades",
  wants: "Gustos",
  savings: "Ahorro",
};

/**
 * Categoría gestionable por el usuario. Es la fuente de verdad para los
 * selects de categoría en el formulario de transacciones y los filtros;
 * DEFAULT_CATEGORIES queda solo como fallback si el backend todavía no
 * tiene el módulo de categorías o la petición falla.
 *
 * Nota: Transaction.category sigue siendo un string libre (no una FK) para
 * no perder el histórico si una categoría se borra o se renombra.
 */
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  budgetGroup?: BudgetGroup | null;
  color?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Payload para crear/editar una categoría. */
export interface CategoryInput {
  name: string;
  type: TransactionType;
  budgetGroup?: BudgetGroup | null;
  color?: string | null;
  isActive?: boolean;
}

export interface CategoriesQuery {
  type?: TransactionType;
  active?: boolean;
}

// ---------------------------------------------------------------------------
// Plan 50/30/20 (un objetivo por mes, en /budget-plans/:month)
// ---------------------------------------------------------------------------

/**
 * Objetivo de distribución del gasto para un mes ("yyyy-MM"), guardado una
 * sola vez por mes (upsert vía PUT /budget-plans/:month). needsPct +
 * wantsPct + savingsPct siempre suman 100 (lo valida el backend).
 */
export interface BudgetPlan {
  id: string;
  month: string; // "yyyy-MM"
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetPlanInput {
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
}

/** Objetivo clásico 50/30/20, usado como punto de partida cuando un mes aún no tiene plan guardado. */
export const DEFAULT_BUDGET_PLAN: BudgetPlanInput = {
  needsPct: 50,
  wantsPct: 30,
  savingsPct: 20,
};

/**
 * Monto real de un grupo (en las 4 monedas de referencia) y qué % de
 * amount.VES representa sobre el ingreso del mes. amount es la suma de cada
 * transacción del grupo ya convertida con SU PROPIA tasa histórica — no el
 * total en VES reconvertido con la tasa de hoy (ver comentario en Summary).
 */
export interface BudgetGroupProgress {
  amount: CurrencyTotals;
  actualPct: number;
  /**
   * Meta en monto (targetPct del grupo aplicado a income - aporte a deudas),
   * ya calculada por el backend. null si el mes no tiene plan guardado
   * (hasPlan: false) — en ese caso el frontend cae en el default 50/30/20.
   */
  targetAmount: CurrencyTotals | null;
}

/** Resumen de deudas del período, compartido por /summary y /budget-plans/:month/progress. */
export interface DebtSummary {
  /** Saldo pendiente de todas las deudas activas, valorado hoy. */
  totalRemainingDebt: CurrencyTotals;
  /** Pagos a deudas hechos dentro del período/mes consultado. */
  monthContribution: CurrencyTotals;
  activeDebtCount: number;
}

/**
 * Un "sobre" de presupuesto por categoría para el mes: cuánto se le asignó
 * (assigned), cuánto se gastó realmente (spent) y cuánto queda (available).
 * Si la categoría tuvo gasto pero nunca se le asignó sobre, assigned viene en
 * 0 — el frontend no debe ocultar esas filas, para no esconder gasto sin
 * presupuestar.
 */
export interface CategoryAssignmentProgress {
  categoryId: string;
  categoryName: string;
  budgetGroup: BudgetGroup | null;
  assigned: CurrencyTotals;
  spent: CurrencyTotals;
  available: CurrencyTotals;
}

/** Resumen de asignación de presupuesto del período, compartido por /summary y /progress. */
export interface AssignmentSummary {
  totalAssigned: CurrencyTotals;
  /** income - totalAssigned; puede ser negativo (sobre-asignado). */
  readyToAssign: CurrencyTotals;
  /** income - expense. */
  availableToSpend: CurrencyTotals;
  byCategory: CategoryAssignmentProgress[];
}

/**
 * Meta vs. real de un mes, ya calculado por el backend en
 * GET /budget-plans/:month/progress. actualPct de cada grupo (y de
 * unclassified) es % sobre income.VES, no sobre el gasto total — así es como
 * se mide la regla 50/30/20 (cuánto de lo que entró se fue a cada grupo).
 * targetPct es null si el mes no tiene plan guardado (hasPlan: false); en
 * ese caso el frontend debe caer en DEFAULT_BUDGET_PLAN para el formulario.
 */
export interface BudgetPlanProgress {
  month: string;
  hasPlan: boolean;
  targetPct: { needs: number; wants: number; savings: number } | null;
  income: CurrencyTotals;
  expense: CurrencyTotals;
  groups: Record<BudgetGroup, BudgetGroupProgress>;
  unclassified: BudgetGroupProgress;
  debt: DebtSummary;
  assignment: AssignmentSummary;
  /** Total histórico puesto en categorías de grupo "savings", valorado hoy. Solo crece: no hay flujo de retiro todavía. */
  savingsAccumulated: CurrencyTotals;
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
  /**
   * USD/EUR/USDT en totals y byCategory son la SUMA de cada transacción ya
   * convertida con su propia tasa histórica (rateSnapshot congelado al
   * crearla) — no el total en VES reconvertido con la tasa de hoy. Así
   * reflejan lo que esas compras costaron realmente en dólares/USDT cuando
   * pasaron, en vez de revalorizar todo el acumulado a la tasa de hoy.
   */
  totals: {
    income: CurrencyTotals;
    expense: CurrencyTotals;
    balance: CurrencyTotals;
  };
  byCategory: CategoryBreakdownItem[];
  /** Tasas de HOY, solo de referencia — no son las usadas para los totales de arriba. */
  currentRates: RatesSnapshot;
  debt: DebtSummary;
  assignment: AssignmentSummary;
  /** Total histórico puesto en categorías de grupo "savings", valorado hoy. Solo crece: no hay flujo de retiro todavía. */
  savingsAccumulated: CurrencyTotals;
}

// ---------------------------------------------------------------------------
// Deudas (CRUD en /debts). totalAmount/paidAmount/remainingBalance/minPayment
// vienen ya convertidos a las 4 monedas de referencia; currencyOriginal es
// solo la moneda en la que se declaró la deuda (y en la que se escriben los
// inputs de creación/edición).
// ---------------------------------------------------------------------------

export interface Debt {
  id: string;
  name: string;
  currencyOriginal: Currency;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalAmount: CurrencyTotals;
  paidAmount: CurrencyTotals;
  remainingBalance: CurrencyTotals;
  percentPaid: number; // 0-100
  minPayment: CurrencyTotals | null;
}

/** GET /debts/:id agrega las transacciones vinculadas más recientes. */
export interface DebtDetail extends Debt {
  payments: Transaction[];
}

export interface DebtInput {
  name: string;
  totalAmount: number;
  currencyOriginal: Currency;
  minPayment?: number;
}

export interface DebtUpdateInput extends Partial<DebtInput> {
  isActive?: boolean;
}

export interface DebtsQuery {
  /** Omitir para incluir también las deudas archivadas (isActive: false). */
  active?: boolean;
}

// ---------------------------------------------------------------------------
// Sobres de presupuesto por categoría (CRUD en /budget-plans/:month/assignments)
// ---------------------------------------------------------------------------

export interface CategoryAssignmentInput {
  amount: number;
  currencyOriginal: Currency;
}
