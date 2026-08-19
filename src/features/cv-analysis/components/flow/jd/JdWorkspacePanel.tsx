import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  JD_MIN_CHARS_FOR_AI,
  type JdAiRequestOutcome,
  type JdWorkspace,
  type RequirementGroup,
} from '@/features/cv-analysis/hooks/useJdWorkspace';
import { useLanguage } from '@/shared/languages';
import { JdAiStatusStrip } from './JdAiStatusStrip';
import { JdAiSuggestBar } from './JdAiSuggestBar';
import { JdChangedBanner } from './JdChangedBanner';
import { JdRequirementComposer } from './JdRequirementComposer';
import { JdRequirementList } from './JdRequirementList';
import { JdSourceEditor } from './JdSourceEditor';
import { createJdQuoteLocator, type JdQuoteRange } from './jdQuoteLocator';
import { showUndoToast } from './jdUndoToast';

const MERGE_FLASH_MS = 2000;

export interface JdWorkspacePanelProps {
  workspace: JdWorkspace;
}

/** The two halves of step (2): one JD, one requirement list the user owns. */
export function JdWorkspacePanel({ workspace }: JdWorkspacePanelProps) {
  const { t } = useLanguage();
  const [highlight, setHighlight] = useState<JdQuoteRange | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [flashingIds, setFlashingIds] = useState<Set<string>>(() => new Set());
  const [notice, setNotice] = useState<string | null>(null);

  const { jdText, lastMerge, requirementCount } = workspace;
  const locate = useMemo(() => createJdQuoteLocator(jdText), [jdText]);

  // An edited JD invalidates the offsets the highlight was built from.
  useEffect(() => setHighlight(null), [jdText]);

  useEffect(() => {
    if (!lastMerge?.addedIds.length) {
      setFlashingIds(new Set());
      return;
    }
    setFlashingIds(new Set(lastMerge.addedIds));
    const handle = setTimeout(() => setFlashingIds(new Set()), MERGE_FLASH_MS);
    return () => clearTimeout(handle);
  }, [lastMerge]);

  const reportOutcome = useCallback(
    (outcome: JdAiRequestOutcome) => {
      if (outcome.status === 'cached') {
        setNotice(t('cv.jd.ai.noNewSuggestions'));
        return;
      }
      if (outcome.status === 'empty') {
        setNotice(`${t('cv.jd.ai.noResults')} ${t('cv.jd.ai.emptyHint')}`);
        return;
      }
      if (outcome.status === 'blocked') {
        setNotice(outcome.message ?? null);
        return;
      }
      setNotice(null);
    },
    [t],
  );

  const requestAi = useCallback(async () => {
    setNotice(null);
    reportOutcome(await workspace.requestAiSuggestions());
  }, [reportOutcome, workspace]);

  const refreshFromChangedJd = useCallback(async () => {
    setNotice(null);
    reportOutcome(await workspace.refreshFromChangedJd());
  }, [reportOutcome, workspace]);

  const handleRemove = useCallback(
    (id: string) => {
      if (!workspace.removeRequirement(id).ok) return;
      showUndoToast({
        message: t('cv.jd.row.removed'),
        undoLabel: t('cv.jd.row.undo'),
        failedLabel: t('cv.jd.row.undoFailed'),
        onUndo: workspace.undoRemove,
      });
    },
    [t, workspace],
  );

  const handleMove = useCallback(
    (id: string, group: RequirementGroup) => {
      const previous: RequirementGroup = group === 'must' ? 'nice' : 'must';
      if (!workspace.moveRequirement(id, group).ok) return;
      showUndoToast({
        message: t('cv.jd.row.moved'),
        undoLabel: t('cv.jd.row.undo'),
        failedLabel: t('cv.jd.row.undoFailed'),
        onUndo: () => workspace.moveRequirement(id, previous).ok,
      });
    },
    [t, workspace],
  );

  return (
    <div className="space-y-8">
      <section aria-labelledby="jd-source-heading">
        <h3 id="jd-source-heading" className="heading-secondary text-base">
          {t('cv.jd.source.title')}
        </h3>
        <div className="mt-3">
          <JdSourceEditor
            workspace={workspace}
            highlight={highlight}
            onClearHighlight={() => setHighlight(null)}
          />
        </div>
      </section>

      <section aria-labelledby="jd-requirements-heading" className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 id="jd-requirements-heading" className="heading-secondary text-base">
              {t('cv.jd.requirements.title')}
            </h3>
            <Badge variant="outline" className="text-muted-foreground">
              {t('cv.jd.requirements.count')
                .replace('{count}', String(requirementCount))
                .replace('{max}', String(workspace.maxRequirements))}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('cv.jd.requirements.description')}
          </p>
        </div>

        {workspace.isJdChangedSinceAi ? (
          <JdChangedBanner
            onRefresh={() => void refreshFromChangedJd()}
            onKeep={workspace.keepRequirementsAfterJdChange}
          />
        ) : null}

        <JdAiSuggestBar
          hasJd={workspace.hasJd}
          hasRequirements={requirementCount > 0}
          isLoading={workspace.aiStatus === 'loading'}
          isJdTooShort={workspace.isJdTooShortForAi}
          atLimit={workspace.isAtRequirementLimit}
          maxRequirements={workspace.maxRequirements}
          isComposerOpen={isComposerOpen}
          minChars={JD_MIN_CHARS_FOR_AI}
          onRequestAi={() => void requestAi()}
          onCancelAi={workspace.cancelAiRequest}
          onOpenComposer={() => setIsComposerOpen(true)}
        />

        <JdAiStatusStrip
          merge={lastMerge}
          error={workspace.aiError}
          notice={notice}
          onUndoMerge={() => workspace.undoLastMerge()}
          onDismissMerge={workspace.dismissMergeOutcome}
          onRetry={() => void requestAi()}
          onDismissNotice={() => setNotice(null)}
        />

        {isComposerOpen ? (
          <JdRequirementComposer
            maxChars={workspace.maxRequirementChars}
            maxRequirements={workspace.maxRequirements}
            atLimit={workspace.isAtRequirementLimit}
            onAdd={workspace.addRequirement}
            onClose={() => setIsComposerOpen(false)}
          />
        ) : null}

        <JdRequirementList
          mustHave={workspace.mustHave}
          niceToHave={workspace.niceToHave}
          flashingIds={flashingIds}
          locate={locate}
          maxChars={workspace.maxRequirementChars}
          hasJd={workspace.hasJd}
          onMove={handleMove}
          onEdit={workspace.updateRequirementText}
          onRemove={handleRemove}
          onShowInJd={setHighlight}
        />
      </section>
    </div>
  );
}
