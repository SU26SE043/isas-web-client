import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InterviewPrepPage } from '@/features/practice/pages/InterviewPrepPage';
import { readCampaignInterviewSession } from '../utils/campaignInterviewSession';

/**
 * Campaign-only routing adapter. All preparation visuals and device behavior
 * remain in the B2C-owned InterviewPrepPage and DeviceCheckStep.
 */
export function CampaignInterviewPreparationPage() {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();

  // Sau bước kiểm thiết bị (đã có ô đồng ý ghi hình/giám sát ở bước chuẩn bị): campaign bật xác minh
  // khuôn mặt ⇒ trang enroll THẬT (ảnh mốc lên server, `CampaignFaceEnrollPage`); không bật ⇒ vào thẳng
  // phòng. Trước đây nhánh không-bật rẽ sang luồng B2C `/terms` → `/identity` — trang "Xác minh danh
  // tính" chụp một tấm ảnh chỉ nằm trong store, không lên server, không đối chiếu với ai, trong khi
  // trang điều khoản khẳng định "đối chiếu khuôn mặt" cho một campaign đã tắt tính năng đó (đo trên dev
  // 2026-09-12: harness thấy 5 bước thay vì 3). Nhánh có-bật vốn đã bỏ qua hai trang này.
  const handleCampaignDeviceReady = useCallback(
    (readySessionId: string) => {
      const campaignSession = readCampaignInterviewSession(readySessionId);
      const campaignId = campaignSession?.campaignId ?? '';
      const target = campaignSession?.faceEnrollRequired
        ? `/candidate/campaigns/${encodeURIComponent(campaignId)}/face-enroll/${encodeURIComponent(readySessionId)}`
        : `/candidate/campaigns/${encodeURIComponent(campaignId)}/interview/${encodeURIComponent(readySessionId)}`;
      navigate(target, { replace: true });
    },
    [navigate],
  );

  return sessionId && readCampaignInterviewSession(sessionId) ? (
    <InterviewPrepPage onCampaignDeviceReady={handleCampaignDeviceReady} />
  ) : (
    <InterviewPrepPage />
  );
}
