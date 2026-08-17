import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRates } from '../../hooks/useRates';
import { formatCurrency } from '../../lib/currency';
import { Skeleton } from '../common/Skeleton';
import { UpdateUsdtModal } from './UpdateUsdtModal';

export function RatesCard() {
  const { data: rates, isLoading, isError, refetch, isFetching } = useRates();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 text-white shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-emerald-50">Tasas del día</h2>
        <button
          onClick={() => refetch()}
          className="rounded-full p-1.5 text-emerald-100 hover:bg-white/10 disabled:opacity-50"
          aria-label="Actualizar tasas"
          disabled={isFetching}
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {isLoading ? (
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Skeleton className="h-14 bg-white/20" />
          <Skeleton className="h-14 bg-white/20" />
          <Skeleton className="h-14 bg-white/20" />
        </div>
      ) : isError || !rates ? (
        <p className="mt-3 text-sm text-emerald-100">No se pudieron cargar las tasas.</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <RateItem label="USD BCV" value={formatCurrency(rates.usdBcv, 'VES')} />
            <RateItem label="EUR BCV" value={formatCurrency(rates.eurBcv, 'VES')} />
            <RateItem label="USDT" value={formatCurrency(rates.usdt, 'VES')} />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-emerald-100">
            <span>
              Actualizado: {new Date(rates.updatedAt).toLocaleString('es-VE', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-full bg-white/15 px-3 py-1 font-medium text-white hover:bg-white/25"
            >
              Actualizar USDT
            </button>
          </div>
        </>
      )}

      <UpdateUsdtModal open={modalOpen} onClose={() => setModalOpen(false)} currentRate={rates?.usdt} />
    </div>
  );
}

function RateItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-2.5 py-2">
      <p className="text-[11px] text-emerald-100">{label}</p>
      <p className="truncate text-sm font-semibold">{value}</p>
    </div>
  );
}
