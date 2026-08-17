import { useState } from 'react';
import { PeriodSelector } from '../components/reports/PeriodSelector';
import { TotalsGrid } from '../components/reports/TotalsGrid';
import { CategoryBreakdown } from '../components/reports/CategoryBreakdown';
import { ErrorState } from '../components/common/ErrorState';
import { useSummary } from '../hooks/useSummary';
import { getRangeForPreset, type PeriodPreset } from '../lib/dates';

export default function Reports() {
  const [preset, setPreset] = useState<PeriodPreset>('current-month');
  const [customRange, setCustomRange] = useState(getRangeForPreset('current-month'));

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
          <TotalsGrid summary={summary} isLoading={isLoading} />

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Desglose por categoría</h2>
            <CategoryBreakdown summary={summary} isLoading={isLoading} />
          </div>
        </>
      )}
    </div>
  );
}
