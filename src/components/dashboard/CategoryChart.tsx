import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Summary } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

interface CategoryChartProps {
  summary?: Summary;
  isLoading: boolean;
}

// Paleta neutra/consistente para las porciones del gráfico.
const COLORS = ['#059669', '#0891b2', '#7c3aed', '#db2777', '#d97706', '#dc2626', '#4f46e5', '#65a30d'];

export function CategoryChart({ summary, isLoading }: CategoryChartProps) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  // byCategory trae el neto (ingresos - gastos) por moneda; un neto negativo
  // en VES indica que la categoría es de gasto. Tomamos el valor absoluto
  // para el gráfico de "gastos por categoría".
  const data = (summary?.byCategory ?? [])
    .filter((item) => item.VES < 0)
    .map((item) => ({ name: item.category, value: -item.VES }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return <EmptyState title="Sin gastos este periodo" description="Cuando registres gastos, aquí verás el desglose por categoría." />;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-slate-700">Gastos por categoría</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0), 'VES')} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between gap-2 truncate">
            <span className="flex items-center gap-1.5 truncate text-slate-600">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 font-medium text-slate-500">
              {formatCurrency(item.value, 'VES')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
