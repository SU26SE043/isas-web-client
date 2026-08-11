# B2B Candidate Interview — Anti-Cheating Requirements & Implementation Guide

## 1. Mục tiêu

Tài liệu này mô tả đầy đủ yêu cầu Anti-Cheating cho luồng:

```text
B2B
→ Candidate
→ Campaign Interview
→ Interview Room
```

Mục tiêu chính:

- Candidate chỉ được làm bài trong chế độ fullscreen.
- Khi bắt đầu phỏng vấn phải vào fullscreen trước.
- Sau khi fullscreen thành công mới chạy countdown `3 → 2 → 1 → Bắt đầu`.
- Trong lúc phỏng vấn, nếu Candidate rời khỏi màn hình phỏng vấn hoặc vi phạm điều kiện anti-cheating thì bài phải bị pause.
- Frontend phát hiện hành vi vi phạm và gửi tín hiệu lên Backend để ghi nhận.
- Candidate bắt buộc phải xác nhận popup vi phạm.
- Chỉ sau khi Candidate click `OK / Tiếp tục làm bài` và fullscreen được khôi phục thành công thì bài mới được tiếp tục.

---

## 2. Nguyên tắc tổng quát

Anti-cheating chỉ chạy trong:

```text
B2B Candidate
+
Interview Room
+
Interview ACTIVE
```

Không ghi nhận violation trong:

```text
Magic Link
Login
Campaign Detail
Waiting Room
Device Check
Countdown trước khi bài bắt đầu
Sau khi submit
Result page
```

Không redesign Interview Room.

Ưu tiên reuse:

- B2C Practice Interview UI
- fullscreen logic hiện có
- countdown `3 → 2 → 1 → Bắt đầu`
- modal/dialog
- camera/microphone logic
- timer
- TTS
- recording logic
- existing API client

---

## 3. Flow bắt đầu phỏng vấn

Flow bắt buộc:

```text
Waiting Room / Device Check
        ↓
Candidate click "Bắt đầu phỏng vấn"
        ↓
Frontend gọi requestFullscreen()
        ↓
Fullscreen thành công
        ↓
Countdown
3
2
1
Bắt đầu
        ↓
Countdown kết thúc
        ↓
Interview ACTIVE
        ↓
Timer / TTS / Recording / Answer Controls bắt đầu hoạt động
```

Không được chạy theo thứ tự:

```text
Click Start
→ Timer chạy
→ TTS phát
→ Recording active
→ sau đó mới fullscreen
```

---

## 4. Fullscreen là bắt buộc

Bài phỏng vấn chỉ được tiếp tục khi:

```ts
document.fullscreenElement !== null
```

Nếu browser từ chối fullscreen:

- không bắt đầu countdown;
- không start timer;
- không phát TTS;
- không enable recording;
- không enable answer controls;
- Candidate vẫn bị block.

Fullscreen phải được gọi trực tiếp từ user gesture như:

```text
click "Bắt đầu phỏng vấn"
click "Tiếp tục làm bài"
click "Thử lại"
```

Không gọi fullscreen tự động sau timeout.

---

## 5. Countdown 3 → 2 → 1 → Bắt đầu

Sau khi fullscreen thành công:

```text
3
↓
2
↓
1
↓
Bắt đầu
```

Sau đó mới:

```text
Interview ACTIVE
```

Trong countdown:

- timer chưa chạy;
- TTS chưa phát;
- recording chưa active;
- answer controls chưa enable;
- anti-cheat Interview ACTIVE chưa bắt đầu tính violation.

Reuse countdown UI của B2C nếu project đã có.

Không tạo countdown UI mới nếu đã có component dùng chung.

---

## 6. Các hành vi Anti-Cheating cần xử lý

Bao gồm:

1. Tab switching
2. Alt + Tab / chuyển sang ứng dụng hoặc cửa sổ khác
3. Thoát fullscreen
4. Focus lost
5. Paste
6. Camera bị tắt / mất camera
7. Không thấy khuôn mặt
8. Nhiều khuôn mặt
9. Face mismatch
10. Identity verification failure

---

## 7. API ghi nhận Frontend Anti-Cheat

Dùng:

```http
POST /api/v1/campaign/{campaignId}/sessions/{sessionId}/flags
```

Request:

```json
{
  "signalType": "string",
  "note": "string"
}
```

Frontend dùng các signal:

```text
tab_switch
paste
focus_lost
camera_blocked
```

---

## 8. Tab Switching

Detect:

```ts
document.addEventListener("visibilitychange", ...)
```

Flow:

```text
visible
→ hidden
→ visible
```

Khi Candidate quay lại:

- pause interview;
- gửi violation;
- hiện popup;
- background blur;
- bắt buộc Candidate xác nhận.

API:

```json
{
  "signalType": "tab_switch",
  "note": "Candidate switched away from the interview tab."
}
```

---

## 9. Alt + Tab / Window Switching

Không được chỉ dựa vào `visibilitychange`.

Cần monitor:

```ts
window.addEventListener("blur", ...)
window.addEventListener("focus", ...)
```

Flow:

```text
Interview active
→ Alt+Tab sang app khác
→ window.blur
→ lưu pending violation
→ Candidate quay lại
→ window.focus
→ xử lý violation
```

API:

```json
{
  "signalType": "tab_switch",
  "note": "Candidate left the interview window using Alt+Tab or window switching."
}
```

---

## 10. Thoát Fullscreen

Monitor:

```ts
document.addEventListener("fullscreenchange", ...)
```

Violation chỉ xảy ra khi:

```text
fullscreen active
→ fullscreen inactive
```

Không tính:

```text
initial page load
entering fullscreen
Waiting Room
after submit
```

Fullscreen exit dùng chung:

```json
{
  "signalType": "tab_switch",
  "note": "Candidate exited fullscreen mode."
}
```

Không tạo signal mới như:

```text
fullscreen_exit
```

---

## 11. Focus Lost

Có thể dùng:

```ts
window.addEventListener("blur", ...)
window.addEventListener("focus", ...)
```

Nếu hành vi focus lost là một violation độc lập, dùng:

```json
{
  "signalType": "focus_lost",
  "note": "Interview window lost focus."
}
```

Tuy nhiên cần deduplicate với:

```text
tab switch
Alt+Tab
fullscreen exit
```

Không để một hành động tạo nhiều violation ngoài ý muốn.

---

## 12. Paste

Monitor:

```ts
document.addEventListener("paste", ...)
```

Khi Candidate paste trong Interview ACTIVE:

```json
{
  "signalType": "paste",
  "note": "Candidate attempted to paste content during the interview."
}
```

Sau đó:

- pause;
- hiện popup;
- Candidate phải xác nhận mới được tiếp tục.

---

## 13. Camera Auto Start

Camera cần được bật và kiểm tra trong Waiting Room.

Reuse B2C camera/device-check logic.

Flow:

```text
Waiting Room
→ request camera permission
→ camera active
→ Start Interview
→ camera tiếp tục hoạt động
```

Không tạo camera flow riêng nếu B2C đã có.

---

## 14. Camera Blocked / Camera Lost

Detect:

```text
camera permission revoked
MediaStreamTrack ended
camera device unavailable
camera stream unexpectedly stopped
```

API:

```json
{
  "signalType": "camera_blocked",
  "note": "Candidate camera became unavailable during the interview."
}
```

Một transition:

```text
camera active
→ unavailable
```

chỉ ghi:

```text
1 violation
```

Không gửi API liên tục trong mỗi poll/render.

---

## 15. Face Enrollment

Nếu campaign yêu cầu face verification:

```text
faceEnrollRequired = true
```

thì trước khi face-check phải gọi:

```http
POST /api/v1/campaign/{campaignId}/sessions/{sessionId}/face-enroll
```

multipart:

```text
image=<valid camera frame>
```

Không capture frame đen ngay sau:

```ts
video.play()
```

Chỉ capture khi:

```text
video ready
dimensions hợp lệ
camera frame thực sự có dữ liệu
```

---

## 16. Face Check

Trong Interview ACTIVE, định kỳ capture frame camera và gọi:

```http
POST /api/v1/campaign/{campaignId}/sessions/{sessionId}/face-check
```

Response ví dụ:

```json
{
  "match": true,
  "faceCount": 1,
  "signals": []
}
```

Các signals cần xử lý:

```text
no_face
multiple_faces
face_mismatch
identity_unverified
```

Không POST các signal này ngược lại `/flags`.

Backend/AI chịu trách nhiệm ghi nhận các face signals.

---

## 17. No Face

Nếu:

```ts
signals.includes("no_face")
```

thì:

- pause interview;
- hiện popup;
- background blur;
- yêu cầu Candidate quay lại camera.

Popup ví dụ:

```text
Phát hiện vi phạm

Không phát hiện khuôn mặt của bạn trong khung hình.

Vui lòng quay lại vị trí trước camera để tiếp tục.

[ Tiếp tục làm bài ]
```

Không gửi:

```json
{
  "signalType": "no_face"
}
```

vào `/flags`.

---

## 18. Multiple Faces

Nếu:

```ts
signals.includes("multiple_faces")
```

thì:

- pause interview;
- hiện popup blocking;
- Candidate chỉ được tiếp tục khi camera trở lại trạng thái hợp lệ.

Ví dụ:

```text
Phát hiện vi phạm

Hệ thống phát hiện nhiều hơn một khuôn mặt trong khung hình.

Vui lòng đảm bảo chỉ có ứng viên xuất hiện trước camera.

[ Tiếp tục làm bài ]
```

---

## 19. Face Mismatch

Nếu:

```ts
signals.includes("face_mismatch")
```

thì:

- pause;
- hiện popup cảnh báo;
- không POST `face_mismatch` vào `/flags`.

Ví dụ:

```text
Phát hiện vi phạm

Khuôn mặt hiện tại không khớp với khuôn mặt đã xác minh trước khi bắt đầu phỏng vấn.

Sự kiện này đã được hệ thống ghi nhận.

[ Tiếp tục làm bài ]
```

---

## 20. Identity Unverified

Nếu:

```ts
signals.includes("identity_unverified")
```

thì không coi là confirmed cheating.

Hiển thị theo hướng lỗi xác minh:

```text
Không thể xác minh khuôn mặt

Ảnh xác minh hiện tại chưa đủ rõ.

Vui lòng:
- ngồi giữa khung hình;
- đảm bảo đủ ánh sáng;
- nhìn trực tiếp vào camera.

[ Thử lại ]
```

Có thể retry face verification theo flow hiện tại.

---

## 21. Flow chung khi phát hiện violation

Flow bắt buộc:

```text
Violation detected
        ↓
Pause interview
        ↓
Send Backend flag nếu là frontend signal
        ↓
Store violation state
        ↓
Candidate quay lại màn hình nếu đang ở ngoài app
        ↓
Show blocking popup
        ↓
Blur/dim background
        ↓
Candidate click "OK / Tiếp tục làm bài"
        ↓
requestFullscreen()
        ↓
Fullscreen success
        ↓
Close popup
        ↓
Resume interview
```

---

## 22. Candidate bắt buộc click OK / Tiếp tục làm bài

Đây là requirement bắt buộc.

Không được:

```text
violation
→ tự fullscreen
→ tự resume
```

Không được:

```text
popup
→ auto close sau vài giây
```

Không được:

```text
click backdrop
→ popup đóng
```

Không được:

```text
ESC
→ popup đóng
```

Candidate bắt buộc phải click:

```text
OK
```

hoặc:

```text
Tiếp tục làm bài
```

---

## 23. Thứ tự khi click Continue

Thứ tự bắt buộc:

```text
Candidate click Continue
        ↓
requestFullscreen()
        ↓
Fullscreen success
        ↓
Close popup
        ↓
Resume interview
```

Không được làm:

```text
click Continue
→ close popup
→ fullscreen fail
→ Candidate vẫn làm bài
```

---

## 24. Nếu requestFullscreen thất bại

Nếu browser không cho fullscreen:

- popup vẫn mở;
- interview vẫn pause;
- timer vẫn pause;
- controls vẫn disabled;
- không cho Candidate làm tiếp.

Hiển thị:

```text
Không thể bật chế độ toàn màn hình.

Vui lòng cho phép toàn màn hình để tiếp tục bài phỏng vấn.

[ Thử lại ]
```

Button `Thử lại` tiếp tục gọi `requestFullscreen()` từ user gesture.

---

## 25. Popup vi phạm

Popup phải là blocking modal.

Yêu cầu UI:

- background Interview Room vẫn thấy được;
- background phải blur/dim;
- modal nằm trên cùng;
- không click được nội dung phía sau;
- không đóng bằng backdrop;
- không đóng bằng ESC;
- không auto-close.

Ví dụ:

```text
Phát hiện vi phạm

Bạn đã rời khỏi màn hình phỏng vấn.

Hành vi này đã được hệ thống ghi nhận.

Vui lòng quay lại chế độ toàn màn hình để tiếp tục.

[ Tiếp tục làm bài ]
```

Reuse modal/dialog của project.

Không tạo design system mới.

---

## 26. Pause Interview khi vi phạm

Khi popup violation mở, phải pause:

```text
question timer
TTS
recording nếu có thể pause an toàn
answer controls
next question
submit answer
```

Candidate không được tương tác với bài phía sau popup.

---

## 27. Timer Pause / Resume

Ví dụ:

```text
timer = 01:20
→ Candidate Alt+Tab
→ timer pause tại 01:20
→ Candidate ở ngoài 20 giây
→ quay lại
→ popup
→ click Continue
→ fullscreen success
→ timer tiếp tục từ 01:20
```

Không được để countdown tiếp tục chạy trong lúc violation đang block.

---

## 28. TTS Pause / Resume

Nếu TTS đang phát khi violation xảy ra:

```text
pause TTS
```

Sau khi:

```text
Continue
→ fullscreen success
```

thì resume theo existing implementation.

Không phát duplicate audio.

---

## 29. Recording Pause / Resume

Nếu đang recording:

ưu tiên:

```text
MediaRecorder.pause()
```

nếu current implementation/browser hỗ trợ an toàn.

Sau Continue:

```text
MediaRecorder.resume()
```

Không:

- discard recording;
- auto-submit incomplete answer;
- tạo recording mới làm mất dữ liệu cũ.

---

## 30. Deduplication

Một Alt+Tab có thể trigger:

```text
blur
visibilitychange
fullscreenchange
```

Nếu không dedupe sẽ có:

```text
3 API calls
3 violations
3 popups
```

Không được phép.

Expected:

```text
1 physical user action
→ 1 violation
```

Dùng:

```text
refs
timestamps
pending violation state
event guard
```

Phải kiểm tra React StrictMode để tránh duplicate listener/API.

---

## 31. Popup Queue

Nếu nhiều violation xảy ra gần nhau:

- không show nhiều popup chồng lên nhau;
- serialize violation handling;
- deduplicate cùng một physical action;
- nếu thật sự là hai hành vi khác nhau thì xử lý lần lượt.

---

## 32. Event Listeners cần monitor

Tối thiểu:

```ts
document.addEventListener("visibilitychange", ...)
window.addEventListener("blur", ...)
window.addEventListener("focus", ...)
document.addEventListener("fullscreenchange", ...)
document.addEventListener("paste", ...)
```

Camera và face-check dùng media state/polling hiện có.

---

## 33. Cleanup

Khi:

```text
submit interview
leave Interview Room
session complete
component unmount
```

phải cleanup:

```text
visibilitychange listener
blur listener
focus listener
fullscreenchange listener
paste listener
face-check interval
countdown timers
pending violation
modal state
media-related listeners
```

Không được tiếp tục gọi anti-cheat API sau khi bài đã kết thúc.

---

## 34. UI Reuse Requirement

Không redesign Interview Room.

Không tạo UI riêng cho B2B nếu B2C đã có.

Phải ưu tiên reuse:

```text
B2C Waiting Room
B2C Device Check
B2C Countdown
B2C blur overlay
existing modal/dialog
existing button styles
existing timer
existing media controls
```

Chỉ thay đổi:

```text
business logic
API integration
event detection
state management
pause/resume
```

---

## 35. Acceptance Criteria

### Start Interview

```text
Click "Bắt đầu phỏng vấn"
→ fullscreen
→ 3
→ 2
→ 1
→ Bắt đầu
→ Interview active
```

Timer/TTS/recording không được bắt đầu trước countdown.

### Alt+Tab

```text
Interview fullscreen
→ Alt+Tab sang app khác
→ quay lại
```

Expected:

```text
1 violation
1 API request
Interview paused
Popup hiện
Background blur
```

Candidate chưa được làm tiếp.

### Continue

Candidate click:

```text
Tiếp tục làm bài
```

Expected:

```text
requestFullscreen()
→ fullscreen success
→ popup đóng
→ interview resume
```

### Fullscreen Restore Fail

Expected:

```text
popup vẫn mở
interview vẫn pause
Candidate vẫn bị block
```

### Browser Tab Switch

Expected giống Alt+Tab.

### ESC Fullscreen Exit

Expected:

```text
1 violation
popup
pause
Continue required
fullscreen restore
resume
```

### Paste

Expected:

```text
paste detected
→ /flags
→ popup
→ pause
→ Continue
```

### Camera Lost

Expected:

```text
camera active
→ camera unavailable
→ 1 camera_blocked flag
→ popup
→ pause
```

Không spam nhiều flags.

### No Face

Expected:

```text
face-check returns no_face
→ popup
→ pause
```

Không POST `no_face` vào `/flags`.

### Multiple Faces

Expected:

```text
face-check returns multiple_faces
→ blocking popup
```

### Face Mismatch

Expected:

```text
face-check returns face_mismatch
→ blocking popup
```

### Identity Unverified

Expected:

```text
verification warning
not confirmed cheating
allow retry
```

---

## 36. Final Implementation Checklist

- [ ] Start Interview yêu cầu fullscreen.
- [ ] Fullscreen success mới chạy countdown.
- [ ] Countdown là `3 → 2 → 1 → Bắt đầu`.
- [ ] Timer chỉ chạy sau countdown.
- [ ] TTS chỉ chạy sau countdown.
- [ ] Recording chỉ active sau countdown.
- [ ] Fullscreen bắt buộc trong Interview ACTIVE.
- [ ] Tab switching được detect.
- [ ] Alt+Tab được detect.
- [ ] Fullscreen exit được detect.
- [ ] Paste được detect.
- [ ] Camera blocked được detect.
- [ ] Face enrollment được xử lý.
- [ ] Face-check chạy định kỳ.
- [ ] no_face được xử lý.
- [ ] multiple_faces được xử lý.
- [ ] face_mismatch được xử lý.
- [ ] identity_unverified được xử lý đúng nghĩa.
- [ ] Violation pause toàn bộ Interview.
- [ ] Popup blocking.
- [ ] Background blur.
- [ ] Candidate bắt buộc click Continue.
- [ ] Continue gọi requestFullscreen().
- [ ] Chỉ fullscreen success mới resume.
- [ ] Fullscreen fail vẫn block.
- [ ] Một Alt+Tab chỉ ghi một violation.
- [ ] Không duplicate API do StrictMode.
- [ ] Cleanup listener khi submit/unmount.
- [ ] Không redesign Interview Room.
- [ ] Reuse B2C components nếu đã có.
