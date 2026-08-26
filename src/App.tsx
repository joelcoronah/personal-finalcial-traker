import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import NewTransaction from './pages/NewTransaction';
import TransactionsList from './pages/TransactionsList';
import EditTransaction from './pages/EditTransaction';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import Plan from './pages/Plan';
import Debts from './pages/Debts';
import DebtDetail from './pages/DebtDetail';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/nueva" element={<NewTransaction />} />
        <Route path="/transacciones" element={<TransactionsList />} />
        <Route path="/transacciones/:id/editar" element={<EditTransaction />} />
        <Route path="/resumen" element={<Reports />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/deudas" element={<Debts />} />
        <Route path="/deudas/:id" element={<DebtDetail />} />
      </Route>
    </Routes>
  );
}
