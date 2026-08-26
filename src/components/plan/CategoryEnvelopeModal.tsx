import { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { useSaveCategoryAssignment, useDeleteCategoryAssignment } from '../../hooks/useBudgetAssignmentMutations';
import { CURRENCY_SYMBOL } from '../../lib/currency';

interface EditingCategory {
  categoryId: string;
  categoryName: string;
  /** Monto actual del sobre en USDT, para precargar el input en modo edición. */
  assignedUSDT: number;
}

interface CreatableCategory {
  id: string;
  name: string;
}

interface CategoryEnvelopeModalProps {
  open: boolean;
  onClose: () => void;
  month: string;
  /** Modo edición: categoría fija, con su sobre actual. */
  editing?: EditingCategory | null;
  /** Modo creación: el usuario elige entre las categorías del grupo que aún no tienen sobre. */
  creatableCategories?: CreatableCategory[];
}

// El monto siempre se escribe/edita en USDT: dejar que el usuario cambie de
// moneda acá invitaba a re-teclear el mismo número bajo otra moneda sin
// convertirlo, y convertirlo automáticamente al vuelo entre VES/USD/EUR/USDT
// arrastraba redondeos de la tasa del día. Fijar una sola moneda estable
// evita ambos problemas.
const ENVELOPE_CURRENCY = 'USDT';

export function CategoryEnvelopeModal({
  open,
  onClose,
  month,
  editing,
  creatableCategories,
}: CategoryEnvelopeModalProps) {
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? '');
  const [amount, setAmount] = useState(editing ? editing.assignedUSDT.toFixed(2) : '');

  const saveAssignment = useSaveCategoryAssignment(month);
  const deleteAssignment = useDeleteCategoryAssignment(month);

  // El modal se queda montado entre aperturas (solo cambia `open`), así que
  // hay que resetear el form manualmente cada vez que se abre para una
  // categoría/edición distinta en vez de confiar en el estado inicial.
  useEffect(() => {
    if (!open) return;
    setCategoryId(editing?.categoryId ?? '');
    // .toFixed(2): assignedUSDT es VES/tasa calculado por el backend y puede
    // llegar con ruido de punto flotante (ej. 299.99999999999994) — se
    // redondea a centavos antes de mostrarlo, igual que el resto de montos
    // en la app (formatCurrency ya trabaja con 2 decimales).
    setAmount(editing ? editing.assignedUSDT.toFixed(2) : '');
    // Solo re-ejecutar al abrir o al cambiar de categoría editada, no en
    // cada render (editing/creatableCategories son objetos/arrays nuevos en
    // cada render del padre y pisarían lo que el usuario esté escribiendo).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing?.categoryId]);

  function resetAndClose() {
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount.replace(',', '.'));
    const targetCategoryId = editing?.categoryId ?? categoryId;
    if (!numericAmount || numericAmount <= 0 || !targetCategoryId) return;

    saveAssignment.mutate(
      { categoryId: targetCategoryId, input: { amount: numericAmount, currencyOriginal: ENVELOPE_CURRENCY } },
      { onSuccess: resetAndClose },
    );
  }

  function handleDelete() {
    if (!editing) return;
    deleteAssignment.mutate(editing.categoryId, { onSuccess: resetAndClose });
  }

  const title = editing ? `Límite para ${editing.categoryName}` : 'Nuevo límite de categoría';

  return (
    <Modal open={open} onClose={resetAndClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!editing && (
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-600">Categoría</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {(creatableCategories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-600">Monto máximo en {ENVELOPE_CURRENCY}</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {CURRENCY_SYMBOL[ENVELOPE_CURRENCY]}
            </span>
            <input
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-16 pr-3 text-lg font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </label>

        {(saveAssignment.isError || deleteAssignment.isError) && (
          <p className="text-sm text-red-600">No se pudo guardar el límite. Intenta de nuevo.</p>
        )}

        <div className="flex gap-2">
          {editing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteAssignment.isPending}
              className="flex-1 rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleteAssignment.isPending ? 'Quitando…' : 'Quitar límite'}
            </button>
          )}
          <button
            type="submit"
            disabled={saveAssignment.isPending}
            className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {saveAssignment.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
