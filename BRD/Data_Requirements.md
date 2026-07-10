# 12_Data_Requirement.md
## 1. Mục đích tài liệu
Tài liệu này xác định kiến trúc dữ liệu nghiệp vụ, các miền dữ liệu logic và các yêu cầu quản trị cho Hệ thống Phỏng vấn & Đánh giá Kỹ năng tích hợp AI (ISAS).
### 1.1 Phạm vi
Phạm vi bao gồm tất cả các thực thể dữ liệu nghiệp vụ logic, các mối quan hệ, dữ liệu chủ (master data), dữ liệu tham chiếu và vòng đời dữ liệu. Nó xác định *những gì* dữ liệu được quản lý, không phải *cách thức* nó được lưu trữ (ví dụ: không có lược đồ SQL hoặc ERD).
### 1.2 Đối tượng độc giả
Kiến trúc sư Dữ liệu, Kiến trúc sư Doanh nghiệp, Chuyên viên Phân tích Nghiệp vụ, Cán bộ Quản trị Dữ liệu và Các bên liên quan cấp quản lý.
### 1.3 Mối quan hệ với các tài liệu khác
- **Relationship with BRD:** Hiện thực hóa các mục tiêu nghiệp vụ thông qua các tài sản dữ liệu có cấu trúc.
- **Relationship with Yêu cầu Chức nănguirements:** Xác định các thực thể logic được xử lý bởi các chức năng của hệ thống.
- **Relationship with Quy tắc Nghiệp vụs:** Nắm bắt các ràng buộc về xác thực, tính toàn vẹn và vòng đời dữ liệu.

## 2. Tổng quan Kiến trúc Dữ liệu
Kiến trúc dữ liệu ISAS được tổ chức thành 12 miền logic riêng biệt nhằm đảm bảo tính mô-đun, quyền sở hữu rõ ràng và quản trị nghiêm ngặt. Các miền này bao trùm toàn bộ vòng đời tuyển dụng, phỏng vấn, đánh giá và học tập. Các nguyên tắc Quản lý Dữ liệu Chủ (MDM) được áp dụng trên tất cả các thực thể dùng chung.

## 3. Các Miền Dữ liệu Nghiệp vụ
### 3.1 Dữ liệu Danh tính
- **ID Miền:** DOM-01
- **Mô tả:** Quản lý xác thực, ủy quyền và hồ sơ bảo mật.
- **Chủ sở hữu Nghiệp vụ:** CISO
- **Người dùng Chính:** System, Admin
- **Giá trị Nghiệp vụ:** Bảo mật truy cập hệ thống
- **Phụ thuộc:** Không có
- **Độ ưu tiên:** Đặc biệt quan trọng

### 3.2 Dữ liệu Ứng viên
- **ID Miền:** DOM-02
- **Mô tả:** Quản lý hồ sơ, kỹ năng và lịch sử nghề nghiệp ứng viên.
- **Chủ sở hữu Nghiệp vụ:** VP of HR
- **Người dùng Chính:** Nhà tuyển dụng, Ứng viên
- **Giá trị Nghiệp vụ:** Lập hồ sơ tài năng cốt lõi
- **Phụ thuộc:** DOM-01
- **Độ ưu tiên:** Cao

### 3.3 Dữ liệu Nhà tuyển dụng
- **ID Miền:** DOM-03
- **Mô tả:** Quản lý khách hàng doanh nghiệp, nhóm và gói đăng ký.
- **Chủ sở hữu Nghiệp vụ:** VP of Sales
- **Người dùng Chính:** Nhà tuyển dụng
- **Giá trị Nghiệp vụ:** Quản lý vòng đời khách hàng
- **Phụ thuộc:** DOM-01
- **Độ ưu tiên:** Cao

### 3.4 Dữ liệu Tuyển dụng
- **ID Miền:** DOM-04
- **Mô tả:** Quản lý chiến dịch, tin đăng tuyển và quy trình tuyển dụng.
- **Chủ sở hữu Nghiệp vụ:** VP of Recruitment
- **Người dùng Chính:** Nhà tuyển dụngs
- **Giá trị Nghiệp vụ:** Thúc đẩy quy trình làm việc tuyển dụng
- **Phụ thuộc:** DOM-02, DOM-03
- **Độ ưu tiên:** Cao

### 3.5 Dữ liệu Phỏng vấn
- **ID Miền:** DOM-05
- **Mô tả:** Quản lý lịch trình, phiếu tự đánh giá và bản ghi hình.
- **Chủ sở hữu Nghiệp vụ:** VP of Product
- **Người dùng Chính:** Tất cả Người dùng
- **Giá trị Nghiệp vụ:** Thực hiện phỏng vấn cốt lõi
- **Phụ thuộc:** DOM-04
- **Độ ưu tiên:** Đặc biệt quan trọng

### 3.6 Dữ liệu Đánh giá
- **ID Miền:** DOM-06
- **Mô tả:** Quản lý các bài kiểm tra kỹ thuật, chấm điểm và giám thị.
- **Chủ sở hữu Nghiệp vụ:** VP of Product
- **Người dùng Chính:** Ứng viêns
- **Giá trị Nghiệp vụ:** Độ chính xác của việc xác thực kỹ năng
- **Phụ thuộc:** DOM-02
- **Độ ưu tiên:** Đặc biệt quan trọng

### 3.7 Dữ liệu Học tập
- **ID Miền:** DOM-07
- **Mô tả:** Quản lý lộ trình, khóa học và sự tiến bộ kỹ năng.
- **Chủ sở hữu Nghiệp vụ:** Chief Learning Officer
- **Người dùng Chính:** Ứng viêns
- **Giá trị Nghiệp vụ:** Rút ngắn khoảng cách kỹ năng
- **Phụ thuộc:** DOM-06
- **Độ ưu tiên:** Trung bình

### 3.8 Dữ liệu Thanh toán
- **ID Miền:** DOM-08
- **Mô tả:** Quản lý giao dịch, tín dụng và hóa đơn.
- **Chủ sở hữu Nghiệp vụ:** CFO
- **Người dùng Chính:** Finance
- **Giá trị Nghiệp vụ:** Theo dõi doanh thu
- **Phụ thuộc:** DOM-03
- **Độ ưu tiên:** Cao

### 3.9 Dữ liệu Thông báo
- **ID Miền:** DOM-09
- **Mô tả:** Quản lý cảnh báo đa kênh và nhật ký tin nhắn.
- **Chủ sở hữu Nghiệp vụ:** VP of Product
- **Người dùng Chính:** Tất cả Người dùng
- **Giá trị Nghiệp vụ:** Sự tương tác của người dùng
- **Phụ thuộc:** Tất cả
- **Độ ưu tiên:** Trung bình

### 3.10 Dữ liệu Kiểm toán
- **ID Miền:** DOM-10
- **Mô tả:** Quản lý tuân thủ, nhật ký truy cập và sự kiện hệ thống.
- **Chủ sở hữu Nghiệp vụ:** Data Protection Officer
- **Người dùng Chính:** Security
- **Giá trị Nghiệp vụ:** Tuân thủ quy định
- **Phụ thuộc:** Tất cả
- **Độ ưu tiên:** Cao

### 3.11 Dữ liệu Phân tích
- **ID Miền:** DOM-11
- **Mô tả:** Quản lý các số liệu tổng hợp và bảng điều khiển.
- **Chủ sở hữu Nghiệp vụ:** CDO
- **Người dùng Chính:** Management
- **Giá trị Nghiệp vụ:** Thông tin chi tiết về doanh nghiệp
- **Phụ thuộc:** Tất cả
- **Độ ưu tiên:** Trung bình

### 3.12 Dữ liệu Cấu hình Hệ thống
- **ID Miền:** DOM-12
- **Mô tả:** Quản lý dữ liệu tham chiếu và cài đặt toàn hệ thống.
- **Chủ sở hữu Nghiệp vụ:** CTO
- **Người dùng Chính:** System
- **Giá trị Nghiệp vụ:** Sự ổn định của nền tảng
- **Phụ thuộc:** Không có
- **Độ ưu tiên:** Cao

## 4. Các Đối tượng Dữ liệu Nghiệp vụ
Phần này xác định các thực thể nghiệp vụ logic do hệ thống quản lý.
| ID Đối tượng Dữ liệu | Tên Nghiệp vụ | Mô tả | Mục đích Nghiệp vụ | Chủ sở hữu Nghiệp vụ | Nguồn | Bên tiêu thụ | Vòng đời | Độ nhạy cảm | Lưu giữ | Phụ thuộc |
|---|---|---|---|---|---|---|---|---|---|---|
| DATA-001 | User | Thực thể logic đại diện cho dữ liệu user. | Quản lý vòng đời của user. | CISO | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-01 cốt lõi |
| DATA-002 | Role | Thực thể logic đại diện cho dữ liệu role. | Quản lý vòng đời của role. | CISO | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-01 cốt lõi |
| DATA-003 | Permission | Thực thể logic đại diện cho dữ liệu permission. | Quản lý vòng đời của permission. | CISO | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-01 cốt lõi |
| DATA-004 | Session | Thực thể logic đại diện cho dữ liệu session. | Quản lý vòng đời của session. | CISO | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-01 cốt lõi |
| DATA-005 | MFA Token | Thực thể logic đại diện cho dữ liệu mfa token. | Quản lý vòng đời của mfa token. | CISO | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-01 cốt lõi |
| DATA-006 | Consent Record | Thực thể logic đại diện cho dữ liệu consent record. | Quản lý vòng đời của consent record. | CISO | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-01 cốt lõi |
| DATA-007 | Identity Verification | Thực thể logic đại diện cho dữ liệu identity verification. | Quản lý vòng đời của identity verification. | CISO | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-01 cốt lõi |
| DATA-008 | Security Profile | Thực thể logic đại diện cho dữ liệu security profile. | Quản lý vòng đời của security profile. | CISO | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-01 cốt lõi |
| DATA-009 | SSO Configuration | Thực thể logic đại diện cho dữ liệu sso configuration. | Quản lý vòng đời của sso configuration. | CISO | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-01 cốt lõi |
| DATA-010 | Password History | Thực thể logic đại diện cho dữ liệu password history. | Quản lý vòng đời của password history. | CISO | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-01 cốt lõi |
| DATA-011 | Ứng viên | Thực thể logic đại diện cho dữ liệu candidate. | Quản lý vòng đời của candidate. | VP of HR | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-02 cốt lõi |
| DATA-012 | Profile | Thực thể logic đại diện cho dữ liệu profile. | Quản lý vòng đời của profile. | VP of HR | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-02 cốt lõi |
| DATA-013 | Education | Thực thể logic đại diện cho dữ liệu education. | Quản lý vòng đời của education. | VP of HR | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-02 cốt lõi |
| DATA-014 | Experience | Thực thể logic đại diện cho dữ liệu experience. | Quản lý vòng đời của experience. | VP of HR | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-02 cốt lõi |
| DATA-015 | Skill Claim | Thực thể logic đại diện cho dữ liệu skill claim. | Quản lý vòng đời của skill claim. | VP of HR | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-02 cốt lõi |
| DATA-016 | Certification | Thực thể logic đại diện cho dữ liệu certification. | Quản lý vòng đời của certification. | VP of HR | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-02 cốt lõi |
| DATA-017 | Career Goal | Thực thể logic đại diện cho dữ liệu career goal. | Quản lý vòng đời của career goal. | VP of HR | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-02 cốt lõi |
| DATA-018 | Language Proficiency | Thực thể logic đại diện cho dữ liệu language proficiency. | Quản lý vòng đời của language proficiency. | VP of HR | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-02 cốt lõi |
| DATA-019 | Portfolio Item | Thực thể logic đại diện cho dữ liệu portfolio item. | Quản lý vòng đời của portfolio item. | VP of HR | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-02 cốt lõi |
| DATA-020 | Availability | Thực thể logic đại diện cho dữ liệu availability. | Quản lý vòng đời của availability. | VP of HR | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-02 cốt lõi |
| DATA-021 | Employer | Thực thể logic đại diện cho dữ liệu employer. | Quản lý vòng đời của employer. | VP of Sales | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-03 cốt lõi |
| DATA-022 | Company | Thực thể logic đại diện cho dữ liệu company. | Quản lý vòng đời của company. | VP of Sales | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-03 cốt lõi |
| DATA-023 | Department | Thực thể logic đại diện cho dữ liệu department. | Quản lý vòng đời của department. | VP of Sales | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-03 cốt lõi |
| DATA-024 | Team | Thực thể logic đại diện cho dữ liệu team. | Quản lý vòng đời của team. | VP of Sales | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-03 cốt lõi |
| DATA-025 | Nhà tuyển dụng | Thực thể logic đại diện cho dữ liệu recruiter. | Quản lý vòng đời của recruiter. | VP of Sales | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-03 cốt lõi |
| DATA-026 | Hiring Manager | Thực thể logic đại diện cho dữ liệu hiring manager. | Quản lý vòng đời của hiring manager. | VP of Sales | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-03 cốt lõi |
| DATA-027 | Billing Profile | Thực thể logic đại diện cho dữ liệu billing profile. | Quản lý vòng đời của billing profile. | VP of Sales | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-03 cốt lõi |
| DATA-028 | Subscription | Thực thể logic đại diện cho dữ liệu subscription. | Quản lý vòng đời của subscription. | VP of Sales | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-03 cốt lõi |
| DATA-029 | Company Address | Thực thể logic đại diện cho dữ liệu company addres. | Quản lý vòng đời của company address. | VP of Sales | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-03 cốt lõi |
| DATA-030 | Employer Setting | Thực thể logic đại diện cho dữ liệu employer setting. | Quản lý vòng đời của employer setting. | VP of Sales | Người dùng Nhập | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-03 cốt lõi |
| DATA-031 | Job Posting | Thực thể logic đại diện cho dữ liệu job posting. | Quản lý vòng đời của job posting. | VP of Recruitment | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-04 cốt lõi |
| DATA-032 | Campaign | Thực thể logic đại diện cho dữ liệu campaign. | Quản lý vòng đời của campaign. | VP of Recruitment | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-04 cốt lõi |
| DATA-033 | Application | Thực thể logic đại diện cho dữ liệu application. | Quản lý vòng đời của application. | VP of Recruitment | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-04 cốt lõi |
| DATA-034 | Talent Pool | Thực thể logic đại diện cho dữ liệu talent pool. | Quản lý vòng đời của talent pool. | VP of Recruitment | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-04 cốt lõi |
| DATA-035 | Offer | Thực thể logic đại diện cho dữ liệu offer. | Quản lý vòng đời của offer. | VP of Recruitment | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-04 cốt lõi |
| DATA-036 | Pipeline Stage | Thực thể logic đại diện cho dữ liệu pipeline stage. | Quản lý vòng đời của pipeline stage. | VP of Recruitment | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-04 cốt lõi |
| DATA-037 | Sourcing Channel | Thực thể logic đại diện cho dữ liệu sourcing channel. | Quản lý vòng đời của sourcing channel. | VP of Recruitment | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-04 cốt lõi |
| DATA-038 | Referral | Thực thể logic đại diện cho dữ liệu referral. | Quản lý vòng đời của referral. | VP of Recruitment | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-04 cốt lõi |
| DATA-039 | Screening Form | Thực thể logic đại diện cho dữ liệu screening form. | Quản lý vòng đời của screening form. | VP of Recruitment | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-04 cốt lõi |
| DATA-040 | Shortlist | Thực thể logic đại diện cho dữ liệu shortlist. | Quản lý vòng đời của shortlist. | VP of Recruitment | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-04 cốt lõi |
| DATA-041 | Interview | Thực thể logic đại diện cho dữ liệu interview. | Quản lý vòng đời của interview. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-05 cốt lõi |
| DATA-042 | Session | Thực thể logic đại diện cho dữ liệu session. | Quản lý vòng đời của session. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-05 cốt lõi |
| DATA-043 | Question | Thực thể logic đại diện cho dữ liệu question. | Quản lý vòng đời của question. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-05 cốt lõi |
| DATA-044 | Answer | Thực thể logic đại diện cho dữ liệu answer. | Quản lý vòng đời của answer. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-05 cốt lõi |
| DATA-045 | Rubric | Thực thể logic đại diện cho dữ liệu rubric. | Quản lý vòng đời của rubric. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-05 cốt lõi |
| DATA-046 | Recording | Thực thể logic đại diện cho dữ liệu recording. | Quản lý vòng đời của recording. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-05 cốt lõi |
| DATA-047 | Transcript | Thực thể logic đại diện cho dữ liệu transcript. | Quản lý vòng đời của transcript. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-05 cốt lõi |
| DATA-048 | Interviewer | Thực thể logic đại diện cho dữ liệu interviewer. | Quản lý vòng đời của interviewer. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-05 cốt lõi |
| DATA-049 | Feedback | Thực thể logic đại diện cho dữ liệu feedback. | Quản lý vòng đời của feedback. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-05 cốt lõi |
| DATA-050 | Rating | Thực thể logic đại diện cho dữ liệu rating. | Quản lý vòng đời của rating. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-05 cốt lõi |
| DATA-051 | Interview Template | Thực thể logic đại diện cho dữ liệu interview template. | Quản lý vòng đời của interview template. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-05 cốt lõi |
| DATA-052 | Assessment | Thực thể logic đại diện cho dữ liệu assessment. | Quản lý vòng đời của assessment. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-06 cốt lõi |
| DATA-053 | Test Case | Thực thể logic đại diện cho dữ liệu test case. | Quản lý vòng đời của test case. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-06 cốt lõi |
| DATA-054 | Submission | Thực thể logic đại diện cho dữ liệu submission. | Quản lý vòng đời của submission. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-06 cốt lõi |
| DATA-055 | Score | Thực thể logic đại diện cho dữ liệu score. | Quản lý vòng đời của score. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-06 cốt lõi |
| DATA-056 | Skill Gap | Thực thể logic đại diện cho dữ liệu skill gap. | Quản lý vòng đời của skill gap. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-06 cốt lõi |
| DATA-057 | Proctoring Log | Thực thể logic đại diện cho dữ liệu proctoring log. | Quản lý vòng đời của proctoring log. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-06 cốt lõi |
| DATA-058 | Code Execution Result | Thực thể logic đại diện cho dữ liệu code execution result. | Quản lý vòng đời của code execution result. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-06 cốt lõi |
| DATA-059 | Plagiarism Báo cáo | Thực thể logic đại diện cho dữ liệu plagiarism report. | Quản lý vòng đời của plagiarism report. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-06 cốt lõi |
| DATA-060 | Question Bank | Thực thể logic đại diện cho dữ liệu question bank. | Quản lý vòng đời của question bank. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-06 cốt lõi |
| DATA-061 | Assessment Template | Thực thể logic đại diện cho dữ liệu assessment template. | Quản lý vòng đời của assessment template. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-06 cốt lõi |
| DATA-062 | Roadmap | Thực thể logic đại diện cho dữ liệu roadmap. | Quản lý vòng đời của roadmap. | Chief Learning Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-07 cốt lõi |
| DATA-063 | Module | Thực thể logic đại diện cho dữ liệu module. | Quản lý vòng đời của module. | Chief Learning Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-07 cốt lõi |
| DATA-064 | Course | Thực thể logic đại diện cho dữ liệu course. | Quản lý vòng đời của course. | Chief Learning Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-07 cốt lõi |
| DATA-065 | Lesson | Thực thể logic đại diện cho dữ liệu lesson. | Quản lý vòng đời của lesson. | Chief Learning Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-07 cốt lõi |
| DATA-066 | Progress | Thực thể logic đại diện cho dữ liệu progres. | Quản lý vòng đời của progress. | Chief Learning Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-07 cốt lõi |
| DATA-067 | Certificate | Thực thể logic đại diện cho dữ liệu certificate. | Quản lý vòng đời của certificate. | Chief Learning Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-07 cốt lõi |
| DATA-068 | Badge | Thực thể logic đại diện cho dữ liệu badge. | Quản lý vòng đời của badge. | Chief Learning Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-07 cốt lõi |
| DATA-069 | Recommendation | Thực thể logic đại diện cho dữ liệu recommendation. | Quản lý vòng đời của recommendation. | Chief Learning Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-07 cốt lõi |
| DATA-070 | Content Resource | Thực thể logic đại diện cho dữ liệu content resource. | Quản lý vòng đời của content resource. | Chief Learning Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-07 cốt lõi |
| DATA-071 | Learning Path | Thực thể logic đại diện cho dữ liệu learning path. | Quản lý vòng đời của learning path. | Chief Learning Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-07 cốt lõi |
| DATA-072 | Transaction | Thực thể logic đại diện cho dữ liệu transaction. | Quản lý vòng đời của transaction. | CFO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 7 Năm | Các thực thể DOM-08 cốt lõi |
| DATA-073 | Invoice | Thực thể logic đại diện cho dữ liệu invoice. | Quản lý vòng đời của invoice. | CFO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 7 Năm | Các thực thể DOM-08 cốt lõi |
| DATA-074 | Credit Balance | Thực thể logic đại diện cho dữ liệu credit balance. | Quản lý vòng đời của credit balance. | CFO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 7 Năm | Các thực thể DOM-08 cốt lõi |
| DATA-075 | Plan | Thực thể logic đại diện cho dữ liệu plan. | Quản lý vòng đời của plan. | CFO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 7 Năm | Các thực thể DOM-08 cốt lõi |
| DATA-076 | Discount | Thực thể logic đại diện cho dữ liệu discount. | Quản lý vòng đời của discount. | CFO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 7 Năm | Các thực thể DOM-08 cốt lõi |
| DATA-077 | Tax Record | Thực thể logic đại diện cho dữ liệu tax record. | Quản lý vòng đời của tax record. | CFO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 7 Năm | Các thực thể DOM-08 cốt lõi |
| DATA-078 | Refund | Thực thể logic đại diện cho dữ liệu refund. | Quản lý vòng đời của refund. | CFO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 7 Năm | Các thực thể DOM-08 cốt lõi |
| DATA-079 | Payment Method | Thực thể logic đại diện cho dữ liệu payment method. | Quản lý vòng đời của payment method. | CFO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 7 Năm | Các thực thể DOM-08 cốt lõi |
| DATA-080 | Billing Cycle | Thực thể logic đại diện cho dữ liệu billing cycle. | Quản lý vòng đời của billing cycle. | CFO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 7 Năm | Các thực thể DOM-08 cốt lõi |
| DATA-081 | Receipt | Thực thể logic đại diện cho dữ liệu receipt. | Quản lý vòng đời của receipt. | CFO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 7 Năm | Các thực thể DOM-08 cốt lõi |
| DATA-082 | Notification | Thực thể logic đại diện cho dữ liệu notification. | Quản lý vòng đời của notification. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-09 cốt lõi |
| DATA-083 | Email Template | Thực thể logic đại diện cho dữ liệu email template. | Quản lý vòng đời của email template. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-09 cốt lõi |
| DATA-084 | SMS Log | Thực thể logic đại diện cho dữ liệu sms log. | Quản lý vòng đời của sms log. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-09 cốt lõi |
| DATA-085 | In-App Message | Thực thể logic đại diện cho dữ liệu in-app message. | Quản lý vòng đời của in-app message. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-09 cốt lõi |
| DATA-086 | Push Notification | Thực thể logic đại diện cho dữ liệu push notification. | Quản lý vòng đời của push notification. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-09 cốt lõi |
| DATA-087 | Delivery Status | Thực thể logic đại diện cho dữ liệu delivery statu. | Quản lý vòng đời của delivery status. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-09 cốt lõi |
| DATA-088 | Subscription Preference | Thực thể logic đại diện cho dữ liệu subscription preference. | Quản lý vòng đời của subscription preference. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-09 cốt lõi |
| DATA-089 | Alert | Thực thể logic đại diện cho dữ liệu alert. | Quản lý vòng đời của alert. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-09 cốt lõi |
| DATA-090 | Reminder | Thực thể logic đại diện cho dữ liệu reminder. | Quản lý vòng đời của reminder. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-09 cốt lõi |
| DATA-091 | Digest | Thực thể logic đại diện cho dữ liệu digest. | Quản lý vòng đời của digest. | VP of Product | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-09 cốt lõi |
| DATA-092 | Audit Log | Thực thể logic đại diện cho dữ liệu audit log. | Quản lý vòng đời của audit log. | Data Protection Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-10 cốt lõi |
| DATA-093 | Access Log | Thực thể logic đại diện cho dữ liệu access log. | Quản lý vòng đời của access log. | Data Protection Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-10 cốt lõi |
| DATA-094 | Change Record | Thực thể logic đại diện cho dữ liệu change record. | Quản lý vòng đời của change record. | Data Protection Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-10 cốt lõi |
| DATA-095 | Error Log | Thực thể logic đại diện cho dữ liệu error log. | Quản lý vòng đời của error log. | Data Protection Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-10 cốt lõi |
| DATA-096 | Compliance Báo cáo | Thực thể logic đại diện cho dữ liệu compliance report. | Quản lý vòng đời của compliance report. | Data Protection Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-10 cốt lõi |
| DATA-097 | Data Export Request | Thực thể logic đại diện cho dữ liệu data export request. | Quản lý vòng đời của data export request. | Data Protection Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-10 cốt lõi |
| DATA-098 | Privacy Request | Thực thể logic đại diện cho dữ liệu privacy request. | Quản lý vòng đời của privacy request. | Data Protection Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-10 cốt lõi |
| DATA-099 | Admin Action | Thực thể logic đại diện cho dữ liệu admin action. | Quản lý vòng đời của admin action. | Data Protection Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-10 cốt lõi |
| DATA-100 | Login Event | Thực thể logic đại diện cho dữ liệu login event. | Quản lý vòng đời của login event. | Data Protection Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-10 cốt lõi |
| DATA-101 | System Alert | Thực thể logic đại diện cho dữ liệu system alert. | Quản lý vòng đời của system alert. | Data Protection Officer | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-10 cốt lõi |
| DATA-102 | Analytics Snapshot | Thực thể logic đại diện cho dữ liệu analytics snapshot. | Quản lý vòng đời của analytics snapshot. | CDO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-11 cốt lõi |
| DATA-103 | Usage Metric | Thực thể logic đại diện cho dữ liệu usage metric. | Quản lý vòng đời của usage metric. | CDO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-11 cốt lõi |
| DATA-104 | Performance Metric | Thực thể logic đại diện cho dữ liệu performance metric. | Quản lý vòng đời của performance metric. | CDO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-11 cốt lõi |
| DATA-105 | Diversity Metric | Thực thể logic đại diện cho dữ liệu diversity metric. | Quản lý vòng đời của diversity metric. | CDO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-11 cốt lõi |
| DATA-106 | ROI Báo cáo | Thực thể logic đại diện cho dữ liệu roi report. | Quản lý vòng đời của roi report. | CDO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-11 cốt lõi |
| DATA-107 | Ứng viên Funnel | Thực thể logic đại diện cho dữ liệu candidate funnel. | Quản lý vòng đời của candidate funnel. | CDO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-11 cốt lõi |
| DATA-108 | Drop-off Rate | Thực thể logic đại diện cho dữ liệu drop-off rate. | Quản lý vòng đời của drop-off rate. | CDO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-11 cốt lõi |
| DATA-109 | Satisfaction Score | Thực thể logic đại diện cho dữ liệu satisfaction score. | Quản lý vòng đời của satisfaction score. | CDO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-11 cốt lõi |
| DATA-110 | Time-to-Hire | Thực thể logic đại diện cho dữ liệu time-to-hire. | Quản lý vòng đời của time-to-hire. | CDO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-11 cốt lõi |
| DATA-111 | Cost-per-Hire | Thực thể logic đại diện cho dữ liệu cost-per-hire. | Quản lý vòng đời của cost-per-hire. | CDO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-11 cốt lõi |
| DATA-112 | System Configuration | Thực thể logic đại diện cho dữ liệu system configuration. | Quản lý vòng đời của system configuration. | CTO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-12 cốt lõi |
| DATA-113 | Localization Setting | Thực thể logic đại diện cho dữ liệu localization setting. | Quản lý vòng đời của localization setting. | CTO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-12 cốt lõi |
| DATA-114 | API Key | Thực thể logic đại diện cho dữ liệu api key. | Quản lý vòng đời của api key. | CTO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-12 cốt lõi |
| DATA-115 | Webhook | Thực thể logic đại diện cho dữ liệu webhook. | Quản lý vòng đời của webhook. | CTO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-12 cốt lõi |
| DATA-116 | Integration Profile | Thực thể logic đại diện cho dữ liệu integration profile. | Quản lý vòng đời của integration profile. | CTO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-12 cốt lõi |
| DATA-117 | Quy tắc Nghiệp vụ Config | Thực thể logic đại diện cho dữ liệu business rule config. | Quản lý vòng đời của business rule config. | CTO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-12 cốt lõi |
| DATA-118 | Feature Flag | Thực thể logic đại diện cho dữ liệu feature flag. | Quản lý vòng đời của feature flag. | CTO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-12 cốt lõi |
| DATA-119 | Maintenance Window | Thực thể logic đại diện cho dữ liệu maintenance window. | Quản lý vòng đời của maintenance window. | CTO | Hệ thống Tạo | Quy trình Hệ thống, Báo cáo | Hoạt động / Đã lưu trữ | Bảo mật | 3 Năm | Các thực thể DOM-12 cốt lõi |


## 5. Thuộc tính Dữ liệu
Các thuộc tính xác định các điểm dữ liệu cụ thể được thu thập cho từng đối tượng kinh doanh. (Mẫu ánh xạ toàn diện trên tất cả các đối tượng).
| ID Đối tượng Dữ liệu | Tên Thuộc tính | Định nghĩa Nghiệp vụ | Kiểu Dữ liệu | Bắt buộc/Tùy chọn | Quy tắc Xác thực | Giá trị Ví dụ | Độ nhạy cảm Level | Tham chiếu Quy tắc Nghiệp vụ |
|---|---|---|---|---|---|---|---|---|
| DATA-001 | User ID | Mã định danh duy nhất cho User | Tham chiếu | Bắt buộc | VAL-001 | USE-8821 | Nội bộ | BR-01 |
| DATA-001 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-002 | Standard User | Công khai | BR-02 |
| DATA-001 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-003 | Active | Nội bộ | BR-03 |
| DATA-001 | Email Address | Email liên hệ chính | Văn bản | Bắt buộc | VAL-004 | user@example.com | Dữ liệu cá nhân (PII) | BR-05 |
| DATA-002 | Role ID | Mã định danh duy nhất cho Role | Tham chiếu | Bắt buộc | VAL-005 | ROL-8821 | Nội bộ | BR-01 |
| DATA-002 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-006 | Standard Role | Công khai | BR-02 |
| DATA-002 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-007 | Active | Nội bộ | BR-03 |
| DATA-002 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-008 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-003 | Permission ID | Mã định danh duy nhất cho Permission | Tham chiếu | Bắt buộc | VAL-009 | PER-8821 | Nội bộ | BR-01 |
| DATA-003 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-010 | Standard Permission | Công khai | BR-02 |
| DATA-003 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-011 | Active | Nội bộ | BR-03 |
| DATA-003 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-012 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-004 | Session ID | Mã định danh duy nhất cho Session | Tham chiếu | Bắt buộc | VAL-013 | SES-8821 | Nội bộ | BR-01 |
| DATA-004 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-014 | Standard Session | Công khai | BR-02 |
| DATA-004 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-015 | Active | Nội bộ | BR-03 |
| DATA-004 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-016 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-005 | MFA Token ID | Mã định danh duy nhất cho MFA Token | Tham chiếu | Bắt buộc | VAL-017 | MFA-8821 | Nội bộ | BR-01 |
| DATA-005 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-018 | Standard MFA Token | Công khai | BR-02 |
| DATA-005 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-019 | Active | Nội bộ | BR-03 |
| DATA-005 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-020 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-006 | Consent Record ID | Mã định danh duy nhất cho Consent Record | Tham chiếu | Bắt buộc | VAL-021 | CON-8821 | Nội bộ | BR-01 |
| DATA-006 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-022 | Standard Consent Record | Công khai | BR-02 |
| DATA-006 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-023 | Active | Nội bộ | BR-03 |
| DATA-006 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-024 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-007 | Identity Verification ID | Mã định danh duy nhất cho Identity Verification | Tham chiếu | Bắt buộc | VAL-025 | IDE-8821 | Nội bộ | BR-01 |
| DATA-007 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-026 | Standard Identity Verification | Công khai | BR-02 |
| DATA-007 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-027 | Active | Nội bộ | BR-03 |
| DATA-007 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-028 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-008 | Security Profile ID | Mã định danh duy nhất cho Security Profile | Tham chiếu | Bắt buộc | VAL-029 | SEC-8821 | Nội bộ | BR-01 |
| DATA-008 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-030 | Standard Security Profile | Công khai | BR-02 |
| DATA-008 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-031 | Active | Nội bộ | BR-03 |
| DATA-008 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-032 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-009 | SSO Configuration ID | Mã định danh duy nhất cho SSO Configuration | Tham chiếu | Bắt buộc | VAL-033 | SSO-8821 | Nội bộ | BR-01 |
| DATA-009 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-034 | Standard SSO Configuration | Công khai | BR-02 |
| DATA-009 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-035 | Active | Nội bộ | BR-03 |
| DATA-009 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-036 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-010 | Password History ID | Mã định danh duy nhất cho Password History | Tham chiếu | Bắt buộc | VAL-037 | PAS-8821 | Nội bộ | BR-01 |
| DATA-010 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-038 | Standard Password History | Công khai | BR-02 |
| DATA-010 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-039 | Active | Nội bộ | BR-03 |
| DATA-010 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-040 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-011 | Ứng viên ID | Mã định danh duy nhất cho Ứng viên | Tham chiếu | Bắt buộc | VAL-041 | CAN-8821 | Nội bộ | BR-01 |
| DATA-011 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-042 | Standard Ứng viên | Công khai | BR-02 |
| DATA-011 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-043 | Active | Nội bộ | BR-03 |
| DATA-011 | Resume | Tài liệu CV đính kèm | Tệp đính kèm | Tùy chọn | VAL-044 | resume.pdf | Dữ liệu cá nhân (PII) | BR-07 |
| DATA-012 | Profile ID | Mã định danh duy nhất cho Profile | Tham chiếu | Bắt buộc | VAL-045 | PRO-8821 | Nội bộ | BR-01 |
| DATA-012 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-046 | Standard Profile | Công khai | BR-02 |
| DATA-012 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-047 | Active | Nội bộ | BR-03 |
| DATA-012 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-048 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-013 | Education ID | Mã định danh duy nhất cho Education | Tham chiếu | Bắt buộc | VAL-049 | EDU-8821 | Nội bộ | BR-01 |
| DATA-013 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-050 | Standard Education | Công khai | BR-02 |
| DATA-013 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-051 | Active | Nội bộ | BR-03 |
| DATA-013 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-052 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-014 | Experience ID | Mã định danh duy nhất cho Experience | Tham chiếu | Bắt buộc | VAL-053 | EXP-8821 | Nội bộ | BR-01 |
| DATA-014 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-054 | Standard Experience | Công khai | BR-02 |
| DATA-014 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-055 | Active | Nội bộ | BR-03 |
| DATA-014 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-056 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-015 | Skill Claim ID | Mã định danh duy nhất cho Skill Claim | Tham chiếu | Bắt buộc | VAL-057 | SKI-8821 | Nội bộ | BR-01 |
| DATA-015 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-058 | Standard Skill Claim | Công khai | BR-02 |
| DATA-015 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-059 | Active | Nội bộ | BR-03 |
| DATA-015 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-060 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-016 | Certification ID | Mã định danh duy nhất cho Certification | Tham chiếu | Bắt buộc | VAL-061 | CER-8821 | Nội bộ | BR-01 |
| DATA-016 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-062 | Standard Certification | Công khai | BR-02 |
| DATA-016 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-063 | Active | Nội bộ | BR-03 |
| DATA-016 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-064 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-017 | Career Goal ID | Mã định danh duy nhất cho Career Goal | Tham chiếu | Bắt buộc | VAL-065 | CAR-8821 | Nội bộ | BR-01 |
| DATA-017 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-066 | Standard Career Goal | Công khai | BR-02 |
| DATA-017 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-067 | Active | Nội bộ | BR-03 |
| DATA-017 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-068 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-018 | Language Proficiency ID | Mã định danh duy nhất cho Language Proficiency | Tham chiếu | Bắt buộc | VAL-069 | LAN-8821 | Nội bộ | BR-01 |
| DATA-018 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-070 | Standard Language Proficiency | Công khai | BR-02 |
| DATA-018 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-071 | Active | Nội bộ | BR-03 |
| DATA-018 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-072 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-019 | Portfolio Item ID | Mã định danh duy nhất cho Portfolio Item | Tham chiếu | Bắt buộc | VAL-073 | POR-8821 | Nội bộ | BR-01 |
| DATA-019 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-074 | Standard Portfolio Item | Công khai | BR-02 |
| DATA-019 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-075 | Active | Nội bộ | BR-03 |
| DATA-019 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-076 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-020 | Availability ID | Mã định danh duy nhất cho Availability | Tham chiếu | Bắt buộc | VAL-077 | AVA-8821 | Nội bộ | BR-01 |
| DATA-020 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-078 | Standard Availability | Công khai | BR-02 |
| DATA-020 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-079 | Active | Nội bộ | BR-03 |
| DATA-020 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-080 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-021 | Employer ID | Mã định danh duy nhất cho Employer | Tham chiếu | Bắt buộc | VAL-081 | EMP-8821 | Nội bộ | BR-01 |
| DATA-021 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-082 | Standard Employer | Công khai | BR-02 |
| DATA-021 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-083 | Active | Nội bộ | BR-03 |
| DATA-021 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-084 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-022 | Company ID | Mã định danh duy nhất cho Company | Tham chiếu | Bắt buộc | VAL-085 | COM-8821 | Nội bộ | BR-01 |
| DATA-022 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-086 | Standard Company | Công khai | BR-02 |
| DATA-022 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-087 | Active | Nội bộ | BR-03 |
| DATA-022 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-088 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-023 | Department ID | Mã định danh duy nhất cho Department | Tham chiếu | Bắt buộc | VAL-089 | DEP-8821 | Nội bộ | BR-01 |
| DATA-023 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-090 | Standard Department | Công khai | BR-02 |
| DATA-023 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-091 | Active | Nội bộ | BR-03 |
| DATA-023 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-092 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-024 | Team ID | Mã định danh duy nhất cho Team | Tham chiếu | Bắt buộc | VAL-093 | TEA-8821 | Nội bộ | BR-01 |
| DATA-024 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-094 | Standard Team | Công khai | BR-02 |
| DATA-024 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-095 | Active | Nội bộ | BR-03 |
| DATA-024 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-096 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-025 | Nhà tuyển dụng ID | Mã định danh duy nhất cho Nhà tuyển dụng | Tham chiếu | Bắt buộc | VAL-097 | REC-8821 | Nội bộ | BR-01 |
| DATA-025 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-098 | Standard Nhà tuyển dụng | Công khai | BR-02 |
| DATA-025 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-099 | Active | Nội bộ | BR-03 |
| DATA-025 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-100 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-026 | Hiring Manager ID | Mã định danh duy nhất cho Hiring Manager | Tham chiếu | Bắt buộc | VAL-101 | HIR-8821 | Nội bộ | BR-01 |
| DATA-026 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-102 | Standard Hiring Manager | Công khai | BR-02 |
| DATA-026 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-103 | Active | Nội bộ | BR-03 |
| DATA-026 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-104 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-027 | Billing Profile ID | Mã định danh duy nhất cho Billing Profile | Tham chiếu | Bắt buộc | VAL-105 | BIL-8821 | Nội bộ | BR-01 |
| DATA-027 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-106 | Standard Billing Profile | Công khai | BR-02 |
| DATA-027 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-107 | Active | Nội bộ | BR-03 |
| DATA-027 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-108 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-028 | Subscription ID | Mã định danh duy nhất cho Subscription | Tham chiếu | Bắt buộc | VAL-109 | SUB-8821 | Nội bộ | BR-01 |
| DATA-028 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-110 | Standard Subscription | Công khai | BR-02 |
| DATA-028 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-111 | Active | Nội bộ | BR-03 |
| DATA-028 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-112 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-029 | Company Address ID | Mã định danh duy nhất cho Company Address | Tham chiếu | Bắt buộc | VAL-113 | COM-8821 | Nội bộ | BR-01 |
| DATA-029 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-114 | Standard Company Address | Công khai | BR-02 |
| DATA-029 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-115 | Active | Nội bộ | BR-03 |
| DATA-029 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-116 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-030 | Employer Setting ID | Mã định danh duy nhất cho Employer Setting | Tham chiếu | Bắt buộc | VAL-117 | EMP-8821 | Nội bộ | BR-01 |
| DATA-030 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-118 | Standard Employer Setting | Công khai | BR-02 |
| DATA-030 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-119 | Active | Nội bộ | BR-03 |
| DATA-030 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-120 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-031 | Job Posting ID | Mã định danh duy nhất cho Job Posting | Tham chiếu | Bắt buộc | VAL-121 | JOB-8821 | Nội bộ | BR-01 |
| DATA-031 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-122 | Standard Job Posting | Công khai | BR-02 |
| DATA-031 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-123 | Active | Nội bộ | BR-03 |
| DATA-031 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-124 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-032 | Campaign ID | Mã định danh duy nhất cho Campaign | Tham chiếu | Bắt buộc | VAL-125 | CAM-8821 | Nội bộ | BR-01 |
| DATA-032 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-126 | Standard Campaign | Công khai | BR-02 |
| DATA-032 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-127 | Active | Nội bộ | BR-03 |
| DATA-032 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-128 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-033 | Application ID | Mã định danh duy nhất cho Application | Tham chiếu | Bắt buộc | VAL-129 | APP-8821 | Nội bộ | BR-01 |
| DATA-033 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-130 | Standard Application | Công khai | BR-02 |
| DATA-033 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-131 | Active | Nội bộ | BR-03 |
| DATA-033 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-132 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-034 | Talent Pool ID | Mã định danh duy nhất cho Talent Pool | Tham chiếu | Bắt buộc | VAL-133 | TAL-8821 | Nội bộ | BR-01 |
| DATA-034 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-134 | Standard Talent Pool | Công khai | BR-02 |
| DATA-034 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-135 | Active | Nội bộ | BR-03 |
| DATA-034 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-136 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-035 | Offer ID | Mã định danh duy nhất cho Offer | Tham chiếu | Bắt buộc | VAL-137 | OFF-8821 | Nội bộ | BR-01 |
| DATA-035 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-138 | Standard Offer | Công khai | BR-02 |
| DATA-035 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-139 | Active | Nội bộ | BR-03 |
| DATA-035 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-140 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-036 | Pipeline Stage ID | Mã định danh duy nhất cho Pipeline Stage | Tham chiếu | Bắt buộc | VAL-141 | PIP-8821 | Nội bộ | BR-01 |
| DATA-036 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-142 | Standard Pipeline Stage | Công khai | BR-02 |
| DATA-036 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-143 | Active | Nội bộ | BR-03 |
| DATA-036 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-144 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-037 | Sourcing Channel ID | Mã định danh duy nhất cho Sourcing Channel | Tham chiếu | Bắt buộc | VAL-145 | SOU-8821 | Nội bộ | BR-01 |
| DATA-037 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-146 | Standard Sourcing Channel | Công khai | BR-02 |
| DATA-037 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-147 | Active | Nội bộ | BR-03 |
| DATA-037 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-148 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-038 | Referral ID | Mã định danh duy nhất cho Referral | Tham chiếu | Bắt buộc | VAL-149 | REF-8821 | Nội bộ | BR-01 |
| DATA-038 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-150 | Standard Referral | Công khai | BR-02 |
| DATA-038 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-151 | Active | Nội bộ | BR-03 |
| DATA-038 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-152 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-039 | Screening Form ID | Mã định danh duy nhất cho Screening Form | Tham chiếu | Bắt buộc | VAL-153 | SCR-8821 | Nội bộ | BR-01 |
| DATA-039 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-154 | Standard Screening Form | Công khai | BR-02 |
| DATA-039 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-155 | Active | Nội bộ | BR-03 |
| DATA-039 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-156 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-040 | Shortlist ID | Mã định danh duy nhất cho Shortlist | Tham chiếu | Bắt buộc | VAL-157 | SHO-8821 | Nội bộ | BR-01 |
| DATA-040 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-158 | Standard Shortlist | Công khai | BR-02 |
| DATA-040 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-159 | Active | Nội bộ | BR-03 |
| DATA-040 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-160 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-041 | Interview ID | Mã định danh duy nhất cho Interview | Tham chiếu | Bắt buộc | VAL-161 | INT-8821 | Nội bộ | BR-01 |
| DATA-041 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-162 | Standard Interview | Công khai | BR-02 |
| DATA-041 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-163 | Active | Nội bộ | BR-03 |
| DATA-041 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-164 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-042 | Session ID | Mã định danh duy nhất cho Session | Tham chiếu | Bắt buộc | VAL-165 | SES-8821 | Nội bộ | BR-01 |
| DATA-042 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-166 | Standard Session | Công khai | BR-02 |
| DATA-042 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-167 | Active | Nội bộ | BR-03 |
| DATA-042 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-168 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-043 | Question ID | Mã định danh duy nhất cho Question | Tham chiếu | Bắt buộc | VAL-169 | QUE-8821 | Nội bộ | BR-01 |
| DATA-043 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-170 | Standard Question | Công khai | BR-02 |
| DATA-043 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-171 | Active | Nội bộ | BR-03 |
| DATA-043 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-172 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-044 | Answer ID | Mã định danh duy nhất cho Answer | Tham chiếu | Bắt buộc | VAL-173 | ANS-8821 | Nội bộ | BR-01 |
| DATA-044 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-174 | Standard Answer | Công khai | BR-02 |
| DATA-044 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-175 | Active | Nội bộ | BR-03 |
| DATA-044 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-176 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-045 | Rubric ID | Mã định danh duy nhất cho Rubric | Tham chiếu | Bắt buộc | VAL-177 | RUB-8821 | Nội bộ | BR-01 |
| DATA-045 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-178 | Standard Rubric | Công khai | BR-02 |
| DATA-045 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-179 | Active | Nội bộ | BR-03 |
| DATA-045 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-180 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-046 | Recording ID | Mã định danh duy nhất cho Recording | Tham chiếu | Bắt buộc | VAL-181 | REC-8821 | Nội bộ | BR-01 |
| DATA-046 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-182 | Standard Recording | Công khai | BR-02 |
| DATA-046 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-183 | Active | Nội bộ | BR-03 |
| DATA-046 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-184 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-047 | Transcript ID | Mã định danh duy nhất cho Transcript | Tham chiếu | Bắt buộc | VAL-185 | TRA-8821 | Nội bộ | BR-01 |
| DATA-047 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-186 | Standard Transcript | Công khai | BR-02 |
| DATA-047 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-187 | Active | Nội bộ | BR-03 |
| DATA-047 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-188 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-048 | Interviewer ID | Mã định danh duy nhất cho Interviewer | Tham chiếu | Bắt buộc | VAL-189 | INT-8821 | Nội bộ | BR-01 |
| DATA-048 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-190 | Standard Interviewer | Công khai | BR-02 |
| DATA-048 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-191 | Active | Nội bộ | BR-03 |
| DATA-048 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-192 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-049 | Feedback ID | Mã định danh duy nhất cho Feedback | Tham chiếu | Bắt buộc | VAL-193 | FEE-8821 | Nội bộ | BR-01 |
| DATA-049 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-194 | Standard Feedback | Công khai | BR-02 |
| DATA-049 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-195 | Active | Nội bộ | BR-03 |
| DATA-049 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-196 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-050 | Rating ID | Mã định danh duy nhất cho Rating | Tham chiếu | Bắt buộc | VAL-197 | RAT-8821 | Nội bộ | BR-01 |
| DATA-050 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-198 | Standard Rating | Công khai | BR-02 |
| DATA-050 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-199 | Active | Nội bộ | BR-03 |
| DATA-050 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-200 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-051 | Interview Template ID | Mã định danh duy nhất cho Interview Template | Tham chiếu | Bắt buộc | VAL-201 | INT-8821 | Nội bộ | BR-01 |
| DATA-051 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-202 | Standard Interview Template | Công khai | BR-02 |
| DATA-051 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-203 | Active | Nội bộ | BR-03 |
| DATA-051 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-204 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-052 | Assessment ID | Mã định danh duy nhất cho Assessment | Tham chiếu | Bắt buộc | VAL-205 | ASS-8821 | Nội bộ | BR-01 |
| DATA-052 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-206 | Standard Assessment | Công khai | BR-02 |
| DATA-052 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-207 | Active | Nội bộ | BR-03 |
| DATA-052 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-208 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-053 | Test Case ID | Mã định danh duy nhất cho Test Case | Tham chiếu | Bắt buộc | VAL-209 | TES-8821 | Nội bộ | BR-01 |
| DATA-053 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-210 | Standard Test Case | Công khai | BR-02 |
| DATA-053 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-211 | Active | Nội bộ | BR-03 |
| DATA-053 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-212 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-054 | Submission ID | Mã định danh duy nhất cho Submission | Tham chiếu | Bắt buộc | VAL-213 | SUB-8821 | Nội bộ | BR-01 |
| DATA-054 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-214 | Standard Submission | Công khai | BR-02 |
| DATA-054 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-215 | Active | Nội bộ | BR-03 |
| DATA-054 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-216 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-055 | Score ID | Mã định danh duy nhất cho Score | Tham chiếu | Bắt buộc | VAL-217 | SCO-8821 | Nội bộ | BR-01 |
| DATA-055 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-218 | Standard Score | Công khai | BR-02 |
| DATA-055 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-219 | Active | Nội bộ | BR-03 |
| DATA-055 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-220 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-056 | Skill Gap ID | Mã định danh duy nhất cho Skill Gap | Tham chiếu | Bắt buộc | VAL-221 | SKI-8821 | Nội bộ | BR-01 |
| DATA-056 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-222 | Standard Skill Gap | Công khai | BR-02 |
| DATA-056 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-223 | Active | Nội bộ | BR-03 |
| DATA-056 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-224 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-057 | Proctoring Log ID | Mã định danh duy nhất cho Proctoring Log | Tham chiếu | Bắt buộc | VAL-225 | PRO-8821 | Nội bộ | BR-01 |
| DATA-057 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-226 | Standard Proctoring Log | Công khai | BR-02 |
| DATA-057 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-227 | Active | Nội bộ | BR-03 |
| DATA-057 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-228 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-058 | Code Execution Result ID | Mã định danh duy nhất cho Code Execution Result | Tham chiếu | Bắt buộc | VAL-229 | COD-8821 | Nội bộ | BR-01 |
| DATA-058 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-230 | Standard Code Execution Result | Công khai | BR-02 |
| DATA-058 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-231 | Active | Nội bộ | BR-03 |
| DATA-058 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-232 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-059 | Plagiarism Báo cáo ID | Mã định danh duy nhất cho Plagiarism Báo cáo | Tham chiếu | Bắt buộc | VAL-233 | PLA-8821 | Nội bộ | BR-01 |
| DATA-059 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-234 | Standard Plagiarism Báo cáo | Công khai | BR-02 |
| DATA-059 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-235 | Active | Nội bộ | BR-03 |
| DATA-059 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-236 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-060 | Question Bank ID | Mã định danh duy nhất cho Question Bank | Tham chiếu | Bắt buộc | VAL-237 | QUE-8821 | Nội bộ | BR-01 |
| DATA-060 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-238 | Standard Question Bank | Công khai | BR-02 |
| DATA-060 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-239 | Active | Nội bộ | BR-03 |
| DATA-060 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-240 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-061 | Assessment Template ID | Mã định danh duy nhất cho Assessment Template | Tham chiếu | Bắt buộc | VAL-241 | ASS-8821 | Nội bộ | BR-01 |
| DATA-061 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-242 | Standard Assessment Template | Công khai | BR-02 |
| DATA-061 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-243 | Active | Nội bộ | BR-03 |
| DATA-061 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-244 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-062 | Roadmap ID | Mã định danh duy nhất cho Roadmap | Tham chiếu | Bắt buộc | VAL-245 | ROA-8821 | Nội bộ | BR-01 |
| DATA-062 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-246 | Standard Roadmap | Công khai | BR-02 |
| DATA-062 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-247 | Active | Nội bộ | BR-03 |
| DATA-062 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-248 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-063 | Module ID | Mã định danh duy nhất cho Module | Tham chiếu | Bắt buộc | VAL-249 | MOD-8821 | Nội bộ | BR-01 |
| DATA-063 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-250 | Standard Module | Công khai | BR-02 |
| DATA-063 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-251 | Active | Nội bộ | BR-03 |
| DATA-063 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-252 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-064 | Course ID | Mã định danh duy nhất cho Course | Tham chiếu | Bắt buộc | VAL-253 | COU-8821 | Nội bộ | BR-01 |
| DATA-064 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-254 | Standard Course | Công khai | BR-02 |
| DATA-064 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-255 | Active | Nội bộ | BR-03 |
| DATA-064 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-256 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-065 | Lesson ID | Mã định danh duy nhất cho Lesson | Tham chiếu | Bắt buộc | VAL-257 | LES-8821 | Nội bộ | BR-01 |
| DATA-065 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-258 | Standard Lesson | Công khai | BR-02 |
| DATA-065 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-259 | Active | Nội bộ | BR-03 |
| DATA-065 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-260 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-066 | Progress ID | Mã định danh duy nhất cho Progress | Tham chiếu | Bắt buộc | VAL-261 | PRO-8821 | Nội bộ | BR-01 |
| DATA-066 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-262 | Standard Progress | Công khai | BR-02 |
| DATA-066 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-263 | Active | Nội bộ | BR-03 |
| DATA-066 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-264 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-067 | Certificate ID | Mã định danh duy nhất cho Certificate | Tham chiếu | Bắt buộc | VAL-265 | CER-8821 | Nội bộ | BR-01 |
| DATA-067 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-266 | Standard Certificate | Công khai | BR-02 |
| DATA-067 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-267 | Active | Nội bộ | BR-03 |
| DATA-067 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-268 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-068 | Badge ID | Mã định danh duy nhất cho Badge | Tham chiếu | Bắt buộc | VAL-269 | BAD-8821 | Nội bộ | BR-01 |
| DATA-068 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-270 | Standard Badge | Công khai | BR-02 |
| DATA-068 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-271 | Active | Nội bộ | BR-03 |
| DATA-068 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-272 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-069 | Recommendation ID | Mã định danh duy nhất cho Recommendation | Tham chiếu | Bắt buộc | VAL-273 | REC-8821 | Nội bộ | BR-01 |
| DATA-069 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-274 | Standard Recommendation | Công khai | BR-02 |
| DATA-069 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-275 | Active | Nội bộ | BR-03 |
| DATA-069 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-276 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-070 | Content Resource ID | Mã định danh duy nhất cho Content Resource | Tham chiếu | Bắt buộc | VAL-277 | CON-8821 | Nội bộ | BR-01 |
| DATA-070 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-278 | Standard Content Resource | Công khai | BR-02 |
| DATA-070 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-279 | Active | Nội bộ | BR-03 |
| DATA-070 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-280 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-071 | Learning Path ID | Mã định danh duy nhất cho Learning Path | Tham chiếu | Bắt buộc | VAL-281 | LEA-8821 | Nội bộ | BR-01 |
| DATA-071 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-282 | Standard Learning Path | Công khai | BR-02 |
| DATA-071 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-283 | Active | Nội bộ | BR-03 |
| DATA-071 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-284 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-072 | Transaction ID | Mã định danh duy nhất cho Transaction | Tham chiếu | Bắt buộc | VAL-285 | TRA-8821 | Nội bộ | BR-01 |
| DATA-072 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-286 | Standard Transaction | Công khai | BR-02 |
| DATA-072 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-287 | Active | Nội bộ | BR-03 |
| DATA-072 | Amount | Giá trị tài chính giao dịch | Tiền tệ | Bắt buộc | VAL-288 | $500.00 | Tài chính | BR-06 |
| DATA-073 | Invoice ID | Mã định danh duy nhất cho Invoice | Tham chiếu | Bắt buộc | VAL-289 | INV-8821 | Nội bộ | BR-01 |
| DATA-073 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-290 | Standard Invoice | Công khai | BR-02 |
| DATA-073 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-291 | Active | Nội bộ | BR-03 |
| DATA-073 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-292 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-074 | Credit Balance ID | Mã định danh duy nhất cho Credit Balance | Tham chiếu | Bắt buộc | VAL-293 | CRE-8821 | Nội bộ | BR-01 |
| DATA-074 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-294 | Standard Credit Balance | Công khai | BR-02 |
| DATA-074 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-295 | Active | Nội bộ | BR-03 |
| DATA-074 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-296 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-075 | Plan ID | Mã định danh duy nhất cho Plan | Tham chiếu | Bắt buộc | VAL-297 | PLA-8821 | Nội bộ | BR-01 |
| DATA-075 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-298 | Standard Plan | Công khai | BR-02 |
| DATA-075 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-299 | Active | Nội bộ | BR-03 |
| DATA-075 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-300 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-076 | Discount ID | Mã định danh duy nhất cho Discount | Tham chiếu | Bắt buộc | VAL-301 | DIS-8821 | Nội bộ | BR-01 |
| DATA-076 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-302 | Standard Discount | Công khai | BR-02 |
| DATA-076 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-303 | Active | Nội bộ | BR-03 |
| DATA-076 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-304 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-077 | Tax Record ID | Mã định danh duy nhất cho Tax Record | Tham chiếu | Bắt buộc | VAL-305 | TAX-8821 | Nội bộ | BR-01 |
| DATA-077 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-306 | Standard Tax Record | Công khai | BR-02 |
| DATA-077 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-307 | Active | Nội bộ | BR-03 |
| DATA-077 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-308 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-078 | Refund ID | Mã định danh duy nhất cho Refund | Tham chiếu | Bắt buộc | VAL-309 | REF-8821 | Nội bộ | BR-01 |
| DATA-078 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-310 | Standard Refund | Công khai | BR-02 |
| DATA-078 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-311 | Active | Nội bộ | BR-03 |
| DATA-078 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-312 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-079 | Payment Method ID | Mã định danh duy nhất cho Payment Method | Tham chiếu | Bắt buộc | VAL-313 | PAY-8821 | Nội bộ | BR-01 |
| DATA-079 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-314 | Standard Payment Method | Công khai | BR-02 |
| DATA-079 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-315 | Active | Nội bộ | BR-03 |
| DATA-079 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-316 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-080 | Billing Cycle ID | Mã định danh duy nhất cho Billing Cycle | Tham chiếu | Bắt buộc | VAL-317 | BIL-8821 | Nội bộ | BR-01 |
| DATA-080 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-318 | Standard Billing Cycle | Công khai | BR-02 |
| DATA-080 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-319 | Active | Nội bộ | BR-03 |
| DATA-080 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-320 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-081 | Receipt ID | Mã định danh duy nhất cho Receipt | Tham chiếu | Bắt buộc | VAL-321 | REC-8821 | Nội bộ | BR-01 |
| DATA-081 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-322 | Standard Receipt | Công khai | BR-02 |
| DATA-081 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-323 | Active | Nội bộ | BR-03 |
| DATA-081 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-324 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-082 | Notification ID | Mã định danh duy nhất cho Notification | Tham chiếu | Bắt buộc | VAL-325 | NOT-8821 | Nội bộ | BR-01 |
| DATA-082 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-326 | Standard Notification | Công khai | BR-02 |
| DATA-082 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-327 | Active | Nội bộ | BR-03 |
| DATA-082 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-328 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-083 | Email Template ID | Mã định danh duy nhất cho Email Template | Tham chiếu | Bắt buộc | VAL-329 | EMA-8821 | Nội bộ | BR-01 |
| DATA-083 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-330 | Standard Email Template | Công khai | BR-02 |
| DATA-083 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-331 | Active | Nội bộ | BR-03 |
| DATA-083 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-332 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-084 | SMS Log ID | Mã định danh duy nhất cho SMS Log | Tham chiếu | Bắt buộc | VAL-333 | SMS-8821 | Nội bộ | BR-01 |
| DATA-084 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-334 | Standard SMS Log | Công khai | BR-02 |
| DATA-084 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-335 | Active | Nội bộ | BR-03 |
| DATA-084 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-336 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-085 | In-App Message ID | Mã định danh duy nhất cho In-App Message | Tham chiếu | Bắt buộc | VAL-337 | IN--8821 | Nội bộ | BR-01 |
| DATA-085 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-338 | Standard In-App Message | Công khai | BR-02 |
| DATA-085 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-339 | Active | Nội bộ | BR-03 |
| DATA-085 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-340 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-086 | Push Notification ID | Mã định danh duy nhất cho Push Notification | Tham chiếu | Bắt buộc | VAL-341 | PUS-8821 | Nội bộ | BR-01 |
| DATA-086 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-342 | Standard Push Notification | Công khai | BR-02 |
| DATA-086 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-343 | Active | Nội bộ | BR-03 |
| DATA-086 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-344 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-087 | Delivery Status ID | Mã định danh duy nhất cho Delivery Status | Tham chiếu | Bắt buộc | VAL-345 | DEL-8821 | Nội bộ | BR-01 |
| DATA-087 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-346 | Standard Delivery Status | Công khai | BR-02 |
| DATA-087 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-347 | Active | Nội bộ | BR-03 |
| DATA-087 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-348 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-088 | Subscription Preference ID | Mã định danh duy nhất cho Subscription Preference | Tham chiếu | Bắt buộc | VAL-349 | SUB-8821 | Nội bộ | BR-01 |
| DATA-088 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-350 | Standard Subscription Preference | Công khai | BR-02 |
| DATA-088 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-351 | Active | Nội bộ | BR-03 |
| DATA-088 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-352 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-089 | Alert ID | Mã định danh duy nhất cho Alert | Tham chiếu | Bắt buộc | VAL-353 | ALE-8821 | Nội bộ | BR-01 |
| DATA-089 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-354 | Standard Alert | Công khai | BR-02 |
| DATA-089 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-355 | Active | Nội bộ | BR-03 |
| DATA-089 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-356 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-090 | Reminder ID | Mã định danh duy nhất cho Reminder | Tham chiếu | Bắt buộc | VAL-357 | REM-8821 | Nội bộ | BR-01 |
| DATA-090 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-358 | Standard Reminder | Công khai | BR-02 |
| DATA-090 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-359 | Active | Nội bộ | BR-03 |
| DATA-090 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-360 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-091 | Digest ID | Mã định danh duy nhất cho Digest | Tham chiếu | Bắt buộc | VAL-361 | DIG-8821 | Nội bộ | BR-01 |
| DATA-091 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-362 | Standard Digest | Công khai | BR-02 |
| DATA-091 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-363 | Active | Nội bộ | BR-03 |
| DATA-091 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-364 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-092 | Audit Log ID | Mã định danh duy nhất cho Audit Log | Tham chiếu | Bắt buộc | VAL-365 | AUD-8821 | Nội bộ | BR-01 |
| DATA-092 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-366 | Standard Audit Log | Công khai | BR-02 |
| DATA-092 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-367 | Active | Nội bộ | BR-03 |
| DATA-092 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-368 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-093 | Access Log ID | Mã định danh duy nhất cho Access Log | Tham chiếu | Bắt buộc | VAL-369 | ACC-8821 | Nội bộ | BR-01 |
| DATA-093 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-370 | Standard Access Log | Công khai | BR-02 |
| DATA-093 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-371 | Active | Nội bộ | BR-03 |
| DATA-093 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-372 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-094 | Change Record ID | Mã định danh duy nhất cho Change Record | Tham chiếu | Bắt buộc | VAL-373 | CHA-8821 | Nội bộ | BR-01 |
| DATA-094 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-374 | Standard Change Record | Công khai | BR-02 |
| DATA-094 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-375 | Active | Nội bộ | BR-03 |
| DATA-094 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-376 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-095 | Error Log ID | Mã định danh duy nhất cho Error Log | Tham chiếu | Bắt buộc | VAL-377 | ERR-8821 | Nội bộ | BR-01 |
| DATA-095 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-378 | Standard Error Log | Công khai | BR-02 |
| DATA-095 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-379 | Active | Nội bộ | BR-03 |
| DATA-095 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-380 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-096 | Compliance Báo cáo ID | Mã định danh duy nhất cho Compliance Báo cáo | Tham chiếu | Bắt buộc | VAL-381 | COM-8821 | Nội bộ | BR-01 |
| DATA-096 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-382 | Standard Compliance Báo cáo | Công khai | BR-02 |
| DATA-096 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-383 | Active | Nội bộ | BR-03 |
| DATA-096 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-384 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-097 | Data Export Request ID | Mã định danh duy nhất cho Data Export Request | Tham chiếu | Bắt buộc | VAL-385 | DAT-8821 | Nội bộ | BR-01 |
| DATA-097 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-386 | Standard Data Export Request | Công khai | BR-02 |
| DATA-097 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-387 | Active | Nội bộ | BR-03 |
| DATA-097 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-388 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-098 | Privacy Request ID | Mã định danh duy nhất cho Privacy Request | Tham chiếu | Bắt buộc | VAL-389 | PRI-8821 | Nội bộ | BR-01 |
| DATA-098 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-390 | Standard Privacy Request | Công khai | BR-02 |
| DATA-098 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-391 | Active | Nội bộ | BR-03 |
| DATA-098 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-392 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-099 | Admin Action ID | Mã định danh duy nhất cho Admin Action | Tham chiếu | Bắt buộc | VAL-393 | ADM-8821 | Nội bộ | BR-01 |
| DATA-099 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-394 | Standard Admin Action | Công khai | BR-02 |
| DATA-099 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-395 | Active | Nội bộ | BR-03 |
| DATA-099 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-396 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-100 | Login Event ID | Mã định danh duy nhất cho Login Event | Tham chiếu | Bắt buộc | VAL-397 | LOG-8821 | Nội bộ | BR-01 |
| DATA-100 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-398 | Standard Login Event | Công khai | BR-02 |
| DATA-100 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-399 | Active | Nội bộ | BR-03 |
| DATA-100 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-400 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-101 | System Alert ID | Mã định danh duy nhất cho System Alert | Tham chiếu | Bắt buộc | VAL-401 | SYS-8821 | Nội bộ | BR-01 |
| DATA-101 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-402 | Standard System Alert | Công khai | BR-02 |
| DATA-101 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-403 | Active | Nội bộ | BR-03 |
| DATA-101 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-404 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-102 | Analytics Snapshot ID | Mã định danh duy nhất cho Analytics Snapshot | Tham chiếu | Bắt buộc | VAL-405 | ANA-8821 | Nội bộ | BR-01 |
| DATA-102 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-406 | Standard Analytics Snapshot | Công khai | BR-02 |
| DATA-102 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-407 | Active | Nội bộ | BR-03 |
| DATA-102 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-408 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-103 | Usage ID Số liệu | Mã định danh duy nhất cho Usage Metric | Tham chiếu | Bắt buộc | VAL-409 | USA-8821 | Nội bộ | BR-01 |
| DATA-103 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-410 | Standard Usage Metric | Công khai | BR-02 |
| DATA-103 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-411 | Active | Nội bộ | BR-03 |
| DATA-103 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-412 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-104 | Performance ID Số liệu | Mã định danh duy nhất cho Performance Metric | Tham chiếu | Bắt buộc | VAL-413 | PER-8821 | Nội bộ | BR-01 |
| DATA-104 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-414 | Standard Performance Metric | Công khai | BR-02 |
| DATA-104 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-415 | Active | Nội bộ | BR-03 |
| DATA-104 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-416 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-105 | Diversity ID Số liệu | Mã định danh duy nhất cho Diversity Metric | Tham chiếu | Bắt buộc | VAL-417 | DIV-8821 | Nội bộ | BR-01 |
| DATA-105 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-418 | Standard Diversity Metric | Công khai | BR-02 |
| DATA-105 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-419 | Active | Nội bộ | BR-03 |
| DATA-105 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-420 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-106 | ROI Báo cáo ID | Mã định danh duy nhất cho ROI Báo cáo | Tham chiếu | Bắt buộc | VAL-421 | ROI-8821 | Nội bộ | BR-01 |
| DATA-106 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-422 | Standard ROI Báo cáo | Công khai | BR-02 |
| DATA-106 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-423 | Active | Nội bộ | BR-03 |
| DATA-106 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-424 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-107 | Ứng viên Funnel ID | Mã định danh duy nhất cho Ứng viên Funnel | Tham chiếu | Bắt buộc | VAL-425 | CAN-8821 | Nội bộ | BR-01 |
| DATA-107 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-426 | Standard Ứng viên Funnel | Công khai | BR-02 |
| DATA-107 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-427 | Active | Nội bộ | BR-03 |
| DATA-107 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-428 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-108 | Drop-off Rate ID | Mã định danh duy nhất cho Drop-off Rate | Tham chiếu | Bắt buộc | VAL-429 | DRO-8821 | Nội bộ | BR-01 |
| DATA-108 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-430 | Standard Drop-off Rate | Công khai | BR-02 |
| DATA-108 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-431 | Active | Nội bộ | BR-03 |
| DATA-108 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-432 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-109 | Satisfaction Score ID | Mã định danh duy nhất cho Satisfaction Score | Tham chiếu | Bắt buộc | VAL-433 | SAT-8821 | Nội bộ | BR-01 |
| DATA-109 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-434 | Standard Satisfaction Score | Công khai | BR-02 |
| DATA-109 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-435 | Active | Nội bộ | BR-03 |
| DATA-109 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-436 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-110 | Time-to-Hire ID | Mã định danh duy nhất cho Time-to-Hire | Tham chiếu | Bắt buộc | VAL-437 | TIM-8821 | Nội bộ | BR-01 |
| DATA-110 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-438 | Standard Time-to-Hire | Công khai | BR-02 |
| DATA-110 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-439 | Active | Nội bộ | BR-03 |
| DATA-110 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-440 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-111 | Cost-per-Hire ID | Mã định danh duy nhất cho Cost-per-Hire | Tham chiếu | Bắt buộc | VAL-441 | COS-8821 | Nội bộ | BR-01 |
| DATA-111 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-442 | Standard Cost-per-Hire | Công khai | BR-02 |
| DATA-111 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-443 | Active | Nội bộ | BR-03 |
| DATA-111 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-444 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-112 | System Configuration ID | Mã định danh duy nhất cho System Configuration | Tham chiếu | Bắt buộc | VAL-445 | SYS-8821 | Nội bộ | BR-01 |
| DATA-112 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-446 | Standard System Configuration | Công khai | BR-02 |
| DATA-112 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-447 | Active | Nội bộ | BR-03 |
| DATA-112 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-448 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-113 | Localization Setting ID | Mã định danh duy nhất cho Localization Setting | Tham chiếu | Bắt buộc | VAL-449 | LOC-8821 | Nội bộ | BR-01 |
| DATA-113 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-450 | Standard Localization Setting | Công khai | BR-02 |
| DATA-113 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-451 | Active | Nội bộ | BR-03 |
| DATA-113 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-452 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-114 | API Key ID | Mã định danh duy nhất cho API Key | Tham chiếu | Bắt buộc | VAL-453 | API-8821 | Nội bộ | BR-01 |
| DATA-114 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-454 | Standard API Key | Công khai | BR-02 |
| DATA-114 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-455 | Active | Nội bộ | BR-03 |
| DATA-114 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-456 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-115 | Webhook ID | Mã định danh duy nhất cho Webhook | Tham chiếu | Bắt buộc | VAL-457 | WEB-8821 | Nội bộ | BR-01 |
| DATA-115 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-458 | Standard Webhook | Công khai | BR-02 |
| DATA-115 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-459 | Active | Nội bộ | BR-03 |
| DATA-115 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-460 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-116 | Integration Profile ID | Mã định danh duy nhất cho Integration Profile | Tham chiếu | Bắt buộc | VAL-461 | INT-8821 | Nội bộ | BR-01 |
| DATA-116 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-462 | Standard Integration Profile | Công khai | BR-02 |
| DATA-116 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-463 | Active | Nội bộ | BR-03 |
| DATA-116 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-464 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-117 | Quy tắc Nghiệp vụ Config ID | Mã định danh duy nhất cho Quy tắc Nghiệp vụ Config | Tham chiếu | Bắt buộc | VAL-465 | BUS-8821 | Nội bộ | BR-01 |
| DATA-117 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-466 | Standard Quy tắc Nghiệp vụ Config | Công khai | BR-02 |
| DATA-117 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-467 | Active | Nội bộ | BR-03 |
| DATA-117 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-468 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-118 | Feature Flag ID | Mã định danh duy nhất cho Feature Flag | Tham chiếu | Bắt buộc | VAL-469 | FEA-8821 | Nội bộ | BR-01 |
| DATA-118 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-470 | Standard Feature Flag | Công khai | BR-02 |
| DATA-118 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-471 | Active | Nội bộ | BR-03 |
| DATA-118 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-472 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |
| DATA-119 | Maintenance Window ID | Mã định danh duy nhất cho Maintenance Window | Tham chiếu | Bắt buộc | VAL-473 | MAI-8821 | Nội bộ | BR-01 |
| DATA-119 | Name / Title | Nhãn mô tả chính | Văn bản | Bắt buộc | VAL-474 | Standard Maintenance Window | Công khai | BR-02 |
| DATA-119 | Status | Trạng thái vòng đời hiện tại | Liệt kê | Bắt buộc | VAL-475 | Active | Nội bộ | BR-03 |
| DATA-119 | Created Date | Dấu thời gian khởi tạo | Ngày giờ | Bắt buộc | VAL-476 | 2026-07-09T10:00:00Z | Nội bộ | BR-04 |


## 11. Data Vòng đời
Các giai đoạn vòng đời tiêu chuẩn cho các đối tượng dữ liệu kinh doanh:
1. **Tạo:** Dữ liệu được thu thập qua người dùng nhập, API hoặc hệ thống tạo.
2. **Xác thực:** System validates against Quy tắc Nghiệp vụs and Kiểu Dữ liệu constraint.
3. **Hoạt động:** Dữ liệu sẵn sàng cho các giao dịch và báo cáo.
4. **Lưu trữ:** Dữ liệu được chuyển sang lưu trữ lạnh sau khoảng thời gian lưu giữ hoạt động.
5. **Xóa/Hủy bỏ:** Dữ liệu bị hủy vĩnh viễn theo Chính sách xóa và tuân thủ GDPR.

## 12. Phân loại Dữ liệu
| Mức độ Phân loại | Mô tả | Ví dụ |
|---|---|---|
| **Công khai** | Dữ liệu có thể truy cập tự do cho công chúng. | Job Postings, Công khai Company Profiles |
| **Nội bộ** | Data restricted to internal employee. | Cấu hình hệ thống, Phân tích tổng hợp |
| **Bảo mật** | Proprietary busines. | Tiêu chí phỏng vấn, Ngân hàng câu hỏi đánh giá |
| **Restricted (Dữ liệu cá nhân (PII))** | Thông tin cá nhân có thể nhận dạng. | Sơ yếu lý lịch ứng viên, Chi tiết liên hệ, Bản ghi phỏng vấn |
| **Tài chính** | Billing and transaction record. | Hóa đơn, Phương thức thanh toán, Số dư tín dụng |

## 13. Yêu cầu Bảo mật Dữ liệu
- **Chủ sở hữuship & Access Control:** Role-Based Access Control (RBAC) enforced across all domain. Strict segregation between Employer data and Ứng viên.
- **Yêu cầu Mã hóa:** AES-256 cho dữ liệu ở trạng thái nghỉ. TLS 1.3 cho dữ liệu đang truyền tải.
- **Che giấu Dữ liệu:** Dữ liệu cá nhân (PII) and Tài chính data must be masked in non-production environments and analytics dashboard.
- **Sao lưu & Phục hồi:** Sao lưu được mã hóa hàng ngày với thời gian lưu giữ 30 ngày và sao chép đa vùng.

## 14. Quản trị Dữ liệu
- **Chủ sở hữu Dữ liệu:** Người quản lý chịu trách nhiệm về độ chính xác của miền dữ liệu (ví dụ: Phó Chủ tịch Nhân sự).
- **Người quản lý Dữ liệu:** Người quản lý hoạt động chịu trách nhiệm về chất lượng dữ liệu hàng ngày.
- **Người trông coi (Custodian):** Đội ngũ CNTT/Nền tảng chịu trách nhiệm về lưu trữ, bảo mật và kiến trúc kỹ thuật.
- **Quản lý Siêu dữ liệu:** Tất cả objects and attributes must be registered in the central Metadata Registry (ISO 11179 compliance).
- **Dòng dõi & Nguồn gốc:** Các hệ thống phải theo dõi nguồn gốc và lịch sử biến đổi của dữ liệu quan trọng (ví dụ: Điểm đánh giá).

## 15. Yêu cầu Chất lượng Dữ liệu
| ID Số liệu | Khía cạnh | Mô tả | Phương pháp Đo lường | Mục tiêu | Tần suất | Chủ sở hữu |
|---|---|---|---|---|---|---|
| DQM-001 | - Tính Đầy đủ | Các trường thiết yếu trong Dữ liệu Danh tính không được rỗng. | Lập hồ sơ tự động | >98% | Hàng ngày | CISO |
| DQM-002 | Độ chính xác | Giá trị trong Dữ liệu Danh tính phản ánh trạng thái thực tế. | Kiểm toán Mẫu | >95% | Hàng tháng | CISO |
| DQM-003 | Tính duy nhất | Không có thực thể cốt lõi trùng lặp trong Dữ liệu Danh tính. | Công cụ Loại bỏ Trùng lặp | 100% | Thời gian thực | CISO |
| DQM-004 | Tính hợp lệ | Dữ liệu Danh tính values conform to defined reference. | Kiểm tra Ràng buộc | 100% | Thời gian thực | CISO |
| DQM-005 | - Tính Đầy đủ | Các trường thiết yếu trong Dữ liệu Ứng viên không được rỗng. | Lập hồ sơ tự động | >98% | Hàng ngày | VP of HR |
| DQM-006 | Độ chính xác | Giá trị trong Dữ liệu Ứng viên phản ánh trạng thái thực tế. | Kiểm toán Mẫu | >95% | Hàng tháng | VP of HR |
| DQM-007 | Tính duy nhất | Không có thực thể cốt lõi trùng lặp trong Dữ liệu Ứng viên. | Công cụ Loại bỏ Trùng lặp | 100% | Thời gian thực | VP of HR |
| DQM-008 | Tính hợp lệ | Dữ liệu Ứng viên values conform to defined reference. | Kiểm tra Ràng buộc | 100% | Thời gian thực | VP of HR |
| DQM-009 | - Tính Đầy đủ | Các trường thiết yếu trong Dữ liệu Nhà tuyển dụng không được rỗng. | Lập hồ sơ tự động | >98% | Hàng ngày | VP of Sales |
| DQM-010 | Độ chính xác | Giá trị trong Dữ liệu Nhà tuyển dụng phản ánh trạng thái thực tế. | Kiểm toán Mẫu | >95% | Hàng tháng | VP of Sales |
| DQM-011 | Tính duy nhất | Không có thực thể cốt lõi trùng lặp trong Dữ liệu Nhà tuyển dụng. | Công cụ Loại bỏ Trùng lặp | 100% | Thời gian thực | VP of Sales |
| DQM-012 | Tính hợp lệ | Dữ liệu Nhà tuyển dụng values conform to defined reference. | Kiểm tra Ràng buộc | 100% | Thời gian thực | VP of Sales |
| DQM-013 | - Tính Đầy đủ | Các trường thiết yếu trong Dữ liệu Tuyển dụng không được rỗng. | Lập hồ sơ tự động | >98% | Hàng ngày | VP of Recruitment |
| DQM-014 | Độ chính xác | Giá trị trong Dữ liệu Tuyển dụng phản ánh trạng thái thực tế. | Kiểm toán Mẫu | >95% | Hàng tháng | VP of Recruitment |
| DQM-015 | Tính duy nhất | Không có thực thể cốt lõi trùng lặp trong Dữ liệu Tuyển dụng. | Công cụ Loại bỏ Trùng lặp | 100% | Thời gian thực | VP of Recruitment |
| DQM-016 | Tính hợp lệ | Dữ liệu Tuyển dụng values conform to defined reference. | Kiểm tra Ràng buộc | 100% | Thời gian thực | VP of Recruitment |
| DQM-017 | - Tính Đầy đủ | Các trường thiết yếu trong Dữ liệu Phỏng vấn không được rỗng. | Lập hồ sơ tự động | >98% | Hàng ngày | VP of Product |
| DQM-018 | Độ chính xác | Giá trị trong Dữ liệu Phỏng vấn phản ánh trạng thái thực tế. | Kiểm toán Mẫu | >95% | Hàng tháng | VP of Product |
| DQM-019 | Tính duy nhất | Không có thực thể cốt lõi trùng lặp trong Dữ liệu Phỏng vấn. | Công cụ Loại bỏ Trùng lặp | 100% | Thời gian thực | VP of Product |
| DQM-020 | Tính hợp lệ | Dữ liệu Phỏng vấn values conform to defined reference. | Kiểm tra Ràng buộc | 100% | Thời gian thực | VP of Product |
| DQM-021 | - Tính Đầy đủ | Các trường thiết yếu trong Dữ liệu Đánh giá không được rỗng. | Lập hồ sơ tự động | >98% | Hàng ngày | VP of Product |
| DQM-022 | Độ chính xác | Giá trị trong Dữ liệu Đánh giá phản ánh trạng thái thực tế. | Kiểm toán Mẫu | >95% | Hàng tháng | VP of Product |
| DQM-023 | Tính duy nhất | Không có thực thể cốt lõi trùng lặp trong Dữ liệu Đánh giá. | Công cụ Loại bỏ Trùng lặp | 100% | Thời gian thực | VP of Product |
| DQM-024 | Tính hợp lệ | Dữ liệu Đánh giá values conform to defined reference. | Kiểm tra Ràng buộc | 100% | Thời gian thực | VP of Product |
| DQM-025 | - Tính Đầy đủ | Các trường thiết yếu trong Dữ liệu Học tập không được rỗng. | Lập hồ sơ tự động | >98% | Hàng ngày | Chief Learning Officer |
| DQM-026 | Độ chính xác | Giá trị trong Dữ liệu Học tập phản ánh trạng thái thực tế. | Kiểm toán Mẫu | >95% | Hàng tháng | Chief Learning Officer |
| DQM-027 | Tính duy nhất | Không có thực thể cốt lõi trùng lặp trong Dữ liệu Học tập. | Công cụ Loại bỏ Trùng lặp | 100% | Thời gian thực | Chief Learning Officer |
| DQM-028 | Tính hợp lệ | Dữ liệu Học tập values conform to defined reference. | Kiểm tra Ràng buộc | 100% | Thời gian thực | Chief Learning Officer |
| DQM-029 | - Tính Đầy đủ | Các trường thiết yếu trong Dữ liệu Thanh toán không được rỗng. | Lập hồ sơ tự động | >98% | Hàng ngày | CFO |
| DQM-030 | Độ chính xác | Giá trị trong Dữ liệu Thanh toán phản ánh trạng thái thực tế. | Kiểm toán Mẫu | >95% | Hàng tháng | CFO |
| DQM-031 | Tính duy nhất | Không có thực thể cốt lõi trùng lặp trong Dữ liệu Thanh toán. | Công cụ Loại bỏ Trùng lặp | 100% | Thời gian thực | CFO |
| DQM-032 | Tính hợp lệ | Dữ liệu Thanh toán values conform to defined reference. | Kiểm tra Ràng buộc | 100% | Thời gian thực | CFO |
| DQM-033 | - Tính Đầy đủ | Các trường thiết yếu trong Dữ liệu Thông báo không được rỗng. | Lập hồ sơ tự động | >98% | Hàng ngày | VP of Product |
| DQM-034 | Độ chính xác | Giá trị trong Dữ liệu Thông báo phản ánh trạng thái thực tế. | Kiểm toán Mẫu | >95% | Hàng tháng | VP of Product |
| DQM-035 | Tính duy nhất | Không có thực thể cốt lõi trùng lặp trong Dữ liệu Thông báo. | Công cụ Loại bỏ Trùng lặp | 100% | Thời gian thực | VP of Product |
| DQM-036 | Tính hợp lệ | Dữ liệu Thông báo values conform to defined reference. | Kiểm tra Ràng buộc | 100% | Thời gian thực | VP of Product |
| DQM-037 | - Tính Đầy đủ | Các trường thiết yếu trong Dữ liệu Kiểm toán không được rỗng. | Lập hồ sơ tự động | >98% | Hàng ngày | Data Protection Officer |
| DQM-038 | Độ chính xác | Giá trị trong Dữ liệu Kiểm toán phản ánh trạng thái thực tế. | Kiểm toán Mẫu | >95% | Hàng tháng | Data Protection Officer |
| DQM-039 | Tính duy nhất | Không có thực thể cốt lõi trùng lặp trong Dữ liệu Kiểm toán. | Công cụ Loại bỏ Trùng lặp | 100% | Thời gian thực | Data Protection Officer |
| DQM-040 | Tính hợp lệ | Dữ liệu Kiểm toán values conform to defined reference. | Kiểm tra Ràng buộc | 100% | Thời gian thực | Data Protection Officer |
| DQM-041 | - Tính Đầy đủ | Các trường thiết yếu trong Dữ liệu Phân tích không được rỗng. | Lập hồ sơ tự động | >98% | Hàng ngày | CDO |
| DQM-042 | Độ chính xác | Giá trị trong Dữ liệu Phân tích phản ánh trạng thái thực tế. | Kiểm toán Mẫu | >95% | Hàng tháng | CDO |
| DQM-043 | Tính duy nhất | Không có thực thể cốt lõi trùng lặp trong Dữ liệu Phân tích. | Công cụ Loại bỏ Trùng lặp | 100% | Thời gian thực | CDO |
| DQM-044 | Tính hợp lệ | Dữ liệu Phân tích values conform to defined reference. | Kiểm tra Ràng buộc | 100% | Thời gian thực | CDO |
| DQM-045 | - Tính Đầy đủ | Các trường thiết yếu trong Dữ liệu Cấu hình Hệ thống không được rỗng. | Lập hồ sơ tự động | >98% | Hàng ngày | CTO |
| DQM-046 | Độ chính xác | Giá trị trong Dữ liệu Cấu hình Hệ thống phản ánh trạng thái thực tế. | Kiểm toán Mẫu | >95% | Hàng tháng | CTO |
| DQM-047 | Tính duy nhất | Không có thực thể cốt lõi trùng lặp trong Dữ liệu Cấu hình Hệ thống. | Công cụ Loại bỏ Trùng lặp | 100% | Thời gian thực | CTO |
| DQM-048 | Tính hợp lệ | Dữ liệu Cấu hình Hệ thống values conform to defined reference. | Kiểm tra Ràng buộc | 100% | Thời gian thực | CTO |


## 16. Data Lưu giữ Policy
| Hạng mục Đối tượng Dữ liệu | Operational Lưu giữ | Chính sách Lưu trữ | Chính sách Xóa/Hủy | Cơ sở Pháp lý |
|---|---|---|---|---|
| Hồ sơ Ứng viên | Active + 2 Năm | Lưu trữ sau 1 năm không hoạt động | Hủy sau 2 năm trừ khi được gia hạn | Điều 6 GDPR (Đồng ý) |
| Bản ghi Phỏng vấn | 6 Tháng | Lưu trữ sau 30 ngày | Hủy sau 6 tháng | Lợi ích Hợp pháp |
| Kết quả Đánh giá | 3 Năm | Lưu trữ sau 1 năm | Hủy sau 3 năm | Lợi ích Hợp pháp |
| Thanh toán / Hóa đơn | 7 Năm | Lưu trữ sau 1 năm | Hủy sau 7 năm | Tuân thủ Thuế / Pháp lý |
| Nhật ký Kiểm toán | 1 Năm | Lưu trữ sau 3 tháng | Hủy sau 1 năm | Tuân thủ Bảo mật |
| Phiếu Hỗ trợ | 3 Năm | Lưu trữ sau 6 tháng | Hủy sau 3 năm | Nghĩa vụ Hợp đồng |

## 17. Dữ liệu Báo cáo
Các bộ dữ liệu tổng hợp được thiết kế đặc biệt cho phân tích và bảng điều khiển:
- **Phân tích Ứng viên:** Skill growth trends, assessment pass rate.
- **Phân tích Nhà tuyển dụng:** Time-to-hire, cost-per-hire, campaign ROI, interview conversion rate.
- **Bảng điều khiển Hoạt động:** Thời gian hoạt động của hệ thống, người dùng đồng thời, mức sử dụng API.
- **Báo cáo Tuân thủ:** Dữ liệu cá nhân (PII) deletion receipts, consent logs, access audit.

## 18. Ma trận Truy xuất Nguồn gốc Dữ liệu
| ID Yêu cầu | Quy trình Kinh doanh | Đối tượng Dữ liệu Logic | Yêu cầu Chức năng | Quy tắc Nghiệp vụ | Báo cáo | Vai trò Người dùng |
|---|---|---|---|---|---|---|
| BR-001 | Đăng ký Ứng viên | Hồ sơ Ứng viên | FR-USR-01 | VAL-002 (Email Duy nhất) | Tăng trưởng Người dùng | Ứng viên |
| BR-002 | Thiết lập Chiến dịch Công việc | Chiến dịch, Tin đăng tuyển | FR-EMP-04 | VAL-012 (Ngân sách Hợp lệ) | ROI Chiến dịch | Nhà tuyển dụng |
| BR-003 | Phỏng vấn Video AI | Phỏng vấn, Ghi hình | FR-INT-02 | VAL-045 (Định dạng Hợp lệ) | Phễu Phỏng vấn | System, Nhà tuyển dụng |
| BR-004 | Đánh giá Kỹ thuật | Đánh giá, Điểm số | FR-ASM-01 | VAL-056 (Giới hạn Điểm số) | Skill Gap | Ứng viên, Manager |
| BR-005 | Tạo Hóa đơn | Hóa đơn, Giao dịch | FR-FIN-03 | VAL-088 (Số tiền Hợp lệ) | Hàng tháng Revenue | Quản trị viên Tài chính |

## 19. Rủi ro Dữ liệu
| ID Rủi ro | Rủi ro | Tác động | Khả năng | Giảm nhẹ |
|---|---|---|---|---|
| RISK-D-01 | Mất Dữ liệu trong quá trình di chuyển/xử lý | Cao | Thấp | Sao lưu hàng ngày tự động, phục hồi theo thời gian điểm. |
| RISK-D-02 | Privacy Breach (Dữ liệu cá nhân (PII) exposure) | Đặc biệt quan trọng | Thấp | Mã hóa lúc nghỉ/đang truyền, RBAC nghiêm ngặt, che giấu dữ liệu. |
| RISK-D-03 | Inconsistent Dữ liệu Chủ | Trung bình | Trung bình | Implement Dữ liệu Chủ Management (MDM) and strict validation. |
| RISK-D-04 | Lưu giữ Policy Violations | Cao | Thấp | Automated purge jobs linked to metadata retention tag. |
| RISK-D-05 | Poor Dữ liệu Ứng viên Quality | Trung bình | Cao | Thực thi các trường bắt buộc, xác thực regex, xác minh email. |
| RISK-D-06 | Thao tác Dữ liệu Sai lệch AI Trái phép | Cao | Thấp | Immutable audit logs on all AI rubric update. |

## 20. Mở rộng Dữ liệu Tương lai
Kiến trúc dữ liệu được thiết kế để hỗ trợ các khả năng trong tương lai sau:
- **Hỗ trợ Đa khách thuê (Multi-Tenant):** Seamless physical data isolation for enterprise clients with strict compliance need.
- **Tích hợp Kho Dữ liệu (Data Lake):** Xuất dữ liệu phi cấu trúc (video, đoạn mã) vào Kho Dữ liệu để đào tạo mô hình ML dài hạn.
- **Tích hợp ATS Bên ngoài:** Standardized HR-XML and JSON schemas to push/pull Dữ liệu Ứng viên to Workday, Greenhouse, etc.
- **Phân tích Dự đoán:** Giới thiệu các bộ dữ liệu thống kê đa biến số cho mô hình dự đoán thành công của ứng viên.

## 21. Tóm tắt
Bản Đặc tả Yêu cầu Dữ liệu này thiết lập một khuôn khổ logic, nghiêm ngặt cho Hệ thống Phỏng vấn & Đánh giá Kỹ năng tích hợp AI. Bằng cách định nghĩa chính xác 120 thực thể nghiệp vụ logic trong 12 miền, cùng với các quy tắc xác thực nghiêm ngặt, số liệu chất lượng dữ liệu và chính sách quản trị, kiến trúc này đảm bảo tính toàn vẹn dữ liệu cao, tuân thủ GDPR nghiêm ngặt và khả năng mở rộng hoạt động cho sử dụng ở cấp độ doanh nghiệp.