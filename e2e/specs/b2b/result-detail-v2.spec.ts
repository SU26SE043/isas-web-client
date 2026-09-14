import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

const campaignId = '11111111-2222-4333-8444-555555555555';
const sessionId = 'session-1';

test('employer can review result detail history and transcript states', async ({ page }) => {
  await page.route(`**/api/v1/campaign/${campaignId}`, async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: campaignId, title: 'Senior Product Designer', status: 'Active' }) }));
  await page.route(`**/api/v1/campaign/${campaignId}/results`, async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ campaignId, totalCandidates: 2, results: [{ rank: 1, candidateId: 'candidate-1', sessionId, fullName: 'Nguyen Van A', email: 'a@example.com', totalScore: 60, aiScore: 75, overrideScore: 60, overrideResult: 'Fail', overrideNote: 'HR review', overriddenAt: '2026-09-11T08:37:00Z', result: 'Fail', scoredAt: '2026-09-11T08:00:00Z', flags: [] }, { rank: 2, candidateId: 'candidate-2', sessionId: 'session-2', fullName: 'Tran Van B', email: 'b@example.com', totalScore: 80, aiScore: 80, result: 'Pass', scoredAt: '2026-09-11T08:00:00Z', flags: [] }] }) }));
  await page.route(`**/api/v1/campaign/${campaignId}/results/${sessionId}/transcript`, async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sessionId, questions: [{ questionId: 'q1', orderNo: 1, content: 'Describe your design process.', transcript: 'I start with discovery and user research.', needsReview: true, answerId: 'answer-1', kind: 'Seed', answerStatus: 'Scored', hasAudio: true, durationSec: 65, scores: [{ criterionId: 'c1', criterionName: 'Product thinking', score: 4, maxScore: 5, reasoning: 'Clear and structured.' }] }, { questionId: 'q2', orderNo: 2, content: 'Tell us about a challenge.', transcript: '', needsReview: false, answerId: null, kind: 'FollowUp', answerStatus: 'Skipped', hasAudio: false, durationSec: null, scores: [] }] }) }));
  await page.route(`**/api/v1/campaign/${campaignId}/results/${sessionId}/override-history`, async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sessionId, items: [{ id: 'history-1', kind: 'Set', score: 60, result: 'Fail', note: 'HR review', actorUserId: 'u1', actorEmail: null, at: '2026-09-11T08:37:00Z', source: 'Live' }, { id: 'history-2', kind: 'Clear', score: null, result: null, note: 'clear', actorUserId: 'u1', actorEmail: 'hr@isas.local', at: '2026-09-11T08:00:00Z', source: 'AuditBackfill' }] }) }));
  let audioRequests = 0;
  await page.route(`**/api/v1/campaign/${campaignId}/results/${sessionId}/answers/answer-1/audio`, async (route) => { audioRequests += 1; await route.fulfill({ status: 200, contentType: 'audio/webm', body: Buffer.from('audio') }); });

  await loginAs(page, 'OrgAdmin');
  await page.goto(`/employer/campaigns/${campaignId}/results/${sessionId}`);
  await expect(page.getByRole('heading', { name: 'Nguyen Van A' })).toBeVisible();
  await expect(page.getByText('60% · Fail · Unknown editor')).toBeVisible();
  await expect(page.getByText('No speech · 0 points')).toHaveCount(0);
  // q2 là FollowUp của q1 ⇒ số hiệu phân cấp "1.1" (cùng cách đếm ứng viên thấy trong phòng thi), không phải "2".
  await expect(page.getByText('Question 1.1', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /View history/i }).click();
  await expect(page.getByText('Adjustment cleared')).toBeVisible();
  await expect(page.getByRole('button', { name: /Adjust result/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Play/i })).toBeVisible();
  expect(audioRequests).toBe(0);
  await page.screenshot({ path: 'test-results/result-detail-v2-desktop.png', fullPage: true });
  await page.getByRole('button', { name: /Play/i }).click();
  await expect.poll(() => audioRequests).toBe(1);
  await page.getByRole('button', { name: /Adjust result/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /Cancel/i }).click();

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByText('Question 1', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/result-detail-v2-mobile.png', fullPage: true });
});
