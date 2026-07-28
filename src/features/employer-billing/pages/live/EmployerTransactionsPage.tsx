import { useState } from 'react';
import { AppPagination, DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import { useLanguage } from '@/shared/languages';
import { QuerySection } from '../../components/live/QuerySection';
import { TransactionsTable } from '../../components/live/TransactionsTable';
import { useEmployerTransactions } from '../../hooks/useEmployerPaymentQueries';

export function EmployerTransactionsPage() {
  const { t } = useLanguage();
  const [cursor, setCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<string | null>>([]);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const query = useEmployerTransactions(cursor, pageSize);

  return (
    <div className="space-y-4">
      <QuerySection isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()}>
        <TransactionsTable transactions={query.data?.data ?? []} />
      </QuerySection>
      <AppPagination
        mode="cursor"
        currentPage={history.length + 1}
        pageSize={pageSize}
        itemCount={query.data?.data.length ?? 0}
        itemLabel={t('employerBilling.pagination.transactions')}
        hasPreviousPage={history.length > 0}
        hasNextPage={Boolean(query.data?.nextCursor)}
        isLoading={query.isFetching}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCursor(null);
          setHistory([]);
        }}
        onPreviousPage={() => {
          setHistory((current) => {
            const next = [...current];
            setCursor(next.pop() ?? null);
            return next;
          });
        }}
        onNextPage={() => {
          if (!query.data?.nextCursor) return;
          setHistory((current) => [...current, cursor]);
          setCursor(query.data.nextCursor);
        }}
      />
    </div>
  );
}

