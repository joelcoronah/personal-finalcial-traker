import { useState } from 'react';
import clsx from 'clsx';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import {
  BUDGET_GROUPS,
  BUDGET_GROUP_LABEL,
  type BudgetGroup,
  type Category,
  type CategoryInput,
  type TransactionType,
} from '../../types';

const DEFAULT_COLOR = '#64748b'; // slate-500

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (input: CategoryInput) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export function CategoryForm({ initialData, onSubmit, isSubmitting, errorMessage }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [type, setType] = useState<TransactionType>(initialData?.type ?? 'expense');
  const [budgetGroup, setBudgetGroup] = useState<BudgetGroup | ''>(initialData?.budgetGroup ?? '');
  const [color, setColor] = useState(initialData?.color ?? DEFAULT_COLOR);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      type,
      budgetGroup: budgetGroup || null,
      color,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Toggle Ingreso / Gasto */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <ToggleButton
          active={type === 'expense'}
          onClick={() => setType('expense')}
          icon={<ArrowDownCircle size={16} />}
          label="Gasto"
          activeClass="bg-white text-red-500 shadow-sm"
        />
        <ToggleButton
          active={type === 'income'}
          onClick={() => setType('income')}
          icon={<ArrowUpCircle size={16} />}
          label="Ingreso"
          activeClass="bg-white text-emerald-600 shadow-sm"
        />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-600">Nombre</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Alimentación"
          className="rounded-lg border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-600">Grupo del plan 50/30/20 (opcional)</span>
        <select
          value={budgetGroup}
          onChange={(e) => setBudgetGroup(e.target.value as BudgetGroup | '')}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Sin grupo</option>
          {BUDGET_GROUPS.map((g) => (
            <option key={g} value={g}>
              {BUDGET_GROUP_LABEL[g]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Color</span>
        <input
          type="color"
          value={color ?? DEFAULT_COLOR}
          onChange={(e) => setColor(e.target.value)}
          className="h-9 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
        />
      </label>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-emerald-600 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors',
        active ? activeClass : 'text-slate-500',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
