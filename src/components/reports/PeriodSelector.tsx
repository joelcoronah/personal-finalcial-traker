import clsx from 'clsx';
import type { PeriodPreset } from '../../lib/dates';

interface PeriodSelectorProps {
  preset: PeriodPreset;
  from: string;
  to: string;
  onPresetChange: (preset: PeriodPreset) => void;
  onCustomRangeChange: (range: { from: string; to: string }) => void;
}

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: 'current-month', label: 'Mes actual' },
  { value: 'previous-month', label: 'Mes anterior' },
  { value: 'custom', label: 'Personalizado' },
];

export function PeriodSelector({ preset, from, to, onPresetChange, onCustomRangeChange }: PeriodSelectorProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPresetChange(p.value)}
            className={clsx(
              'rounded-lg py-2 text-sm font-medium transition-colors',
              preset === p.value ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Desde</span>
            <input
              type="date"
              value={from}
              onChange={(e) => onCustomRangeChange({ from: e.target.value, to })}
              className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Hasta</span>
            <input
              type="date"
              value={to}
              onChange={(e) => onCustomRangeChange({ from, to: e.target.value })}
              className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
        </div>
      )}
    </div>
  );
}
