import { useState } from "react";
import clsx from "clsx";
import {
  CURRENCIES,
  type Currency,
  type Debt,
  type DebtInput,
} from "../../types";
import { CURRENCY_SYMBOL } from "../../lib/currency";

interface DebtFormProps {
  initialData?: Debt;
  onSubmit: (input: DebtInput) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

/**
 * totalAmount y minPayment se escriben en `currencyOriginal` (una sola
 * moneda para toda la deuda, no por campo): el backend convierte a VES con
 * la tasa de hoy.
 */
export function DebtForm({
  initialData,
  onSubmit,
  isSubmitting,
  errorMessage,
}: DebtFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [currency, setCurrency] = useState<Currency>(
    initialData?.currencyOriginal ?? "USD",
  );
  const [totalAmount, setTotalAmount] = useState(
    initialData
      ? String(initialData.totalAmount[initialData.currencyOriginal])
      : "",
  );
  const [minPayment, setMinPayment] = useState(
    initialData?.minPayment
      ? String(initialData.minPayment[initialData.currencyOriginal])
      : "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericTotal = Number(totalAmount.replace(",", "."));
    const numericMin = minPayment
      ? Number(minPayment.replace(",", "."))
      : undefined;
    if (!name.trim() || !numericTotal || numericTotal <= 0) return;

    onSubmit({
      name: name.trim(),
      totalAmount: numericTotal,
      currencyOriginal: currency,
      minPayment: numericMin && numericMin > 0 ? numericMin : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-600">Nombre</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Tarjeta de crédito"
          className="rounded-lg border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Monto total de la deuda
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {CURRENCY_SYMBOL[currency]}
          </span>
          <input
            inputMode="decimal"
            placeholder="0,00"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-16 pr-4 text-lg font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {CURRENCIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCurrency(c)}
              className={clsx(
                "rounded-lg border py-1.5 text-xs font-semibold transition-colors",
                currency === c
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-600">
          Pago mínimo mensual en {currency} (opcional)
        </span>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {CURRENCY_SYMBOL[currency]}
          </span>
          <input
            inputMode="decimal"
            placeholder="0,00"
            value={minPayment}
            onChange={(e) => setMinPayment(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-16 pr-4 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </label>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-emerald-600 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {isSubmitting ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
