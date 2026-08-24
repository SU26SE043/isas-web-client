import { useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { AdminPageShell } from '../components/AdminPageShell';
import { RoadmapThresholdsTable, isValidThresholdPct } from '../components/roadmap-thresholds/RoadmapThresholdsTable';
import { useAdminRoadmapThresholds } from '../hooks/useAdminRoadmapThresholds';
import type { RoadmapThreshold } from '../types/adminApi.types';

const errorKey = (prefix: string, error: unknown) => {
  const status = getApiStatusCode(error);
  return status === 400 || status === 404 ? `${prefix}.${status}` : `${prefix}.default`;
};

export function AdminRoadmapThresholdsPage() {
  const { t } = useLanguage();
  const { list, update, reset } = useAdminRoadmapThresholds();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [resettingLevel, setResettingLevel] = useState<string | null>(null);
  const rows: RoadmapThreshold[] = list.data ?? [];
  const forbidden = getApiStatusCode(list.error) === 403;

  const dirty = useMemo(() => {
    const changed: Record<string, string> = {};
    for (const row of rows) {
      const value = draft[row.level];
      // Hàng mồ côi không sửa được: PUT cấp lạ chắc chắn 400, đừng gửi đi cho 400.
      if (value === undefined || !row.isKnownLevel) continue;
      if (value.trim() !== String(row.effectivePct)) changed[row.level] = value;
    }
    return changed;
  }, [rows, draft]);

  const dirtyLevels = Object.keys(dirty);
  const hasInvalid = dirtyLevels.some((level) => !isValidThresholdPct(dirty[level]));

  const save = () => {
    const payload: Record<string, number> = {};
    for (const level of dirtyLevels) payload[level] = Number(dirty[level].trim());
    update.mutate(payload, { onSuccess: () => setDraft({}) });
  };

  const onReset = (level: string) => {
    setResettingLevel(level);
    reset.mutate(level, {
      onSuccess: () => setDraft((current) => { const next = { ...current }; delete next[level]; return next; }),
      onSettled: () => setResettingLevel(null),
    });
  };

  return (
    <AdminPageShell
      eyebrow="SCR-ADM-ROADMAP-THRESHOLDS"
      title={t('admin.roadmapThresholds.title')}
      description={t('admin.roadmapThresholds.description')}
      actions={
        <Button type="button" loading={update.isPending} disabled={!dirtyLevels.length || hasInvalid} onClick={save}>
          {t('admin.roadmapThresholds.save')}
        </Button>
      }
    >
      {/*
        Bắt buộc nói ra: đổi ngưỡng KHÔNG hồi tố. Không nói thì admin sửa xong đi tìm
        xem sao báo cáo của lộ trình đã hoàn thành không nhúc nhích, rồi báo là bug.
      */}
      <Alert variant="warning">
        <AlertDescription>{t('admin.roadmapThresholds.notRetroactive')}</AlertDescription>
      </Alert>

      {list.isLoading ? (
        <p aria-live="polite" className="rounded-xl border border-satin bg-surface-raised p-6 text-sm text-muted-foreground">
          {t('admin.roadmapThresholds.loading')}
        </p>
      ) : null}

      {list.isError ? (
        <div className="space-y-3">
          <Alert variant="error">
            <AlertDescription>{forbidden ? t('admin.roadmapThresholds.forbidden') : getApiErrorMessage(list.error, t('admin.roadmapThresholds.error'))}</AlertDescription>
          </Alert>
          {forbidden ? null : (
            <Button type="button" variant="outline" onClick={() => void list.refetch()}>{t('admin.roadmapThresholds.retry')}</Button>
          )}
        </div>
      ) : null}

      {update.isError ? (
        <Alert variant="error">
          <AlertDescription>{t(errorKey('admin.roadmapThresholds.saveError', update.error))} {getApiErrorMessage(update.error, '')}</AlertDescription>
        </Alert>
      ) : null}

      {reset.isError ? (
        <Alert variant="error">
          <AlertDescription>{t(errorKey('admin.roadmapThresholds.resetError', reset.error))}</AlertDescription>
        </Alert>
      ) : null}

      {rows.length ? (
        <>
          <RoadmapThresholdsTable
            rows={rows}
            draft={draft}
            resettingLevel={resettingLevel}
            onDraftChange={(level, value) => setDraft((current) => ({ ...current, [level]: value }))}
            onReset={onReset}
          />
          <p className="text-sm text-muted-foreground">
            {dirtyLevels.length
              ? t('admin.roadmapThresholds.dirtyHint').replace('{count}', String(dirtyLevels.length))
              : t('admin.roadmapThresholds.cleanHint')}
          </p>
        </>
      ) : null}

      {!list.isLoading && !list.isError && !rows.length ? (
        <p className="rounded-xl border border-satin bg-surface-raised p-6 text-sm text-muted-foreground">{t('admin.roadmapThresholds.empty')}</p>
      ) : null}
    </AdminPageShell>
  );
}
