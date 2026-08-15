const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const EXPIRES_AT_KEY = 'expiresAt';

const E2E_TAB_STORAGE_PREFIX = 'isas-e2e-auth:';

function usesE2eTabStorage() {
  return typeof window !== 'undefined' && window.location.port === '4173';
}

function readTabValue(key: string) {
  if (!usesE2eTabStorage() || !window.name.startsWith(E2E_TAB_STORAGE_PREFIX)) return null;
  try {
    const values = JSON.parse(window.name.slice(E2E_TAB_STORAGE_PREFIX.length)) as Record<string, string>;
    return values[key] ?? null;
  } catch {
    return null;
  }
}

function writeTabValue(key: string, value: string) {
  if (!usesE2eTabStorage()) return;
  let values: Record<string, string> = {};
  if (window.name.startsWith(E2E_TAB_STORAGE_PREFIX)) {
    try {
      values = JSON.parse(window.name.slice(E2E_TAB_STORAGE_PREFIX.length)) as Record<string, string>;
    } catch {
      values = {};
    }
  }
  values[key] = value;
  window.name = `${E2E_TAB_STORAGE_PREFIX}${JSON.stringify(values)}`;
}

function removeTabValue(key: string) {
  if (!usesE2eTabStorage() || !window.name.startsWith(E2E_TAB_STORAGE_PREFIX)) return;
  try {
    const values = JSON.parse(window.name.slice(E2E_TAB_STORAGE_PREFIX.length)) as Record<string, string>;
    delete values[key];
    window.name = `${E2E_TAB_STORAGE_PREFIX}${JSON.stringify(values)}`;
  } catch {
    window.name = E2E_TAB_STORAGE_PREFIX;
  }
}

function read(key: string) {
  const stored = localStorage.getItem(key);
  if (stored) return stored;
  // Clearing the persisted auth snapshot is an explicit sign-out signal in
  // browser tests and in recovery flows; do not resurrect that session from a
  // secondary storage backend.
  if (!localStorage.getItem('auth-storage')) return null;
  const sessionStored = sessionStorage.getItem(key);
  if (sessionStored) return sessionStored;
  const tabValue = readTabValue(key);
  if (tabValue) return tabValue;
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((entry) => entry.startsWith(`${key}=`));
  return match ? decodeURIComponent(match.slice(key.length + 1)) : null;
}

function write(key: string, value: string) {
  localStorage.setItem(key, value);
  sessionStorage.setItem(key, value);
  writeTabValue(key, value);
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

function remove(key: string) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
  removeTabValue(key);
  document.cookie = `${key}=; Max-Age=0; path=/; SameSite=Lax`;
}

export const authTokenStorage = {
  getAccessToken: () => read(ACCESS_TOKEN_KEY),
  getRefreshToken: () => read(REFRESH_TOKEN_KEY),
  getExpiresAt: () => read(EXPIRES_AT_KEY),
  setAccessToken: (accessToken: string) => {
    write(ACCESS_TOKEN_KEY, accessToken);
  },
  setTokens: (accessToken: string, refreshToken: string, expiresAt?: string | null) => {
    write(ACCESS_TOKEN_KEY, accessToken);
    write(REFRESH_TOKEN_KEY, refreshToken);
    if (expiresAt) {
      write(EXPIRES_AT_KEY, expiresAt);
    } else {
      remove(EXPIRES_AT_KEY);
    }
  },
  clear: () => {
    remove(ACCESS_TOKEN_KEY);
    remove(REFRESH_TOKEN_KEY);
    remove(EXPIRES_AT_KEY);
  },
};
