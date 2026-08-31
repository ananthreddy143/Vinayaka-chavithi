import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Donations from '@/pages/Donations';
import Expenses from '@/pages/Expenses';
import Donors from '@/pages/Donors';
import Reports from '@/pages/Reports';
import Transparency from '@/pages/Transparency';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/donors" element={<Donors />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
