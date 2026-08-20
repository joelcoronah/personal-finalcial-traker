import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, ImageOff, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Transaction } from '../../types';
import { resolveApiUrl } from '../../api/client';
import { formatCurrency } from '../../lib/currency';
import { formatDateShort } from '../../lib/dates';
import { ImagePreviewModal } from './ImagePreviewModal';

interface TransactionRowProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export function TransactionRow({ transaction: tx, onDelete, compact }: TransactionRowProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const isIncome = tx.type === 'income';

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}
      >
        {isIncome ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-700">
          {tx.description || tx.category}
        </p>
        <p className="truncate text-xs text-slate-400">
          {tx.category} · {formatDateShort(tx.date)}
          {tx.paymentMethod ? ` · ${tx.paymentMethod}` : ''}
        </p>
      </div>

      {tx.receiptImageUrl ? (
        <button
          onClick={() => setPreviewOpen(true)}
          className="shrink-0 overflow-hidden rounded-lg border border-slate-200"
          aria-label="Ver comprobante"
        >
          <img
            src={resolveApiUrl(tx.receiptImageUrl)}
            alt="Comprobante"
            className="h-9 w-9 object-cover"
          />
        </button>
      ) : (
        !compact && (
          <span className="shrink-0 text-slate-300">
            <ImageOff size={16} />
          </span>
        )
      )}

      <div className="shrink-0 text-right">
        <p className={`text-sm font-semibold ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
          {isIncome ? '+' : '-'}
          {formatCurrency(tx.amountOriginal, tx.currencyOriginal)}
        </p>
        {tx.currencyOriginal !== 'VES' && (
          <p className="text-xs text-slate-400">{formatCurrency(tx.amountVES, 'VES')}</p>
        )}
      </div>

      {!compact && (
        <div className="flex shrink-0 items-center gap-1">
          <Link
            to={`/transacciones/${tx.id}/editar`}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Editar"
          >
            <Pencil size={15} />
          </Link>
          <button
            onClick={() => onDelete?.(tx.id)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
            aria-label="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}

      {tx.receiptImageUrl && (
        <ImagePreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          src={resolveApiUrl(tx.receiptImageUrl)}
        />
      )}
    </div>
  );
}
