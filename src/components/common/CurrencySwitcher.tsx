import clsx from 'clsx';
import { CURRENCIES, type Currency } from '../../types';

interface CurrencySwitcherProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

/**
 * Selector de moneda en pastillas (mismo patrón visual que el picker de
 * moneda del formulario de transacciones), para elegir en qué moneda se
 * muestran las tarjetas de resumen y los montos del plan.
 */
export function CurrencySwitcher({ value, onChange }: CurrencySwitcherProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={clsx(
            'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
            value === c ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100',
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
