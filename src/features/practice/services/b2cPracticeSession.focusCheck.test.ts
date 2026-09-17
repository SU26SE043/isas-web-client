import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { usesMockData } from '@/shared/mock';
import { checkPracticeFace, recordPracticeFocusEvent } from './b2cPracticeSession.service';
import { b2cPracticeSessionEndpoints } from './b2cPracticeSession.endpoints';

vi.mock('@/shared/mock', () => ({
  mockDelay: vi.fn(),
  usesMockData: vi.fn(() => false),
}));

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const usesMock = vi.mocked(usesMockData);
const post = vi.mocked(apiClient.post);

describe('recordPracticeFocusEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usesMock.mockReturnValue(false);
  });

  it('POSTs signalType + note to the focus-events endpoint', async () => {
    post.mockResolvedValue({ status: 204, data: undefined } as never);

    await recordPracticeFocusEvent('session-1', 'tab_switch', 'left for 3s');

    expect(post).toHaveBeenCalledWith(
      b2cPracticeSessionEndpoints.focusEvents('session-1'),
      { signalType: 'tab_switch', note: 'left for 3s' },
      expect.objectContaining({ validateStatus: expect.any(Function) }),
    );
  });

  it('never throws — a network error is swallowed (must not block the interview)', async () => {
    post.mockRejectedValue(new Error('network down'));

    await expect(recordPracticeFocusEvent('session-1', 'paste')).resolves.toBeUndefined();
  });

  it('skips the call entirely under mock mode', async () => {
    usesMock.mockReturnValue(true);

    await recordPracticeFocusEvent('session-1', 'tab_switch');

    expect(post).not.toHaveBeenCalled();
  });
});

describe('checkPracticeFace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usesMock.mockReturnValue(false);
  });

  it('posts a multipart form with field "image" and parses the result', async () => {
    post.mockResolvedValue({ status: 200, data: { faceCount: 0, signals: ['no_face'] } } as never);
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });

    const result = await checkPracticeFace('session-1', file);

    expect(post).toHaveBeenCalledWith(
      b2cPracticeSessionEndpoints.faceCheck('session-1'),
      expect.any(FormData),
      expect.anything(),
    );
    const formData = post.mock.calls[0][1] as FormData;
    expect(formData.get('image')).toBe(file);
    expect(result).toEqual({ faceCount: 0, signals: ['no_face'] });
  });

  it('returns null for a 204 (not applicable) response', async () => {
    post.mockResolvedValue({ status: 204, data: null } as never);

    await expect(checkPracticeFace('session-1', new File(['x'], 'a.jpg'))).resolves.toBeNull();
  });

  it('never throws — resolves null on network/AIService error', async () => {
    post.mockRejectedValue(new Error('AIService 502'));

    await expect(checkPracticeFace('session-1', new File(['x'], 'a.jpg'))).resolves.toBeNull();
  });

  it('filters out any signal outside the known frame set (defense against a hostile/buggy response)', async () => {
    post.mockResolvedValue({
      status: 200,
      data: { faceCount: 1, signals: ['face_mismatch', 'no_face'] },
    } as never);

    const result = await checkPracticeFace('session-1', new File(['x'], 'a.jpg'));

    expect(result?.signals).toEqual(['no_face']);
  });

  it('skips the call entirely under mock mode', async () => {
    usesMock.mockReturnValue(true);

    const result = await checkPracticeFace('session-1', new File(['x'], 'a.jpg'));

    expect(result).toBeNull();
    expect(post).not.toHaveBeenCalled();
  });
});
