# 10. Đặc Tả Danh Mục Màn Hình

*Hệ thống: Hệ thống Đánh giá Kỹ năng & Phỏng vấn bằng AI (ISAS)*  
*Phiên bản: 1.0.0*  
*Ngày: 9 tháng 7, 2026*

## 1. Mục Đích Tài Liệu
Tài liệu này đóng vai trò là **Danh mục Màn hình Tổng thể (Master Screen Inventory)** có tính thẩm quyền cho nền tảng ISAS, được thiết kế theo các nguyên tắc Thiết kế Lấy Con người Làm trung tâm (HCD) và Thiết kế Lấy Người dùng Làm trung tâm (UCD). Tài liệu tổng hợp các tiêu chuẩn từ Material Design (cho luồng Ứng viên/Khách) và Ant Design (cho các lưới dữ liệu dành cho luồng Doanh nghiệp/Quản trị phức tạp).

**Mối quan hệ với các tài liệu đặc tả khác:**
- **Luồng Người dùng (User Flows):** Cung cấp các điểm cuối UI rõ ràng được ánh xạ tới các trạng thái luồng.
- **Yêu cầu Chức năng (Functional Requirements):** Hiện thực hóa các khả năng trừu tượng thành các không gian tương tác hữu hình.
- **Đặc tả Giao diện (UI Specification):** Đóng vai trò là bản thiết kế cấu trúc trước khi áp dụng CSS/UI hoàn chỉnh.

**Đối tượng hướng tới:** Giám đốc Sản phẩm, Nhà thiết kế UX/UI, Kỹ sư Frontend, Kỹ sư QA, và Kiến trúc sư Giải pháp.

## 2. Tổ Chức Màn Hình
Các màn hình được phân nhóm hợp lý vào các module liên kết sau đây nhằm đảm bảo kiến trúc tách rời và phân chia component chuẩn xác:
- **Xác thực (Authentication)**: Các giao diện dành riêng cho hành trình xác thực.
- **Ứng viên (Candidate)**: Các giao diện dành riêng cho hành trình của ứng viên.
- **HR/Candidate**: Các giao diện dành riêng cho hành trình của HR/Candidate (đã được điều chỉnh từ Employer).
- **Quản trị viên (Administrator)**: Các giao diện dành riêng cho hành trình của quản trị viên.
- **Thành phần chung (Shared Components)**: Các giao diện dành riêng cho các thành phần được dùng chung.

## 3. Danh Mục Màn Hình Tổng Thể
| Mã Màn hình | Tên Màn hình | Module | Người dùng chính | Mô tả | Mức Ưu tiên | Luồng L.quan | Quy trình L.quan | Chức năng L.quan | Entry Điều hướng |
|---|---|---|---|---|---|---|---|---|---|
| SCR-AUT-001 | Chào mừng | Xác thực | Khách | Giao diện hỗ trợ thao tác welcome trong module Xác thực. | Cao | UF-AUT-01 | BP-AUT-01 | F-AUT-01 | /nav/authentication/welcome |
| SCR-AUT-002 | Đăng nhập | Xác thực | Khách | Giao diện hỗ trợ thao tác login trong module Xác thực. | Cao | UF-AUT-01 | BP-AUT-01 | F-AUT-01 | /nav/authentication/login |
| SCR-AUT-003 | Đăng ký | Xác thực | Khách | Giao diện hỗ trợ thao tác register trong module Xác thực. | Trung bình | UF-AUT-01 | BP-AUT-01 | F-AUT-01 | /nav/authentication/register |
| SCR-AUT-004 | Xác minh Email | Xác thực | Khách | Giao diện hỗ trợ thao tác email verification trong module Xác thực. | Cao | UF-AUT-01 | BP-AUT-01 | F-AUT-01 | /nav/authentication/email-verification |
| SCR-AUT-005 | Quên mật khẩu | Xác thực | Khách | Giao diện hỗ trợ thao tác forgot password trong module Xác thực. | Cao | UF-AUT-01 | BP-AUT-01 | F-AUT-01 | /nav/authentication/forgot-password |
| SCR-AUT-006 | Đặt lại mật khẩu | Xác thực | Khách | Giao diện hỗ trợ thao tác reset password trong module Xác thực. | Trung bình | UF-AUT-01 | BP-AUT-01 | F-AUT-01 | /nav/authentication/reset-password |
| SCR-AUT-007 | Xác minh 2 bước | Xác thực | Khách | Giao diện hỗ trợ thao tác two-factor verification trong module Xác thực. | Cao | UF-AUT-01 | BP-AUT-01 | F-AUT-01 | /nav/authentication/two-factor-verification |
| SCR-AUT-008 | Hết hạn phiên | Xác thực | Khách | Giao diện hỗ trợ thao tác session expired trong module Xác thực. | Cao | UF-AUT-01 | BP-AUT-01 | F-AUT-01 | /nav/authentication/session-expired |
| SCR-AUT-009 | Từ chối truy cập | Xác thực | Khách | Giao diện hỗ trợ thao tác access denied trong module Xác thực. | Trung bình | UF-AUT-01 | BP-AUT-01 | F-AUT-01 | /nav/authentication/access-denied |
| SCR-AUT-010 | Khóa tài khoản | Xác thực | Khách | Giao diện hỗ trợ thao tác account locked trong module Xác thực. | Cao | UF-AUT-01 | BP-AUT-01 | F-AUT-01 | /nav/authentication/account-locked |
| SCR-AUT-011 | Điều khoản & Bảo mật | Xác thực | Khách | Giao diện hỗ trợ thao tác terms & privacy trong module Xác thực. | Cao | UF-AUT-01 | BP-AUT-01 | F-AUT-01 | /nav/authentication/terms-&-privacy |
| SCR-CAN-012 | Bảng điều khiển (Dashboard) | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác dashboard trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/dashboard |
| SCR-CAN-013 | Hồ sơ | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác profile trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/profile |
| SCR-CAN-014 | Hoàn thiện hồ sơ | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác profile completion trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/profile-completion |
| SCR-CAN-015 | Mục tiêu nghề nghiệp | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác career goal trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/career-goal |
| SCR-CAN-016 | Học vấn | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác education trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/education |
| SCR-CAN-017 | Kinh nghiệm | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác experience trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/experience |
| SCR-CAN-018 | Kỹ năng | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác skills trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/skills |
| SCR-CAN-019 | Chứng chỉ | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác certificates trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/certificates |
| SCR-CAN-020 | Hồ sơ năng lực | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác portfolio trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/portfolio |
| SCR-CAN-021 | Tải lên CV | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác cv upload trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/cv-upload |
| SCR-CAN-022 | Phân tích CV | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác cv analysis trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/cv-analysis |
| SCR-CAN-023 | Khám phá chiến dịch | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác campaign discovery trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/campaign-discovery |
| SCR-CAN-024 | Chi tiết chiến dịch | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác campaign details trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/campaign-details |
| SCR-CAN-025 | Tham gia chiến dịch | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác campaign enrollment trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/campaign-enrollment |
| SCR-CAN-026 | Thanh toán | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác payment trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/payment |
| SCR-CAN-027 | Tín dụng | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác credits trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/credits |
| SCR-CAN-028 | Gói đăng ký | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác subscription trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/subscription |
| SCR-CAN-029 | Chuẩn bị phỏng vấn | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác interview preparation trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/interview-preparation |
| SCR-CAN-030 | Xác minh danh tính | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác identity verification trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/identity-verification |
| SCR-CAN-031 | Kiểm tra thiết bị | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác device check trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/device-check |
| SCR-CAN-032 | Phòng chờ phỏng vấn | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác interview waiting trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/interview-waiting |
| SCR-CAN-033 | Phiên phỏng vấn | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác interview session trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/interview-session |
| SCR-CAN-034 | Tạm dừng phỏng vấn | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác interview pause trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/interview-pause |
| SCR-CAN-035 | Hoàn thành phỏng vấn | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác interview completion trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/interview-completion |
| SCR-CAN-036 | Báo cáo AI | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác ai report trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/ai-report |
| SCR-CAN-037 | Phản hồi chi tiết | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác detailed feedback trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/detailed-feedback |
| SCR-CAN-038 | Chi tiết kỹ năng | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác skill breakdown trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/skill-breakdown |
| SCR-CAN-039 | Lộ trình | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác roadmap trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/roadmap |
| SCR-CAN-040 | Trung tâm học tập | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác learning hub trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/learning-hub |
| SCR-CAN-041 | Module học tập | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác learning module trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/learning-module |
| SCR-CAN-042 | Phiên thực hành | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác practice session trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/practice-session |
| SCR-CAN-043 | Bảng tiến độ | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác progress dashboard trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/progress-dashboard |
| SCR-CAN-044 | Bảng xếp hạng | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác leaderboard trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/leaderboard |
| SCR-CAN-045 | Thành tựu | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác achievements trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/achievements |
| SCR-CAN-046 | Chứng nhận | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác certificate trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/certificate |
| SCR-CAN-047 | Thông báo | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác notifications trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/notifications |
| SCR-CAN-048 | Lịch sử | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác history trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/history |
| SCR-CAN-049 | Cài đặt | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác settings trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/settings |
| SCR-CAN-050 | Trợ giúp | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác help trong module Ứng viên. | Cao | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/help |
| SCR-CAN-051 | Hỗ trợ | Ứng viên | Ứng viên | Giao diện hỗ trợ thao tác support trong module Ứng viên. | Trung bình | UF-CAN-01 | BP-CAN-01 | F-CAN-01 | /nav/candidate/support |
| SCR-EMP-052 | Bảng điều khiển HR/Candidate | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác hr/candidate dashboard trong module HR/Candidate. | Cao | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/hr-candidate-dashboard |
| SCR-EMP-053 | Hồ sơ công ty | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác company profile trong module HR/Candidate. | Cao | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/company-profile |
| SCR-EMP-054 | Xác minh công ty | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác company verification trong module HR/Candidate. | Trung bình | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/company-verification |
| SCR-EMP-055 | Danh sách chiến dịch | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác campaign list trong module HR/Candidate. | Cao | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/campaign-list |
| SCR-EMP-056 | Chi tiết chiến dịch | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác campaign details trong module HR/Candidate. | Cao | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/campaign-details |
| SCR-EMP-057 | Tạo chiến dịch | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác create campaign trong module HR/Candidate. | Trung bình | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/create-campaign |
| SCR-EMP-058 | Sửa chiến dịch | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác edit campaign trong module HR/Candidate. | Cao | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/edit-campaign |
| SCR-EMP-059 | Danh sách ứng viên | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác candidate list trong module HR/Candidate. | Cao | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/candidate-list |
| SCR-EMP-060 | Hồ sơ ứng viên | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác candidate profile trong module HR/Candidate. | Trung bình | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/candidate-profile |
| SCR-EMP-061 | Báo cáo phỏng vấn | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác interview reports trong module HR/Candidate. | Cao | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/interview-reports |
| SCR-EMP-062 | Phân tích | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác analytics trong module HR/Candidate. | Cao | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/analytics |
| SCR-EMP-063 | Gói đăng ký | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác subscription trong module HR/Candidate. | Trung bình | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/subscription |
| SCR-EMP-064 | Thanh toán (Billing) | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác billing trong module HR/Candidate. | Cao | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/billing |
| SCR-EMP-065 | Hóa đơn | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác invoices trong module HR/Candidate. | Cao | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/invoices |
| SCR-EMP-066 | Thông báo | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác notifications trong module HR/Candidate. | Trung bình | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/notifications |
| SCR-EMP-067 | Cài đặt | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác settings trong module HR/Candidate. | Cao | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/settings |
| SCR-EMP-068 | Quản lý nhóm | HR/Candidate | HR/Candidate | Giao diện hỗ trợ thao tác team management trong module HR/Candidate. | Cao | UF-EMP-01 | BP-EMP-01 | F-EMP-01 | /nav/hr-candidate/team-management |
| SCR-ADM-069 | Bảng điều khiển (Dashboard) | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác dashboard trong module Quản trị viên. | Trung bình | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/dashboard |
| SCR-ADM-070 | Quản lý người dùng | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác user management trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/user-management |
| SCR-ADM-071 | Quản lý vai trò | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác role management trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/role-management |
| SCR-ADM-072 | Quản lý phân quyền | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác permission management trong module Quản trị viên. | Trung bình | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/permission-management |
| SCR-ADM-073 | Phê duyệt HR/Candidate | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác hr/candidate approval trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/hr-candidate-approval |
| SCR-ADM-074 | Quản lý ứng viên | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác candidate management trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/candidate-management |
| SCR-ADM-075 | Kiểm duyệt chiến dịch | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác campaign moderation trong module Quản trị viên. | Trung bình | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/campaign-moderation |
| SCR-ADM-076 | Quản lý nội dung | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác content management trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/content-management |
| SCR-ADM-077 | Quản lý học tập | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác learning management trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/learning-management |
| SCR-ADM-078 | Cấu hình AI | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác ai configuration trong module Quản trị viên. | Trung bình | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/ai-configuration |
| SCR-ADM-079 | Mẫu thông báo | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác notification templates trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/notification-templates |
| SCR-ADM-080 | Báo cáo | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác reports trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/reports |
| SCR-ADM-081 | Nhật ký hệ thống | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác audit logs trong module Quản trị viên. | Trung bình | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/audit-logs |
| SCR-ADM-082 | Cấu hình hệ thống | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác system configuration trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/system-configuration |
| SCR-ADM-083 | Tính năng thử nghiệm | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác feature flags trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/feature-flags |
| SCR-ADM-084 | Giám sát | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác monitoring trong module Quản trị viên. | Trung bình | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/monitoring |
| SCR-ADM-085 | Bảng trạng thái hệ thống | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác health dashboard trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/health-dashboard |
| SCR-ADM-086 | Sao lưu | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác backups trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/backups |
| SCR-ADM-087 | Bảo trì | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác maintenance trong module Quản trị viên. | Trung bình | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/maintenance |
| SCR-ADM-088 | Yêu cầu hỗ trợ | Quản trị viên | Quản trị Hệ thống | Giao diện hỗ trợ thao tác support tickets trong module Quản trị viên. | Cao | UF-ADM-01 | BP-ADM-01 | F-ADM-01 | /nav/administrator/support-tickets |
| SCR-SHR-089 | Lỗi 404 | Thành phần chung | Hệ thống | Giao diện hỗ trợ thao tác 404 trong module Thành phần chung. | Cao | UF-SHR-01 | BP-SHR-01 | F-SHR-01 | /nav/shared-components/404 |
| SCR-SHR-090 | Lỗi 403 | Thành phần chung | Hệ thống | Giao diện hỗ trợ thao tác 403 trong module Thành phần chung. | Trung bình | UF-SHR-01 | BP-SHR-01 | F-SHR-01 | /nav/shared-components/403 |
| SCR-SHR-091 | Lỗi 500 | Thành phần chung | Hệ thống | Giao diện hỗ trợ thao tác 500 trong module Thành phần chung. | Cao | UF-SHR-01 | BP-SHR-01 | F-SHR-01 | /nav/shared-components/500 |
| SCR-SHR-092 | Bảo trì | Thành phần chung | Hệ thống | Giao diện hỗ trợ thao tác maintenance trong module Thành phần chung. | Cao | UF-SHR-01 | BP-SHR-01 | F-SHR-01 | /nav/shared-components/maintenance |
| SCR-SHR-093 | Đang tải | Thành phần chung | Hệ thống | Giao diện hỗ trợ thao tác loading trong module Thành phần chung. | Trung bình | UF-SHR-01 | BP-SHR-01 | F-SHR-01 | /nav/shared-components/loading |
| SCR-SHR-094 | Trạng thái rỗng | Thành phần chung | Hệ thống | Giao diện hỗ trợ thao tác empty state trong module Thành phần chung. | Cao | UF-SHR-01 | BP-SHR-01 | F-SHR-01 | /nav/shared-components/empty-state |
| SCR-SHR-095 | Trung tâm thông báo | Thành phần chung | Hệ thống | Giao diện hỗ trợ thao tác notification center trong module Thành phần chung. | Cao | UF-SHR-01 | BP-SHR-01 | F-SHR-01 | /nav/shared-components/notification-center |
| SCR-SHR-096 | Hộp thoại tải tệp | Thành phần chung | Hệ thống | Giao diện hỗ trợ thao tác file upload dialog trong module Thành phần chung. | Trung bình | UF-SHR-01 | BP-SHR-01 | F-SHR-01 | /nav/shared-components/file-upload-dialog |
| SCR-SHR-097 | Hộp thoại xác nhận | Thành phần chung | Hệ thống | Giao diện hỗ trợ thao tác confirmation dialog trong module Thành phần chung. | Cao | UF-SHR-01 | BP-SHR-01 | F-SHR-01 | /nav/shared-components/confirmation-dialog |
| SCR-SHR-098 | Hộp thoại báo lỗi | Thành phần chung | Hệ thống | Giao diện hỗ trợ thao tác error dialog trong module Thành phần chung. | Cao | UF-SHR-01 | BP-SHR-01 | F-SHR-01 | /nav/shared-components/error-dialog |
| SCR-SHR-099 | Hộp thoại thành công | Thành phần chung | Hệ thống | Giao diện hỗ trợ thao tác success dialog trong module Thành phần chung. | Trung bình | UF-SHR-01 | BP-SHR-01 | F-SHR-01 | /nav/shared-components/success-dialog |
| SCR-SHR-100 | Hết thời gian phiên | Thành phần chung | Hệ thống | Giao diện hỗ trợ thao tác session timeout trong module Thành phần chung. | Cao | UF-SHR-01 | BP-SHR-01 | F-SHR-01 | /nav/shared-components/session-timeout |

## 4. Màn Hình Xác thực
- **SCR-AUT-001**: Chào mừng
- **SCR-AUT-002**: Đăng nhập
- **SCR-AUT-003**: Đăng ký
- **SCR-AUT-004**: Xác minh Email
- **SCR-AUT-005**: Quên mật khẩu
- **SCR-AUT-006**: Đặt lại mật khẩu
- **SCR-AUT-007**: Xác minh 2 bước
- **SCR-AUT-008**: Hết hạn phiên
- **SCR-AUT-009**: Từ chối truy cập
- **SCR-AUT-010**: Khóa tài khoản
- **SCR-AUT-011**: Điều khoản & Bảo mật

## 5. Màn Hình Ứng viên
- **SCR-CAN-012**: Bảng điều khiển (Dashboard)
- **SCR-CAN-013**: Hồ sơ
- **SCR-CAN-014**: Hoàn thiện hồ sơ
- **SCR-CAN-015**: Mục tiêu nghề nghiệp
- **SCR-CAN-016**: Học vấn
- **SCR-CAN-017**: Kinh nghiệm
- **SCR-CAN-018**: Kỹ năng
- **SCR-CAN-019**: Chứng chỉ
- **SCR-CAN-020**: Hồ sơ năng lực
- **SCR-CAN-021**: Tải lên CV
- **SCR-CAN-022**: Phân tích CV
- **SCR-CAN-023**: Khám phá chiến dịch
- **SCR-CAN-024**: Chi tiết chiến dịch
- **SCR-CAN-025**: Tham gia chiến dịch
- **SCR-CAN-026**: Thanh toán
- **SCR-CAN-027**: Tín dụng
- **SCR-CAN-028**: Gói đăng ký
- **SCR-CAN-029**: Chuẩn bị phỏng vấn
- **SCR-CAN-030**: Xác minh danh tính
- **SCR-CAN-031**: Kiểm tra thiết bị
- **SCR-CAN-032**: Phòng chờ phỏng vấn
- **SCR-CAN-033**: Phiên phỏng vấn
- **SCR-CAN-034**: Tạm dừng phỏng vấn
- **SCR-CAN-035**: Hoàn thành phỏng vấn
- **SCR-CAN-036**: Báo cáo AI
- **SCR-CAN-037**: Phản hồi chi tiết
- **SCR-CAN-038**: Chi tiết kỹ năng
- **SCR-CAN-039**: Lộ trình
- **SCR-CAN-040**: Trung tâm học tập
- **SCR-CAN-041**: Module học tập
- **SCR-CAN-042**: Phiên thực hành
- **SCR-CAN-043**: Bảng tiến độ
- **SCR-CAN-044**: Bảng xếp hạng
- **SCR-CAN-045**: Thành tựu
- **SCR-CAN-046**: Chứng nhận
- **SCR-CAN-047**: Thông báo
- **SCR-CAN-048**: Lịch sử
- **SCR-CAN-049**: Cài đặt
- **SCR-CAN-050**: Trợ giúp
- **SCR-CAN-051**: Hỗ trợ

## 6. Màn Hình HR/Candidate
- **SCR-EMP-052**: Bảng điều khiển HR/Candidate
- **SCR-EMP-053**: Hồ sơ công ty
- **SCR-EMP-054**: Xác minh công ty
- **SCR-EMP-055**: Danh sách chiến dịch
- **SCR-EMP-056**: Chi tiết chiến dịch
- **SCR-EMP-057**: Tạo chiến dịch
- **SCR-EMP-058**: Sửa chiến dịch
- **SCR-EMP-059**: Danh sách ứng viên
- **SCR-EMP-060**: Hồ sơ ứng viên
- **SCR-EMP-061**: Báo cáo phỏng vấn
- **SCR-EMP-062**: Phân tích
- **SCR-EMP-063**: Gói đăng ký
- **SCR-EMP-064**: Thanh toán (Billing)
- **SCR-EMP-065**: Hóa đơn
- **SCR-EMP-066**: Thông báo
- **SCR-EMP-067**: Cài đặt
- **SCR-EMP-068**: Quản lý nhóm

## 7. Màn Hình Quản trị viên
- **SCR-ADM-069**: Bảng điều khiển (Dashboard)
- **SCR-ADM-070**: Quản lý người dùng
- **SCR-ADM-071**: Quản lý vai trò
- **SCR-ADM-072**: Quản lý phân quyền
- **SCR-ADM-073**: Phê duyệt HR/Candidate
- **SCR-ADM-074**: Quản lý ứng viên
- **SCR-ADM-075**: Kiểm duyệt chiến dịch
- **SCR-ADM-076**: Quản lý nội dung
- **SCR-ADM-077**: Quản lý học tập
- **SCR-ADM-078**: Cấu hình AI
- **SCR-ADM-079**: Mẫu thông báo
- **SCR-ADM-080**: Báo cáo
- **SCR-ADM-081**: Nhật ký hệ thống
- **SCR-ADM-082**: Cấu hình hệ thống
- **SCR-ADM-083**: Tính năng thử nghiệm
- **SCR-ADM-084**: Giám sát
- **SCR-ADM-085**: Bảng trạng thái hệ thống
- **SCR-ADM-086**: Sao lưu
- **SCR-ADM-087**: Bảo trì
- **SCR-ADM-088**: Yêu cầu hỗ trợ

## 8. Màn Hình Thành phần chung
- **SCR-SHR-089**: Lỗi 404
- **SCR-SHR-090**: Lỗi 403
- **SCR-SHR-091**: Lỗi 500
- **SCR-SHR-092**: Bảo trì
- **SCR-SHR-093**: Đang tải
- **SCR-SHR-094**: Trạng thái rỗng
- **SCR-SHR-095**: Trung tâm thông báo
- **SCR-SHR-096**: Hộp thoại tải tệp
- **SCR-SHR-097**: Hộp thoại xác nhận
- **SCR-SHR-098**: Hộp thoại báo lỗi
- **SCR-SHR-099**: Hộp thoại thành công
- **SCR-SHR-100**: Hết thời gian phiên

## 9. Đặc Tả Màn Hình Chi Tiết
### SCR-AUT-001: Chào mừng
- **Mã Màn Hình:** SCR-AUT-001
- **Tên Màn Hình:** Chào mừng (Welcome)
- **Mục Đích:** Hỗ trợ quy trình welcome cho đối tượng Khách.
- **Đối Tượng Chính (Persona):** Khách
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-AUT-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác welcome trong module Xác thực.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-AUT-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-AUT-01
- **Yêu Cầu Chức Năng Liên Quan:** F-AUT-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** AUTHENTICATION_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-AUT-002: Đăng nhập
- **Mã Màn Hình:** SCR-AUT-002
- **Tên Màn Hình:** Đăng nhập (Login)
- **Mục Đích:** Hỗ trợ quy trình login cho đối tượng Khách.
- **Đối Tượng Chính (Persona):** Khách
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-AUT-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác login trong module Xác thực.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-AUT-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-AUT-01
- **Yêu Cầu Chức Năng Liên Quan:** F-AUT-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** AUTHENTICATION_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-AUT-003: Đăng ký
- **Mã Màn Hình:** SCR-AUT-003
- **Tên Màn Hình:** Đăng ký (Register)
- **Mục Đích:** Hỗ trợ quy trình register cho đối tượng Khách.
- **Đối Tượng Chính (Persona):** Khách
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-AUT-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác register trong module Xác thực.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-AUT-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-AUT-01
- **Yêu Cầu Chức Năng Liên Quan:** F-AUT-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** AUTHENTICATION_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-AUT-004: Xác minh Email
- **Mã Màn Hình:** SCR-AUT-004
- **Tên Màn Hình:** Xác minh Email (Email Verification)
- **Mục Đích:** Hỗ trợ quy trình email verification cho đối tượng Khách.
- **Đối Tượng Chính (Persona):** Khách
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-AUT-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác email verification trong module Xác thực.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-AUT-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-AUT-01
- **Yêu Cầu Chức Năng Liên Quan:** F-AUT-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** AUTHENTICATION_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-AUT-005: Quên mật khẩu
- **Mã Màn Hình:** SCR-AUT-005
- **Tên Màn Hình:** Quên mật khẩu (Forgot Password)
- **Mục Đích:** Hỗ trợ quy trình forgot password cho đối tượng Khách.
- **Đối Tượng Chính (Persona):** Khách
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-AUT-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác forgot password trong module Xác thực.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-AUT-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-AUT-01
- **Yêu Cầu Chức Năng Liên Quan:** F-AUT-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** AUTHENTICATION_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-AUT-006: Đặt lại mật khẩu
- **Mã Màn Hình:** SCR-AUT-006
- **Tên Màn Hình:** Đặt lại mật khẩu (Reset Password)
- **Mục Đích:** Hỗ trợ quy trình reset password cho đối tượng Khách.
- **Đối Tượng Chính (Persona):** Khách
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-AUT-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác reset password trong module Xác thực.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-AUT-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-AUT-01
- **Yêu Cầu Chức Năng Liên Quan:** F-AUT-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** AUTHENTICATION_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-AUT-007: Xác minh 2 bước
- **Mã Màn Hình:** SCR-AUT-007
- **Tên Màn Hình:** Xác minh 2 bước (Two-Factor Verification)
- **Mục Đích:** Hỗ trợ quy trình two-factor verification cho đối tượng Khách.
- **Đối Tượng Chính (Persona):** Khách
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-AUT-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác two-factor verification trong module Xác thực.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-AUT-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-AUT-01
- **Yêu Cầu Chức Năng Liên Quan:** F-AUT-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** AUTHENTICATION_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-AUT-008: Hết hạn phiên
- **Mã Màn Hình:** SCR-AUT-008
- **Tên Màn Hình:** Hết hạn phiên (Session Expired)
- **Mục Đích:** Hỗ trợ quy trình session expired cho đối tượng Khách.
- **Đối Tượng Chính (Persona):** Khách
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-AUT-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác session expired trong module Xác thực.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-AUT-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-AUT-01
- **Yêu Cầu Chức Năng Liên Quan:** F-AUT-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** AUTHENTICATION_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-AUT-009: Từ chối truy cập
- **Mã Màn Hình:** SCR-AUT-009
- **Tên Màn Hình:** Từ chối truy cập (Access Denied)
- **Mục Đích:** Hỗ trợ quy trình access denied cho đối tượng Khách.
- **Đối Tượng Chính (Persona):** Khách
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-AUT-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác access denied trong module Xác thực.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-AUT-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-AUT-01
- **Yêu Cầu Chức Năng Liên Quan:** F-AUT-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** AUTHENTICATION_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-AUT-010: Khóa tài khoản
- **Mã Màn Hình:** SCR-AUT-010
- **Tên Màn Hình:** Khóa tài khoản (Account Locked)
- **Mục Đích:** Hỗ trợ quy trình account locked cho đối tượng Khách.
- **Đối Tượng Chính (Persona):** Khách
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-AUT-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác account locked trong module Xác thực.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-AUT-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-AUT-01
- **Yêu Cầu Chức Năng Liên Quan:** F-AUT-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** AUTHENTICATION_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-AUT-011: Điều khoản & Bảo mật
- **Mã Màn Hình:** SCR-AUT-011
- **Tên Màn Hình:** Điều khoản & Bảo mật (Terms & Privacy)
- **Mục Đích:** Hỗ trợ quy trình terms & privacy cho đối tượng Khách.
- **Đối Tượng Chính (Persona):** Khách
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-AUT-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác terms & privacy trong module Xác thực.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-AUT-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-AUT-01
- **Yêu Cầu Chức Năng Liên Quan:** F-AUT-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** AUTHENTICATION_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-012: Bảng điều khiển (Dashboard)
- **Mã Màn Hình:** SCR-CAN-012
- **Tên Màn Hình:** Bảng điều khiển (Dashboard) (Dashboard)
- **Mục Đích:** Hỗ trợ quy trình dashboard cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác dashboard trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-013: Hồ sơ
- **Mã Màn Hình:** SCR-CAN-013
- **Tên Màn Hình:** Hồ sơ (Profile)
- **Mục Đích:** Hỗ trợ quy trình profile cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác profile trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-014: Hoàn thiện hồ sơ
- **Mã Màn Hình:** SCR-CAN-014
- **Tên Màn Hình:** Hoàn thiện hồ sơ (Profile Completion)
- **Mục Đích:** Hỗ trợ quy trình profile completion cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác profile completion trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-015: Mục tiêu nghề nghiệp
- **Mã Màn Hình:** SCR-CAN-015
- **Tên Màn Hình:** Mục tiêu nghề nghiệp (Career Goal)
- **Mục Đích:** Hỗ trợ quy trình career goal cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác career goal trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-016: Học vấn
- **Mã Màn Hình:** SCR-CAN-016
- **Tên Màn Hình:** Học vấn (Education)
- **Mục Đích:** Hỗ trợ quy trình education cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác education trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-017: Kinh nghiệm
- **Mã Màn Hình:** SCR-CAN-017
- **Tên Màn Hình:** Kinh nghiệm (Experience)
- **Mục Đích:** Hỗ trợ quy trình experience cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác experience trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-018: Kỹ năng
- **Mã Màn Hình:** SCR-CAN-018
- **Tên Màn Hình:** Kỹ năng (Skills)
- **Mục Đích:** Hỗ trợ quy trình skills cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác skills trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-019: Chứng chỉ
- **Mã Màn Hình:** SCR-CAN-019
- **Tên Màn Hình:** Chứng chỉ (Certificates)
- **Mục Đích:** Hỗ trợ quy trình certificates cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác certificates trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-020: Hồ sơ năng lực
- **Mã Màn Hình:** SCR-CAN-020
- **Tên Màn Hình:** Hồ sơ năng lực (Portfolio)
- **Mục Đích:** Hỗ trợ quy trình portfolio cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác portfolio trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-021: Tải lên CV
- **Mã Màn Hình:** SCR-CAN-021
- **Tên Màn Hình:** Tải lên CV (CV Upload)
- **Mục Đích:** Hỗ trợ quy trình cv upload cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác cv upload trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-022: Phân tích CV
- **Mã Màn Hình:** SCR-CAN-022
- **Tên Màn Hình:** Phân tích CV (CV Analysis)
- **Mục Đích:** Hỗ trợ quy trình cv analysis cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác cv analysis trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-023: Khám phá chiến dịch
- **Mã Màn Hình:** SCR-CAN-023
- **Tên Màn Hình:** Khám phá chiến dịch (Campaign Discovery)
- **Mục Đích:** Hỗ trợ quy trình campaign discovery cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác campaign discovery trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-024: Chi tiết chiến dịch
- **Mã Màn Hình:** SCR-CAN-024
- **Tên Màn Hình:** Chi tiết chiến dịch (Campaign Details)
- **Mục Đích:** Hỗ trợ quy trình campaign details cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác campaign details trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-025: Tham gia chiến dịch
- **Mã Màn Hình:** SCR-CAN-025
- **Tên Màn Hình:** Tham gia chiến dịch (Campaign Enrollment)
- **Mục Đích:** Hỗ trợ quy trình campaign enrollment cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác campaign enrollment trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-026: Thanh toán
- **Mã Màn Hình:** SCR-CAN-026
- **Tên Màn Hình:** Thanh toán (Payment)
- **Mục Đích:** Hỗ trợ quy trình payment cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác payment trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-027: Tín dụng
- **Mã Màn Hình:** SCR-CAN-027
- **Tên Màn Hình:** Tín dụng (Credits)
- **Mục Đích:** Hỗ trợ quy trình credits cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác credits trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-028: Gói đăng ký
- **Mã Màn Hình:** SCR-CAN-028
- **Tên Màn Hình:** Gói đăng ký (Subscription)
- **Mục Đích:** Hỗ trợ quy trình subscription cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác subscription trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-029: Chuẩn bị phỏng vấn
- **Mã Màn Hình:** SCR-CAN-029
- **Tên Màn Hình:** Chuẩn bị phỏng vấn (Interview Preparation)
- **Mục Đích:** Hỗ trợ quy trình interview preparation cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác interview preparation trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-030: Xác minh danh tính
- **Mã Màn Hình:** SCR-CAN-030
- **Tên Màn Hình:** Xác minh danh tính (Identity Verification)
- **Mục Đích:** Hỗ trợ quy trình identity verification cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác identity verification trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-031: Kiểm tra thiết bị
- **Mã Màn Hình:** SCR-CAN-031
- **Tên Màn Hình:** Kiểm tra thiết bị (Device Check)
- **Mục Đích:** Hỗ trợ quy trình device check cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác device check trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-032: Phòng chờ phỏng vấn
- **Mã Màn Hình:** SCR-CAN-032
- **Tên Màn Hình:** Phòng chờ phỏng vấn (Interview Waiting)
- **Mục Đích:** Hỗ trợ quy trình interview waiting cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác interview waiting trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-033: Phiên phỏng vấn
- **Mã Màn Hình:** SCR-CAN-033
- **Tên Màn Hình:** Phiên phỏng vấn (Interview Session)
- **Mục Đích:** Hỗ trợ quy trình interview session cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác interview session trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-034: Tạm dừng phỏng vấn
- **Mã Màn Hình:** SCR-CAN-034
- **Tên Màn Hình:** Tạm dừng phỏng vấn (Interview Pause)
- **Mục Đích:** Hỗ trợ quy trình interview pause cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác interview pause trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-035: Hoàn thành phỏng vấn
- **Mã Màn Hình:** SCR-CAN-035
- **Tên Màn Hình:** Hoàn thành phỏng vấn (Interview Completion)
- **Mục Đích:** Hỗ trợ quy trình interview completion cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác interview completion trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-036: Báo cáo AI
- **Mã Màn Hình:** SCR-CAN-036
- **Tên Màn Hình:** Báo cáo AI (AI Report)
- **Mục Đích:** Hỗ trợ quy trình ai report cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác ai report trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-037: Phản hồi chi tiết
- **Mã Màn Hình:** SCR-CAN-037
- **Tên Màn Hình:** Phản hồi chi tiết (Detailed Feedback)
- **Mục Đích:** Hỗ trợ quy trình detailed feedback cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác detailed feedback trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-038: Chi tiết kỹ năng
- **Mã Màn Hình:** SCR-CAN-038
- **Tên Màn Hình:** Chi tiết kỹ năng (Skill Breakdown)
- **Mục Đích:** Hỗ trợ quy trình skill breakdown cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác skill breakdown trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-039: Lộ trình
- **Mã Màn Hình:** SCR-CAN-039
- **Tên Màn Hình:** Lộ trình (Roadmap)
- **Mục Đích:** Hỗ trợ quy trình roadmap cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác roadmap trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-040: Trung tâm học tập
- **Mã Màn Hình:** SCR-CAN-040
- **Tên Màn Hình:** Trung tâm học tập (Learning Hub)
- **Mục Đích:** Hỗ trợ quy trình learning hub cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác learning hub trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-041: Module học tập
- **Mã Màn Hình:** SCR-CAN-041
- **Tên Màn Hình:** Module học tập (Learning Module)
- **Mục Đích:** Hỗ trợ quy trình learning module cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác learning module trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-042: Phiên thực hành
- **Mã Màn Hình:** SCR-CAN-042
- **Tên Màn Hình:** Phiên thực hành (Practice Session)
- **Mục Đích:** Hỗ trợ quy trình practice session cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác practice session trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-043: Bảng tiến độ
- **Mã Màn Hình:** SCR-CAN-043
- **Tên Màn Hình:** Bảng tiến độ (Progress Dashboard)
- **Mục Đích:** Hỗ trợ quy trình progress dashboard cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác progress dashboard trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-044: Bảng xếp hạng
- **Mã Màn Hình:** SCR-CAN-044
- **Tên Màn Hình:** Bảng xếp hạng (Leaderboard)
- **Mục Đích:** Hỗ trợ quy trình leaderboard cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác leaderboard trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-045: Thành tựu
- **Mã Màn Hình:** SCR-CAN-045
- **Tên Màn Hình:** Thành tựu (Achievements)
- **Mục Đích:** Hỗ trợ quy trình achievements cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác achievements trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-046: Chứng nhận
- **Mã Màn Hình:** SCR-CAN-046
- **Tên Màn Hình:** Chứng nhận (Certificate)
- **Mục Đích:** Hỗ trợ quy trình certificate cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác certificate trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-047: Thông báo
- **Mã Màn Hình:** SCR-CAN-047
- **Tên Màn Hình:** Thông báo (Notifications)
- **Mục Đích:** Hỗ trợ quy trình notifications cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác notifications trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-048: Lịch sử
- **Mã Màn Hình:** SCR-CAN-048
- **Tên Màn Hình:** Lịch sử (History)
- **Mục Đích:** Hỗ trợ quy trình history cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác history trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-CAN-049: Cài đặt
- **Mã Màn Hình:** SCR-CAN-049
- **Tên Màn Hình:** Cài đặt (Settings)
- **Mục Đích:** Hỗ trợ quy trình settings cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác settings trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-050: Trợ giúp
- **Mã Màn Hình:** SCR-CAN-050
- **Tên Màn Hình:** Trợ giúp (Help)
- **Mục Đích:** Hỗ trợ quy trình help cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác help trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-CAN-051: Hỗ trợ
- **Mã Màn Hình:** SCR-CAN-051
- **Tên Màn Hình:** Hỗ trợ (Support)
- **Mục Đích:** Hỗ trợ quy trình support cho đối tượng Ứng viên.
- **Đối Tượng Chính (Persona):** Ứng viên
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-CAN-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác support trong module Ứng viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-CAN-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-CAN-01
- **Yêu Cầu Chức Năng Liên Quan:** F-CAN-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-EMP-052: Bảng điều khiển HR/Candidate
- **Mã Màn Hình:** SCR-EMP-052
- **Tên Màn Hình:** Bảng điều khiển HR/Candidate (Employer Dashboard)
- **Mục Đích:** Hỗ trợ quy trình hr/candidate dashboard cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác hr/candidate dashboard trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-EMP-053: Hồ sơ công ty
- **Mã Màn Hình:** SCR-EMP-053
- **Tên Màn Hình:** Hồ sơ công ty (Company Profile)
- **Mục Đích:** Hỗ trợ quy trình company profile cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác company profile trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-EMP-054: Xác minh công ty
- **Mã Màn Hình:** SCR-EMP-054
- **Tên Màn Hình:** Xác minh công ty (Company Verification)
- **Mục Đích:** Hỗ trợ quy trình company verification cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác company verification trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-EMP-055: Danh sách chiến dịch
- **Mã Màn Hình:** SCR-EMP-055
- **Tên Màn Hình:** Danh sách chiến dịch (Campaign List)
- **Mục Đích:** Hỗ trợ quy trình campaign list cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác campaign list trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-EMP-056: Chi tiết chiến dịch
- **Mã Màn Hình:** SCR-EMP-056
- **Tên Màn Hình:** Chi tiết chiến dịch (Campaign Details)
- **Mục Đích:** Hỗ trợ quy trình campaign details cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác campaign details trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-EMP-057: Tạo chiến dịch
- **Mã Màn Hình:** SCR-EMP-057
- **Tên Màn Hình:** Tạo chiến dịch (Create Campaign)
- **Mục Đích:** Hỗ trợ quy trình create campaign cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác create campaign trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-EMP-058: Sửa chiến dịch
- **Mã Màn Hình:** SCR-EMP-058
- **Tên Màn Hình:** Sửa chiến dịch (Edit Campaign)
- **Mục Đích:** Hỗ trợ quy trình edit campaign cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác edit campaign trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-EMP-059: Danh sách ứng viên
- **Mã Màn Hình:** SCR-EMP-059
- **Tên Màn Hình:** Danh sách ứng viên (Candidate List)
- **Mục Đích:** Hỗ trợ quy trình candidate list cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác candidate list trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-EMP-060: Hồ sơ ứng viên
- **Mã Màn Hình:** SCR-EMP-060
- **Tên Màn Hình:** Hồ sơ ứng viên (Candidate Profile)
- **Mục Đích:** Hỗ trợ quy trình candidate profile cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác candidate profile trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-EMP-061: Báo cáo phỏng vấn
- **Mã Màn Hình:** SCR-EMP-061
- **Tên Màn Hình:** Báo cáo phỏng vấn (Interview Reports)
- **Mục Đích:** Hỗ trợ quy trình interview reports cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác interview reports trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-EMP-062: Phân tích
- **Mã Màn Hình:** SCR-EMP-062
- **Tên Màn Hình:** Phân tích (Analytics)
- **Mục Đích:** Hỗ trợ quy trình analytics cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác analytics trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-EMP-063: Gói đăng ký
- **Mã Màn Hình:** SCR-EMP-063
- **Tên Màn Hình:** Gói đăng ký (Subscription)
- **Mục Đích:** Hỗ trợ quy trình subscription cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác subscription trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-EMP-064: Thanh toán (Billing)
- **Mã Màn Hình:** SCR-EMP-064
- **Tên Màn Hình:** Thanh toán (Billing) (Billing)
- **Mục Đích:** Hỗ trợ quy trình billing cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác billing trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-EMP-065: Hóa đơn
- **Mã Màn Hình:** SCR-EMP-065
- **Tên Màn Hình:** Hóa đơn (Invoices)
- **Mục Đích:** Hỗ trợ quy trình invoices cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác invoices trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-EMP-066: Thông báo
- **Mã Màn Hình:** SCR-EMP-066
- **Tên Màn Hình:** Thông báo (Notifications)
- **Mục Đích:** Hỗ trợ quy trình notifications cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác notifications trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-EMP-067: Cài đặt
- **Mã Màn Hình:** SCR-EMP-067
- **Tên Màn Hình:** Cài đặt (Settings)
- **Mục Đích:** Hỗ trợ quy trình settings cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác settings trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-EMP-068: Quản lý nhóm
- **Mã Màn Hình:** SCR-EMP-068
- **Tên Màn Hình:** Quản lý nhóm (Team Management)
- **Mục Đích:** Hỗ trợ quy trình team management cho đối tượng HR/Candidate.
- **Đối Tượng Chính (Persona):** HR/Candidate
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-EMP-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác team management trong module HR/Candidate.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-EMP-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-EMP-01
- **Yêu Cầu Chức Năng Liên Quan:** F-EMP-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** HR_CANDIDATE_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-069: Bảng điều khiển (Dashboard)
- **Mã Màn Hình:** SCR-ADM-069
- **Tên Màn Hình:** Bảng điều khiển (Dashboard) (Dashboard)
- **Mục Đích:** Hỗ trợ quy trình dashboard cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác dashboard trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-ADM-070: Quản lý người dùng
- **Mã Màn Hình:** SCR-ADM-070
- **Tên Màn Hình:** Quản lý người dùng (User Management)
- **Mục Đích:** Hỗ trợ quy trình user management cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác user management trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-071: Quản lý vai trò
- **Mã Màn Hình:** SCR-ADM-071
- **Tên Màn Hình:** Quản lý vai trò (Role Management)
- **Mục Đích:** Hỗ trợ quy trình role management cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác role management trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-072: Quản lý phân quyền
- **Mã Màn Hình:** SCR-ADM-072
- **Tên Màn Hình:** Quản lý phân quyền (Permission Management)
- **Mục Đích:** Hỗ trợ quy trình permission management cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác permission management trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-ADM-073: Phê duyệt HR/Candidate
- **Mã Màn Hình:** SCR-ADM-073
- **Tên Màn Hình:** Phê duyệt HR/Candidate (Employer Approval)
- **Mục Đích:** Hỗ trợ quy trình hr/candidate approval cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác hr/candidate approval trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-074: Quản lý ứng viên
- **Mã Màn Hình:** SCR-ADM-074
- **Tên Màn Hình:** Quản lý ứng viên (Candidate Management)
- **Mục Đích:** Hỗ trợ quy trình candidate management cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác candidate management trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-075: Kiểm duyệt chiến dịch
- **Mã Màn Hình:** SCR-ADM-075
- **Tên Màn Hình:** Kiểm duyệt chiến dịch (Campaign Moderation)
- **Mục Đích:** Hỗ trợ quy trình campaign moderation cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác campaign moderation trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-ADM-076: Quản lý nội dung
- **Mã Màn Hình:** SCR-ADM-076
- **Tên Màn Hình:** Quản lý nội dung (Content Management)
- **Mục Đích:** Hỗ trợ quy trình content management cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác content management trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-077: Quản lý học tập
- **Mã Màn Hình:** SCR-ADM-077
- **Tên Màn Hình:** Quản lý học tập (Learning Management)
- **Mục Đích:** Hỗ trợ quy trình learning management cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác learning management trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-078: Cấu hình AI
- **Mã Màn Hình:** SCR-ADM-078
- **Tên Màn Hình:** Cấu hình AI (AI Configuration)
- **Mục Đích:** Hỗ trợ quy trình ai configuration cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác ai configuration trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-ADM-079: Mẫu thông báo
- **Mã Màn Hình:** SCR-ADM-079
- **Tên Màn Hình:** Mẫu thông báo (Notification Templates)
- **Mục Đích:** Hỗ trợ quy trình notification templates cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác notification templates trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-080: Báo cáo
- **Mã Màn Hình:** SCR-ADM-080
- **Tên Màn Hình:** Báo cáo (Reports)
- **Mục Đích:** Hỗ trợ quy trình reports cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác reports trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-081: Nhật ký hệ thống
- **Mã Màn Hình:** SCR-ADM-081
- **Tên Màn Hình:** Nhật ký hệ thống (Audit Logs)
- **Mục Đích:** Hỗ trợ quy trình audit logs cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác audit logs trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-ADM-082: Cấu hình hệ thống
- **Mã Màn Hình:** SCR-ADM-082
- **Tên Màn Hình:** Cấu hình hệ thống (System Configuration)
- **Mục Đích:** Hỗ trợ quy trình system configuration cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác system configuration trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-083: Tính năng thử nghiệm
- **Mã Màn Hình:** SCR-ADM-083
- **Tên Màn Hình:** Tính năng thử nghiệm (Feature Flags)
- **Mục Đích:** Hỗ trợ quy trình feature flags cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác feature flags trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-084: Giám sát
- **Mã Màn Hình:** SCR-ADM-084
- **Tên Màn Hình:** Giám sát (Monitoring)
- **Mục Đích:** Hỗ trợ quy trình monitoring cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác monitoring trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-ADM-085: Bảng trạng thái hệ thống
- **Mã Màn Hình:** SCR-ADM-085
- **Tên Màn Hình:** Bảng trạng thái hệ thống (Health Dashboard)
- **Mục Đích:** Hỗ trợ quy trình health dashboard cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác health dashboard trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-086: Sao lưu
- **Mã Màn Hình:** SCR-ADM-086
- **Tên Màn Hình:** Sao lưu (Backups)
- **Mục Đích:** Hỗ trợ quy trình backups cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác backups trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-ADM-087: Bảo trì
- **Mã Màn Hình:** SCR-ADM-087
- **Tên Màn Hình:** Bảo trì (Maintenance)
- **Mục Đích:** Hỗ trợ quy trình maintenance cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác maintenance trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-ADM-088: Yêu cầu hỗ trợ
- **Mã Màn Hình:** SCR-ADM-088
- **Tên Màn Hình:** Yêu cầu hỗ trợ (Support Tickets)
- **Mục Đích:** Hỗ trợ quy trình support tickets cho đối tượng Quản trị Hệ thống.
- **Đối Tượng Chính (Persona):** Quản trị Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-ADM-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác support tickets trong module Quản trị viên.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-ADM-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-ADM-01
- **Yêu Cầu Chức Năng Liên Quan:** F-ADM-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** ADMINISTRATOR_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-SHR-089: Lỗi 404
- **Mã Màn Hình:** SCR-SHR-089
- **Tên Màn Hình:** Lỗi 404 (404)
- **Mục Đích:** Hỗ trợ quy trình 404 cho đối tượng Hệ thống.
- **Đối Tượng Chính (Persona):** Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-SHR-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác 404 trong module Thành phần chung.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-SHR-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-SHR-01
- **Yêu Cầu Chức Năng Liên Quan:** F-SHR-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** SHARED_COMPONENTS_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-SHR-090: Lỗi 403
- **Mã Màn Hình:** SCR-SHR-090
- **Tên Màn Hình:** Lỗi 403 (403)
- **Mục Đích:** Hỗ trợ quy trình 403 cho đối tượng Hệ thống.
- **Đối Tượng Chính (Persona):** Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-SHR-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác 403 trong module Thành phần chung.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-SHR-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-SHR-01
- **Yêu Cầu Chức Năng Liên Quan:** F-SHR-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** SHARED_COMPONENTS_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-SHR-091: Lỗi 500
- **Mã Màn Hình:** SCR-SHR-091
- **Tên Màn Hình:** Lỗi 500 (500)
- **Mục Đích:** Hỗ trợ quy trình 500 cho đối tượng Hệ thống.
- **Đối Tượng Chính (Persona):** Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-SHR-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác 500 trong module Thành phần chung.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-SHR-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-SHR-01
- **Yêu Cầu Chức Năng Liên Quan:** F-SHR-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** SHARED_COMPONENTS_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-SHR-092: Bảo trì
- **Mã Màn Hình:** SCR-SHR-092
- **Tên Màn Hình:** Bảo trì (Maintenance)
- **Mục Đích:** Hỗ trợ quy trình maintenance cho đối tượng Hệ thống.
- **Đối Tượng Chính (Persona):** Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-SHR-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác maintenance trong module Thành phần chung.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-SHR-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-SHR-01
- **Yêu Cầu Chức Năng Liên Quan:** F-SHR-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** SHARED_COMPONENTS_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-SHR-093: Đang tải
- **Mã Màn Hình:** SCR-SHR-093
- **Tên Màn Hình:** Đang tải (Loading)
- **Mục Đích:** Hỗ trợ quy trình loading cho đối tượng Hệ thống.
- **Đối Tượng Chính (Persona):** Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-SHR-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác loading trong module Thành phần chung.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-SHR-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-SHR-01
- **Yêu Cầu Chức Năng Liên Quan:** F-SHR-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** SHARED_COMPONENTS_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-SHR-094: Trạng thái rỗng
- **Mã Màn Hình:** SCR-SHR-094
- **Tên Màn Hình:** Trạng thái rỗng (Empty State)
- **Mục Đích:** Hỗ trợ quy trình empty state cho đối tượng Hệ thống.
- **Đối Tượng Chính (Persona):** Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-SHR-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác empty state trong module Thành phần chung.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-SHR-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-SHR-01
- **Yêu Cầu Chức Năng Liên Quan:** F-SHR-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** SHARED_COMPONENTS_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-SHR-095: Trung tâm thông báo
- **Mã Màn Hình:** SCR-SHR-095
- **Tên Màn Hình:** Trung tâm thông báo (Notification Center)
- **Mục Đích:** Hỗ trợ quy trình notification center cho đối tượng Hệ thống.
- **Đối Tượng Chính (Persona):** Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-SHR-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác notification center trong module Thành phần chung.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-SHR-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-SHR-01
- **Yêu Cầu Chức Năng Liên Quan:** F-SHR-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** SHARED_COMPONENTS_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-SHR-096: Hộp thoại tải tệp
- **Mã Màn Hình:** SCR-SHR-096
- **Tên Màn Hình:** Hộp thoại tải tệp (File Upload Dialog)
- **Mục Đích:** Hỗ trợ quy trình file upload dialog cho đối tượng Hệ thống.
- **Đối Tượng Chính (Persona):** Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-SHR-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác file upload dialog trong module Thành phần chung.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-SHR-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-SHR-01
- **Yêu Cầu Chức Năng Liên Quan:** F-SHR-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** SHARED_COMPONENTS_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-SHR-097: Hộp thoại xác nhận
- **Mã Màn Hình:** SCR-SHR-097
- **Tên Màn Hình:** Hộp thoại xác nhận (Confirmation Dialog)
- **Mục Đích:** Hỗ trợ quy trình confirmation dialog cho đối tượng Hệ thống.
- **Đối Tượng Chính (Persona):** Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-SHR-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác confirmation dialog trong module Thành phần chung.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-SHR-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-SHR-01
- **Yêu Cầu Chức Năng Liên Quan:** F-SHR-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** SHARED_COMPONENTS_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-SHR-098: Hộp thoại báo lỗi
- **Mã Màn Hình:** SCR-SHR-098
- **Tên Màn Hình:** Hộp thoại báo lỗi (Error Dialog)
- **Mục Đích:** Hỗ trợ quy trình error dialog cho đối tượng Hệ thống.
- **Đối Tượng Chính (Persona):** Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-SHR-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác error dialog trong module Thành phần chung.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-SHR-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-SHR-01
- **Yêu Cầu Chức Năng Liên Quan:** F-SHR-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** SHARED_COMPONENTS_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

### SCR-SHR-099: Hộp thoại thành công
- **Mã Màn Hình:** SCR-SHR-099
- **Tên Màn Hình:** Hộp thoại thành công (Success Dialog)
- **Mục Đích:** Hỗ trợ quy trình success dialog cho đối tượng Hệ thống.
- **Đối Tượng Chính (Persona):** Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-SHR-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác success dialog trong module Thành phần chung.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-SHR-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-SHR-01
- **Yêu Cầu Chức Năng Liên Quan:** F-SHR-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** SHARED_COMPONENTS_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Trung bình

### SCR-SHR-100: Hết thời gian phiên
- **Mã Màn Hình:** SCR-SHR-100
- **Tên Màn Hình:** Hết thời gian phiên (Session Timeout)
- **Mục Đích:** Hỗ trợ quy trình session timeout cho đối tượng Hệ thống.
- **Đối Tượng Chính (Persona):** Hệ thống
- **Mục Tiêu Kinh Doanh:** Cho phép thực thi liền mạch BP-SHR-01 để duy trì tương tác và hiệu quả hoạt động.
- **Mô Tả:** Giao diện hỗ trợ thao tác session timeout trong module Thành phần chung.
- **Điều Kiện Đầu Vào:** Người dùng đã xác thực (nếu yêu cầu) và có ngữ cảnh trạng thái phù hợp.
- **Điều Kiện Đầu Ra:** Trạng thái được lưu, API trả về 2xx, người dùng chuyển hướng tới bước tiếp theo.
- **Nguồn Điều Hướng:** Dashboard cha, Menu ngữ cảnh, hoặc Liên kết trực tiếp.
- **Đích Điều Hướng:** Màn hình tiếp theo trong UF-SHR-01 hoặc quay lại Dashboard.
- **Luồng Người Dùng Liên Quan:** UF-SHR-01
- **Yêu Cầu Chức Năng Liên Quan:** F-SHR-01
- **Quy Tắc Kinh Doanh Liên Quan:** BR-SEC-01 (Bảo mật dữ liệu), BR-UI-05 (Khả năng truy cập).
- **Quyền Hạn Bắt Buộc:** SHARED_COMPONENTS_ACCESS
- **Tiêu Chí Thành Công:** Không có lỗi nghiêm trọng, UI tải dưới 1.5s, điểm số truy cập (accessibility) 95+.
- **Mức Độ Ưu Tiên:** Cao

## 10. Ma Trận Điều Hướng
| Từ Màn hình | Hành động | Tới Màn hình | Điều kiện | Quy tắc |
|---|---|---|---|---|
| Đăng nhập | Gửi thông tin (Submit Credentials) | Bảng điều khiển Ứng viên | Role == Ứng viên | BR-AUTH-01 |
| Đăng nhập | Gửi thông tin (Submit Credentials) | Bảng điều khiển HR/Candidate | Role == HR/Candidate | BR-AUTH-01 |
| Bảng điều khiển Ứng viên | Nhấn 'Tìm chiến dịch' | Khám phá chiến dịch | Tài khoản Đang hoạt động | BR-NAV-02 |
| Khám phá chiến dịch | Chọn chiến dịch | Chi tiết chiến dịch | Chiến dịch Đang mở | BR-CMP-01 |
| Chi tiết chiến dịch | Nhấn 'Tham gia' | Thanh toán | Yêu cầu Phí | BR-PAY-01 |
| Thanh toán | Thành công | Chuẩn bị phỏng vấn | Đã thanh toán | BR-PAY-03 |
| Chuẩn bị phỏng vấn | Bắt đầu Kiểm tra hệ thống | Kiểm tra thiết bị | Quyền Camera/Mic | BR-SYS-01 |
| Kiểm tra thiết bị | Đạt | Xác minh danh tính | Khớp Sinh trắc học | BR-SEC-05 |
| Xác minh danh tính | Đạt | Phòng chờ phỏng vấn | Đã Xác minh Danh tính | BR-SEC-06 |
| Phòng chờ phỏng vấn | Hết thời gian đếm ngược | Phiên phỏng vấn | Tới giờ | BR-INT-01 |
| Phiên phỏng vấn | Hoàn thành | Hoàn thành phỏng vấn | Đã trả lời hết câu hỏi | BR-INT-09 |
| Hoàn thành phỏng vấn | Tạo báo cáo | Báo cáo AI | Xử lý AI Xong | BR-AI-04 |
| Báo cáo AI | Xem Lộ trình | Lộ trình | Báo cáo Đã chốt | BR-REP-02 |
| Lộ trình | Bắt đầu Học tập | Trung tâm học tập | Còn Tín dụng (Credits) | BR-LRN-01 |
| Bảng điều khiển HR/Candidate | Nhấn 'Tạo mới' | Tạo chiến dịch | Có Quyền | BR-EMP-03 |
| Tạo chiến dịch | Lưu lại | Chi tiết chiến dịch | Đạt Validation | BR-CMP-04 |

## 11. Ma Trận Phân Quyền Màn Hình
*(Lưu ý: Role 'Employer' đã được thay thế thành 'HR/Candidate' theo yêu cầu)*
| Mã Màn hình | Khách | Ứng viên | HR/Candidate | Tuyển dụng | Phỏng vấn viên | Hỗ trợ | Quản trị | Quản trị Hệ thống |
|---|---|---|---|---|---|---|---|---|
| SCR-AUT-001 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-AUT-002 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-AUT-003 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-AUT-004 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-AUT-005 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-AUT-006 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-AUT-007 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-AUT-008 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-AUT-009 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-AUT-010 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-AUT-011 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-CAN-012 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-013 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-014 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-015 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-016 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-017 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-018 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-019 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-020 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-021 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-022 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-023 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-024 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-025 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-026 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-027 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-028 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-029 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-030 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-031 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-032 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-033 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-034 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-035 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-036 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-037 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-038 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-039 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-040 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-041 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-042 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-043 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-044 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-045 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-046 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-047 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-048 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-049 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-050 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-CAN-051 | Từ chối  |  Quản lý  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-052 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-053 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-054 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-055 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-056 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-057 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-058 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-059 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-060 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-061 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-062 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-063 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-064 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-065 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-066 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-067 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-EMP-068 | Từ chối  |  Từ chối  |  Quản lý  |  Quản lý  |  Xem  |  Xem  |  Xem  |  Quản lý |
| SCR-ADM-069 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-070 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-071 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-072 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-073 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-074 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-075 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-076 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-077 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-078 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-079 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-080 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-081 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-082 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-083 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-084 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-085 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-086 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-087 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-ADM-088 | Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Từ chối  |  Xem  |  Quản lý  |  Quản lý |
| SCR-SHR-089 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-SHR-090 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-SHR-091 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-SHR-092 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-SHR-093 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-SHR-094 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-SHR-095 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-SHR-096 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-SHR-097 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-SHR-098 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-SHR-099 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |
| SCR-SHR-100 | Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem  |  Xem |

## 12. Ma Trận Phụ Thuộc Màn Hình
| Màn hình Chính | Màn hình Phụ thuộc | Loại Phụ thuộc | Mô tả |
|---|---|---|---|
| Đăng nhập | Tất cả Bảng điều khiển (Secure) | Xác thực | Yêu cầu token phiên làm việc hợp lệ. |
| Bảng điều khiển | Hồ sơ | Toàn vẹn Dữ liệu | Bắt buộc hoàn thiện hồ sơ trước khi mở khóa tính năng. |
| Hồ sơ | Tải lên CV | Luồng xử lý | Trình phân tích CV sẽ điền trước dữ liệu hồ sơ. |
| Tải lên CV | Khám phá chiến dịch | Điều kiện | Phải có CV để ứng tuyển chiến dịch. |
| Khám phá chiến dịch | Thanh toán | Tài chính | Chiến dịch Premium yêu cầu số dư tín dụng (credit). |
| Thanh toán | Chuẩn bị phỏng vấn | Ủy quyền | Cấp quyền truy cập sau khi xác thực thanh toán. |
| Chuẩn bị phỏng vấn | Kiểm tra thiết bị | Kỹ thuật | Truy cập phần cứng là bắt buộc để phỏng vấn. |
| Kiểm tra thiết bị | Phiên phỏng vấn | Kỹ thuật | Chặn phiên nếu kiểm tra phần cứng thất bại. |
| Phiên phỏng vấn | Báo cáo AI | Luồng Dữ liệu | Báo cáo chờ cho đến khi dữ liệu phiên được lưu. |
| Báo cáo AI | Lộ trình | Suy luận | Lộ trình phụ thuộc vào các số liệu của báo cáo AI. |

## 13. Vòng Đời Màn Hình
- **Khởi tạo:** Thiết kế nháp trên Figma/Sketch, kiểm duyệt theo Yêu cầu Chức năng, phê duyệt bởi Product Owner.
- **Kích hoạt:** Phát triển bằng React/Next.js, vượt qua kiểm thử UAT, merge vào nhánh production, deploy qua CI/CD.
- **Cập nhật:** Được kích hoạt bởi các đợt audit UX hoặc nâng cấp tính năng. Tuân thủ versioning (vd: v1.1.0).
- **Lưu trữ:** Các màn hình lỗi thời sẽ bị gỡ khỏi điều hướng hoạt động nhưng vẫn giữ trong mã nguồn đằng sau feature flags để dự phòng (90 ngày).
- **Xóa bỏ:** Xóa cứng khỏi mã nguồn và bảng định tuyến sau thời gian lưu trữ.
- **Đánh phiên bản:** Xử lý qua version của component library và route manifests (vd: `/v2/candidate/dashboard`).
- **Ngưng sử dụng (Deprecation):** Thông báo cho người dùng trước 30 ngày nếu điều này ảnh hưởng đến các luồng công việc quan trọng.

## 14. Chỉ Số KPI Màn Hình
1. **Tỷ lệ Tải thành công:** % số lần màn hình render mà không bị lỗi.
2. **Tỷ lệ Hoàn thành:** % người dùng hoàn thành thao tác chính (vd: submit form).
3. **Tỷ lệ Thoát (Drop-off):** % người dùng thoát luồng tại màn hình này.
4. **Thời gian Lưu lại:** Thời gian trung bình ở lại trang trước khi chuyển hướng.
5. **Tỷ lệ Lỗi:** Tần suất các lỗi validation của UI hoặc API hiển thị.
6. **Tỷ lệ Chuyển đổi:** % người dùng đi từ bước khám phá sang giao dịch/hành động.
7. **Tỷ lệ Điều hướng Thành công:** % điều hướng thành công tới đích đến.
8. **Tỷ lệ Bỏ ngang:** % số phiên kết thúc ngay trên màn hình này.
9. **Tỷ lệ Tương tác:** Chiều sâu tương tác (click, scroll) mỗi lượt truy cập.
10. **Tỷ lệ Thoát trang (Bounce Rate):** % các phiên chỉ có một trang.
11. **Độ sâu Cuộn trang:** Tỷ lệ phần trăm trung bình của layout dọc được xem.
12. **Tỷ lệ Click (CTR):** Số lượt click vào các nút CTA chính.
13. **Thời gian Hoàn thành Form:** Thời gian (giây) để điền các trường bắt buộc.
14. **First Contentful Paint (FCP):** Thời gian để render hình ảnh ban đầu.
15. **Time to Interactive (TTI):** Thời gian cho đến khi tất cả các phần tử tương tác hoạt động.
16. **Độ trễ Phản hồi API:** Thời gian lấy dữ liệu từ các query chính.
17. **Thời gian Render UI:** Thời lượng render phía client (React).
18. **Tỷ lệ Hành động Thành công:** % số lần click nút hoàn tất mà không dính lỗi 4xx/5xx.
19. **Tỷ lệ Bỏ qua Modal:** % số overlay bị đóng mà không có hành động nào.
20. **Tỷ lệ Gửi phản hồi:** Lượng feedback/báo cáo lỗi gửi trực tiếp từ màn hình.
21. **Tỷ lệ Tìm kiếm Thành công:** % số lượt search nội bộ màn hình ra kết quả có lượt click.
22. **Tỷ lệ Sử dụng Bộ lọc:** Mức độ sử dụng bộ lọc lưới dữ liệu.
23. **Tỷ lệ Phân trang:** Độ sâu duyệt dữ liệu ở dạng danh sách.
24. **Tỷ lệ Chạy Media Thành công:** (Với module học tập/phỏng vấn) % luồng stream không bị ngắt quãng.
25. **Tỷ lệ Tải xuống Thành công:** Vd: Export báo cáo AI ra PDF thành công.
26. **Tỷ lệ Upload Thành công:** Vd: Tải và phân tích CV hoàn thành.
27. **Thời lượng Phiên:** Thời gian tab hoạt động gắn với màn hình này.
28. **Tỷ lệ Quay lại mỗi Màn hình:** Tần suất user quay lại màn hình trong cùng một phiên.
29. **Lượt Click Ức chế (Rage Click):** Số trường hợp phát hiện user click liên tục do bực bội.
30. **Lượt Click Chết (Dead Click):** Click vào các phần tử không có tính năng tương tác.

## 15. Ma Trận Truy Xuất (Traceability)
| Yêu cầu K.Doanh | Quy trình K.Doanh | Yêu cầu Chức năng | Luồng Người dùng | Mã Màn hình | Quyền Hạn | Test Case |
|---|---|---|---|---|---|---|
| BR-01 | BP-AUTH | FR-AUT-01 | UF-01 | SCR-AUT-002 | GUEST | TC-AUT-001 |
| BR-02 | BP-ONB | FR-CAN-01 | UF-02 | SCR-CAN-042 | CAN_EDIT | TC-CAN-010 |
| BR-03 | BP-INT | FR-INT-05 | UF-05 | SCR-CAN-062 | CAN_VIEW | TC-INT-005 |
| BR-04 | BP-REP | FR-REP-02 | UF-06 | SCR-CAN-065 | CAN_VIEW | TC-REP-002 |
| BR-05 | BP-EMP | FR-EMP-01 | UF-10 | SCR-EMP-076 | HR_CANDIDATE_MANAGE | TC-EMP-001 |
| BR-06 | BP-EMP | FR-EMP-03 | UF-11 | SCR-EMP-081 | HR_CANDIDATE_EDIT | TC-EMP-004 |
| BR-07 | BP-ADM | FR-ADM-01 | UF-20 | SCR-ADM-094 | ADM_MANAGE | TC-ADM-001 |
| BR-08 | BP-SYS | FR-SYS-05 | UF-25 | SCR-ADM-111 | SYS_ADMIN | TC-SYS-010 |

## 16. Màn Hình Tương Lai
Để hỗ trợ mở rộng quy mô trong tương lai, các module sau đây được đưa vào kế hoạch cho các giai đoạn tiếp theo:
- **Ứng dụng Mobile (iOS/Android):** Giao diện Native tương đương cho Bảng điều khiển Ứng viên và Phỏng vấn.
- **Giao diện Tablet:** Tối ưu hóa chế độ xem màn hình ngang cho phần Phân tích HR/Candidate và chấm điểm cho Phỏng vấn viên.
- **Bảng điều khiển Enterprise:** Góc nhìn tổng quan cấp cao dành cho các công ty holding quản lý nhiều công ty con HR/Candidate.
- **AI Career Coach:** Giao diện trò chuyện (chat) để tư vấn lộ trình phát triển theo thời gian thực.
- **Marketplace:** Hệ sinh thái B2B để tích hợp bên cung cấp bài test thứ 3 (như HackerRank, Codility).
- **Phỏng vấn Trực tiếp / Video Conference:** Các màn hình fallback dùng cho phỏng vấn trực tiếp giữa người với người.
- **Giao diện Cấu hình Tích hợp ATS:** Quản lý Webhook và API key ánh xạ cho Workday, Greenhouse, v.v.
- **Enterprise SSO:** Bảng cấu hình SAML/OIDC dành cho khách hàng doanh nghiệp.
- **Cộng đồng:** Giao diện diễn đàn peer-to-peer dành cho ứng viên trao đổi.

## 17. Tóm Tắt
Tài liệu **Đặc Tả Danh Mục Màn Hình** này vạch ra một bộ khung toàn diện gồm 100 màn hình được định danh duy nhất trải dài trên 5 module cốt lõi, mang đến một bản thiết kế UX hoàn chỉnh cho nền tảng ISAS.

**Những Điểm Chính:**
- **Kiến trúc Màn hình Tổng thể:** Đi theo hướng tiếp cận mô-đun, tách rời linh hoạt, đảm bảo trải nghiệm của Ứng viên, HR/Candidate, và Quản trị viên được cô lập về mặt logic nhưng vẫn nhất quán về mặt hình ảnh.
- **Phân bổ Module:** Tập trung nhiều cho Ứng viên (40 màn hình) nhằm đảm bảo quá trình đánh giá mượt mà, có hướng dẫn chi tiết, tiếp theo là công cụ mạnh mẽ dành cho Quản trị và HR/Candidate.
- **Chiến lược Điều hướng:** Được thiết kế theo phân cấp chặt chẽ với các liên kết chéo ngữ cảnh rõ ràng, ánh xạ chi tiết thông qua các ma trận điều hướng và ma trận phụ thuộc.
- **Bao phủ Phân quyền Role:** 8 vai trò RBAC riêng biệt (Khách, Ứng viên, HR/Candidate, Tuyển dụng, Phỏng vấn viên, Hỗ trợ, Quản trị, Quản trị Hệ thống) được thực thi nghiêm ngặt qua Ma trận Quyền hạn.
- **Khả năng Mở rộng:** Quy ước đặt tên chuẩn (`SCR-MOD-000`) và bộ tham số tracking có cấu trúc cho phép dễ dàng tích hợp các hệ thống mở rộng tương lai như Mobile, Marketplace hay SSO.