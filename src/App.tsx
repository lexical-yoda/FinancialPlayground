import { useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { SetupPage } from './pages/SetupPage';
import { JsonExportImport } from './components/JsonExportImport';
import './app-theme.css';

type Tab = 'dashboard' | 'setup';

function App() {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Financial Trajectory Playground</h1>
        <nav className="tab-nav">
          <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
            Dashboard
          </button>
          <button className={tab === 'setup' ? 'active' : ''} onClick={() => setTab('setup')}>
            Setup
          </button>
        </nav>
        <JsonExportImport />
      </header>

      <main className="app-main">{tab === 'dashboard' ? <DashboardPage /> : <SetupPage />}</main>
    </div>
  );
}

export default App;
