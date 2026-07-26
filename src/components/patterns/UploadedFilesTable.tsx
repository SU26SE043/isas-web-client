import { useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Eye, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  statusLabel: string;
  status: 'ready' | 'error' | 'processing';
  detail?: string;
}

export interface UploadedFilesTableLabels {
  selected: string;
  totalSize: string;
  format: string;
  maxFileSize: string;
  fileList: string;
  deleteSelected: string;
  fileName: string;
  fileSize: string;
  status: string;
  actions: string;
  selectPage: string;
  preview: string;
  remove: string;
  show: string;
  perPage: string;
  page: string;
  previous: string;
  next: string;
}

interface UploadedFilesTableProps {
  files: UploadedFileItem[];
  labels: UploadedFilesTableLabels;
  maxFileSize: string;
  primaryAction?: ReactNode;
  onPreview?: (id: string) => void;
  onRemove: (ids: string[]) => void;
  disabled?: boolean;
}

const PAGE_SIZES = [5, 10, 20];

export function UploadedFilesTable({
  files,
  labels,
  maxFileSize,
  primaryAction,
  onPreview,
  onRemove,
  disabled = false,
}: UploadedFilesTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const totalPages = Math.max(1, Math.ceil(files.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = files.slice((safePage - 1) * pageSize, safePage * pageSize);
  const allVisibleSelected =
    visible.length > 0 && visible.every((file) => selected.has(file.id));
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  const removeFiles = (ids: string[]) => {
    onRemove(ids);
    setSelected(new Set());
    setPage(Math.min(safePage, Math.max(1, Math.ceil((files.length - ids.length) / pageSize))));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-satin bg-surface-raised sm:grid-cols-4">
        <Stat label={labels.selected} value={String(files.length)} tone="success" />
        <Stat label={labels.totalSize} value={formatFileSize(totalBytes)} />
        <Stat label={labels.format} value="PDF" />
        <Stat label={labels.maxFileSize} value={maxFileSize} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          {labels.fileList.replace('{count}', String(files.length))}
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || selected.size === 0}
            onClick={() => removeFiles(Array.from(selected))}
          >
            {labels.deleteSelected}
          </Button>
          {primaryAction}
        </div>
      </div>

      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                className="size-4 accent-foreground"
                checked={allVisibleSelected}
                aria-label={labels.selectPage}
                onChange={() =>
                  setSelected((current) => {
                    const next = new Set(current);
                    visible.forEach((file) =>
                      allVisibleSelected ? next.delete(file.id) : next.add(file.id),
                    );
                    return next;
                  })
                }
              />
            </TableHead>
            <TableHead>{labels.fileName}</TableHead>
            <TableHead>{labels.fileSize}</TableHead>
            <TableHead>{labels.status}</TableHead>
            <TableHead className="text-right">{labels.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((file) => (
            <TableRow key={file.id}>
              <TableCell>
                <input
                  type="checkbox"
                  className="size-4 accent-foreground"
                  checked={selected.has(file.id)}
                  aria-label={file.name}
                  onChange={() =>
                    setSelected((current) => {
                      const next = new Set(current);
                      next.has(file.id) ? next.delete(file.id) : next.add(file.id);
                      return next;
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-error/10 text-error">
                    <FileText className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="max-w-[360px] truncate font-medium text-foreground">{file.name}</p>
                    {file.detail ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{file.detail}</p>
                    ) : null}
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatFileSize(file.size)}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs',
                    file.status === 'ready' && 'bg-success/10 text-success',
                    file.status === 'error' && 'bg-error/10 text-error',
                    file.status === 'processing' && 'bg-info/10 text-info',
                  )}
                >
                  {file.statusLabel}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  {onPreview ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={labels.preview}
                      onClick={() => onPreview(file.id)}
                    >
                      <Eye aria-hidden />
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label={labels.remove}
                    disabled={disabled}
                    onClick={() => removeFiles([file.id])}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2">
          {labels.show}
          <select
            value={pageSize}
            className="h-8 rounded-lg border border-input bg-surface-overlay px-2 text-foreground"
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
          >
            {PAGE_SIZES.map((size) => <option key={size}>{size}</option>)}
          </select>
          {labels.perPage}
        </label>
        <div className="flex items-center justify-center gap-1">
          <Button type="button" variant="outline" size="icon-sm" disabled={safePage === 1} aria-label={labels.previous} onClick={() => setPage(safePage - 1)}>
            <ChevronLeft aria-hidden />
          </Button>
          <span className="px-2 text-foreground">{labels.page.replace('{page}', String(safePage)).replace('{total}', String(totalPages))}</span>
          <Button type="button" variant="outline" size="icon-sm" disabled={safePage === totalPages} aria-label={labels.next} onClick={() => setPage(safePage + 1)}>
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'success' }) {
  return (
    <div className="border-b border-r border-satin/60 px-4 py-3 text-center sm:border-b-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-sm font-semibold text-foreground', tone === 'success' && 'text-success')}>{value}</p>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
