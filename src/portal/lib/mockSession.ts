const MOCK_SESSION_USER_ID_KEY = 'gcio_mock_session_user_id';

export function getMockSessionUserId(): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(MOCK_SESSION_USER_ID_KEY);
}

export function setMockSessionUserId(userId: string | null): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  if (userId) {
    sessionStorage.setItem(MOCK_SESSION_USER_ID_KEY, userId);
  } else {
    sessionStorage.removeItem(MOCK_SESSION_USER_ID_KEY);
  }
}
