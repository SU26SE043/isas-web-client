import { describe, expect, it } from 'vitest';
// `?raw` của Vite thay vì `node:fs`: repo không cài `@types/node`, nên đọc file bằng API Node sẽ
// làm `tsc -b` và `npm run build` ĐỎ trong khi vitest vẫn xanh — một kiểu hỏng chỉ lộ ở CI.
import sceneSource from './interviewerScene.ts?raw';

/**
 * `interviewerScene.ts` dựng WebGLRenderer nên không unit-test chạy thật được (jsdom không có GPU).
 * Nhưng chỗ ĐẤU DÂY mới là chỗ hay hỏng: `applyRestPose` có đủ test riêng mà vẫn vô dụng nếu không
 * ai gọi nó — lúc đó avatar quay lại T-pose và **không test nào đỏ**. Nên khoá bằng cách đọc mã
 * nguồn, cùng thủ pháp guard-quét-nguồn đã dùng ở chỗ khác trong repo.
 *
 * Đây là hàng rào yếu hơn test hành vi, và nói rõ nó yếu ở đâu: nó chỉ chứng minh lời gọi CÓ MẶT,
 * không chứng minh nó chạy đúng thứ tự hay có tác dụng. Phần "có tác dụng" nằm ở
 * `interviewerPose.test.ts`; phần "trông thấy được" phải verify bằng mắt trên `/dev/interviewer-avatar`.
 */
describe('interviewerScene đấu dây với applyRestPose', () => {
  it('có import applyRestPose', () => {
    expect(sceneSource).toMatch(/import\s*\{[^}]*applyRestPose[^}]*\}\s*from\s*'\.\/interviewerPose'/);
  });

  it('THỰC SỰ gọi applyRestPose(model) — không chỉ import rồi bỏ đó', () => {
    expect(sceneSource).toMatch(/applyRestPose\s*\(\s*model\s*\)/);
  });

  it('gọi TRƯỚC framePortrait — nhánh dự phòng đóng khung theo bounding box, T-pose làm box rộng gấp đôi', () => {
    const posedAt = sceneSource.indexOf('applyRestPose(model)');
    // ⚠ Phải bắt LỜI GỌI, không phải ĐỊNH NGHĨA: `function framePortrait(camera: …)` nằm ở đầu file
    // nên `indexOf('framePortrait(camera')` luôn trả về vị trí sớm hơn và bài test đỏ oan.
    const framedAt = sceneSource.search(/^\s*framePortrait\(camera, model, head\);/m);
    expect(posedAt).toBeGreaterThan(-1);
    expect(framedAt).toBeGreaterThan(-1);
    expect(posedAt).toBeLessThan(framedAt);
  });
});
