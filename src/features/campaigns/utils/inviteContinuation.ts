/** Session-scoped invite continuation (cleared after successful join). */
export const CAMPAIGN_INVITE_TOKEN_KEY = 'isas-campaign-invite-token';

export function savePendingInviteToken(token: string) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(CAMPAIGN_INVITE_TOKEN_KEY, token.trim());
}

export function readPendingInviteToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(CAMPAIGN_INVITE_TOKEN_KEY);
}

export function clearPendingInviteToken() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(CAMPAIGN_INVITE_TOKEN_KEY);
}

export function invitationPath(token: string) {
  return `/invitations/${encodeURIComponent(token)}`;
}
