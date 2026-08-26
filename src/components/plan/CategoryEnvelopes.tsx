import { useMemo, useState } from 'react';
import { ChevronDown, Pencil, Plus, TriangleAlert } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { formatCurrency } from '../../lib/currency';
import { CategoryEnvelopeModal } from './CategoryEnvelopeModal';
import type { BudgetGroup, CategoryAssignmentProgress, Currency } from '../../types';

interface CategoryEnvelopesProps {
  group: BudgetGroup;
  month: string;
  byCategory: CategoryAssignmentProgress[];
  color: string;
  currency: Currency;
}

/**
 * Drill-down de sobres de presupuesto por categoría dentro de un grupo del
 * plan 50/30/20. `byCategory` ya trae assigned/spent/available calculados
 * por el backend (assignment.byCategory de /progress); acá solo se filtra
 * por grupo y se agrega la UI para editar/crear/borrar sobres.
 */
export function CategoryEnvelopes({ group, month, byCategory, color, currency }: CategoryEnvelopesProps) {
  const [expanded, setExpanded] = useState(false);
  const [modalState, setModalState] = useState<
    { mode: 'edit'; categoryId: string; categoryName: string; assignedUSDT: number } | { mode: 'create' } | null
  >(null);

  const rows = byCategory.filter((c) => c.budgetGroup === group);

  // Categorías de gasto de este grupo que todavía no tienen fila en
  // byCategory (sin sobre y sin gasto este mes) — candidatas para "+ Agregar límite".
  const { data: expenseCategories } = useCategories({ type: 'expense', active: true });
  const creatableCategories = useMemo(() => {
    const existingIds = new Set(rows.map((r) => r.categoryId));
    return (expenseCategories ?? [])
      .filter((c) => c.budgetGroup === group && !existingIds.has(c.id))
      .map((c) => ({ id: c.id, name: c.name }));
  }, [expenseCategories, group, rows]);

  if (rows.length === 0 && creatableCategories.length === 0) return null;

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600"
      >
        <ChevronDown size={13} className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'} />
        {expanded ? 'Ocultar categorías' : `Ver categorías${rows.length > 0 ? ` (${rows.length})` : ''}`}
      </button>

      {expanded && (
        <div className="mt-2 flex flex-col gap-2 border-l-2 pl-3" style={{ borderColor: color }}>
          {rows.map((row) => (
            <CategoryEnvelopeRow
              key={row.categoryId}
              row={row}
              currency={currency}
              onEdit={() =>
                setModalState({
                  mode: 'edit',
                  categoryId: row.categoryId,
                  categoryName: row.categoryName,
                  assignedUSDT: row.assigned.USDT,
                })
              }
            />
          ))}

          {creatableCategories.length > 0 && (
            <button
              type="button"
              onClick={() => setModalState({ mode: 'create' })}
              className="flex w-fit items-center gap-1 rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:border-emerald-400 hover:text-emerald-600"
            >
              <Plus size={13} />
              Agregar límite
            </button>
          )}
        </div>
      )}

      <CategoryEnvelopeModal
        open={modalState !== null}
        onClose={() => setModalState(null)}
        month={month}
        editing={modalState?.mode === 'edit' ? modalState : null}
        creatableCategories={modalState?.mode === 'create' ? creatableCategories : undefined}
      />
    </div>
  );
}

function CategoryEnvelopeRow({
  row,
  currency,
  onEdit,
}: {
  row: CategoryAssignmentProgress;
  currency: Currency;
  onEdit: () => void;
}) {
  // El signo/ratio es el mismo en cualquier moneda (todas se derivan de la
  // misma conversión), así que la lógica de negocio se evalúa en VES y solo
  // el texto se formatea en la moneda elegida.
  const hasEnvelope = row.assigned.VES > 0;
  const isUnbudgeted = !hasEnvelope && row.spent.VES !== 0;
  const isOverspent = hasEnvelope && row.available.VES < 0;
  const pct = hasEnvelope ? Math.min((row.spent.VES / row.assigned.VES) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="flex min-w-0 items-center gap-1.5 truncate font-medium text-slate-600">
          <span className="truncate">{row.categoryName}</span>
          {isUnbudgeted && (
            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
              <TriangleAlert size={10} />
              Sin presupuesto
            </span>
          )}
        </span>
        <button
          onClick={onEdit}
          className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label={hasEnvelope ? 'Editar límite' : 'Poner límite'}
        >
          <Pencil size={12} />
        </button>
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>
          Gastado {formatCurrency(row.spent[currency], currency)}
          {hasEnvelope && <> de {formatCurrency(row.assigned[currency], currency)}</>}
        </span>
        {hasEnvelope && (
          <span className={isOverspent ? 'font-medium text-red-500' : ''}>
            {isOverspent ? 'Excedido: ' : 'Disponible: '}
            {formatCurrency(Math.abs(row.available[currency]), currency)}
          </span>
        )}
      </div>
      {hasEnvelope && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${isOverspent ? 'bg-red-400' : 'bg-emerald-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
