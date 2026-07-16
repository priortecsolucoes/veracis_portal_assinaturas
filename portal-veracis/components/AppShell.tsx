'use client';

import { useStore } from '@/lib/store';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import GuiaDetail from './GuiaDetail';
import Relatorios from './Relatorios';
import TiposConsulta from './TiposConsulta';

export default function AppShell() {
  const { tab } = useStore();

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <div style={{ flex:1, minWidth:0, overflowX:'auto' }}>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'detail'    && <GuiaDetail />}
        {tab === 'relatorio' && <Relatorios />}
        {tab === 'tipos'     && <TiposConsulta />}
      </div>
    </div>
  );
}
