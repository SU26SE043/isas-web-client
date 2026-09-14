import type { RouteObject } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { UserRole } from '@/features/auth/types/auth.types';
import { buildEmployerNavItems, filterEmployerNavItems } from '@/layouts/employerNavItems';
import { enterpriseRoutes } from '@/routes/groups/enterpriseRoutes';
import { translations } from '@/shared/languages/translations';
import { EmployerAnalyticsPage } from './pages/EmployerAnalyticsPage';

function collectPaths(routes: RouteObject[], prefix = ''): Array<{ path: string; element: unknown }> {
  return routes.flatMap((route) => {
    const path = route.path ? `${prefix}/${route.path}`.replace(/\/+/g, '/') : prefix;
    return [{ path, element: route.element }, ...collectPaths(route.children ?? [], path)];
  });
}

describe('nav + route "Phân tích tuyển dụng"', () => {
  it('mục "Phân tích" đứng NGAY SAU "Chiến dịch" và không giới hạn role', () => {
    const items = buildEmployerNavItems((key) => key);
    const paths = items.map((item) => item.to);
    expect(paths.indexOf('/employer/analytics')).toBe(paths.indexOf('/employer/campaigns') + 1);
    expect(items.find((item) => item.to === '/employer/analytics')?.roles).toBeUndefined();
  });

  it.each([UserRole.ORG_ADMIN, UserRole.HR_MEMBER, UserRole.ADMIN])('role %s thấy mục Phân tích', (role) => {
    const visible = filterEmployerNavItems(buildEmployerNavItems((key) => key), role).map((item) => item.to);
    expect(visible).toContain('/employer/analytics');
  });

  it('nhãn nav có cả vi lẫn en', () => {
    expect(translations.vi['employerAnalytics.nav.title']).toBe('Phân tích');
    expect(translations.en['employerAnalytics.nav.title']).toBe('Analytics');
  });

  it('route /employer/analytics render EmployerAnalyticsPage bên trong layout employer', () => {
    const match = collectPaths(enterpriseRoutes).find((entry) => entry.path === '/employer/analytics');
    expect(match).toBeDefined();
    expect((match!.element as { type: unknown }).type).toBe(EmployerAnalyticsPage);
  });
});
