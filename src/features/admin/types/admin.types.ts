// Chỉ còn nhãn trạng thái dùng cho `AdminStatusBadge`. Các kiểu snapshot/health/audit/flags/maintenance
// từng nuôi `useAdminPlatform` (fixture) — gỡ 2026-09-13 cùng với các màn admin mock.
export type AdminStatus = 'active' | 'pending' | 'suspended' | 'approved' | 'rejected' | 'open' | 'resolved' | 'healthy' | 'warning' | 'critical';
