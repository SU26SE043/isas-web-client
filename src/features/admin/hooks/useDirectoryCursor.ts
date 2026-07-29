import { useState } from 'react';

export function useDirectoryCursor(initialPageSize = 20) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([]);

  const reset = () => {
    setCurrentCursor(null);
    setCursorHistory([]);
  };

  const changePageSize = (value: number) => {
    setPageSize(value);
    reset();
  };

  const next = (nextCursor: string | null) => {
    if (!nextCursor) return;
    setCursorHistory((previous) => [...previous, currentCursor]);
    setCurrentCursor(nextCursor);
  };

  const previous = () => {
    setCursorHistory((history) => {
      if (history.length === 0) return history;
      const updated = [...history];
      setCurrentCursor(updated.pop() ?? null);
      return updated;
    });
  };

  return {
    pageSize,
    currentCursor,
    pageNumber: cursorHistory.length + 1,
    hasPreviousPage: cursorHistory.length > 0,
    changePageSize,
    next,
    previous,
    reset,
  };
}
