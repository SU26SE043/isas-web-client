// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { localToIso, useIdempotencyKey } from './adminGrants';

describe('useIdempotencyKey — khoá neo vào vân tay form (Q14)', () => {
  it('cùng vân tay ⇒ cùng khoá qua nhiều render; đổi vân tay ⇒ khoá mới; rotate() ⇒ khoá mới dù vân tay giữ', () => {
    const { result, rerender } = renderHook(({ fp }: { fp: string }) => useIdempotencyKey(fp), { initialProps: { fp: 'a' } });
    const first = result.current.key;
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
    rerender({ fp: 'a' });
    expect(result.current.key).toBe(first);
    rerender({ fp: 'b' });
    const second = result.current.key;
    expect(second).not.toBe(first);
    act(() => result.current.rotate());
    expect(result.current.key).not.toBe(second);
  });
});

describe('localToIso', () => {
  it('rỗng ⇒ undefined; giá trị hợp lệ ⇒ ISO UTC; rác ⇒ undefined', () => {
    expect(localToIso('')).toBeUndefined();
    expect(localToIso('2026-09-16T09:30')).toMatch(/^2026-09-1[56]T\d{2}:\d{2}:00\.000Z$/);
    expect(localToIso('not-a-date')).toBeUndefined();
  });
});
