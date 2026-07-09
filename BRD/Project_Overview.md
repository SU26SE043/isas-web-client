
# ISAS (AI-Powered Interview Simulation and Assessment System) — Project Overview

## 1. Tóm tắt dự án (Executive Summary)
*Tổng quan về hệ thống ISAS, định vị là một nền tảng cung cấp 2 dòng sản phẩm cốt lõi (B2C - Luyện phỏng vấn cá nhân và B2B - Tuyển dụng doanh nghiệp) chạy trên cùng một Engine Phỏng vấn bằng AI.*

## 2. Bài toán & Động lực (Problem Statement & Motivation)
*(Cần bổ sung: Bối cảnh thực tiễn, nỗi đau của ứng viên khi thiếu môi trường cọ xát và của doanh nghiệp khi tốn chi phí sàng lọc CV/phỏng vấn vòng 1)*

## 3. Phạm vi hệ thống (System Scope & Modules)
Theo thiết kế hiện tại, hệ thống bao gồm:
*   **Dòng B2C (Luyện tập cá nhân):** Quản lý ví Credit cá nhân (BC1), Tự tạo buổi luyện từ CV/JD (BC2), Lịch sử cá nhân (BC3), Phân tích CV (BC4). Tạo roadmap dựa trên các điểm yếu trong report. Tạo roadmap dựa trên các điểm yếu trong report, domain mong muốn, và goal muốn đạt được.
*   **Dòng B2B (Tuyển dụng doanh nghiệp):** Quản lý chiến dịch (M2), Phân phối Magic-link (M3), Chấm điểm AI theo tiêu chí (M4), Báo cáo & Xếp hạng (M5). Phân tích loạt CV và ranking. 

## 4. Kiến trúc Tổng thể (High-level Architecture)
*Dự án áp dụng kiến trúc Frontend Monolith, giao tiếp với hệ thống Backend Microservices thông qua API Gateway.*
*   **Frontend (Monolith):** Ứng dụng tập trung quản lý toàn bộ giao diện và luồng người dùng cho cả hai dòng sản phẩm cốt lõi: B2C (Luyện tập cá nhân) và B2B (Tuyển dụng doanh nghiệp).
    * *(Gợi ý: Chỗ này ông có thể liệt kê thêm Tech stack của FE vô cho rõ nha, ví dụ như React, TypeScript, State Management, UI Library...)*
*   **Giao tiếp Backend (External APIs):** Client (Frontend) không gọi trực tiếp đến từng service riêng lẻ mà sẽ gọi qua một cổng duy nhất là API Gateway (YARP). Gateway này sẽ tự động routing các request xuống hệ thống Microservices bên dưới (Auth, Interview, Campaign, Payment, AI) đặng trả data về cho FE.


## 5. Quyết định Thiết kế Cốt lõi (Key Architecture Decisions - ADRs)
*Các quyết định kiến trúc cốt lõi định hình cách xây dựng giao diện và xử lý luồng dữ liệu trên Frontend:*
*   **D1 - Tách biệt luồng nghiệp vụ (Engine vs Orchestrator):** Giao diện được thiết kế phân tách rõ ràng giữa màn hình cấu hình chiến dịch B2B (Campaign) và không gian phỏng vấn cốt lõi (Interview Engine). Tuy nhiên, UI của phòng phỏng vấn được thiết kế độc lập để có thể tái sử dụng cho cả luồng B2B lẫn B2C.
*   **D4 & D15 - Trải nghiệm thanh toán dựa trên Credit:** Giao diện hiển thị ví và lịch sử giao dịch sẽ tập trung vào đơn vị "Credit" (tương đương lượt phỏng vấn). Thiết kế UI/UX theo hướng này giúp hiển thị chi phí trực quan, dễ hiểu cho người dùng thay vì phải giải thích mô hình tính phí phức tạp theo LLM Token.
*   **D11 - Xử lý dữ liệu Soft Delete & Audit Logs:** UI cần được thiết kế để xử lý khéo léo các trạng thái dữ liệu đã bị xóa mềm (ẩn khỏi danh sách hiển thị thông thường nhưng vẫn có thể tra cứu khi cần), đồng thời xây dựng các trang lịch sử hoạt động để phục vụ việc đối soát.

## 6. Tổ chức Nhóm (Team Organization)
*Dự án Capstone chuyên ngành Kỹ thuật Phần mềm (SU26SE043)*
*(Cần bổ sung: Phân công chi tiết cho các thành viên trong nhóm)*

## 7. Yêu cầu Phi chức năng & Triển khai (NFRs & Deployment)
**Yêu cầu Phi chức năng (NFRs):**
*   **Hiệu năng (Performance):** Tối ưu hóa thời gian tải trang ban đầu (First Load) và đảm bảo UI không bị giật lag, đặc biệt là trong luồng không gian phỏng vấn (nơi cần xử lý thao tác người dùng và trạng thái liên tục).
*   **Trải nghiệm người dùng (UX) & Tương thích:** Giao diện được thiết kế Responsive, hoạt động mượt mà trên đa thiết bị và tương thích tốt với các trình duyệt phổ biến hiện nay.
*   **Độ tin cậy (Reliability):** Có cơ chế bắt lỗi khéo léo (Graceful Error Handling) khi gọi API thất bại, rớt mạng hoặc mất kết nối với Gateway.
**Quy trình Triển khai (CI/CD & Infrastructure):**
*   **Đóng gói (Containerization):** Ứng dụng Frontend được build và đóng gói thành các container bằng **Docker** (ví dụ: dùng Nginx để serve static files), giúp đảm bảo tính nhất quán tuyệt đối giữa môi trường dev và production.
*   **Tự động hóa (CI/CD):** Toàn bộ quy trình tích hợp và triển khai liên tục được quản lý bởi **GitHub Actions**. Mỗi khi có code mới merge vào nhánh chính, pipeline sẽ tự động kích hoạt luồng: Build source code -> Build Docker image -> Triển khai lên server.

