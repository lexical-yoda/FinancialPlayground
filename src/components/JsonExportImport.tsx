import { useRef } from 'react';
import { usePlanStore } from '../store/planStore';
import type { PlanConfig } from '../types/plan';

const REQUIRED_KEYS: (keyof PlanConfig)[] = [
  'startYear',
  'startMonth',
  'incomeStreams',
  'expenseStreams',
  'oneOffEvents',
  'assets',
  'liabilities',
  'goalAmount',
  'projectionYears',
];

function isPlanConfig(value: unknown): value is PlanConfig {
  if (typeof value !== 'object' || value === null) return false;
  return REQUIRED_KEYS.every((key) => key in value);
}

export function JsonExportImport() {
  const config = usePlanStore((s) => s.config);
  const replaceConfig = usePlanStore((s) => s.replaceConfig);
  const resetToSeed = usePlanStore((s) => s.resetToSeed);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-plan.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file
      .text()
      .then((text) => {
        const parsed = JSON.parse(text);
        if (!isPlanConfig(parsed)) {
          alert('That file does not look like a valid plan config — missing required fields.');
          return;
        }
        replaceConfig(parsed);
      })
      .catch(() => alert('Could not read that file as JSON.'))
      .finally(() => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
  };

  return (
    <div className="json-io">
      <button onClick={handleExport}>Export JSON</button>
      <button onClick={handleImportClick}>Import JSON</button>
      <button onClick={() => confirm('Reset to the default seed plan? This discards unsaved edits.') && resetToSeed()}>
        Reset to seed
      </button>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} hidden />
    </div>
  );
}
