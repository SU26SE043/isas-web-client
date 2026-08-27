// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOCK_SESSION_TOPICS_EIGHT } from '../mocks/sessionTopics.fixtures';
import { PracticeSessionTopics } from './PracticeSessionTopics';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => ({
      'practice.setup.jobCategory.BE': 'Backend Developer',
      'practice.wizard.level.junior': 'Junior',
      'practice.wizard.level.middle': 'Middle',
      'practice.wizard.level.senior': 'Senior',
      'practice.topics.title': 'Practice session topic catalog',
      'practice.topics.level': 'Topics at {seniority} level',
      'practice.topics.compact':
        'This session will focus on the professional areas of {category} at {seniority} level.',
    }[key] ?? key),
  }),
}));

afterEach(cleanup);

describe('PracticeSessionTopics', () => {
  it.each(['full', 'compact'] as const)('renders nothing for null topics in %s variant', (variant) => {
    const { container } = render(
      <PracticeSessionTopics topics={null} seniority="Junior" variant={variant} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it.each(['full', 'compact'] as const)('renders nothing for empty topics in %s variant', (variant) => {
    const { container } = render(
      <PracticeSessionTopics topics={[]} seniority="Junior" variant={variant} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders all eight labels with numbered visual hierarchy in full variant', () => {
    render(<PracticeSessionTopics topics={MOCK_SESSION_TOPICS_EIGHT} seniority="Middle" variant="full" />);

    expect(screen.getByRole('heading', { name: 'Practice session topic catalog' })).toBeInTheDocument();
    expect(screen.getByText('Topics at Middle level')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(8);
    for (const topic of MOCK_SESSION_TOPICS_EIGHT) {
      expect(screen.getByText(topic.label)).toBeInTheDocument();
    }
  });

  it('renders one compact line without any topic label list', () => {
    render(<PracticeSessionTopics topics={MOCK_SESSION_TOPICS_EIGHT} seniority="Junior" variant="compact" />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByText(/This session will focus on the professional areas/)).toHaveTextContent('Junior');
    expect(screen.queryByText(MOCK_SESSION_TOPICS_EIGHT[0].label)).not.toBeInTheDocument();
  });

  it('renders the wizard compact preview from the selected category before session creation', () => {
    render(
      <PracticeSessionTopics
        topics={null}
        jobCategory="BE"
        seniority="Junior"
        variant="compact"
      />,
    );

    expect(screen.getByText(/Backend Developer/)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('does not expose cvEvidence when a topic has Weak cvLevel', () => {
    const weakTopic = {
      ...MOCK_SESSION_TOPICS_EIGHT[0],
      cvLevel: 'Weak' as const,
      // MỘT chuỗi — khớp `CvRequirementMatch.Evidence` bên backend, không phải mảng.
      cvEvidence: 'private evidence that must stay hidden',
    };
    const { container } = render(
      <PracticeSessionTopics topics={[weakTopic]} seniority="Senior" variant="full" />,
    );

    expect(container).not.toHaveTextContent('private evidence that must stay hidden');
    expect(container).not.toHaveTextContent('Weak');
  });
});
