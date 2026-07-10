import { useCallback, useRef, useState } from 'react';
import { UploadIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_BYTES = 10 * 1024 * 1024;

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  hint: string;
  dropLabel: string;
  browseLabel: string;
  cancelLabel: string;
  uploadLabel: string;
  onUpload: (file: File) => void;
  accept?: string;
}

export function FileUploadDialog({
  open,
  onOpenChange,
  title,
  description,
  hint,
  dropLabel,
  browseLabel,
  cancelLabel,
  uploadLabel,
  onUpload,
  accept = '.pdf,.doc,.docx',
}: FileUploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setFile(null);
    setError(null);
    setDragging(false);
  }, []);

  const handleFile = (next: File | null) => {
    if (!next) return;
    if (next.size > MAX_BYTES) {
      setError(hint);
      setFile(null);
      return;
    }
    setError(null);
    setFile(next);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0] ?? null);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors',
            dragging ? 'border-[var(--border-focus)] bg-surface-overlay' : 'border-default bg-surface-raised',
          )}
        >
          <UploadIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm text-foreground">{file?.name ?? dropLabel}</span>
          <span className="text-caption">{hint}</span>
          <span className="text-sm text-muted-foreground">{browseLabel}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            disabled={!file}
            onClick={() => {
              if (!file) return;
              onUpload(file);
              reset();
              onOpenChange(false);
            }}
          >
            {uploadLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
