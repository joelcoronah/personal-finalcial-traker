import { useState } from 'react';
import { PeriodSelector } from '../components/reports/PeriodSelector';
import { TotalsGrid } from '../components/reports/TotalsGrid';
import { CategoryBreakdown } from '../components/reports/CategoryBreakdown';
import { ErrorState } from '../components/common/ErrorState';
import { CurrencySwitcher } from '../components/common/CurrencySwitcher';
import { useSummary } from '../hooks/useSummary';
import { getRangeForPreset, type PeriodPreset } from '../lib/dates';
import type { Currency } from '../types';

export default function Reports() {
  const [preset, setPreset] = useState<PeriodPreset>('current-month');
  const [customRange, setCustomRange] = useState(getRangeForPreset('current-month'));
  const [currency, setCurrency] = useState<Currency>('USDT');

  const range = preset === 'custom' ? customRange : getRangeForPreset(preset);
  const { data: summary, isLoading, isError, refetch } = useSummary(range.from, range.to);

  function handlePresetChange(next: PeriodPreset) {
    setPreset(next);
    if (next !== 'custom') setCustomRange(getRangeForPreset(next));
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Resumen</h1>
        <p className="text-sm text-slate-400">Totales y desglose por categoría</p>
      </div>

      <PeriodSelector
        preset={preset}
        from={customRange.from}
        to={customRange.to}
        onPresetChange={handlePresetChange}
        onCustomRangeChange={setCustomRange}
      />

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <>
          <CurrencySwitcher value={currency} onChange={setCurrency} />

          <TotalsGrid summary={summary} isLoading={isLoading} currency={currency} />

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Desglose por categoría</h2>
            <CategoryBreakdown summary={summary} isLoading={isLoading} />
          </div>
        </>
      )}
    </div>
  );
}
