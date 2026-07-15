import { useCallback, useState } from 'react';

const STORAGE_KEY = 'isas.employer.blindHiring';

function readStoredBlindHiring() {
  if (typeof sessionStorage === 'undefined') return true;
  return sessionStorage.getItem(STORAGE_KEY) !== 'false';
}

export function useBlindHiringMode() {
  const [enabled, setEnabled] = useState(readStoredBlindHiring);

  const setBlindHiringEnabled = useCallback((value: boolean) => {
    setEnabled(value);
    sessionStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  return { blindHiringEnabled: enabled, setBlindHiringEnabled };
}
