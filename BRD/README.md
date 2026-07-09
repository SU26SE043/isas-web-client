# Business Requirements Document (BRD)

## Overview

Thư mục **BRD** chứa toàn bộ tài liệu đặc tả nghiệp vụ của dự án. Đây là **Single Source of Truth** cho toàn bộ quá trình phân tích, thiết kế, phát triển, kiểm thử và nghiệm thu hệ thống.

Các tài liệu được tổ chức theo từng chủ đề nhằm:

* Phân tách rõ trách nhiệm của từng tài liệu.
* Tránh trùng lặp thông tin.
* Dễ dàng bảo trì khi dự án mở rộng.
* Giúp Business Analyst, Product Owner, UI/UX Designer, Developer, QA và Stakeholders cùng sử dụng một nguồn thông tin thống nhất.

---

# Folder Structure

```text
BRD/
│
├── 00_Project_Overview.md
├── 01_Business_Requirements.md
├── 02_Scope_and_Objectives.md
├── 03_Stakeholders.md
├── 04_Business_Process.md
├── 05_User_Roles_and_Permissions.md
├── 06_Functional_Requirements.md
├── 07_Non_Functional_Requirements.md
├── 08_Business_Rules.md
├── 09_User_Flows.md
├── 10_Screen_Inventory.md
├── 11_UIUX_Specification.md
├── 12_Data_Requirements.md
├── 13_Reporting_Requirements.md
├── 14_Notifications.md
├── 15_Integration_Requirements.md
├── 16_Security_Requirements.md
├── 17_Acceptance_Criteria.md
├── 18_Risk_and_Assumptions.md
├── 19_Glossary.md
└── Appendix/
```

---

# Document Guide

| File                                  | Purpose                                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| **00_Project_Overview.md**            | Tổng quan dự án, giới thiệu sản phẩm, kiến trúc và các module chính.                          |
| **01_Business_Requirements.md**       | Mô tả bài toán kinh doanh, mục tiêu và giá trị mà hệ thống cần mang lại.                      |
| **02_Scope_and_Objectives.md**        | Xác định phạm vi dự án, mục tiêu, deliverables và những nội dung nằm ngoài phạm vi.           |
| **03_Stakeholders.md**                | Danh sách các bên liên quan, vai trò và trách nhiệm của từng nhóm.                            |
| **04_Business_Process.md**            | Đặc tả quy trình nghiệp vụ hiện tại (AS-IS) và quy trình sau khi áp dụng hệ thống (TO-BE).    |
| **05_User_Roles_and_Permissions.md**  | Định nghĩa các nhóm người dùng và quyền truy cập (RBAC).                                      |
| **06_Functional_Requirements.md**     | Danh sách toàn bộ chức năng của hệ thống và các yêu cầu nghiệp vụ tương ứng.                  |
| **07_Non_Functional_Requirements.md** | Các yêu cầu phi chức năng như hiệu năng, khả năng mở rộng, tính sẵn sàng, bảo trì và bảo mật. |
| **08_Business_Rules.md**              | Quy tắc nghiệp vụ, validation, workflow và các điều kiện xử lý dữ liệu.                       |
| **09_User_Flows.md**                  | Luồng thao tác của người dùng đối với từng tính năng.                                         |
| **10_Screen_Inventory.md**            | Danh mục toàn bộ màn hình trong hệ thống cùng mã định danh (Screen ID).                       |
| **11_UIUX_Specification.md**          | Đặc tả chi tiết giao diện, thành phần UI, trạng thái màn hình và hành vi tương tác.           |
| **12_Data_Requirements.md**           | Định nghĩa dữ liệu, Data Dictionary, Entity, Field và quan hệ dữ liệu.                        |
| **13_Reporting_Requirements.md**      | Đặc tả Dashboard, KPI, báo cáo và chức năng xuất dữ liệu.                                     |
| **14_Notifications.md**               | Đặc tả Email, Push Notification, In-App Notification và các điều kiện kích hoạt.              |
| **15_Integration_Requirements.md**    | Đặc tả tích hợp với hệ thống bên ngoài, API, Webhook và Data Mapping.                         |
| **16_Security_Requirements.md**       | Đặc tả Authentication, Authorization, Audit Log, Encryption và các yêu cầu bảo mật.           |
| **17_Acceptance_Criteria.md**         | Điều kiện nghiệm thu (Acceptance Criteria) và Definition of Done cho từng chức năng.          |
| **18_Risk_and_Assumptions.md**        | Các rủi ro, giả định, phụ thuộc và kế hoạch giảm thiểu rủi ro.                                |
| **19_Glossary.md**                    | Từ điển thuật ngữ nghiệp vụ và kỹ thuật được sử dụng trong dự án.                             |
| **Appendix/**                         | Phụ lục bao gồm tài liệu tham khảo, biểu mẫu, hình ảnh, sơ đồ và các tài liệu bổ sung.        |

---

# Document Flow

```text
Project Overview
        │
        ▼
Business Requirements
        │
        ▼
Scope & Objectives
        │
        ▼
Business Process
        │
        ▼
Business Rules
        │
        ▼
User Roles & Permissions
        │
        ▼
User Flows
        │
        ▼
Functional Requirements
        │
        ├───────────────┐
        ▼               ▼
Screen Inventory   Data Requirements
        │               │
        ▼               ▼
UI/UX Specification Integration Requirements
        │               │
        └───────┬───────┘
                ▼
Security Requirements
                ▼
Reporting Requirements
                ▼
Notifications
                ▼
Acceptance Criteria
                ▼
Risk & Assumptions
                ▼
Glossary
```

---

# Recommended Reading Order

Đối với thành viên mới tham gia dự án, nên đọc tài liệu theo thứ tự sau:

1. Project Overview
2. Business Requirements
3. Scope and Objectives
4. Business Process
5. User Roles and Permissions
6. Business Rules
7. User Flows
8. Functional Requirements
9. Screen Inventory
10. UI/UX Specification
11. Data Requirements
12. Integration Requirements
13. Security Requirements
14. Reporting Requirements
15. Notifications
16. Acceptance Criteria
17. Risk and Assumptions
18. Glossary

---

# Intended Audience

| Role               | Primary Documents |
| ------------------ | ----------------- |
| Product Owner      | 00–04, 06, 17     |
| Business Analyst   | Toàn bộ tài liệu  |
| Project Manager    | 00–04, 17, 18     |
| UI/UX Designer     | 09–11             |
| Frontend Developer | 06, 09–11, 15, 16 |
| Backend Developer  | 05–08, 12, 15, 16 |
| QA Engineer        | 06, 08, 09, 17    |
| Solution Architect | 07, 12, 15, 16    |
| Stakeholders       | 00–04             |

---

# Document Maintenance

* Mỗi tài liệu cần có phiên bản (Version), ngày cập nhật và người chỉnh sửa.
* Khi thay đổi yêu cầu nghiệp vụ, cần cập nhật các tài liệu liên quan để đảm bảo tính nhất quán.
* Không chỉnh sửa trực tiếp các tài liệu đã được phê duyệt mà không có quy trình quản lý thay đổi (Change Management).
* Các sơ đồ, hình ảnh và tài liệu bổ sung nên được lưu trong thư mục `Appendix/` và tham chiếu từ tài liệu chính.

---

# Goal

Mục tiêu của bộ tài liệu BRD là đảm bảo tất cả các bên liên quan có cùng cách hiểu về nghiệp vụ, phạm vi và yêu cầu của hệ thống, từ đó giảm thiểu sai lệch trong quá trình thiết kế, phát triển, kiểm thử và triển khai.
