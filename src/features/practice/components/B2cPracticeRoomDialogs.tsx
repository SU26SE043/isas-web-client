import { getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { AudioRecorderModal } from './audio-recorder/AudioRecorderModal';
import { B2cPracticeRoomModals } from './B2cPracticeRoomModals';
import { mapSubmitPracticeAnswerErrorKey } from '../utils/b2cPracticeSessionErrors';
import type { AudioRecorderStatus } from '../types/audioRecorder.types';
import type { useB2cPracticeRoom } from '../hooks/useB2cPracticeRoom';

type PracticeRoomApi = ReturnType<typeof useB2cPracticeRoom>;

interface B2cPracticeRoomDialogsProps {
  room: PracticeRoomApi;
  sessionId: string;
  recorderOpen: boolean;
  onRecorderOpenChange: (open: boolean) => void;
  onRecorderStatusChange: (status: AudioRecorderStatus) => void;
  autoSubmitRequestId: number;
}

export function B2cPracticeRoomDialogs({
  room,
  sessionId,
  recorderOpen,
  onRecorderOpenChange,
  onRecorderStatusChange,
  autoSubmitRequestId,
}: B2cPracticeRoomDialogsProps) {
  const { t } = useLanguage();
  const questionLabel = t('practice.room.questionOf')
    .replace('{current}', String(room.currentIndex + 1))
    .replace('{total}', String(Math.max(room.questions.length, 1)));

  return (
    <>
      {room.currentQuestion ? (
        <AudioRecorderModal
          open={recorderOpen}
          onOpenChange={onRecorderOpenChange}
          sessionId={sessionId}
          questionId={room.currentQuestion.id}
          questionContent={room.currentQuestion.content}
          questionLabel={questionLabel}
          maxDurationSeconds={Math.max(
            1,
            Math.min(
              room.remainingSeconds || room.currentQuestion.timeLimitSec || 120,
              room.currentQuestion.timeLimitSec || room.remainingSeconds || 120,
            ),
          )}
          sharedStream={room.media.stream}
          disabled={room.speech.isBusy || room.isTimingOut || room.remainingSeconds <= 0}
          paused={room.isTimingOut}
          onStatusChange={onRecorderStatusChange}
          onSubmitRecording={(file, durationSec) => room.submitAnswerWithFile(file, durationSec)}
          onAutoSubmitRecording={(file, durationSec) =>
            room.submitAnswerWithFile(file, durationSec, { allowDuringTimeout: true })
          }
          autoSubmitRequestId={autoSubmitRequestId}
          onAutoSubmitEmpty={room.submitEmptyAnswer}
          mapSubmitErrorKey={(error) => mapSubmitPracticeAnswerErrorKey(getApiStatusCode(error))}
        />
      ) : null}

      <B2cPracticeRoomModals
        finishOpen={room.finishOpen}
        isSubmittingSession={room.isSubmittingSession}
        submittedCount={room.submittedCount}
        unansweredCount={room.unansweredCount}
        hasPendingRecording={room.hasPendingRecording}
        onCloseFinish={() => room.setFinishOpen(false)}
        onConfirmFinish={() => void room.confirmFinish()}
        overwriteConfirmOpen={room.overwriteConfirmOpen}
        onCloseOverwrite={() => room.setOverwriteConfirmOpen(false)}
        onConfirmOverwrite={room.confirmOverwriteSubmit}
        retryConfirmOpen={room.retryConfirmOpen}
        onCloseRetry={() => room.setRetryConfirmOpen(false)}
        onConfirmRetry={room.confirmRetryRecording}
      />
    </>
  );
}
