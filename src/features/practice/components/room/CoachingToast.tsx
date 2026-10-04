import { AppWindow, CameraOff, ScanFace, Users, type LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CoachingNoticeKind } from '../../hooks/useB2cCoachingNotices';

const ICON: Record<CoachingNoticeKind, LucideIcon> = {
  tab_switch: AppWindow,
  focus_lost: AppWindow,
  no_face: ScanFace,
  multiple_faces: Users,
  low_light: CameraOff,
};

/**
 * Khung toast coaching: viền + ô icon màu CẢNH BÁO (cam — cùng tông mục "Mất tập trung" ở màn kết quả), không đỏ:
 * đây là lời nhắc, không phải lỗi hay chống gian lận. Trước 2026-10-04 chỉ là một dòng chữ xám trên nền trắng,
 * không icon ⇒ lẫn vào giao diện, người luyện lướt qua không biết chuyện gì vừa xảy ra.
 */
const COACHING_TOAST_CLASS = 'surface-elevated w-[360px] max-w-[calc(100vw-2rem)] border border-warning/40 shadow-lg';

function CoachingToastIcon({ kind }: { kind: CoachingNoticeKind }) {
  const Icon = ICON[kind];
  return (
    <span className="grid size-9 shrink-0 place-items-center self-start rounded-full bg-warning text-white shadow-sm ring-4 ring-warning/15">
      <Icon className="size-[18px]" aria-hidden />
    </span>
  );
}

export function CoachingToastContent({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-w-0 text-left">
      <p className="text-sm font-semibold leading-snug text-foreground">{title}</p>
      <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{message}</p>
    </div>
  );
}

/** Một toast cho mỗi LOẠI (`id` cố định) — loại đó hiện lại thì thay toast cũ chứ không chồng thêm. */
export function showCoachingToast(kind: CoachingNoticeKind, t: (key: string) => string) {
  toast(
    <CoachingToastContent
      title={t(`practice.room.focusTracking.title.${kind}`)}
      message={t(`practice.room.focusTracking.${kind}`)}
    />,
    {
      id: `practice-coach-${kind}`,
      icon: <CoachingToastIcon kind={kind} />,
      className: COACHING_TOAST_CLASS,
      // Hai dòng (tiêu đề + lời khuyên) cần lâu hơn mặc định 4s để kịp đọc giữa lúc đang trả lời.
      duration: 5000,
      style: { padding: '12px 14px', maxWidth: 'calc(100vw - 2rem)' },
    },
  );
}
