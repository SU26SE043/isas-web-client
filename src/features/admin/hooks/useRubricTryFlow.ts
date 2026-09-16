import { useCallback, useState } from 'react';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { adminRubricService } from '../services/adminRubric.service';
import type {
  AdminDeliveryMetrics,
  AdminRubricJobCategory,
  AdminRubricLanguage,
  AdminRubricPreviewRequest,
  AdminRubricPreviewRun,
} from '../types/adminApi.types';

export type RubricTryMode = 'voice' | 'paste';

/** Phần câu hỏi/cấp độ do panel chọn; hook chỉ lo BÀI của người dùng. */
export type RubricTryQuestionInput = Pick<AdminRubricPreviewRequest, 'question' | 'sampleQuestionId' | 'seniority'>;

interface UseRubricTryFlowArgs {
  category: AdminRubricJobCategory;
  language: AdminRubricLanguage;
  preview: UseMutationResult<AdminRubricPreviewRun, unknown, AdminRubricPreviewRequest>;
}

/**
 * Luồng "tự thử thước đo": người dùng NÓI (mic → chép lời → sửa) hoặc DÁN bài, rồi chấm bằng đúng
 * bộ chấm thật. Bất biến do UX chốt (2026-09-16):
 * - Không có đường nào bấm Chấm trước khi THẤY bản chép lời — chấm trên bản chép sai là chấm oan.
 * - Số đo cách nói CHỈ đi kèm khi bài đến từ bản ghi âm; dán tay ⇒ không có số đo ⇒ BE không chấm
 *   tiêu chí trôi chảy (UI nói rõ, không để ai tưởng mình 0 điểm).
 * - 3 bài AI là tuỳ chọn TẮT mặc định — bật mới tốn 3 lượt Gemini + 30–60s.
 */
export function useRubricTryFlow({ category, language, preview }: UseRubricTryFlowArgs) {
  const [mode, setMode] = useState<RubricTryMode>('voice');
  const [answerText, setAnswerText] = useState('');
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AdminDeliveryMetrics | null>(null);
  const [noSpeech, setNoSpeech] = useState(false);
  const [includeAiSamples, setIncludeAiSamples] = useState(false);

  const transcribe = useMutation({
    mutationFn: (file: File) => adminRubricService.transcribeForPreview(category, language, file, file.name),
    onSuccess: (result) => {
      setTranscribedText(result.transcript);
      setAnswerText(result.transcript);
      setMetrics(result.deliveryMetrics);
      setNoSpeech(result.noSpeech);
    },
  });

  /** Bỏ bài hiện tại (ghi lại / đổi câu hỏi / đổi chế độ). */
  const resetAnswer = useCallback(() => {
    setAnswerText('');
    setTranscribedText(null);
    setMetrics(null);
    setNoSpeech(false);
    transcribe.reset();
  }, [transcribe]);

  const switchMode = useCallback((next: RubricTryMode) => {
    setMode(next);
    resetAnswer();
  }, [resetAnswer]);

  const hasAnswer = answerText.trim().length > 0 || transcribedText !== null || transcribe.isPending;
  // Số đo chỉ hợp lệ khi bài vẫn là bài NÓI; đã chuyển sang dán thì bản ghi không còn nói về bài này.
  const hasAudioMetrics = mode === 'voice' && metrics !== null;
  const transcriptEdited = transcribedText !== null && answerText !== transcribedText;
  const canGrade = answerText.trim().length > 0 && !noSpeech && !preview.isPending && !transcribe.isPending;

  const grade = useCallback((questionInput: RubricTryQuestionInput, onSuccess?: () => void) => {
    const input: AdminRubricPreviewRequest = {
      ...questionInput,
      customAnswer: answerText.trim(),
      includeAiSamples,
      ...(hasAudioMetrics ? { deliveryMetrics: metrics } : {}),
    };
    preview.mutate(input, { onSuccess });
  }, [answerText, includeAiSamples, hasAudioMetrics, metrics, preview]);

  return {
    mode, switchMode,
    answerText, setAnswerText,
    transcribedText, transcriptEdited,
    metrics, hasAudioMetrics, noSpeech,
    includeAiSamples, setIncludeAiSamples,
    transcribe, resetAnswer,
    hasAnswer, canGrade, grade,
  };
}

export type RubricTryFlow = ReturnType<typeof useRubricTryFlow>;
