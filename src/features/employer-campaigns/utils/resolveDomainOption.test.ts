import { describe, expect, it } from 'vitest';
import { resolveDomainOption } from './buildCampaignCreateRequest';

// Campaign tạo qua API mang mã nghề `BE`/`FE`/`BA` (giá trị AIService/`jobCategory`); wizard sửa phải nhận,
// nếu không "Lưu & chấm thử" nhảy về bước 1 đòi chọn lại lĩnh vực cho một chiến dịch đã có lĩnh vực.
describe('resolveDomainOption', () => {
  it('nhận nhãn dài lẫn mã nghề viết tắt, không phân biệt hoa thường', () => {
    expect(resolveDomainOption('Backend')).toBe('backend');
    expect(resolveDomainOption('BE')).toBe('backend');
    expect(resolveDomainOption('fe')).toBe('frontend');
    expect(resolveDomainOption('Frontend development')).toBe('frontend');
    expect(resolveDomainOption('BA')).toBe('business-analyst');
    expect(resolveDomainOption('Business Analyst')).toBe('business-analyst');
  });
  it('giá trị lạ/rỗng ⇒ "" (bắt chọn lại), không đoán bừa', () => {
    expect(resolveDomainOption('Fullstack')).toBe('');
    expect(resolveDomainOption('QA')).toBe('');
    expect(resolveDomainOption(null)).toBe('');
    expect(resolveDomainOption('  ')).toBe('');
  });
});
