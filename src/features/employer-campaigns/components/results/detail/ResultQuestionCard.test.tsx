import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/shared/languages';
import type { TranscriptQuestion } from '../../../types/campaign.api.types';
import { ResultQuestionCard } from './ResultQuestionCard';
import { ResultQuestionNav } from './ResultQuestionNav';

afterEach(() => cleanup());

const base: TranscriptQuestion = {
  questionId: 'q1',
  orderNo: 1,
  content: 'Giải thích cách tối ưu truy vấn chậm.',
  transcript: 'Tôi bật logging để xem SQL.',
  needsReview: false,
  scores: [
    { criterionId: 'c1', criterionName: 'Chiều sâu kỹ thuật', score: 8, maxScore: 10, reasoning: 'Trích: bật logging' },
    { criterionId: 'c2', criterionName: 'Giao tiếp', score: 6, maxScore: 10, reasoning: null },
  ],
  answerId: 'a1',
  kind: 'Seed',
  answerStatus: 'Scored',
  rejectReason: null,
  durationSec: 84,
  hasAudio: true,
  sampleAnswer: 'Câu mẫu.',
  deliveryMetrics: { speechRateWpm: 299, pauseCount: 3, longestPauseSec: 2.1, silenceRatio: 0.1, fillerCount: 4, fillerBreakdown: {} },
};

function renderCard(question: TranscriptQuestion) {
  return render(
    <LanguageProvider>
      <ResultQuestionCard question={question} campaignId="c1" sessionId="s1" />
    </LanguageProvider>,
  );
}

describe('ResultQuestionCard — trạng thái câu', () => {
  it('câu đã chấm: kind, điểm TB, player, chỉ số cách nói, câu mẫu', () => {
    renderCard(base);
    expect(screen.getByText('Câu gốc')).toBeInTheDocument();
    expect(screen.getByText('7.0/10')).toBeInTheDocument(); // (8+6)/(10+10)×10
    expect(screen.getByRole('button', { name: /phát/i })).toBeInTheDocument();
    expect(screen.getByText(/299 wpm · vừa/)).toBeInTheDocument();
    expect(screen.getByText(/Khoảng lặng: 3 · 2.1s/)).toBeInTheDocument();
    expect(screen.getByText('Câu trả lời tham chiếu của AI')).toBeInTheDocument();
    expect(screen.queryByText('Bỏ trống')).not.toBeInTheDocument();
  });

  it('im lặng (no_speech, CÓ audio): chip "Không có tiếng nói" + vẫn nghe được, KHÔNG phải "Bỏ trống"', () => {
    renderCard({
      ...base,
      transcript: null,
      scores: [],
      answerStatus: 'Skipped',
      rejectReason: 'no_speech',
      deliveryMetrics: null,
      sampleAnswer: null,
    });
    expect(screen.getAllByText('Không có tiếng nói · 0 điểm').length).toBeGreaterThan(0);
    expect(screen.queryByText('Bỏ trống')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /phát/i })).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('bỏ trống (Skipped, KHÔNG audio, không lý do): chip "Bỏ trống", không player', () => {
    renderCard({
      ...base,
      transcript: null,
      scores: [],
      answerId: 'a3',
      answerStatus: 'Skipped',
      rejectReason: null,
      hasAudio: false,
      deliveryMetrics: null,
      sampleAnswer: null,
    });
    expect(screen.getByText('Bỏ trống')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /phát/i })).not.toBeInTheDocument();
  });

  it('chấm lỗi (Failed) → chip "Chấm lỗi"', () => {
    renderCard({ ...base, answerStatus: 'Failed', scores: [] });
    expect(screen.getByText('Chấm lỗi')).toBeInTheDocument();
  });

  it('needsReview → chip "Cần soi lại"; kind AI làm rõ', () => {
    renderCard({ ...base, needsReview: true, kind: 'Clarify' });
    expect(screen.getByText('Cần soi lại')).toBeInTheDocument();
    expect(screen.getByText('AI làm rõ')).toBeInTheDocument();
  });

  it('chỉ số cách nói null → "chưa đo", KHÔNG hiện 0', () => {
    renderCard({ ...base, deliveryMetrics: null });
    expect(screen.getAllByText(/chưa đo/).length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText(/0 wpm/)).not.toBeInTheDocument();
  });

  it('tốc độ < 180 → chậm; > 320 → nhanh', () => {
    renderCard({ ...base, deliveryMetrics: { ...base.deliveryMetrics!, speechRateWpm: 150 } });
    expect(screen.getByText(/150 wpm · chậm/)).toBeInTheDocument();
    cleanup();
    renderCard({ ...base, deliveryMetrics: { ...base.deliveryMetrics!, speechRateWpm: 340 } });
    expect(screen.getByText(/340 wpm · nhanh/)).toBeInTheDocument();
  });

  it('bản chép dài → có "Xem thêm"; ngắn → không', () => {
    renderCard({ ...base, transcript: 'x'.repeat(300) });
    expect(screen.getByRole('button', { name: 'Xem thêm' })).toBeInTheDocument();
    cleanup();
    renderCard(base);
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).not.toBeInTheDocument();
  });
});

describe('ResultQuestionNav', () => {
  it('anchor #q-{n} + điểm + icon theo trạng thái', () => {
    render(
      <LanguageProvider>
        <ResultQuestionNav
          questions={[
            base,
            { ...base, questionId: 'q2', orderNo: 2, scores: [], rejectReason: 'no_speech' },
            { ...base, questionId: 'q3', orderNo: 3, needsReview: true },
          ]}
        />
      </LanguageProvider>,
    );
    const links = screen.getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#q-1', '#q-2', '#q-3']);
    expect(links[0]).toHaveTextContent('7.0');
    expect(links[1]).toHaveTextContent('—');
  });
});
