/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignSettingsStep } from './CampaignSettingsStep';
import { CampaignInvitesStep } from './CampaignInvitesStep';

const PLACEHOLDER_KEYS: Record<string, string> = {
  'employer.campaigns.form.attemptRules.estimate': '{{minutes}}|{{k}}',
  'employer.campaigns.form.attemptRules.estimateAdaptive': '{{minutes}}|{{k}}|{{d}}',
  'employer.campaigns.form.attemptRules.attemptOptionOne': '{{n}}',
  'employer.campaigns.form.attemptRules.attemptOptionMany': '{{n}}',
  'employer.campaigns.form.attemptRules.timeLimitRange': '{{min}}-{{max}}',
};

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => (PLACEHOLDER_KEYS[key] ? `${key} ${PLACEHOLDER_KEYS[key]}` : key),
    language: 'vi',
  }),
}));
// Tab CV của bước Mời không render trong các test này; mock để không kéo react-query vào.
vi.mock('../screening/CvScreeningPanel', () => ({ CvScreeningPanel: () => null }));

afterEach(() => cleanup());

const TIME_LIMIT_LABEL = 'employer.campaigns.form.timeLimitMinutes';
const ESTIMATE = 'employer.campaigns.form.attemptRules.estimate';
const ESTIMATE_ADAPTIVE = 'employer.campaigns.form.attemptRules.estimateAdaptive';

const settings = {
  antiCheatEnabled: true,
  faceVerifyEnabled: false,
  adaptiveEnabled: false,
  maxFollowUps: 2,
  maxQuestions: 5,
  maxDeepPerQuestion: 0,
};

function renderStep(props: Partial<Parameters<typeof CampaignSettingsStep>[0]> = {}) {
  const onRulesChange = vi.fn();
  const view = render(
    <CampaignSettingsStep
      settings={settings}
      timeLimitMinutes={60}
      maxAttempts={1}
      onRulesChange={onRulesChange}
      onChange={vi.fn()}
      onBack={vi.fn()}
      onNext={vi.fn()}
      questionCount={5}
      {...props}
    />,
  );
  return { ...view, onRulesChange };
}

const attemptButton = (n: number) => screen.getByRole('button', { name: `employer.campaigns.form.attemptRules.attemptOption${n === 1 ? 'One' : 'Many'} ${n}` });

/** ATT1-F1 — khối "Luật làm bài" là nguồn DUY NHẤT của thời lượng + số lần làm, đặt ở bước 5. */
describe('ATT1-F1 — khối "Luật làm bài" ở bước 5', () => {
  it('ô thời lượng có ở bước 5, nằm TRONG khối Luật làm bài, đứng TRÊN các ô chống gian lận', () => {
    renderStep();
    const block = screen.getByTestId('campaign-attempt-rules');
    expect(within(block).getByRole('heading', { name: 'employer.campaigns.form.attemptRules.title' })).toBeInTheDocument();
    const input = within(block).getByLabelText(TIME_LIMIT_LABEL);
    expect(input).toHaveValue(60);
    expect(input).toHaveAttribute('min', '5');
    expect(input).toHaveAttribute('max', '180');
    const antiCheat = screen.getByLabelText('employer.campaigns.form.antiCheat');
    expect(block.compareDocumentPosition(antiCheat) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('ô thời lượng KHÔNG còn ở bước Mời ứng viên (một nguồn sự thật)', () => {
    render(<CampaignInvitesStep campaignId="c-1" inviteEmails={[]} onInviteEmailsChange={vi.fn()} onBack={vi.fn()} onNext={vi.fn()} />);
    expect(screen.queryByLabelText(TIME_LIMIT_LABEL)).not.toBeInTheDocument();
    expect(document.getElementById('campaign-time-limit')).toBeNull();
  });

  it('gõ thời lượng ⇒ onRulesChange({ timeLimitMinutes }) — không kẹp giá trị (4 vẫn đi lên để validate báo lỗi)', () => {
    const { onRulesChange } = renderStep();
    fireEvent.change(screen.getByLabelText(TIME_LIMIT_LABEL), { target: { value: '45' } });
    expect(onRulesChange).toHaveBeenLastCalledWith({ timeLimitMinutes: 45 });
    fireEvent.change(screen.getByLabelText(TIME_LIMIT_LABEL), { target: { value: '4' } });
    expect(onRulesChange).toHaveBeenLastCalledWith({ timeLimitMinutes: 4 });
    fireEvent.change(screen.getByLabelText(TIME_LIMIT_LABEL), { target: { value: '' } });
    expect(onRulesChange).toHaveBeenLastCalledWith({ timeLimitMinutes: 0 });
  });

  it('số lần làm: 3 lựa chọn 1/2/3, đánh dấu giá trị hiện tại; bấm 2 ⇒ onRulesChange({ maxAttempts: 2 })', () => {
    const { onRulesChange } = renderStep({ maxAttempts: 1 });
    expect(attemptButton(1)).toHaveAttribute('aria-pressed', 'true');
    expect(attemptButton(2)).toHaveAttribute('aria-pressed', 'false');
    expect(attemptButton(3)).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(attemptButton(2));
    expect(onRulesChange).toHaveBeenLastCalledWith({ maxAttempts: 2 });
  });

  it('maxAttempts 3 ⇒ nút 3 được chọn', () => {
    renderStep({ maxAttempts: 3 });
    expect(attemptButton(3)).toHaveAttribute('aria-pressed', 'true');
    expect(attemptButton(1)).toHaveAttribute('aria-pressed', 'false');
  });

  it('ước tính: K=5, adaptive tắt ⇒ ~10 phút (không có vế đào sâu)', () => {
    renderStep({ questionCount: 5 });
    expect(screen.getByTestId('campaign-time-estimate')).toHaveTextContent(`${ESTIMATE} 10|5`);
  });

  it('adaptive TẮT nhưng settings còn giữ maxDeepPerQuestion=3 (d cũ) ⇒ vẫn ~10 phút, khoá không-adaptive', () => {
    renderStep({ questionCount: 5, settings: { ...settings, adaptiveEnabled: false, maxDeepPerQuestion: 3 } });
    const line = screen.getByTestId('campaign-time-estimate');
    expect(line).toHaveTextContent(`${ESTIMATE} 10|5`);
    expect(line).not.toHaveTextContent(ESTIMATE_ADAPTIVE);
  });

  it('ước tính ĐỔI khi bật adaptive (d = maxDeepPerQuestion): K=5, d=3 ⇒ ~40 phút', () => {
    renderStep({ questionCount: 5, settings: { ...settings, adaptiveEnabled: true, maxDeepPerQuestion: 3 } });
    expect(screen.getByTestId('campaign-time-estimate')).toHaveTextContent(`${ESTIMATE_ADAPTIVE} 40|5|3`);
  });

  it('ước tính ĐỔI khi đổi K: K=8, d=1 ⇒ ~32 phút', () => {
    renderStep({ questionCount: 8, settings: { ...settings, adaptiveEnabled: true, maxDeepPerQuestion: 1 } });
    expect(screen.getByTestId('campaign-time-estimate')).toHaveTextContent(`${ESTIMATE_ADAPTIVE} 32|8|1`);
  });

  it('thời lượng < ước tính ⇒ dòng ước tính màu cảnh báo + câu nhắc; nút Tiếp KHÔNG bị khoá', () => {
    renderStep({ timeLimitMinutes: 30, questionCount: 5, settings: { ...settings, adaptiveEnabled: true, maxDeepPerQuestion: 3 } });
    const line = screen.getByTestId('campaign-time-estimate');
    expect(line).toHaveAttribute('data-below-estimate', 'true');
    expect(line).toHaveClass('text-warning');
    expect(line).toHaveTextContent('employer.campaigns.form.attemptRules.belowEstimate');
    expect(screen.getByRole('button', { name: 'employer.campaigns.wizard.next' })).toBeEnabled();
  });

  it('thời lượng ≥ ước tính ⇒ dòng ước tính màu thường, không câu nhắc', () => {
    renderStep({ timeLimitMinutes: 40, questionCount: 5, settings: { ...settings, adaptiveEnabled: true, maxDeepPerQuestion: 3 } });
    const line = screen.getByTestId('campaign-time-estimate');
    expect(line).toHaveAttribute('data-below-estimate', 'false');
    expect(line).not.toHaveClass('text-warning');
    expect(line).not.toHaveTextContent('belowEstimate');
  });

  it('có lỗi bước và thời lượng ngoài [5,180] ⇒ ô nhập aria-invalid; thời lượng hợp lệ thì không', () => {
    const { rerender, onRulesChange } = renderStep({ timeLimitMinutes: 4, error: 'employer.campaigns.wizard.timeLimitInvalid' });
    expect(screen.getByLabelText(TIME_LIMIT_LABEL)).toHaveAttribute('aria-invalid', 'true');
    rerender(
      <CampaignSettingsStep settings={settings} timeLimitMinutes={5} maxAttempts={1} onRulesChange={onRulesChange} error="x"
        onChange={vi.fn()} onBack={vi.fn()} onNext={vi.fn()} questionCount={5} />,
    );
    expect(screen.getByLabelText(TIME_LIMIT_LABEL)).toHaveAttribute('aria-invalid', 'false');
  });
});
