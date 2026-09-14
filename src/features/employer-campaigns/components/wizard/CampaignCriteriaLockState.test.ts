import { describe, expect, it } from 'vitest';

/**
 * CMP3-F4 — "quay lại tiêu chí đánh giá thì nó hết khoá".
 *
 * Mọi bước wizard render có điều kiện ({step === N ? <X/> : null}) nên rời bước là component bị
 * HUỶ. Cờ "đã tuỳ chỉnh" từng là useState trong bước 3 với initializer theo độ dài rubric: vào
 * lần đầu rubric rỗng ⇒ khoá; effect tự nạp bộ chuẩn ⇒ rubric có dữ liệu; sang bước 4 rồi quay
 * lại ⇒ initializer chạy lại, lần này rubric KHÔNG rỗng ⇒ cờ tự bật ⇒ bảng mở khoá và nhãn đổi
 * thành "Bộ tiêu chí tùy chỉnh" dù người dùng chưa bấm gì.
 *
 * Bất biến khoá ở đây: cờ đó là QUYẾT ĐỊNH của người dùng ⇒ sống ở wizard state, KHÔNG được suy
 * ra từ độ dài rubric. Dùng lưới quét mã nguồn theo đúng khuôn questionCapGuard: thứ hỏng là một
 * dòng khai state, còn render bước 3 thì đòi cả cây provider + react-query.
 */
const sources = import.meta.glob('/src/features/employer-campaigns/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Bỏ comment trước khi quét — chính đoạn giải thích ở trên sẽ làm lưới đỏ oan. */
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const read = (suffix: string) => {
  const key = Object.keys(sources).find((path) => path.endsWith(suffix));
  if (!key) throw new Error(`Không tìm thấy ${suffix}`);
  return stripComments(sources[key]);
};

describe('CMP3-F4 — trạng thái khoá của bước Tiêu chí', () => {
  it('bước 3 KHÔNG được tự suy cờ tuỳ chỉnh từ độ dài rubric', () => {
    const source = read('/wizard/CampaignCriteriaStepV2.tsx');
    expect(
      /useState\([^)]*rubric\.length/.test(source),
      'CampaignCriteriaStepV2 không được dựng cờ "customized" bằng useState theo rubric.length — '
        + 'nó mất khi rời bước và tự bật lại khi quay về.',
    ).toBe(false);
    expect(source.includes('customized,'), 'cờ phải nhận qua props từ wizard state').toBe(true);
    expect(source.includes('onCustomize'), 'hành động tuỳ chỉnh phải đẩy lên wizard state').toBe(true);
  });

  it('wizard state giữ cờ, và "Đặt lại" trả về chế độ bộ chuẩn', () => {
    const hook = read('/hooks/useCampaignWizard.ts');
    expect(hook.includes('rubricCustomized'), 'cờ phải nằm trong wizard state').toBe(true);
    const reset = hook.slice(hook.indexOf('const resetRubric'), hook.indexOf('const customizeRubric'));
    expect(
      reset.includes('rubricCustomized: false'),
      'resetRubric phải đưa cờ về false, nếu không bấm "Đặt lại" xong bảng vẫn mở khoá.',
    ).toBe(true);
  });

  it('bước 3 nhận cờ từ wizard state chứ không tự dựng', () => {
    const content = read('/wizard/CampaignWizardStepContent.tsx');
    expect(content.includes('customized={state.rubricCustomized}')).toBe(true);
    expect(content.includes('onCustomize={wizard.customizeRubric}')).toBe(true);
  });
});
