import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CandidateFilterBar } from './CandidateFilterBar';
import { employerCampaignTranslations } from '../../languages/translations';
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => employerCampaignTranslations.vi[key] ?? key }) }));
afterEach(cleanup);
it('F5 exposes four status chips and sends the corresponding server filter', () => {
  const onChange = vi.fn();
  render(<CandidateFilterBar filters={{ skill: 'React' }} onChange={onChange} onClear={vi.fn()} />);
  const chips = within(screen.getByRole('group')).getAllByRole('button');
  expect(chips).toHaveLength(4);
  [undefined, 'Filtered', 'Invited', 'Rejected'].forEach((status, index) => {
    fireEvent.click(chips[index]); expect(onChange).toHaveBeenLastCalledWith({ skill: 'React', status });
  });
});
