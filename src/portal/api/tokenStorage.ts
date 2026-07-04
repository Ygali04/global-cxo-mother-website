/**
 * Optional bearer storage until the backend uses httpOnly refresh cookies only.
 * Uses sessionStorage (not localStorage) to limit persistence to the tab session.
 */
const ACCESS_TOKEN_KEY = 'gcio_access_token';

export function getStoredAccessToken(): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  if (token) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}
