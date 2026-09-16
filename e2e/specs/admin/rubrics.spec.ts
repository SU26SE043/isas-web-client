import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

/**
 * Màn Thước đo chấm điểm (admin) — chạy trong trình duyệt thật với response mock theo ĐÚNG DTO
 * `AdminRubric.cs`/`AdminRubricPreview.cs`. Ba điều bản cũ hỏng và spec này khoá: bảng hiện
 * `descriptor` thật, PUT chỉ mang {id, description, levels[{score, descriptor}]}, chấm thử gửi
 * đúng hợp đồng và HIỆN kết quả.
 */
const LONG = (s: string) => `${s} — ${'lorem '.repeat(6).trim()}`;
const rubric = {
  jobCategory: 'BE', language: 'en', version: 2, changed: false,
  criteria: [
    { id: 'c-1', name: 'Communication', description: 'Clear structure.', weight: 0.15, maxScore: 5, scoringScope: 'Always', levels: [{ score: 0, descriptor: LONG('No answer or off topic') }, { score: 5, descriptor: LONG('Fluent with concrete examples') }] },
    { id: 'c-2', name: 'Technical depth', description: null, weight: 0.25, maxScore: 5, scoringScope: 'WhenTargeted', levels: [{ score: 0, descriptor: LONG('Nothing relevant') }, { score: 5, descriptor: LONG('Deep and precise') }] },
  ],
  sampleQuestions: [{ id: 'q-1', text: 'Explain indexes in PostgreSQL.' }],
};
const matrix = [{ jobCategory: 'BE', language: 'en', version: 2, criteriaCount: 2, withLevelsCount: 2 }];
const run = {
  id: 'r-1', status: 'Succeeded', jobCategory: 'BE', language: 'en', rubricVersion: 2, questionText: 'Explain indexes in PostgreSQL.', rubricFingerprint: 'fp', promptVersion: null,
  deliveryMetricsAvailable: false, lengthParityWarning: false, freeRunsRemaining: 4,
  rubric: rubric.criteria.map((c) => ({ criterionId: c.id, name: c.name, weight: c.weight, maxScore: c.maxScore, levels: c.levels })),
  samples: ['Weak', 'Good', 'Excellent'].map((band, i) => ({
    band, answerText: `${band} sample answer`, wordCount: 40 * (i + 1), expectedPct: [20, 60, 100][i], actualPct: [48.4, 66.4, 70.2][i],
    scores: rubric.criteria.map((c) => ({ criterionId: c.id, criterionName: c.name, maxScore: 5, expectedLevel: [1, 3, 5][i], actualScore: [2, 3, 4][i], levelMatched: [2, 3, 4][i], reasoning: 'because', measured: false })),
    deliveryMetrics: null,
  })),
  errorReason: null, createdAt: '2026-09-16T09:00:00Z', completedAt: '2026-09-16T09:00:40Z',
};

// Lượt "tự thử": bài của CHÍNH người dùng (dán), không có 3 bài AI, có hàng đo trôi chảy giả lập là KHÔNG (dán tay).
const customRun = {
  ...run, id: 'r-2', deliveryMetricsAvailable: false,
  samples: [{ band: 'Custom', answerText: 'My own answer.', wordCount: 3, expectedPct: 60, actualPct: 60, deliveryMetrics: null,
    scores: rubric.criteria.map((c) => ({ criterionId: c.id, criterionName: c.name, maxScore: 5, expectedLevel: 3, actualScore: 3, levelMatched: 3, reasoning: 'has a main point', measured: false })) }],
};

test('admin sees real level descriptors, saves only the allowed fields, and grades their OWN pasted answer (no AI samples)', async ({ page }) => {
  const puts: unknown[] = [];
  const previews: unknown[] = [];
  await page.route('**/api/v1/interview/admin/rubrics**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname.endsWith('/admin/rubrics')) return json(matrix);
    if (url.pathname.endsWith('/history')) return json([{ version: 2, isActive: true, criteriaCount: 2, withLevelsCount: 2 }]);
    if (url.pathname.endsWith('/preview')) {
      if (req.method() === 'GET') return json([]);
      const body = req.postDataJSON();
      previews.push(body);
      return json(body.includeAiSamples ? run : customRun);
    }
    if (req.method() === 'PUT') { puts.push(req.postDataJSON()); return json({ ...rubric, version: 3, changed: true }); }
    return json(rubric);
  });

  await loginAs(page, 'Admin');
  await page.goto('/admin/rubrics');

  // (1) Bảng hiện descriptor thật của mốc (bản cũ: mọi ô trống vì đọc `description`).
  await expect(page.getByText(/No answer or off topic/)).toBeVisible();
  // Ngôn ngữ BỘ CHUẨN (vi/en) là một chiều dữ liệu, độc lập với ngôn ngữ giao diện — mặc định mở BE/vi.
  await expect(page.getByRole('button', { name: 'Backend · Vietnamese' })).toHaveAttribute('aria-pressed', 'true');

  // (2) Sửa mô tả → Lưu → confirm → PUT chỉ mang 3 trường BE nhận.
  const save = page.getByRole('button', { name: 'Save new version' });
  await expect(save).toBeDisabled();
  await page.getByLabel('Description for the AI Technical depth').fill('Depth of technical understanding.');
  await expect(save).toBeEnabled();
  await save.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/Saved v3/)).toBeVisible();
  expect(puts).toHaveLength(1);
  expect(puts[0]).toEqual({
    criteria: [
      { id: 'c-1', description: 'Clear structure.', levels: rubric.criteria[0].levels },
      { id: 'c-2', description: 'Depth of technical understanding.', levels: rubric.criteria[1].levels },
    ],
  });
  expect(JSON.stringify(puts[0])).not.toMatch(/"name"|"weight"|"maxScore"|"scoringScope"/);

  // (3) Tự thử: chưa có bài ⇒ nút Chấm tắt; chuyển "Paste" → dán bài → Chấm gửi ĐÚNG hợp đồng
  // (sampleQuestionId + customAnswer + includeAiSamples=false, KHÔNG deliveryMetrics) → hiện "Your answer",
  // nói rõ trôi chảy không chấm vì không có bản ghi; không có mục 3 bài AI.
  const grade = page.getByRole('button', { name: /Grade this answer/ });
  await expect(grade).toBeDisabled();
  await page.getByRole('button', { name: 'Paste', exact: true }).click();
  await page.getByLabel('Paste', { exact: true }).fill('My own answer.');
  await expect(grade).toBeEnabled();
  await grade.click();
  await expect(page.getByRole('region', { name: 'Your answer' })).toBeVisible();
  await expect(page.getByText(/A pasted answer has no recording/)).toBeVisible();
  await expect(page.getByText(/Compared with 3 AI-written samples/)).toHaveCount(0);
  expect(previews).toHaveLength(1);
  expect(previews[0]).toEqual({ sampleQuestionId: 'q-1', customAnswer: 'My own answer.', includeAiSamples: false });

  // (4) Bật "3 bài AI" → lượt thứ hai mang includeAiSamples=true và mục so sánh hiện 3 dải.
  await page.getByRole('checkbox').check();
  await grade.click();
  await expect(page.getByText(/Compared with 3 AI-written samples/)).toBeVisible();
  await expect(page.getByText('Weak', { exact: true })).toBeVisible();
  expect(previews).toHaveLength(2);
  expect(previews[1]).toMatchObject({ includeAiSamples: true });
});
