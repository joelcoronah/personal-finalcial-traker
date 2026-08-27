import { useState } from "react";
import { Modal } from "../common/Modal";
import { useUpdateUsdtRate } from "../../hooks/useRates";

interface UpdateUsdtModalProps {
  open: boolean;
  onClose: () => void;
  currentRate?: number;
}

export function UpdateUsdtModal({
  open,
  onClose,
  currentRate,
}: UpdateUsdtModalProps) {
  const [value, setValue] = useState(currentRate ? String(currentRate) : "");
  const { mutate, isPending, error } = useUpdateUsdtRate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rate = Number(value.replace(",", "."));
    if (!rate || rate <= 0) return;
    mutate(rate, { onSuccess: onClose });
  }

  return (
    <Modal open={open} onClose={onClose} title="Actualizar tasa USDT">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-slate-500">
          La tasa paralela/cripto no la reporta el BCV, así que se actualiza a
          mano cuando cambie durante el día.
        </p>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-600">
            Nueva tasa (Bs. por USDT)
          </span>
          <input
            autoFocus
            inputMode="decimal"
            placeholder="Ej: 780.50"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded-lg border text-black border-slate-300 px-3 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        {error && (
          <p className="text-sm text-red-600">No se pudo actualizar la tasa.</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {isPending ? "Guardando…" : "Guardar tasa"}
        </button>
      </form>
    </Modal>
  );
}
