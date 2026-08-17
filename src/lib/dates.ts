import {
  startOfMonth,
  endOfMonth,
  subMonths,
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
