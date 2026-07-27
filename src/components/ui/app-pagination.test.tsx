// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppPagination } from './app-pagination';
import type { PagePaginationProps } from './pagination.types';

const messages: Record<string, string> = {
  'ds.pagination.label': 'Pagination',
  'ds.pagination.show': 'Show',
  'ds.pagination.pageSize': 'Items per page',
  'ds.pagination.perPage': '/ page',
  'ds.pagination.range': '{start}–{end} of {total} {itemLabel}',
  'ds.pagination.cursorSummary': 'Page {page} · {count} {itemLabel}',
  'ds.pagination.previous': 'Previous page',
  'ds.pagination.next': 'Next page',
  'ds.pagination.page': 'Page {page}',
  'ds.pagination.goTo': 'Go to page {page}',
};

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => messages[key] ?? key }),
}));

afterEach(cleanup);

function renderPage(overrides: Partial<PagePaginationProps> = {}) {
  const onPageChange = vi.fn();
  const onPageSizeChange = vi.fn();
  render(
    <AppPagination
      currentPage={2}
      pageSize={10}
      totalItems={120}
      itemLabel="campaigns"
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      {...overrides}
    />,
  );
  return { onPageChange, onPageSizeChange };
}

describe('AppPagination page mode', () => {
  it('renders the range, page numbers, active page and ellipsis', () => {
    renderPage({ currentPage: 6 });
    expect(screen.getByText('51–60 of 120 campaigns')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to page 6' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getAllByText('…')).toHaveLength(2);
  });

  it('handles previous, next and numbered page clicks', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderPage();
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.click(screen.getByRole('button', { name: 'Go to page 5' }));
    expect(onPageChange.mock.calls.map(([page]) => page)).toEqual([1, 3, 5]);
  });

  it('disables previous on the first page and next on the last page', () => {
    const { unmount } = render(
      <AppPagination
        currentPage={1}
        pageSize={10}
        totalItems={20}
        itemLabel="items"
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    unmount();
    renderPage({ currentPage: 12 });
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('resets to page one and reports the new page size', async () => {
    const user = userEvent.setup();
    const { onPageChange, onPageSizeChange } = renderPage();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Items per page' }), '20');
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('renders a zero range and disables controls while loading', () => {
    renderPage({ totalItems: 0, currentPage: 1, isLoading: true });
    expect(screen.getByText('0–0 of 0 campaigns')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });
});

describe('AppPagination cursor mode', () => {
  it('does not fabricate total pages and uses cursor navigation', async () => {
    const user = userEvent.setup();
    const onPreviousPage = vi.fn();
    const onNextPage = vi.fn();
    render(
      <AppPagination
        mode="cursor"
        currentPage={3}
        pageSize={20}
        itemCount={18}
        itemLabel="interviews"
        hasPreviousPage
        hasNextPage
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onPageSizeChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Page 3 · 18 interviews')).toBeInTheDocument();
    expect(screen.getByText('Page 3')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Go to page 3' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPreviousPage).toHaveBeenCalledOnce();
    expect(onNextPage).toHaveBeenCalledOnce();
  });
});
