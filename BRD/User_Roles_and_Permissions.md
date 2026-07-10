# Tài liệu Vai trò và Quyền hạn Người dùng (ISAS)

## 1. Mục đích Tài liệu
### 1.1 Mục đích của Quản lý Vai trò
Mục đích của tài liệu này là định nghĩa các Vai trò và Quyền hạn Người dùng cho Hệ thống Phỏng vấn & Đánh giá Kỹ năng được hỗ trợ bởi AI (ISAS). Tài liệu phác thảo khuôn khổ Quản lý Danh tính và Truy cập (IAM) nền tảng cần thiết để bảo mật các tài nguyên hệ thống, thực thi trách nhiệm giải trình và đảm bảo người dùng chỉ được cấp các quyền truy cập cần thiết. 

Hệ thống đã được tinh gọn lại tập trung vào **5 Vai trò cốt lõi**: `Guest`, `Candidate`, `HR`, `Organize`, và `Admin`.

### 1.2 Mối liên hệ với Yêu cầu Nghiệp vụ
Tài liệu này đóng vai trò như một phần mở rộng quan trọng cho tài liệu định nghĩa nghiệp vụ của ISAS, quản lý nghiêm ngặt lớp phân quyền — xác định *ai* có thể thực thi các quy trình nghiệp vụ và *những giới hạn nào* hạn chế hành động của họ.

### 1.3 Mục tiêu Bảo mật
*   **Tính Bảo mật (Confidentiality):** Bảo vệ thông tin cá nhân (PII), bài đánh giá ứng viên và dữ liệu AI.
*   **Tính Toàn vẹn (Integrity):** Ngăn chặn sửa đổi trái phép điểm số AI, báo cáo và cấu hình hệ thống.
*   **Trách nhiệm Giải trình (Accountability):** Truy xuất mọi hành động đến cá nhân thực thi cụ thể.

---

## 2. Tổng quan về Mô hình Cấp quyền
### 2.1 Kiểm soát Truy cập Dựa trên Vai trò (RBAC)
ISAS sử dụng mô hình RBAC. Quyền truy cập không gán trực tiếp cho người dùng mà thông qua 5 Vai trò. Mỗi tài khoản chỉ được gán vai trò dựa trên chức năng nhiệm vụ.

### 2.2 Nguyên tắc Đặc quyền Tối thiểu
Tất cả các vai trò được xây dựng nghiêm ngặt dựa trên Nguyên tắc Đặc quyền Tối thiểu (Least Privilege). Theo mặc định, mọi truy cập đều bị từ chối trừ khi được cấp quyền rõ ràng.

### 2.3 Phân tách Nhiệm vụ (SoD)
Các quy trình quan trọng được chia nhỏ. Ví dụ: `HR` thực hiện đánh giá ứng viên, nhưng cấu hình gói dịch vụ và thanh toán được quản lý bởi `Organize` hoặc `Admin`.

---

## 3. Cấu trúc Phân cấp Vai trò Người dùng

```text
[Cấp độ Nền tảng Hệ thống]
      |--- ROL-005: Admin (Quản trị viên Hệ thống)

[Cấp độ Tổ chức / Doanh nghiệp]
      |--- ROL-004: Organize (Quản trị viên Tổ chức)
            |--- ROL-003: HR (Nhân viên Tuyển dụng / Nhân sự)

[Cấp độ Ứng viên & Công chúng]
      |--- ROL-002: Candidate (Ứng viên)
            |--- ROL-001: Guest (Khách)
```

---

## 4. Hồ sơ Vai trò Người dùng Chi tiết

### ROL-001: Guest (Khách)
*   **Mô tả:** Người dùng chưa xác thực truy cập cổng thông tin công khai.
*   **Mục đích:** Khám phá nền tảng, xem các bài đăng tuyển dụng công khai và bắt đầu đăng ký.
*   **Phạm vi Quyền hạn:** Chỉ đọc (Read-only) các chiến dịch công khai và landing page.
*   **Giới hạn:** Không thể truy cập bất kỳ dữ liệu cá nhân, cấu hình hệ thống hay giao diện làm việc nào.

### ROL-002: Candidate (Ứng viên)
*   **Mô tả:** Cá nhân đã đăng ký tài khoản để ứng tuyển và xác thực kỹ năng.
*   **Mục đích:** Quản lý hồ sơ, làm bài test AI, tham gia phỏng vấn và xem kết quả của mình.
*   **Phạm vi Quyền hạn:** Quyền truy cập bị giới hạn ở hồ sơ cá nhân, kết quả đánh giá (nếu HR cho phép hiển thị) và lịch phỏng vấn của chính họ.
*   **Giới hạn:** Tuyệt đối không thể xem dữ liệu ứng viên khác, không thể sửa điểm AI, không thể xem ghi chú nội bộ của nhà tuyển dụng.

### ROL-003: HR (Nhân viên Tuyển dụng / Nhân sự)
*   **Mô tả:** Chuyên viên nhân sự trực tiếp quản lý các đợt tuyển dụng và ứng viên.
*   **Mục đích:** Tạo chiến dịch, sàng lọc CV, lên lịch phỏng vấn, thực hiện phỏng vấn và đánh giá ứng viên.
*   **Phạm vi Quyền hạn:** Quản lý vòng đời chiến dịch, xem thông tin ứng viên, xem điểm AI, ghi chú phỏng vấn.
*   **Giới hạn:** Chỉ xem được dữ liệu trong các chiến dịch thuộc tổ chức của mình. Không thể quản lý thanh toán hoặc cài đặt toàn hệ thống.

### ROL-004: Organize (Quản trị viên Tổ chức)
*   **Mô tả:** Đại diện quản lý cấp cao của một tổ chức/doanh nghiệp thuê bao ISAS.
*   **Mục đích:** Quản lý tổng thể không gian làm việc của doanh nghiệp, tài khoản HR, thanh toán, và báo cáo chung.
*   **Phạm vi Quyền hạn:** Toàn quyền quản lý (CRUD) đối với tài nguyên của Doanh nghiệp mình (Tạo tài khoản HR, thiết lập thanh toán, xem tất cả báo cáo/chiến dịch nội bộ).
*   **Giới hạn:** Không thể can thiệp dữ liệu của doanh nghiệp khác (Cô lập Tenant) và không thể thay đổi cấu hình lõi của hệ thống ISAS.

### ROL-005: Admin (Quản trị viên Hệ thống)
*   **Mô tả:** Người quản trị cao nhất của nền tảng ISAS.
*   **Mục đích:** Duy trì hoạt động toàn hệ thống, quản lý các tài khoản Organize, cấu hình thông số AI, kiểm toán và giám sát.
*   **Phạm vi Quyền hạn:** Toàn quyền hệ thống, quản lý cơ sở dữ liệu, quản lý tenant (tổ chức), phân quyền hệ thống và xem log kiểm toán.
*   **Giới hạn:** Chịu sự giám sát chặt chẽ của log kiểm toán (không thể xóa log). Khuyến cáo hạn chế can thiệp trực tiếp vào hồ sơ cá nhân của ứng viên nếu không có yêu cầu hỗ trợ.

---

## 5. Danh mục Chi tiết Quyền hạn (Permission Catalog)

| Mã Quyền | Tên Quyền | Danh mục | Rủi ro | Phân bổ Vai trò (Role Assignment) |
| :--- | :--- | :--- | :--- | :--- |
| PER-001 | Đăng nhập hệ thống | AUTH | Thấp | Candidate, HR, Organize, Admin |
| PER-002 | Quản lý Hồ sơ Cá nhân | PROF | Thấp | Candidate (Chính họ), Admin |
| PER-003 | Tải lên & Quản lý CV | CVMG | Thấp | Candidate |
| PER-004 | Xem CV và Dữ liệu Ứng viên | CVMG | Cao | HR, Organize, Admin |
| PER-005 | Tạo & Quản lý Chiến dịch | CAMP | Trung bình | HR, Organize |
| PER-006 | Thiết lập Lịch Phỏng vấn | INTV | Trung bình | HR, Organize |
| PER-007 | Làm bài Đánh giá AI | ASMT | Thấp | Candidate |
| PER-008 | Ghi đè/Chỉnh sửa Điểm Đánh giá| ASMT | Cao | HR (Cần Log), Organize |
| PER-009 | Tạo Báo cáo Tuyển dụng | REPT | Trung bình | HR, Organize |
| PER-010 | Mời & Quản lý tài khoản HR | USER | Cao | Organize, Admin |
| PER-011 | Thanh toán & Gói Đăng ký | PAYM | Cao | Organize, Admin |
| PER-012 | Cấu hình Thông số Hệ thống | CONF | Nghiêm trọng | Admin |
| PER-013 | Xem & Xuất Log Kiểm toán | AUDT | Cao | Admin |

---

## 6. Ma trận Quyền - Vai trò Cốt lõi
*(✔ = Cho phép, ✖ = Từ chối, R = Chỉ Đọc, M = Quản lý)*

| Quyền hạn Cốt lõi | Guest | Candidate | HR | Organize | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Đăng nhập & Auth** | ✖ | ✔ | ✔ | ✔ | ✔ |
| **Cập nhật Hồ sơ Cá nhân** | ✖ | ✔ | ✔ | ✔ | ✔ |
| **Tải lên & Xóa CV (Bản thân)** | ✖ | ✔ | ✖ | ✖ | ✖ |
| **Xem CV Ứng viên** | ✖ | ✖ | ✔ | ✔ | R |
| **Quản lý Chiến dịch** | ✖ | ✖ | M | M | R |
| **Thực hiện Bài Đánh giá** | ✖ | ✔ | ✖ | ✖ | ✖ |
| **Đánh giá & Chấm điểm Ứng viên**| ✖ | ✖ | ✔ | R | ✖ |
| **Quản lý Tài khoản (Nội bộ CTy)**| ✖ | ✖ | ✖ | M | M |
| **Quản lý Thanh toán (CTy)** | ✖ | ✖ | ✖ | M | R |
| **Cấu hình Hệ thống & AI** | ✖ | ✖ | ✖ | ✖ | M |
| **Quản lý Cấp độ Tenant (Tổ chức)**| ✖ | ✖ | ✖ | ✖ | M |

---

## 7. Các Hoạt động Nhạy cảm & Rủi ro

| Hoạt động Nhạy cảm | Vai trò Thực thi | Giới hạn & Kiểm soát |
| :--- | :--- | :--- |
| **Xóa Tài khoản Người dùng** | Candidate (Tự xóa), Admin | Yêu cầu kiểm tra các đợt phỏng vấn đang diễn ra trước khi xóa. Xóa mềm (Soft-delete). |
| **Xuất danh sách ứng viên (Bulk)** | Organize | Bị giới hạn số lượng mỗi lần tải. Ghi log toàn bộ lịch sử tải về. |
| **Điều chỉnh trọng số/mô hình AI** | Admin | Yêu cầu thông qua quy trình cập nhật mô hình, không thể thay đổi trực tiếp trên cơ sở dữ liệu. |
| **Nâng cấp gói Tenant** | Organize, Admin | Yêu cầu xác thực tài chính và tạo hóa đơn lưu trữ. |

---

## 8. Quy tắc Nghiệp vụ Trọng tâm

1.  **BR-001:** `Candidate` chỉ có thể xem dữ liệu và kết quả của chính mình (nếu tổ chức cho phép). Tuyệt đối không thấy hồ sơ ứng viên khác.
2.  **BR-002:** `HR` không thể tạo thêm tài khoản HR khác, quyền này thuộc về `Organize`.
3.  **BR-003:** `HR` và `Organize` chỉ có thể truy cập dữ liệu ứng viên khi ứng viên đó đã nộp hồ sơ vào chiến dịch của doanh nghiệp họ (Cô lập dữ liệu giữa các doanh nghiệp).
4.  **BR-004:** Ghi chú nội bộ, điểm đánh giá của `HR` bị ẩn hoàn toàn đối với `Candidate`.
5.  **BR-005:** Không ai, kể cả `Admin`, có quyền xóa Log Kiểm toán (Audit Logs). Dữ liệu này là bất biến (Immutable).
6.  **BR-006:** `Guest` phải đăng ký và xác thực email thành công mới có thể chuyển sang vai trò `Candidate`.
7.  **BR-007:** Tài khoản `Admin` yêu cầu bảo mật Xác thực đa yếu tố (MFA) bắt buộc.
8.  **BR-008:** Các tài khoản không hoạt động quá 180 ngày sẽ tự động bị đình chỉ quyền truy cập tạm thời.

---

## 9. Tổng kết
Tài liệu cung cấp kiến trúc ủy quyền rõ ràng thông qua 5 vai trò (Guest, Candidate, HR, Organize, Admin). Việc tinh gọn này giúp hệ thống vừa vận hành linh hoạt cho cả người tìm việc và nhà tuyển dụng, vừa tuân thủ tuyệt đối các nguyên tắc bảo mật như cách ly dữ liệu tổ chức (Tenant Isolation) và kiểm soát rủi ro nội bộ.