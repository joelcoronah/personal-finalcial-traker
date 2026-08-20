import { LayoutDashboard, PlusCircle, List, PieChart, Tags, Target } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/nueva', label: 'Nueva', icon: PlusCircle, end: false },
  { to: '/transacciones', label: 'Historial', icon: List, end: false },
  { to: '/resumen', label: 'Resumen', icon: PieChart, end: false },
  { to: '/categorias', label: 'Categorías', icon: Tags, end: false },
  { to: '/plan', label: 'Plan', icon: Target, end: false },
];
