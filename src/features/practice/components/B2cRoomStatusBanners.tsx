import { useLanguage } from '@/shared/languages';

interface B2cRoomStatusBannersProps {
  deviceDenied: boolean;
  onRetryDevice: () => void;
  speechWarning: string | null;
  answerError: string | null;
  hideAnswerError: boolean;
}

/** Extracted from `B2cPracticeInterviewRoom` to stay under the 250-line UI file cap. */
export function B2cRoomStatusBanners({
  deviceDenied,
  onRetryDevice,
  speechWarning,
  answerError,
  hideAnswerError,
}: B2cRoomStatusBannersProps) {
  const { t } = useLanguage();

  return (
    <>
      {deviceDenied ? (
        <div role="alert" className="border-b border-error/30 bg-error/10 px-6 py-2 text-sm text-error">
          {t('practice.flow.device.denied')}
          <button type="button" className="ml-3 underline underline-offset-2" onClick={onRetryDevice}>
            {t('practice.flow.device.retry')}
          </button>
        </div>
      ) : null}
      {speechWarning ? (
        <div role="status" className="border-b border-warning/30 bg-warning/10 px-6 py-2 text-sm text-warning">
          {t(speechWarning)}
        </div>
      ) : null}
      {answerError && !hideAnswerError ? (
        <div role="alert" className="border-b border-error/30 bg-error/10 px-6 py-2 text-sm text-error">
          {t(answerError)}
        </div>
      ) : null}
    </>
  );
}
