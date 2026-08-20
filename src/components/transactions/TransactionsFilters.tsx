import { CURRENCIES, DEFAULT_CATEGORIES, type TransactionsQuery } from '../../types';
import { useCategories } from '../../hooks/useCategories';

interface TransactionsFiltersProps {
  filters: TransactionsQuery;
  onChange: (filters: TransactionsQuery) => void;
}

export function TransactionsFilters({ filters, onChange }: TransactionsFiltersProps) {
  // Igual que en TransactionForm: si el backend no tiene categorías todavía
  // o la petición falla, se cae de vuelta a DEFAULT_CATEGORIES.
  const { data: categoriesData } = useCategories({ active: true });
  const categoryOptions =
    categoriesData && categoriesData.length > 0
      ? Array.from(new Set(categoriesData.map((c) => c.name))).sort((a, b) => a.localeCompare(b))
      : DEFAULT_CATEGORIES;

  function update(patch: Partial<TransactionsQuery>) {
    onChange({ ...filters, ...patch, page: 1 });
  }

  const hasActiveFilters =
    filters.from || filters.to || filters.type || filters.category || filters.currencyOriginal;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Desde</span>
          <input
            type="date"
            value={filters.from ?? ''}
            onChange={(e) => update({ from: e.target.value || undefined })}
            className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Hasta</span>
          <input
            type="date"
            value={filters.to ?? ''}
            onChange={(e) => update({ to: e.target.value || undefined })}
            className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Tipo</span>
          <select
            value={filters.type ?? ''}
            onChange={(e) => update({ type: (e.target.value || undefined) as TransactionsQuery['type'] })}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Todos</option>
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Categoría</span>
          <select
            value={filters.category ?? ''}
            onChange={(e) => update({ category: e.target.value || undefined })}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Todas</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Moneda</span>
          <select
            value={filters.currencyOriginal ?? ''}
            onChange={(e) =>
              update({ currencyOriginal: (e.target.value || undefined) as TransactionsQuery['currencyOriginal'] })
            }
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Todas</option>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => onChange({ page: 1, limit: filters.limit })}
          className="self-start text-xs font-medium text-emerald-600 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
