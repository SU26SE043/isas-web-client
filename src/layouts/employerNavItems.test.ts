import { describe, expect, it } from 'vitest';
import { buildEmployerNavItems } from './employerNavItems';

describe('employerNavItems', () => {
  it('ẩn hai trang mock Hồ sơ công ty / Xác minh khỏi nav (route vẫn giữ, chờ backend)', () => {
    const paths = buildEmployerNavItems((key) => key).map((item) => item.to);
    expect(paths).not.toContain('/employer/company');
    expect(paths).not.toContain('/employer/company/verify');
    expect(paths).toContain('/employer/dashboard');
    expect(paths).toContain('/employer/campaigns');
  });
});
