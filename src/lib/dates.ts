import {
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  format,
  formatISO,
} from 'date-fns';
import { es } from 'date-fns/locale';

export type PeriodPreset = 'current-month' | 'previous-month' | 'custom';

export interface DateRange {
  from: string; // ISO yyyy-MM-dd
  to: string; // ISO yyyy-MM-dd
}

function toDateOnlyISO(date: Date): string {
  return formatISO(date, { representation: 'date' });
}

export function getCurrentMonthRange(): DateRange {
  const now = new Date();
  return { from: toDateOnlyISO(startOfMonth(now)), to: toDateOnlyISO(endOfMonth(now)) };
}

export function getPreviousMonthRange(): DateRange {
  const prev = subMonths(new Date(), 1);
  return { from: toDateOnlyISO(startOfMonth(prev)), to: toDateOnlyISO(endOfMonth(prev)) };
}

export function getRangeForPreset(preset: PeriodPreset): DateRange {
  if (preset === 'previous-month') return getPreviousMonthRange();
  return getCurrentMonthRange();
}

export function formatDateHuman(isoDate: string): string {
  try {
    return format(new Date(isoDate), "d 'de' MMMM, yyyy", { locale: es });
  } catch {
    return isoDate;
  }
}

export function formatDateShort(isoDate: string): string {
  try {
    return format(new Date(isoDate), 'dd/MM/yyyy');
  } catch {
    return isoDate;
  }
}

export function todayISO(): string {
  return toDateOnlyISO(new Date());
}

// ---------------------------------------------------------------------------
// Mes como clave "yyyy-MM" (usado por el Plan 50/30/20, que guarda un
// objetivo por mes). Se construye la fecha con año/mes explícitos en vez de
// parsear el string directamente para no depender de cómo cada motor JS
// interpreta zonas horarias en "yyyy-MM".
// ---------------------------------------------------------------------------

function monthKeyToDate(month: string): Date {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m - 1, 1);
}

export function currentMonthKey(): string {
  return format(new Date(), 'yyyy-MM');
}

export function shiftMonthKey(month: string, delta: number): string {
  return format(addMonths(monthKeyToDate(month), delta), 'yyyy-MM');
}

/** Rango [from, to] (ISO yyyy-MM-dd) que cubre el mes completo de `month`. */
export function getMonthRange(month: string): DateRange {
  const date = monthKeyToDate(month);
  return { from: toDateOnlyISO(startOfMonth(date)), to: toDateOnlyISO(endOfMonth(date)) };
}

/** Ej: "2026-08" -> "Agosto 2026" */
export function formatMonthLabel(month: string): string {
  const label = format(monthKeyToDate(month), 'MMMM yyyy', { locale: es });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
