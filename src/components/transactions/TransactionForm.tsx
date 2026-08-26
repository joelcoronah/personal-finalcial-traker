import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import {
  CURRENCIES,
  DEFAULT_CATEGORIES,
  PAYMENT_METHODS,
  type Currency,
  type Transaction,
  type TransactionInput,
  type TransactionType,
} from '../../types';
import { CURRENCY_SYMBOL, formatCurrency, toVES } from '../../lib/currency';
import { todayISO } from '../../lib/dates';
import { useRates } from '../../hooks/useRates';
import { useCategories } from '../../hooks/useCategories';
import { useDebts } from '../../hooks/useDebts';
import { ImageDropzone } from './ImageDropzone';

/** Heurística para mostrar el selector de deuda sin obligar al usuario a
 * pasar por una categoría exacta: cualquier categoría de gasto que
 * mencione "deuda" (la default "Deudas" incluida). No la valida el backend,
 * es puramente para no mostrar el selector en gastos que claramente no son
 * pagos de deuda. */
const DEBT_CATEGORY_HINT = /deuda/i;

export interface TransactionFormValues {
  input: TransactionInput;
  file: File | null;
}

interface TransactionFormProps {
  initialData?: Transaction;
  onSubmit: (values: TransactionFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  errorMessage?: string | null;
  /** El backend no soporta reemplazar el comprobante al editar; solo se usa al crear. */
  hideImageUpload?: boolean;
}

export function TransactionForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel = 'Guardar',
  errorMessage,
  hideImageUpload,
}: TransactionFormProps) {
  const { data: rates } = useRates();

  const [type, setType] = useState<TransactionType>(initialData?.type ?? 'expense');
  // Las categorías se filtran por tipo (income/expense). Si el backend
  // todavía no tiene el módulo de categorías o la petición falla, se cae de
  // vuelta a DEFAULT_CATEGORIES para que el formulario siga siendo usable.
  const { data: categoriesData } = useCategories({ type, active: true });
  const categoryOptions = useMemo(() => {
    const names = categoriesData?.map((c) => c.name) ?? [];
    const base = names.length > 0 ? names : [...DEFAULT_CATEGORIES];
    return base.includes('Otra') ? base : [...base, 'Otra'];
  }, [categoriesData]);
  const [amount, setAmount] = useState(initialData ? String(initialData.amountOriginal) : '');
  const [currency, setCurrency] = useState<Currency>(initialData?.currencyOriginal ?? 'VES');
  const [date, setDate] = useState(initialData?.date?.slice(0, 10) ?? todayISO());
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [customCategory, setCustomCategory] = useState(
    initialData && !DEFAULT_CATEGORIES.includes(initialData.category as (typeof DEFAULT_CATEGORIES)[number])
      ? initialData.category
      : '',
  );
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [debtId, setDebtId] = useState(initialData?.debtId ?? '');

  const isOtherCategory = category === 'Otra';
  const numericAmount = Number(amount.replace(',', '.'));

  // Las categorías dependen del tipo (income/expense); si el usuario cambia
  // de tipo después de montar el form, la categoría seleccionada ya no
  // aplica y hay que limpiarla (no corre en el primer render, para no pisar
  // initialData al editar). El vínculo a deuda solo aplica a gastos, así que
  // se limpia junto con la categoría.
  const isFirstTypeRender = useRef(true);
  useEffect(() => {
    if (isFirstTypeRender.current) {
      isFirstTypeRender.current = false;
      return;
    }
    setCategory('');
    setCustomCategory('');
    setDebtId('');
  }, [type]);

  // Solo se ofrece cuando la categoría sugiere un pago de deuda; si la
  // transacción ya venía vinculada a una (editando), se deja visible para
  // poder desvincularla aunque la categoría no calce con el patrón.
  const showDebtSelector =
    type === 'expense' && (DEBT_CATEGORY_HINT.test(category) || Boolean(initialData?.debtId));
  const { data: activeDebts } = useDebts({ active: true }, { enabled: type === 'expense' });

  const estimatedVES = useMemo(() => {
    if (!rates || !numericAmount) return null;
    return toVES(numericAmount, currency, rates);
  }, [rates, numericAmount, currency]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalCategory = isOtherCategory ? customCategory.trim() : category;
    if (!numericAmount || numericAmount <= 0 || !finalCategory) return;

    // El backend rechaza debtId en ingresos, así que ni se manda el campo.
    // En gastos: un id elegido se manda tal cual; si había uno y se limpió,
    // hay que mandar null explícito para desvincular (undefined no cambia
    // nada en un PATCH); si nunca hubo uno, se omite.
    const debtIdPayload =
      type === 'expense' ? debtId || (initialData?.debtId ? null : undefined) : undefined;

    onSubmit({
      input: {
        type,
        amountOriginal: numericAmount,
        currencyOriginal: currency,
        date,
        category: finalCategory,
        paymentMethod: paymentMethod || undefined,
        description: description.trim() || undefined,
        debtId: debtIdPayload,
      },
      file,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

      {/* Monto + moneda */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Monto</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {CURRENCY_SYMBOL[currency]}
            </span>
            <input
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-12 pr-3 text-lg font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {CURRENCIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCurrency(c)}
              className={clsx(
                'rounded-lg border py-1.5 text-xs font-semibold transition-colors',
                currency === c
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {currency !== 'VES' && estimatedVES !== null && (
          <p className="mt-2 text-sm text-slate-500">
            ≈ <span className="font-semibold text-slate-700">{formatCurrency(estimatedVES, 'VES')}</span> al
            cambio de hoy
          </p>
        )}
      </div>

      {/* Fecha */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-600">Fecha</span>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      {/* Categoría */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-600">Categoría</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {isOtherCategory && (
        <input
          placeholder="Especifica la categoría"
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      )}

      {/* Vínculo a deuda (solo gastos, y solo si la categoría sugiere un pago de deuda) */}
      {showDebtSelector && (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-600">Vincular a una deuda (opcional)</span>
          <select
            value={debtId}
            onChange={(e) => setDebtId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">Ninguna</option>
            {activeDebts?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Método de pago */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-600">Método de pago (opcional)</span>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Sin especificar</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      {/* Descripción */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-600">Descripción (opcional)</span>
        <textarea
          rows={2}
          placeholder="Contexto adicional…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none rounded-lg border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      {/* Comprobante */}
      {!hideImageUpload && (
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-600">Comprobante (opcional)</span>
          <ImageDropzone file={file} onChange={setFile} />
        </div>
      )}

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-emerald-600 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando…' : submitLabel}
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
