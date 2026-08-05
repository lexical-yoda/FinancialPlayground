import { useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { DashboardPage } from './pages/DashboardPage';
import { SetupPage } from './pages/SetupPage';
import { JsonExportImport } from './components/JsonExportImport';
import './app-theme.css';

type Tab = 'dashboard' | 'setup';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function App() {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <motion.header
          className="app-header"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
        >
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
        </motion.header>

        <main className="app-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
            >
              {tab === 'dashboard' ? <DashboardPage /> : <SetupPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  );
}

export default App;
