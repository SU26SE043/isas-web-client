import { describe, expect, it } from 'vitest';
import {
  clearPendingInviteToken,
  invitationPath,
  readPendingInviteToken,
  savePendingInviteToken,
} from './inviteContinuation';

describe('inviteContinuation', () => {
  it('builds invitation path with encoded token', () => {
    expect(invitationPath('a/b')).toBe('/invitations/a%2Fb');
  });

  it('stores and clears pending invite token in sessionStorage', () => {
    clearPendingInviteToken();
    savePendingInviteToken('  token-1  ');
    expect(readPendingInviteToken()).toBe('token-1');
    clearPendingInviteToken();
    expect(readPendingInviteToken()).toBeNull();
  });
});
