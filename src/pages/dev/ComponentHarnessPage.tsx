import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { EmptyState } from '@/components/patterns/EmptyState';
import { FileUploadDialog } from '@/components/patterns/FileUploadDialog';

export function ComponentHarnessPage() {
  const { t } = useLanguage();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="dashboard-content space-y-6">
      <div>
        <h1 className="heading-primary text-2xl">{t('ds.dev.harnessTitle')}</h1>
        <p className="body-text mt-1">{t('ds.dev.harnessDescription')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('ds.dev.tabAtoms')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button>{t('ds.dev.primary')}</Button>
            <Button variant="secondary">{t('ds.dev.secondary')}</Button>
            <Button variant="outline">{t('ds.dev.outline')}</Button>
            <Button loading>{t('ds.dev.loading')}</Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="harness-email">Email</Label>
            <Input id="harness-email" placeholder="name@company.com" />
          </div>
          <div className="flex items-center gap-3">
            <Spinner className="size-6" />
            <Skeleton className="h-8 w-40" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('ds.dev.tabFeedback')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>Notice</AlertTitle>
            <AlertDescription>Monochrome alert surface.</AlertDescription>
          </Alert>
          <EmptyState title={t('ds.empty.noDataTitle')} description={t('ds.empty.noDataDescription')} />
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => toast.success(t('ds.dev.toastSuccess'))}>{t('ds.dev.showToast')}</Button>
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              {t('ds.dev.openConfirm')}
            </Button>
            <Button variant="secondary" onClick={() => setUploadOpen(true)}>
              {t('ds.dev.openUpload')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('ds.dev.confirmTitle')}
        description={t('ds.dev.confirmDescription')}
        confirmLabel={t('ds.dev.confirmAction')}
        cancelLabel={t('ds.common.cancel')}
        destructive
        onConfirm={() => setConfirmOpen(false)}
      />
      <FileUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        title={t('ds.upload.title')}
        description={t('ds.upload.description')}
        hint={t('ds.upload.hint')}
        dropLabel={t('ds.upload.dropLabel')}
        browseLabel={t('ds.upload.browseLabel')}
        cancelLabel={t('ds.common.cancel')}
        uploadLabel={t('ds.upload.action')}
        onUpload={() => toast.success(t('ds.dev.uploadComplete'))}
      />
    </div>
  );
}