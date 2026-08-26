import { Link } from 'react-router-dom';
import { Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react';
import type { Debt } from '../../types';
import { formatCurrency, formatMultiCurrency } from '../../lib/currency';

interface DebtRowProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onToggleActive: (debt: Debt) => void;
}

export function DebtRow({ debt, onEdit, onDelete, onToggleActive }: DebtRowProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/deudas/${debt.id}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-700 hover:text-emerald-700">{debt.name}</p>
          <p className="text-xs text-slate-400">
            {formatCurrency(debt.totalAmount[debt.currencyOriginal], debt.currencyOriginal)} total
            {debt.minPayment && (
              <> · mín. {formatCurrency(debt.minPayment[debt.currencyOriginal], debt.currencyOriginal)}/mes</>
            )}
          </p>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onEdit(debt)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Editar"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onToggleActive(debt)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label={debt.isActive ? 'Archivar' : 'Reactivar'}
          >
            {debt.isActive ? <Archive size={15} /> : <ArchiveRestore size={15} />}
          </button>
          <button
            onClick={() => onDelete(debt)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
            aria-label="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="mt-2.5">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
          <span>{debt.percentPaid.toFixed(0)}% pagado</span>
          <span>Saldo: {formatMultiCurrency(debt.remainingBalance)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${Math.min(debt.percentPaid, 100)}%` }}
          />
        </div>
      </div>

      {!debt.isActive && (
        <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
          Archivada
        </span>
      )}
    </div>
  );
}
