import { TGame } from 'lib/game';
import { useEffect } from 'react';

const PERSISTED_STATE_KEY = 'game';

export function getPersistedState(): TGame | null {
  const value = localStorage.getItem(PERSISTED_STATE_KEY);

  if (!value) {
    return null;
  }

  return JSON.parse(value);
}

export function clearPersistedState(): void {
  localStorage.removeItem(PERSISTED_STATE_KEY);
}

export function useStatePersist(state: TGame) {
  useEffect(() => {
    localStorage.setItem(PERSISTED_STATE_KEY, JSON.stringify(state));
  }, [state]);
}
