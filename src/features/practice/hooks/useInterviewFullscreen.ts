import { useCallback, useEffect, useRef, useState } from 'react';
import { resumeSpeechAudioContext } from '../utils/interviewerSpeechBus';

export interface FullscreenRequestResult {
  supported: boolean;
  entered: boolean;
}

export async function requestInterviewFullscreen(): Promise<FullscreenRequestResult> {
  if (typeof document === 'undefined') return { supported: false, entered: false };
  // Gọi ngay trong click handler để Web Audio nhận user activation trước khi
  // route/countdown làm mất gesture. Lỗi resume không được chặn fullscreen.
  const audioResume = resumeSpeechAudioContext();
  if (document.fullscreenElement) {
    await audioResume;
    return { supported: true, entered: true };
  }

  const requestFullscreen = document.documentElement.requestFullscreen;
  if (!requestFullscreen) {
    await audioResume;
    return { supported: false, entered: false };
  }

  try {
    await Promise.all([audioResume, requestFullscreen.call(document.documentElement)]);
    return { supported: true, entered: Boolean(document.fullscreenElement) };
  } catch {
    return { supported: true, entered: false };
  }
}

// Lượt thoát fullscreen do CHÍNH ta gọi, không phải người dùng bấm Esc.
//
// Cờ ở tầng module chứ không phải ref của hook, vì hai đầu của nó nằm ở hai lần mount KHÁC NHAU:
// `exitInterviewFullscreen` chạy trong cleanup của lần mount cũ, còn `fullscreenchange` lại rơi vào
// listener của lần mount mới. Ref theo từng instance thì không bắc được qua ranh giới đó.
let selfInitiatedExit = false;

export async function exitInterviewFullscreen(): Promise<void> {
  if (typeof document === 'undefined' || !document.fullscreenElement || !document.exitFullscreen) return;
  selfInitiatedExit = true;
  try {
    await document.exitFullscreen();
  } catch {
    // The browser can reject exit while the document is already unloading.
    selfInitiatedExit = false;
  }
}

export function useInterviewFullscreen({ cleanup = true } = {}) {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== 'undefined' && Boolean(document.fullscreenElement),
  );
  const [hasExitedFullscreen, setHasExitedFullscreen] = useState(false);
  const wasFullscreenRef = useRef(isFullscreen);
  const pendingExitRef = useRef<number | null>(null);
  const supported = typeof document !== 'undefined' && Boolean(document.documentElement.requestFullscreen);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      const wasFullscreen = wasFullscreenRef.current;
      wasFullscreenRef.current = active;
      if (active) {
        selfInitiatedExit = false;
        setHasExitedFullscreen(false);
        return;
      }
      // Ta tự thoát (rời phòng thi) KHÔNG phải vi phạm. Thiếu vế này thì mọi lượt thoát do code
      // gọi đều bị tính là "ứng viên thoát toàn màn hình" ⇒ dựng dialog chặn ⇒ `violationPaused`
      // ⇒ vòng đếm 3-2-1 đứng im ở 3 (nó `return` sớm khi cờ bật).
      if (selfInitiatedExit) {
        selfInitiatedExit = false;
        return;
      }
      if (wasFullscreen) setHasExitedFullscreen(true);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    // Effect chạy lại (StrictMode gắn-tháo-gắn) ⇒ huỷ lượt thoát vừa hẹn ở cleanup ngay trước đó.
    if (pendingExitRef.current != null) {
      window.clearTimeout(pendingExitRef.current);
      pendingExitRef.current = null;
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (!cleanup) return;
      // HOÃN một nhịp thay vì thoát ngay.
      //
      // React 18 StrictMode (bật ở `main.tsx`) chạy effect → cleanup → effect NGAY trong cùng một
      // nhịp mount. Thoát thẳng ở cleanup nghĩa là: ứng viên bấm "Bắt đầu" ở phòng chờ, trình duyệt
      // vào toàn màn hình, rồi component này mount và lập tức thoát ra — huỷ đúng thứ vừa được bật,
      // rồi lần mount thứ hai đọc sự kiện đó thành vi phạm. Triệu chứng người dùng thấy: đếm ngược
      // đứng ở 3, phải F5 mới chạy (F5 xong không còn fullscreen nên không có sự kiện thoát nào).
      //
      // Tháo THẬT (rời phòng thi) thì không có effect nào chạy lại để huỷ ⇒ vẫn thoát như cũ.
      pendingExitRef.current = window.setTimeout(() => {
        pendingExitRef.current = null;
        void exitInterviewFullscreen();
      }, 0);
    };
  }, [cleanup]);

  const enterFullscreen = useCallback(async () => {
    const result = await requestInterviewFullscreen();
    if (result.entered) setHasExitedFullscreen(false);
    return result;
  }, []);

  const dismissFullscreenWarning = useCallback(() => setHasExitedFullscreen(false), []);

  return {
    isFullscreen,
    supported,
    hasExitedFullscreen,
    enterFullscreen,
    dismissFullscreenWarning,
  };
}
