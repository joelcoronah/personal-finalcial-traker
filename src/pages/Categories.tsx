import { useState } from 'react';
import clsx from 'clsx';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { CategoryForm } from '../components/categories/CategoryForm';
import { useCategories } from '../hooks/useCategories';
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from '../hooks/useCategoryMutations';
import { BUDGET_GROUP_LABEL, type Category, type CategoryInput } from '../types';

export default function Categories() {
  const { data: categories, isLoading, isError, refetch } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const isSubmitting = createCategory.isPending || updateCategory.isPending;
  const hasSubmitError = createCategory.isError || updateCategory.isError;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setFormOpen(true);
  }

  function handleSubmit(input: CategoryInput) {
    const onSuccess = () => setFormOpen(false);
    if (editing) {
      updateCategory.mutate({ id: editing.id, input }, { onSuccess });
    } else {
      createCategory.mutate(input, { onSuccess });
    }
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;
    deleteCategory.mutate(pendingDeleteId, { onSuccess: () => setPendingDeleteId(null) });
  }

  const expense = categories?.filter((c) => c.type === 'expense') ?? [];
  const income = categories?.filter((c) => c.type === 'income') ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Categorías</h1>
          <p className="text-sm text-slate-400">Organiza tus ingresos y gastos</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <Plus size={16} />
          Nueva
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          title="No hay categorías"
          description="Crea la primera para empezar a organizar tus transacciones."
        />
      ) : (
        <>
          <CategoryGroup title="Gastos" categories={expense} onEdit={openEdit} onDelete={setPendingDeleteId} />
          <CategoryGroup title="Ingresos" categories={income} onEdit={openEdit} onDelete={setPendingDeleteId} />
        </>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar categoría' : 'Nueva categoría'}
      >
        <CategoryForm
          initialData={editing ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errorMessage={hasSubmitError ? 'No se pudo guardar la categoría. Intenta de nuevo.' : null}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Eliminar categoría"
        description="Las transacciones ya registradas conservan el nombre de la categoría; solo dejará de estar disponible para nuevas transacciones."
        isConfirming={deleteCategory.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}

interface CategoryGroupProps {
  title: string;
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

function CategoryGroup({ title, categories, onEdit, onDelete }: CategoryGroupProps) {
  if (categories.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold text-slate-500">{title}</h2>
      <div className="flex flex-col divide-y divide-slate-100">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 py-2.5">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: c.color ?? '#94a3b8' }}
            />
            <div className="min-w-0 flex-1">
              <p
                className={clsx(
                  'truncate text-sm font-medium',
                  c.isActive ? 'text-slate-700' : 'text-slate-400',
                )}
              >
                {c.name}
              </p>
              {c.budgetGroup && (
                <p className="text-xs text-slate-400">{BUDGET_GROUP_LABEL[c.budgetGroup]}</p>
              )}
            </div>
            <button
              onClick={() => onEdit(c)}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Editar"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(c.id)}
              className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
              aria-label="Eliminar"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
