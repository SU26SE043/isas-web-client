import { B2cPracticeRoomModals } from './B2cPracticeRoomModals';
import type { useB2cPracticeRoom } from '../hooks/useB2cPracticeRoom';

type PracticeRoomApi = ReturnType<typeof useB2cPracticeRoom>;

interface B2cPracticeRoomDialogsProps {
  room: PracticeRoomApi;
  hasPendingRecording?: boolean;
  onConfirmFinish: () => void;
  earlyFinish?: boolean;
}

export function B2cPracticeRoomDialogs({
  room,
  hasPendingRecording,
  onConfirmFinish,
  earlyFinish = false,
}: B2cPracticeRoomDialogsProps) {
  return (
    <B2cPracticeRoomModals
        finishOpen={room.finishOpen}
        isSubmittingSession={room.isSubmittingSession}
        submittedCount={room.submittedCount}
        unansweredCount={room.unansweredCount}
        hasPendingRecording={hasPendingRecording ?? room.hasPendingRecording}
        onCloseFinish={() => room.setFinishOpen(false)}
        onConfirmFinish={onConfirmFinish}
        overwriteConfirmOpen={room.overwriteConfirmOpen}
        onCloseOverwrite={() => room.setOverwriteConfirmOpen(false)}
        onConfirmOverwrite={room.confirmOverwriteSubmit}
        retryConfirmOpen={room.retryConfirmOpen}
        onCloseRetry={() => room.setRetryConfirmOpen(false)}
        onConfirmRetry={room.confirmRetryRecording}
        earlyFinish={earlyFinish && !room.interviewComplete}
        answeredCount={room.submittedCount}
        totalCount={room.questions.length}
        remainingCount={room.unansweredCount}
    />
  );
}
