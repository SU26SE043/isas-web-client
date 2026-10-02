# ATT1-F6 — nghiệm thu chạy thật trên dev

- **Ngày chạy:** 03/10/2026, ~02:37–03:00 (Asia/Saigon)
- **Môi trường:** FE local `localhost:5173` trỏ gateway dev `100.64.204.33:5051`; Backend `feat/att1-be` đã apply 3 migration lên dev
- **Nhánh FE:** `feat/att1-fe` (F1–F5b, 2437 passed / 372 file)
- **Chiến dịch dựng để thử:** `a4685220-603a-4808-9985-2d0c49139ae5` — "ATT1 F6 — nghiệm thu số lần làm bài", org ISAS Demo Co., 5 phút, maxAttempts 2 → tăng lên 3, rổ 5 câu bốc 3, antiCheat bật
- **Ứng viên:** `candidate@isas.local`; buổi thi `d8d83d05-11c7-4f53-ae32-8c9b0f2b645d`
- **Ghi chú môi trường:** Browser pane chặn camera/micrô nên phần phòng thi chạy trong Chrome thật (người dùng cấp quyền thiết bị). Đăng nhập do người dùng tự nhập.

## Kết quả

| # | Mục | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | HR tạo chiến dịch: bước 5 đặt 5 phút + 2 lần, bước Kiểm tra đúng, triển khai | **PASS** | Bước Kiểm tra hiện "Luật làm bài · 5 phút · tối đa 2 lần" + nút Sửa; deploy ra campaign `a4685220` |
| 2 | HR mở chi tiết: thẻ Luật làm bài; tăng lên 3 | **PASS** | Thẻ hiện "5 phút (khoá sau khi triển khai)" + "tối đa 2 lần" + nút Tăng; sau khi tăng → "tối đa 3 lần", nút tự ẩn khi chạm trần |
| 2b | Thử giảm số lần → 409 lời server | **KHÔNG CHẠY** | Sau khi đạt trần 3 thì không mở được hộp thoại; gửi request tay cần token phiên. Đã có: backend L3 đo `409 MAX_ATTEMPTS_DECREASE`, FE có test so khớp nguyên văn lời server |
| 3 | Ứng viên trạng thái ①, hộp thoại đúng luật, bước chuẩn bị `questionsLocked` + đề rỗng | **PASS** | Trang hiện "Thời lượng 5 phút · 3 lần làm" + câu luật đồng hồ; hộp thoại "Bài thi 5 phút" + "Bạn có 3 lượt", KHÔNG có dòng lượt n/N ở lần đầu; marker sau `start` có 3 câu `content` rỗng (`contentLen: 0`) nhưng đủ `id`/`orderNo`/`timeLimitSec`; `deadlineAt` = 01/11 (hạn cứng); bước chuẩn bị không có đồng hồ |
| 4 | Vào phòng: đồng hồ cả buổi ≈ 05:00 theo giờ server | **PASS** | Header "Thời gian bài thi · 04:45 · (theo giờ hệ thống)"; sau `begin`, GET trả nội dung câu thật; đồng hồ KHÔNG dùng `deadlineAt` 01/11 của `start` |
| 4b | Giả lập lệch giờ máy +10 phút | **KHÔNG CHẠY** | Đổi giờ hệ điều hành không an toàn trong phiên này; ghi đè `Date.now` sau khi offset đã tính thì không tái hiện đúng ca. Đã có test đơn vị F4 khoá (mutation offset bỏ dấu / `Date.now()` trần đều ĐỎ) |
| 5 | Overlay vi phạm ⇒ đồng hồ vẫn giảm, có dòng "vẫn chạy" | **PASS** | Overlay "Yêu cầu toàn màn hình" che màn hình, đồng hồ đi 04:45 → 04:06; overlay có dòng "Đồng hồ bài thi vẫn chạy" |
| 6 | Trả lời 1 câu, hết giờ khi đang ghi câu 2 ⇒ màn hết giờ, câu được lưu, bài được nộp | **PASS** | Nộp câu 1 → sang câu 2 → ghi âm → hết giờ: màn "Đã hết giờ làm bài" + "✓ Đã nộp bài" + "Đã trả lời **2/3** câu chính" (câu đang ghi đã được nộp trước khi nộp bài); Escape và bấm nền đều không đóng được; chỉ 1 nút "Về trang chiến dịch" |
| 7 | Lượt 2 ⇒ ③ ⇒ làm lại đề khác ⇒ bỏ ngang ⇒ ④ | **KHÔNG CHẠY ĐƯỢC** | Lượt 1 kết thúc ở trạng thái **Completed**, mà CAMP-23 quy định Completed không làm lại được dù còn lượt ⇒ không dựng được ③/④ trên chiến dịch này. Cần một chiến dịch khác và một lượt **bỏ ngang**. Đã có: backend L3 đo campaign B đi đủ ①→③→④ với `ATTEMPT_LIMIT_REACHED {attemptsUsed:2,maxAttempts:2}`; FE có test cho cả 4 trạng thái |
| 8 | 375 px không tràn ngang | **PASS** | `scrollWidth === clientWidth === 375` trên trang chiến dịch ứng viên |
| 9 | (bổ sung) Ứng viên Completed KHÔNG có nút làm lại | **PASS** | Trạng thái "Đã hoàn thành", vùng hành động không có nút nào, dù maxAttempts 3 mới dùng 1 |
| 10 | (bổ sung) Nháp thời lượng ngoài 5–180 hiện đúng lời server | **KHÔNG CHẠY** | Wizard chặn client-side trước (xem mục 11), nên không dựng được nháp sai qua UI. Backend chặn ở publish (`CampaignController.cs:798` → 400 `{ error }`), FE đã sửa `getDeployWarnings` đọc `{ error }` cho 400/409 (F5b) và có test |

## Xác nhận thêm, ngoài danh sách

| Mục | Kết quả |
|---|---|
| Biên 5–180 ở bước 5 | Nhập 4 phút ⇒ "Thời lượng bài thi phải là số nguyên từ 5 đến 180 phút", chặn sang bước kế, viền đỏ ở ô nhập |
| Ước tính dùng K = số câu bốc mỗi buổi | Rổ 5 câu, bốc 3 ⇒ "Ước tính cần ~6 phút cho 3 câu" (không phải 5 câu đã soạn) |
| Cảnh báo ước tính không chặn | Đặt 5 phút < ước tính 6 phút ⇒ dòng đổi màu cảnh báo, vẫn lưu và sang bước được |
| Ô thời lượng chỉ còn ở bước 5 | Bước 1 và bước 6 (Mời ứng viên) không còn ô này |
| Câu hộp thoại F5b | "Chỉ người bỏ ngang (lượt bị huỷ) dùng được lượt mới; người đã nộp bài không làm lại được." |
| Dòng nhắc ≤ 1 phút (R1 của F4) | Ở mốc 00:41 hiện "Còn dưới 1 phút — hệ thống sẽ tự nộp khi hết giờ", không còn ghi nhầm "Còn 5 phút" |
| Trạng thái ② | "Đang làm dở" + nút "Tiếp tục bài phỏng vấn", KHÔNG có đếm ngược trên trang chiến dịch |
| i18n en | "Duration 5 min · 3 attempts" |
| Câu `content` rỗng không làm hỏng luồng | Marker giữ đủ 3 câu rỗng; bước chuẩn bị không kẹt `initializing`; sau `begin` phòng hiện đề thật. Đây là lỗi [C7] mà KIỂM F3 bắt được, sửa ở `4c82d23e` |

## Việc còn lại

1. **Mục 7 (③/④)** — cần chiến dịch mới với một lượt **bỏ ngang** (vào phòng rồi thoát, không nộp). Chiến dịch `a4685220` không dùng lại được vì ứng viên đã Completed.
2. **Mục 4b (lệch giờ máy)** — chạy bằng Playwright `page.clock` hoặc đổi giờ hệ điều hành trước khi vào phòng.
3. **Mục 2b (409 giảm số lần)** — cần chiến dịch chưa chạm trần 3 để mở được hộp thoại, rồi can thiệp request.
4. **Mục 10 (publish 400)** — cần một bản nháp có thời lượng ngoài 5–180 (nháp cũ tạo trước ATT1).

## Phát hiện phụ, ngoài phạm vi ATT1

- Wizard không có ô "Số ứng viên tối đa", nên chiến dịch tạo qua UI có sức chứa 0. Lời mời vẫn gửi được, nhưng cần kiểm xem có chỗ nào chặn theo sức chứa không.
- Token lời mời chỉ tồn tại trong email (DB lưu `token_hash`, DTO không trả cho HR), nên không có đường nào cho ứng viên tham gia nếu email không có hộp thư thật. Việc này làm nghiệm thu thủ công trên dev rất khó; cân nhắc một đường join dành riêng cho môi trường dev.
