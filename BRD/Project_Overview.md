
# ISAS (AI-Powered Interview Simulation and Assessment System) — Project Overview

## 1. Tóm tắt dự án (Executive Summary)
*Tổng quan về hệ thống ISAS, định vị là một nền tảng cung cấp 2 dòng sản phẩm cốt lõi (B2C - Luyện phỏng vấn cá nhân và B2B - Tuyển dụng doanh nghiệp) chạy trên cùng một Engine Phỏng vấn bằng AI.*

## 2. Bài toán & Động lực (Problem Statement & Motivation)
*(Cần bổ sung: Bối cảnh thực tiễn, nỗi đau của ứng viên khi thiếu môi trường cọ xát và của doanh nghiệp khi tốn chi phí sàng lọc CV/phỏng vấn vòng 1)*

## 3. Phạm vi hệ thống (System Scope & Modules)
Theo thiết kế hiện tại, hệ thống bao gồm:
*   **Dòng B2C (Luyện tập cá nhân):** Quản lý ví Credit cá nhân (BC1), Tự tạo buổi luyện từ CV/JD (BC2), Lịch sử cá nhân (BC3), Phân tích CV (BC4). Tạo roadmap dựa trên các điểm yếu trong report.
*   **Dòng B2B (Tuyển dụng doanh nghiệp):** Quản lý chiến dịch (M2), Phân phối Magic-link (M3), Chấm điểm AI theo tiêu chí (M4), Báo cáo & Xếp hạng (M5). Phân tích loạt CV và ranking. 

## 4. Kiến trúc Tổng thể (High-level Architecture)
*Mô hình Microservices theo pattern Engine + Orchestrator:*
*   **Gateway (YARP):** Routing & gộp OpenAPI.
*   **AuthService:** Quản lý Identity (Candidate, Employer, Admin) và RBAC (Organization roles).
*   **InterviewService:** Core Engine dùng chung (quản lý session, state machine, rabbitmq publisher).
*   **CampaignService:** Orchestrator cho luồng B2B.
*   **PaymentService:** Quản lý ví Credit (Prepaid/Postpaid) qua PayOS.
*   **AIService (Python):** Sinh câu hỏi, Whisper transcribe, Gemini evaluation (Stateless).

## 5. Quyết định Thiết kế Cốt lõi (Key Architecture Decisions - ADRs)
*   **D1:** Tách biệt Engine (Interview) và Orchestrator (Campaign).
*   **D4 & D15:** Mô hình thanh toán dựa trên Credit (lượt phỏng vấn), không tính phí theo LLM Token.
*   **D11:** Áp dụng Soft Delete và Audit Logs cho mục đích pháp lý & đối soát.

## 6. Tổ chức Nhóm (Team Organization)
*Dự án Capstone chuyên ngành Kỹ thuật Phần mềm (SU26SE043)*
*(Cần bổ sung: Phân công chi tiết cho các thành viên trong nhóm)*

## 7. Yêu cầu Phi chức năng & Triển khai (NFRs & Deployment)
*(Cần bổ sung: Metrics hiệu năng, SLA, quy trình CI/CD qua GitHub Actions, hạ tầng Docker/Tailscale)*

