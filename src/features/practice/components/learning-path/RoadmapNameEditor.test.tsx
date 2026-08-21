import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoadmapNameEditor } from './RoadmapNameEditor';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'en', t: (key: string) => key }),
}));

describe('RoadmapNameEditor', () => {
  afterEach(() => cleanup());

  it('calls onSave with the edited name and closes edit mode', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<RoadmapNameEditor name="Old path" isSaving={false} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'practice.learningPath.rename' }));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), ' New path ');
    await user.click(screen.getByRole('button', { name: 'practice.learningPath.saveName' }));

    expect(onSave).toHaveBeenCalledWith('New path');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows save errors and keeps the editor open', async () => {
    const user = userEvent.setup();
    render(<RoadmapNameEditor name="Old path" isSaving={false} error="Could not save" onSave={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'practice.learningPath.rename' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save');
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
