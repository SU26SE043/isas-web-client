export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

interface AppPaginationBaseProps {
  pageSize: number;
  itemLabel: string;
  pageSizeOptions?: readonly number[];
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface PagePaginationProps extends AppPaginationBaseProps {
  mode?: 'page';
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export interface CursorPaginationProps extends AppPaginationBaseProps {
  mode: 'cursor';
  currentPage: number;
  itemCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export type AppPaginationProps = PagePaginationProps | CursorPaginationProps;
export type PaginationToken = number | 'ellipsis-start' | 'ellipsis-end';
