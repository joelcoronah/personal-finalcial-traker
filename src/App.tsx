import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import NewTransaction from './pages/NewTransaction';
import TransactionsList from './pages/TransactionsList';
import EditTransaction from './pages/EditTransaction';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/nueva" element={<NewTransaction />} />
        <Route path="/transacciones" element={<TransactionsList />} />
        <Route path="/transacciones/:id/editar" element={<EditTransaction />} />
        <Route path="/resumen" element={<Reports />} />
      </Route>
    </Routes>
  );
}
