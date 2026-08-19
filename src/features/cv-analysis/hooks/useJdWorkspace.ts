import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/shared/languages';
import {
  cvAnalysisService,
  CvAnalysisError,
  JD_REQUIREMENTS_TIMEOUT_MS,
} from '../services/cvAnalysis.service';
import type { RequirementInput } from '../types/cvAnalysis.types';
import {
  CV_ANALYSIS_MAX_REQUIREMENTS,
  CV_REQUIREMENT_MAX_CHARS,
  createRequirementId,
  findDuplicateRequirement,
  mergeRequirementSuggestions,
  normalizeRequirementKey,
  splitRequirementInputs,
  type RequirementGroup,
  type RequirementItem,
  type RequirementSuggestion,
} from '../utils/jdRequirementMerge';
import { resolveJdError, type ResolvedJdError } from '../utils/resolveJdError';

export type {
  RequirementGroup,
  RequirementItem,
  RequirementOrigin,
  RequirementSuggestion,
} from '../utils/jdRequirementMerge';
export { CV_ANALYSIS_MAX_REQUIREMENTS, CV_REQUIREMENT_MAX_CHARS };

/**
 * Where the JD content came from. There is exactly one JD in the workspace:
 * a file or a saved JD only *loads text into it*, it is never a second object
 * competing with the textarea (J1).
 */
export type JdSource =
  | { kind: 'paste' }
  | { kind: 'file'; fileId: string; fileName: string; detached: boolean };

export type JdFileLoadStatus = 'idle' | 'loading' | 'ready' | 'pending' | 'failed';

export type JdAiStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export type JdAiOutcomeStatus =
  | 'success'
  | 'empty'
  /** JD unchanged since the last extraction — no API call was made (J8). */
  | 'cached'
  | 'canceled'
  | 'error'
  /** Refused before any call: no JD, JD too short, or no job category yet. */
  | 'blocked'
  /** A request is already running. */
  | 'busy';

export interface JdMergeOutcome {
  addedCount: number;
  skippedDuplicateCount: number;
  skippedOverLimitCount: number;
  /** Ids added by this merge — highlight targets, and what Undo removes. */
  addedIds: string[];
  replacedCount: number;
}

export interface JdAiRequestOutcome {
  status: JdAiOutcomeStatus;
  merge?: JdMergeOutcome;
  error?: ResolvedJdError;
  reason?: 'noJobCategory' | 'noJd' | 'jdTooShort' | 'limitReached';
  message?: string;
}

export type RequirementRejection =
  | 'empty'
  | 'duplicate'
  | 'tooLong'
  | 'limit'
  | 'notFound';

export type RequirementMutationResult =
  | { ok: true; item: RequirementItem }
  | { ok: false; reason: RequirementRejection; message: string };

export interface JdAnalysisPayload {
  jdId?: string;
  jdText?: string;
  mustHave?: RequirementInput[];
  niceToHave?: RequirementInput[];
}

/** Below this the JD carries too little signal to extract from — a pure rule (J16). */
export const JD_MIN_CHARS_FOR_AI = 200;
export const JD_DRIFT_DEBOUNCE_MS = 800;
export const JD_DRIFT_MIN_RATIO = 0.9;
export const JD_DRIFT_MAX_LENGTH_DELTA = 200;

/** Stable id for a JD body — drives the "already extracted this" cache (J8). */
export function hashJdText(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  let hash = 0x811c9dc5;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${normalized.length.toString(36)}-${hash.toString(36)}`;
}

/**
 * Levenshtein distance, abandoned as soon as it passes `maxDistance`.
 * A JD can be 20k characters, so the full matrix is not an option; the band
 * plus the early exit keep the debounced drift check in the millisecond range.
 */
function boundedLevenshtein(left: string, right: string, maxDistance: number): number | null {
  if (Math.abs(left.length - right.length) > maxDistance) return null;
  const infinity = maxDistance + 1;
  let previous = new Array<number>(right.length + 1);
  let current = new Array<number>(right.length + 1);

  for (let column = 0; column <= right.length; column += 1) {
    previous[column] = column <= maxDistance ? column : infinity;
  }

  for (let row = 1; row <= left.length; row += 1) {
    const from = Math.max(1, row - maxDistance);
    const to = Math.min(right.length, row + maxDistance);
    current[0] = row <= maxDistance ? row : infinity;
    if (from > 1) current[from - 1] = infinity;
    let best = current[0];

    for (let column = from; column <= to; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      const value = Math.min(
        previous[column] + 1,
        current[column - 1] + 1,
        previous[column - 1] + cost,
      );
      current[column] = value > infinity ? infinity : value;
      if (current[column] < best) best = current[column];
    }

    if (to < right.length) current[to + 1] = infinity;
    if (best > maxDistance) return null;
    const swap = previous;
    previous = current;
    current = swap;
  }

  const distance = previous[right.length];
  return distance > maxDistance ? null : distance;
}

/** 1 = identical. Anything the bounded search cannot reach counts as changed. */
export function jdSimilarityRatio(left: string, right: string): number {
  if (left === right) return 1;
  const longest = Math.max(left.length, right.length);
  if (longest === 0) return 1;
  if (Math.abs(left.length - right.length) > JD_DRIFT_MAX_LENGTH_DELTA) return 0;
  const maxDistance = Math.min(400, Math.max(1, Math.ceil((1 - JD_DRIFT_MIN_RATIO) * longest)));
  const distance = boundedLevenshtein(left, right, maxDistance);
  if (distance === null) return 0;
  return 1 - distance / longest;
}

export function isJdChanged(baseline: string, current: string): boolean {
  if (baseline === current) return false;
  if (Math.abs(baseline.length - current.length) > JD_DRIFT_MAX_LENGTH_DELTA) return true;
  return jdSimilarityRatio(baseline, current) < JD_DRIFT_MIN_RATIO;
}

/**
 * The one place that decides *which* JD reference travels with a request.
 *
 * I5 — once the text has been edited away from the file (`detached`), the file
 * no longer describes what the user sees, so only `jdText` may be sent.
 */
export function resolveJdReference(
  source: JdSource,
  jdText: string,
): { jdId?: string; jdText?: string } | null {
  if (source.kind === 'file' && !source.detached) return { jdId: source.fileId };
  const trimmed = jdText.trim();
  return trimmed ? { jdText: trimmed } : null;
}

export interface UseJdWorkspaceOptions {
  /** API `jobCategory` enum (FE/BE/BA) — required by `/jd-requirements`. */
  jobCategory?: string | null;
}

export interface JdWorkspace {
  // ----- JD source (single source of truth) -----
  jdText: string;
  setJdText: (next: string) => void;
  source: JdSource;
  /** True when a JD file or pasted text is present. */
  hasJd: boolean;
  jdLength: number;
  /** JD present but shorter than `JD_MIN_CHARS_FOR_AI` (never blocks "Tiếp tục"). */
  isJdTooShortForAi: boolean;
  /** Load a JD file / saved JD into the textarea. Resolves with the load state. */
  loadJdFile: (file: { id: string; name: string }) => Promise<JdFileLoadStatus>;
  /** Re-read the parsed text of the attached file (202 pending → poll again). */
  reloadJdFile: () => Promise<JdFileLoadStatus>;
  fileLoadStatus: JdFileLoadStatus;
  fileLoadError: string | null;
  /** Detach the file and keep the text the user can already see. */
  detachJdFile: () => void;
  /** Empty the JD (text + file). Requirements are untouched — the user owns them. */
  clearJd: () => void;

  // ----- Requirements (one list, owned by the user) -----
  requirements: RequirementItem[];
  mustHave: RequirementItem[];
  niceToHave: RequirementItem[];
  requirementCount: number;
  isAtRequirementLimit: boolean;
  maxRequirements: number;
  maxRequirementChars: number;
  addRequirement: (text: string, group: RequirementGroup) => RequirementMutationResult;
  updateRequirementText: (id: string, text: string) => RequirementMutationResult;
  moveRequirement: (id: string, group: RequirementGroup) => RequirementMutationResult;
  removeRequirement: (id: string) => RequirementMutationResult;
  /**
   * Replace the whole list (bulk edit / draft hydration). Guarded: blanks and
   * over-long rows are dropped, duplicates collapse, and the cap still applies.
   */
  replaceRequirements: (items: RequirementItem[]) => void;
  /** Restore the last removed row at its original position (toast Undo). */
  undoRemove: () => boolean;
  canUndoRemove: boolean;
  lastRemoved: RequirementItem | null;
  clearRequirements: () => void;

  // ----- AI extraction -----
  aiStatus: JdAiStatus;
  aiError: ResolvedJdError | null;
  aiRetryAfterSeconds: number | null;
  /** Result of the most recent merge — feeds the "Đã thêm N…" strip. */
  lastMerge: JdMergeOutcome | null;
  dismissMergeOutcome: () => void;
  canRequestAi: boolean;
  requestAiSuggestions: (options?: { force?: boolean }) => Promise<JdAiRequestOutcome>;
  cancelAiRequest: () => void;
  /** Remove exactly the rows the last merge added / changed. */
  undoLastMerge: () => boolean;
  canUndoMerge: boolean;

  // ----- JD drift after suggestions exist -----
  isJdChangedSinceAi: boolean;
  /** Drop untouched AI rows (100% of the user's rows stay) and extract again. */
  refreshFromChangedJd: () => Promise<JdAiRequestOutcome>;
  keepRequirementsAfterJdChange: () => void;

  // ----- Output -----
  buildAnalysisPayload: () => JdAnalysisPayload;
  reset: () => void;
}

export function useJdWorkspace(options: UseJdWorkspaceOptions = {}): JdWorkspace {
  const { t } = useLanguage();

  const [jdText, setJdTextState] = useState('');
  const [source, setSource] = useState<JdSource>({ kind: 'paste' });
  const [requirements, setRequirementsState] = useState<RequirementItem[]>([]);
  const [fileLoadStatus, setFileLoadStatus] = useState<JdFileLoadStatus>('idle');
  const [fileLoadError, setFileLoadError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<JdAiStatus>('idle');
  const [aiError, setAiError] = useState<ResolvedJdError | null>(null);
  const [lastMerge, setLastMerge] = useState<JdMergeOutcome | null>(null);
  const [lastRemoved, setLastRemoved] = useState<RequirementItem | null>(null);
  const [isJdChangedSinceAi, setIsJdChangedSinceAi] = useState(false);

  const jdTextRef = useRef(jdText);
  const sourceRef = useRef(source);
  const requirementsRef = useRef(requirements);
  const jobCategoryRef = useRef(options.jobCategory ?? null);
  const loadedFileTextRef = useRef('');
  const lastExtractedHashRef = useRef<string | null>(null);
  const aiBaselineRef = useRef('');
  const abortRef = useRef<AbortController | null>(null);
  const aiRunningRef = useRef(false);
  const fileGenerationRef = useRef(0);
  const removedRef = useRef<{ item: RequirementItem; index: number } | null>(null);
  const mergeUndoRef = useRef<{
    addedIds: string[];
    replaced: Array<{ id: string; previous: RequirementItem }>;
  } | null>(null);

  jobCategoryRef.current = options.jobCategory ?? null;

  const applyRequirements = useCallback((next: RequirementItem[]) => {
    requirementsRef.current = next;
    setRequirementsState(next);
  }, []);

  const applyJdText = useCallback((next: string) => {
    jdTextRef.current = next;
    setJdTextState(next);
  }, []);

  const applySource = useCallback((next: JdSource) => {
    sourceRef.current = next;
    setSource(next);
  }, []);

  const setJdText = useCallback(
    (next: string) => {
      applyJdText(next);
      const current = sourceRef.current;
      if (current.kind !== 'file') return;
      const detached = next !== loadedFileTextRef.current;
      if (current.detached !== detached) applySource({ ...current, detached });
    },
    [applyJdText, applySource],
  );

  const readParsedTextInto = useCallback(
    async (fileId: string): Promise<JdFileLoadStatus> => {
      const generation = ++fileGenerationRef.current;
      setFileLoadStatus('loading');
      setFileLoadError(null);
      try {
        const result = await cvAnalysisService.readParsedText(fileId);
        if (generation !== fileGenerationRef.current) return 'idle';
        if (result.status === 'pending') {
          setFileLoadStatus('pending');
          return 'pending';
        }
        if (result.status === 'failed') {
          setFileLoadStatus('failed');
          setFileLoadError(t('cv.jd.parseFailed'));
          return 'failed';
        }
        loadedFileTextRef.current = result.parsedText;
        applyJdText(result.parsedText);
        const current = sourceRef.current;
        if (current.kind === 'file' && current.fileId === fileId) {
          applySource({ ...current, detached: false });
        }
        setFileLoadStatus('ready');
        return 'ready';
      } catch (error) {
        if (generation !== fileGenerationRef.current) return 'idle';
        setFileLoadStatus('failed');
        setFileLoadError(resolveJdError(error, 'uploadJd', t).message);
        return 'failed';
      }
    },
    [applyJdText, applySource, t],
  );

  const loadJdFile = useCallback(
    async (file: { id: string; name: string }) => {
      loadedFileTextRef.current = '';
      applySource({ kind: 'file', fileId: file.id, fileName: file.name, detached: false });
      return readParsedTextInto(file.id);
    },
    [applySource, readParsedTextInto],
  );

  const reloadJdFile = useCallback(async () => {
    const current = sourceRef.current;
    if (current.kind !== 'file') return 'idle' as JdFileLoadStatus;
    return readParsedTextInto(current.fileId);
  }, [readParsedTextInto]);

  const detachJdFile = useCallback(() => {
    const current = sourceRef.current;
    if (current.kind !== 'file') return;
    applySource({ ...current, detached: true });
  }, [applySource]);

  const clearJd = useCallback(() => {
    fileGenerationRef.current += 1;
    loadedFileTextRef.current = '';
    applyJdText('');
    applySource({ kind: 'paste' });
    setFileLoadStatus('idle');
    setFileLoadError(null);
    lastExtractedHashRef.current = null;
    aiBaselineRef.current = '';
    setIsJdChangedSinceAi(false);
    setAiStatus('idle');
    setAiError(null);
  }, [applyJdText, applySource]);

  // ----- requirement CRUD -----

  const reject = useCallback(
    (reason: RequirementRejection): RequirementMutationResult => ({
      ok: false,
      reason,
      message: t(`cv.jd.requirement.${reason}`),
    }),
    [t],
  );

  const addRequirement = useCallback(
    (text: string, group: RequirementGroup): RequirementMutationResult => {
      const trimmed = text.trim();
      if (!trimmed) return reject('empty');
      if (trimmed.length > CV_REQUIREMENT_MAX_CHARS) return reject('tooLong');
      const items = requirementsRef.current;
      if (items.length >= CV_ANALYSIS_MAX_REQUIREMENTS) return reject('limit');
      if (findDuplicateRequirement(items, trimmed)) return reject('duplicate');

      const item: RequirementItem = {
        id: createRequirementId(),
        text: trimmed,
        group,
        origin: 'user',
        jdQuote: null,
      };
      applyRequirements([...items, item]);
      return { ok: true, item };
    },
    [applyRequirements, reject],
  );

  const updateRequirementText = useCallback(
    (id: string, text: string): RequirementMutationResult => {
      const trimmed = text.trim();
      if (!trimmed) return reject('empty');
      if (trimmed.length > CV_REQUIREMENT_MAX_CHARS) return reject('tooLong');
      const items = requirementsRef.current;
      const index = items.findIndex((entry) => entry.id === id);
      if (index < 0) return reject('notFound');
      if (findDuplicateRequirement(items, trimmed, id)) return reject('duplicate');

      const previous = items[index];
      const changed = previous.text !== trimmed;
      // I4 — an edited suggestion becomes the user's row for good; a later AI
      // run treats it as owned text and never rewrites or drops it.
      const next: RequirementItem = changed
        ? { ...previous, text: trimmed, origin: 'user', jdQuote: null }
        : previous;
      const items2 = [...items];
      items2[index] = next;
      applyRequirements(items2);
      return { ok: true, item: next };
    },
    [applyRequirements, reject],
  );

  const moveRequirement = useCallback(
    (id: string, group: RequirementGroup): RequirementMutationResult => {
      const items = requirementsRef.current;
      const index = items.findIndex((entry) => entry.id === id);
      if (index < 0) return reject('notFound');
      // Re-grouping is an ownership signal too: keep the JD quote (the text did
      // not change) but stop treating the row as disposable AI output.
      const next: RequirementItem = { ...items[index], group, origin: 'user' };
      const updated = [...items];
      updated[index] = next;
      applyRequirements(updated);
      return { ok: true, item: next };
    },
    [applyRequirements, reject],
  );

  const removeRequirement = useCallback(
    (id: string): RequirementMutationResult => {
      const items = requirementsRef.current;
      const index = items.findIndex((entry) => entry.id === id);
      if (index < 0) return reject('notFound');
      const item = items[index];
      removedRef.current = { item, index };
      setLastRemoved(item);
      applyRequirements(items.filter((entry) => entry.id !== id));
      return { ok: true, item };
    },
    [applyRequirements, reject],
  );

  const replaceRequirements = useCallback(
    (items: RequirementItem[]) => {
      const seen = new Set<string>();
      const next: RequirementItem[] = [];
      for (const item of items) {
        const text = item.text.trim();
        if (!text || text.length > CV_REQUIREMENT_MAX_CHARS) continue;
        const key = normalizeRequirementKey(text);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        next.push({ ...item, text });
        if (next.length >= CV_ANALYSIS_MAX_REQUIREMENTS) break;
      }
      applyRequirements(next);
    },
    [applyRequirements],
  );

  const undoRemove = useCallback(() => {
    const removed = removedRef.current;
    if (!removed) return false;
    const items = requirementsRef.current;
    if (items.length >= CV_ANALYSIS_MAX_REQUIREMENTS) return false;
    if (items.some((entry) => entry.id === removed.item.id)) return false;
    const restored = [...items];
    restored.splice(Math.min(removed.index, restored.length), 0, removed.item);
    applyRequirements(restored);
    removedRef.current = null;
    setLastRemoved(null);
    return true;
  }, [applyRequirements]);

  const clearRequirements = useCallback(() => {
    applyRequirements([]);
    removedRef.current = null;
    mergeUndoRef.current = null;
    setLastRemoved(null);
    setLastMerge(null);
  }, [applyRequirements]);

  // ----- AI extraction -----

  const cancelAiRequest = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const blocked = useCallback(
    (reason: NonNullable<JdAiRequestOutcome['reason']>): JdAiRequestOutcome => ({
      status: 'blocked',
      reason,
      message: t(`cv.jd.ai.${reason}`),
    }),
    [t],
  );

  const requestAiSuggestions = useCallback(
    async (requestOptions: { force?: boolean } = {}): Promise<JdAiRequestOutcome> => {
      if (aiRunningRef.current) return { status: 'busy' };

      const jobCategory = jobCategoryRef.current;
      if (!jobCategory) return blocked('noJobCategory');

      const currentText = jdTextRef.current;
      const reference = resolveJdReference(sourceRef.current, currentText);
      if (!reference) return blocked('noJd');

      const trimmed = currentText.trim();
      if (trimmed.length > 0 && trimmed.length < JD_MIN_CHARS_FOR_AI) return blocked('jdTooShort');
      if (requirementsRef.current.length >= CV_ANALYSIS_MAX_REQUIREMENTS) {
        return blocked('limitReached');
      }

      // J8 — the real rate limit is 5 calls / 10 minutes. Re-pressing the button
      // on an unchanged JD must not spend one of them.
      const hash = hashJdText(trimmed || reference.jdId || '');
      if (!requestOptions.force && lastExtractedHashRef.current === hash) {
        return { status: 'cached' };
      }

      const controller = new AbortController();
      abortRef.current = controller;
      aiRunningRef.current = true;
      setAiStatus('loading');
      setAiError(null);
      setLastMerge(null);

      // Belt and braces: axios has its own timeout, this one also covers a
      // client stuck before the request leaves. Both must read as "timeout",
      // never as the silent "user canceled".
      let timedOut = false;
      const timeoutHandle = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, JD_REQUIREMENTS_TIMEOUT_MS);

      try {
        const response = await cvAnalysisService.getJdRequirements(
          { jdId: reference.jdId ?? null, jdText: reference.jdText ?? null, jobCategory },
          { signal: controller.signal, timeoutMs: JD_REQUIREMENTS_TIMEOUT_MS },
        );

        lastExtractedHashRef.current = hash;
        aiBaselineRef.current = jdTextRef.current;
        setIsJdChangedSinceAi(false);

        const incoming: RequirementSuggestion[] = [
          ...response.mustHave.map((entry) => ({
            text: entry.text,
            group: 'must' as const,
            jdQuote: entry.jdQuote,
          })),
          ...response.niceToHave.map((entry) => ({
            text: entry.text,
            group: 'nice' as const,
            jdQuote: entry.jdQuote,
          })),
        ];

        if (incoming.length === 0) {
          setAiStatus('empty');
          return { status: 'empty' };
        }

        const result = mergeRequirementSuggestions({
          existing: requirementsRef.current,
          incoming,
          sourceJdHash: hash,
        });
        applyRequirements(result.items);
        mergeUndoRef.current = { addedIds: result.addedIds, replaced: result.replaced };

        const outcome: JdMergeOutcome = {
          addedCount: result.addedCount,
          skippedDuplicateCount: result.skippedDuplicateCount + result.skippedInvalidCount,
          skippedOverLimitCount: result.skippedOverLimitCount,
          addedIds: result.addedIds,
          replacedCount: result.replacedCount,
        };
        setLastMerge(outcome);
        setAiStatus('success');
        return { status: 'success', merge: outcome };
      } catch (error) {
        if (error instanceof CvAnalysisError && error.code === 'canceled' && !timedOut) {
          setAiStatus('idle');
          return { status: 'canceled' };
        }
        const failure =
          timedOut && error instanceof CvAnalysisError && error.code === 'canceled'
            ? new CvAnalysisError('timeout', 'Request timed out.')
            : error;
        const resolved = resolveJdError(failure, 'extractRequirements', t);
        setAiError(resolved);
        setAiStatus('error');
        return { status: 'error', error: resolved };
      } finally {
        clearTimeout(timeoutHandle);
        aiRunningRef.current = false;
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [applyRequirements, blocked, t],
  );

  const undoLastMerge = useCallback(() => {
    const undo = mergeUndoRef.current;
    if (!undo) return false;
    const addedIds = new Set(undo.addedIds);
    const restored = new Map(undo.replaced.map((entry) => [entry.id, entry.previous]));
    const next = requirementsRef.current
      .filter((item) => !addedIds.has(item.id))
      .map((item) => restored.get(item.id) ?? item);
    applyRequirements(next);
    mergeUndoRef.current = null;
    setLastMerge(null);
    return true;
  }, [applyRequirements]);

  const dismissMergeOutcome = useCallback(() => {
    setLastMerge(null);
  }, []);

  // ----- JD drift -----

  useEffect(() => {
    if (!lastExtractedHashRef.current) return;
    const handle = setTimeout(() => {
      setIsJdChangedSinceAi(isJdChanged(aiBaselineRef.current, jdTextRef.current));
    }, JD_DRIFT_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [jdText]);

  const refreshFromChangedJd = useCallback(async () => {
    // Untouched AI rows go; everything the user typed, edited or re-grouped
    // stays, because those rows carry origin 'user'.
    applyRequirements(requirementsRef.current.filter((item) => item.origin !== 'ai'));
    mergeUndoRef.current = null;
    setLastMerge(null);
    setIsJdChangedSinceAi(false);
    return requestAiSuggestions({ force: true });
  }, [applyRequirements, requestAiSuggestions]);

  const keepRequirementsAfterJdChange = useCallback(() => {
    aiBaselineRef.current = jdTextRef.current;
    setIsJdChangedSinceAi(false);
  }, []);

  // ----- output -----

  const buildAnalysisPayload = useCallback((): JdAnalysisPayload => {
    const payload: JdAnalysisPayload = {};
    const reference = resolveJdReference(sourceRef.current, jdTextRef.current);
    if (reference?.jdId) payload.jdId = reference.jdId;
    else if (reference?.jdText) payload.jdText = reference.jdText;

    const { mustHave, niceToHave } = splitRequirementInputs(requirementsRef.current);
    // I1 — an empty array switches the backend into requirement mode with zero
    // requirements: blank report, 1 credit gone. Omit both keys instead.
    if (mustHave.length + niceToHave.length > 0) {
      payload.mustHave = mustHave;
      payload.niceToHave = niceToHave;
    }
    return payload;
  }, []);

  const reset = useCallback(() => {
    cancelAiRequest();
    fileGenerationRef.current += 1;
    loadedFileTextRef.current = '';
    lastExtractedHashRef.current = null;
    aiBaselineRef.current = '';
    removedRef.current = null;
    mergeUndoRef.current = null;
    applyJdText('');
    applySource({ kind: 'paste' });
    applyRequirements([]);
    setFileLoadStatus('idle');
    setFileLoadError(null);
    setAiStatus('idle');
    setAiError(null);
    setLastMerge(null);
    setLastRemoved(null);
    setIsJdChangedSinceAi(false);
  }, [applyJdText, applyRequirements, applySource, cancelAiRequest]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const trimmedLength = jdText.trim().length;
  const hasJd = trimmedLength > 0 || (source.kind === 'file' && !source.detached);
  const mustHave = useMemo(
    () => requirements.filter((item) => item.group === 'must'),
    [requirements],
  );
  const niceToHave = useMemo(
    () => requirements.filter((item) => item.group === 'nice'),
    [requirements],
  );

  return {
    jdText,
    setJdText,
    source,
    hasJd,
    jdLength: trimmedLength,
    isJdTooShortForAi: trimmedLength > 0 && trimmedLength < JD_MIN_CHARS_FOR_AI,
    loadJdFile,
    reloadJdFile,
    fileLoadStatus,
    fileLoadError,
    detachJdFile,
    clearJd,

    requirements,
    mustHave,
    niceToHave,
    requirementCount: requirements.length,
    isAtRequirementLimit: requirements.length >= CV_ANALYSIS_MAX_REQUIREMENTS,
    maxRequirements: CV_ANALYSIS_MAX_REQUIREMENTS,
    maxRequirementChars: CV_REQUIREMENT_MAX_CHARS,
    addRequirement,
    updateRequirementText,
    moveRequirement,
    removeRequirement,
    replaceRequirements,
    undoRemove,
    canUndoRemove: lastRemoved !== null,
    lastRemoved,
    clearRequirements,

    aiStatus,
    aiError,
    aiRetryAfterSeconds: aiError?.retryAfterSeconds ?? null,
    lastMerge,
    dismissMergeOutcome,
    canRequestAi:
      Boolean(options.jobCategory) &&
      hasJd &&
      !(trimmedLength > 0 && trimmedLength < JD_MIN_CHARS_FOR_AI) &&
      requirements.length < CV_ANALYSIS_MAX_REQUIREMENTS &&
      aiStatus !== 'loading',
    requestAiSuggestions,
    cancelAiRequest,
    undoLastMerge,
    canUndoMerge: lastMerge !== null,

    isJdChangedSinceAi,
    refreshFromChangedJd,
    keepRequirementsAfterJdChange,

    buildAnalysisPayload,
    reset,
  };
}
