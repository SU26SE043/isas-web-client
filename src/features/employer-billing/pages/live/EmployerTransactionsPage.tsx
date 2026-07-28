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
  const items = query.data?.items ?? [];

  const handlePreviousPage = () => {
    if (!history.length || query.isFetching) return;
    setCursor(history[history.length - 1] ?? null);
    setHistory((current) => current.slice(0, -1));
  };

  const handleNextPage = () => {
    if (!query.data?.nextCursor || query.isFetching) return;
    setHistory((current) => [...current, cursor]);
    setCursor(query.data.nextCursor);
  };

  return (
    <div className="space-y-4">
      <QuerySection
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => void query.refetch()}
        errorTitle={t('employerBilling.transactions.errorTitle')}
        errorDescription={t('employerBilling.transactions.errorDescription')}
      >
        <TransactionsTable transactions={items} />
      </QuerySection>
      <AppPagination
        mode="cursor"
        currentPage={history.length + 1}
        pageSize={pageSize}
        itemCount={items.length}
        itemLabel={t('employerBilling.pagination.transactions')}
        hasPreviousPage={history.length > 0}
        hasNextPage={Boolean(query.data?.nextCursor)}
        isLoading={query.isFetching}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCursor(null);
          setHistory([]);
        }}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
}
