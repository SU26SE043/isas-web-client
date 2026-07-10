# 06 Đặc tả Yêu cầu Chức năng (FRS)

## 1. Mục đích Tài liệu
### Mục đích
Tài liệu này xác định các yêu cầu chức năng cho Hệ thống Phỏng vấn & Đánh giá Kỹ năng tích hợp AI (ISAS). Nó quy định hành vi của hệ thống, tương tác của người dùng, quy tắc nghiệp vụ và các ràng buộc mà không đi sâu vào định nghĩa triển khai kỹ thuật nền tảng.

### Phạm vi
Phạm vi bao gồm xác thực, lập hồ sơ ứng viên, phân tích CV, thực hiện phỏng vấn, đánh giá bằng AI, tạo lộ trình học tập, lập hóa đơn và quản trị hệ thống.

### Đối tượng
Chủ sở hữu Sản phẩm (Product Owners), Chuyên viên Phân tích Nghiệp vụ (Business Analysts), Kiến trúc sư Giải pháp (Solution Architects), Nhóm Phát triển, Nhóm Đảm bảo Chất lượng (QA) và Các bên liên quan (Business Stakeholders).

### Mối quan hệ với BRD
FRS này chuyển đổi các mục tiêu kinh doanh cấp cao từ Tài liệu Yêu cầu Nghiệp vụ (BRD) thành các hành vi hệ thống chi tiết. Mỗi Yêu cầu Chức năng (FR) đều có thể truy xuất nguồn gốc từ một Yêu cầu Nghiệp vụ (BR).

### Mối quan hệ với Quy trình Nghiệp vụ
Các yêu cầu chức năng hỗ trợ các mô hình hoạt động mục tiêu được xác định trong các mô hình Quy trình Nghiệp vụ, đảm bảo phần mềm kích hoạt các luồng công việc tuyển dụng được tối ưu hóa.

## 2. Tổng quan Chức năng
Nền tảng ISAS là một hệ thống doanh nghiệp đa khách hàng (multi-tenant) được thiết kế để tự động hóa việc sàng lọc ứng viên, tiến hành các cuộc phỏng vấn dựa trên AI và cung cấp các đánh giá kỹ năng có thể hành động. Các chức năng được phân chia thành các lĩnh vực nghiệp vụ sau:
- **Xác thực & Bảo mật**: Quản lý danh tính, kiểm soát truy cập và quản trị phiên.
- **Quản lý Ứng viên**: Tạo hồ sơ, quản lý tài liệu và theo dõi sự nghiệp.
- **Quản lý Nhà tuyển dụng**: Cung cấp tài khoản khách thuê (tenant), truy cập của nhà tuyển dụng và thiết lập chiến dịch.
- **Hệ thống Phỏng vấn**: Cung cấp câu hỏi, xác minh danh tính, ghi âm/ghi hình đa phương tiện và cơ chế chống gian lận.
- **Đánh giá AI**: Chuyển đổi giọng nói thành văn bản, xử lý ngôn ngữ tự nhiên, phân tích ngữ nghĩa và chấm điểm tự động.
- **Trung tâm Học tập**: Phân tích khoảng trống kỹ năng và tạo lộ trình cá nhân hóa.
- **Thanh toán & Lập hóa đơn**: Quản lý gói đăng ký, tiêu thụ tín dụng và xuất hóa đơn.
- **Phân tích & Báo cáo**: Bảng điều khiển số liệu, báo cáo đánh giá và theo dõi việc sử dụng hệ thống.
- **Quản trị**: Cấu hình hệ thống, nhật ký kiểm toán và quản lý tuân thủ.
- **Thông báo**: Cảnh báo đa kênh và giao tiếp.

## 3. Các Mô-đun Chức năng
| Mã Mô-đun | Tên Mô-đun | Mô tả | Mục tiêu Nghiệp vụ | Tác nhân Chính | Phụ thuộc | Ưu tiên |
|---|---|---|---|---|---|---|
| M01 | Xác thực | Quản lý danh tính và truy cập người dùng. | Truy cập hệ thống an toàn. | Tất cả người dùng | Không có | Cao |
| M02 | Hồ sơ Ứng viên | Quản lý chi tiết ứng viên. | Tập trung hóa dữ liệu ứng viên. | Ứng viên | M01 | Cao |
| M03 | Quản lý CV | Tải lên và phân tích sơ yếu lý lịch. | Tự động hóa nhập liệu. | Ứng viên | M02 | Cao |
| M04 | Chiến dịch | Chiến dịch tuyển dụng và đánh giá. | Cấu trúc phễu tuyển dụng. | Nhà tuyển dụng | M01 | Cao |
| M05 | Công cụ Phỏng vấn | Thực hiện phỏng vấn tự động. | Tiêu chuẩn hóa sàng lọc. | Ứng viên, Nhà tuyển dụng | M04 | Cực kỳ quan trọng |
| M06 | Đánh giá AI | Tự động chấm điểm phỏng vấn. | Đánh giá không thiên vị. | Hệ thống | M05 | Cực kỳ quan trọng |
| M07 | Trung tâm Học tập | Tạo lộ trình đào tạo. | Nâng cao kỹ năng ứng viên. | Ứng viên | M06 | Trung bình |
| M08 | Thanh toán | Xử lý thanh toán và tín dụng. | Kiếm tiền từ nền tảng. | Nhà tuyển dụng, Quản trị viên | M01 | Cao |
| M09 | Báo cáo | Tạo tài liệu phân tích. | Cung cấp thông tin chi tiết. | Nhà tuyển dụng, Quản trị viên | M06 | Cao |
| M10 | Thông báo | Cảnh báo và email hệ thống. | Tương tác người dùng. | Hệ thống | Tất cả | Trung bình |
| M11 | Cổng Quản trị | Cấu hình toàn hệ thống. | Duy trì sức khỏe hệ thống. | Quản trị viên | M01 | Cao |
| M12 | Kiểm toán | Nhật ký hệ thống và tuân thủ. | Đảm bảo tính truy xuất. | Hệ thống, Quản trị viên | Tất cả | Trung bình |

## 4. Yêu cầu Chức năng Chi tiết
Phần này xác định các hành vi chức năng mở rộng của hệ thống. Các yêu cầu được trình bày chi tiết dưới đây đại diện cho logic thực thi cốt lõi.

### FR-001 Đăng ký Ứng viên
**Mã yêu cầu:** FR-001
**Tên yêu cầu:** Đăng ký Ứng viên
**Mô tả:** Đăng ký ứng viên mới
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Xác thực bằng cách hỗ trợ đăng ký ứng viên.
**Tác nhân:** Ứng viên
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Xác thực.
**Kích hoạt:** Ứng viên gửi biểu mẫu đăng ký
**Luồng bình thường:**
1. Ứng viên truy cập tính năng Đăng ký Ứng viên.
2. Ứng viên cung cấp Email, Mật khẩu, Tên.
3. Hệ thống xác thực dữ liệu đầu vào.
4. Hệ thống tạo bản ghi.
5. Hệ thống trả về Tài khoản người dùng, Email xác minh.
**Luồng thay thế:** Ứng viên hủy bỏ quy trình trước khi gửi. Hệ thống loại bỏ dữ liệu.
**Luồng ngoại lệ:** Xác thực không thành công. Hệ thống làm nổi bật lỗi và chặn việc tạo tài khoản.
**Đầu vào:** Email, Mật khẩu, Tên
**Đầu ra:** Tài khoản người dùng, Email xác minh
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Xác thực.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Xác thực.
**Tiêu chí chấp nhận:** Ứng viên có thể thực hiện Đăng ký Ứng viên thành công. Đầu vào (Email, Mật khẩu, Tên) ánh xạ chính xác tới Đầu ra (Tài khoản người dùng, Email xác minh).
**Quy trình Nghiệp vụ liên quan:** BP-AUT-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-002
**Vai trò Người dùng liên quan:** Ứng viên
**Yêu cầu Phi chức năng liên quan:** NFR-AUT-01

---
### FR-002 Đăng nhập SSO
**Mã yêu cầu:** FR-002
**Tên yêu cầu:** Đăng nhập SSO
**Mô tả:** Đăng nhập một lần (Single Sign-On) cho Doanh nghiệp
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Xác thực bằng cách hỗ trợ đăng nhập SSO.
**Tác nhân:** Nhà tuyển dụng
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Xác thực.
**Kích hoạt:** Nhà tuyển dụng nhấp vào đăng nhập SSO
**Luồng bình thường:**
1. Kích hoạt: Nhà tuyển dụng nhấp vào đăng nhập SSO.
2. Hệ thống khởi tạo quy trình Đăng nhập SSO.
3. Hệ thống xử lý Mã thông báo (Token) SAML/OIDC.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Mã thông báo Phiên (Session Token).
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Mã thông báo SAML/OIDC
**Đầu ra:** Mã thông báo Phiên
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Xác thực.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Xác thực.
**Tiêu chí chấp nhận:** Nhà tuyển dụng có thể thực hiện Đăng nhập SSO thành công. Đầu vào (Mã thông báo SAML/OIDC) ánh xạ chính xác tới Đầu ra (Mã thông báo Phiên).
**Quy trình Nghiệp vụ liên quan:** BP-AUT-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-003
**Vai trò Người dùng liên quan:** Nhà tuyển dụng
**Yêu cầu Phi chức năng liên quan:** NFR-AUT-01

---
### FR-003 Xác minh MFA
**Mã yêu cầu:** FR-003
**Tên yêu cầu:** Xác minh MFA
**Mô tả:** Thử thách xác thực đa yếu tố
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Xác thực bằng cách hỗ trợ xác minh MFA.
**Tác nhân:** Tất cả người dùng
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Xác thực.
**Kích hoạt:** Người dùng nhập thông tin đăng nhập
**Luồng bình thường:**
1. Kích hoạt: Người dùng nhập thông tin đăng nhập.
2. Hệ thống khởi tạo quy trình Xác minh MFA.
3. Hệ thống xử lý Mã OTP.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Phiên được xác thực (Authenticated Session).
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Mã OTP
**Đầu ra:** Phiên được xác thực
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Xác thực.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Xác thực.
**Tiêu chí chấp nhận:** Tất cả người dùng có thể thực hiện Xác minh MFA thành công. Đầu vào (Mã OTP) ánh xạ chính xác tới Đầu ra (Phiên được xác thực).
**Quy trình Nghiệp vụ liên quan:** BP-AUT-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-004
**Vai trò Người dùng liên quan:** Tất cả người dùng
**Yêu cầu Phi chức năng liên quan:** NFR-AUT-01

---
### FR-004 Tải lên Tệp CV
**Mã yêu cầu:** FR-004
**Tên yêu cầu:** Tải lên Tệp CV
**Mô tả:** Tải lên tài liệu sơ yếu lý lịch
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Quản lý CV bằng cách hỗ trợ tải lên tệp CV.
**Tác nhân:** Ứng viên
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Quản lý CV.
**Kích hoạt:** Ứng viên chọn tệp
**Luồng bình thường:**
1. Ứng viên truy cập tính năng Tải lên Tệp CV.
2. Ứng viên cung cấp Tệp PDF/DOCX.
3. Hệ thống xác thực dữ liệu đầu vào.
4. Hệ thống tạo bản ghi.
5. Hệ thống trả về Tham chiếu tệp (File Reference), URI Lưu trữ.
**Luồng thay thế:** Ứng viên hủy bỏ quy trình trước khi gửi. Hệ thống loại bỏ dữ liệu.
**Luồng ngoại lệ:** Xác thực không thành công. Hệ thống làm nổi bật lỗi và chặn việc tạo.
**Đầu vào:** Tệp PDF/DOCX
**Đầu ra:** Tham chiếu tệp, URI Lưu trữ
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Quản lý CV.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Quản lý CV.
**Tiêu chí chấp nhận:** Ứng viên có thể thực hiện Tải lên Tệp CV thành công. Đầu vào (Tệp PDF/DOCX) ánh xạ chính xác tới Đầu ra (Tham chiếu tệp, URI Lưu trữ).
**Quy trình Nghiệp vụ liên quan:** BP-CV -01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-005
**Vai trò Người dùng liên quan:** Ứng viên
**Yêu cầu Phi chức năng liên quan:** NFR-CV -01

---
### FR-005 Công cụ Phân tích CV
**Mã yêu cầu:** FR-005
**Tên yêu cầu:** Công cụ Phân tích CV
**Mô tả:** Trích xuất văn bản từ CV
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Quản lý CV bằng cách hỗ trợ công cụ phân tích CV.
**Tác nhân:** Hệ thống
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Quản lý CV.
**Kích hoạt:** Quá trình tải lên tệp hoàn tất
**Luồng bình thường:**
1. Kích hoạt: Quá trình tải lên tệp hoàn tất.
2. Hệ thống khởi tạo quy trình Công cụ Phân tích CV.
3. Hệ thống xử lý URI Tệp.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Dữ liệu JSON đã được phân tích.
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** URI Tệp
**Đầu ra:** Dữ liệu JSON đã được phân tích
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Quản lý CV.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Quản lý CV.
**Tiêu chí chấp nhận:** Hệ thống có thể thực hiện Công cụ Phân tích CV thành công. Đầu vào (URI Tệp) ánh xạ chính xác tới Đầu ra (Dữ liệu JSON đã được phân tích).
**Quy trình Nghiệp vụ liên quan:** BP-CV -01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-006
**Vai trò Người dùng liên quan:** Hệ thống
**Yêu cầu Phi chức năng liên quan:** NFR-CV -01

---
### FR-006 Tự động Ánh xạ Hồ sơ
**Mã yêu cầu:** FR-006
**Tên yêu cầu:** Tự động Ánh xạ Hồ sơ
**Mô tả:** Ánh xạ dữ liệu CV vào hồ sơ
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Quản lý CV bằng cách hỗ trợ tự động ánh xạ hồ sơ.
**Tác nhân:** Hệ thống
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Quản lý CV.
**Kích hoạt:** Quá trình phân tích CV hoàn tất
**Luồng bình thường:**
1. Kích hoạt: Quá trình phân tích CV hoàn tất.
2. Hệ thống khởi tạo quy trình Tự động Ánh xạ Hồ sơ.
3. Hệ thống xử lý JSON đã được phân tích.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Hồ sơ Ứng viên đã được điền thông tin.
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** JSON đã được phân tích
**Đầu ra:** Hồ sơ Ứng viên đã được điền thông tin
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Quản lý CV.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Quản lý CV.
**Tiêu chí chấp nhận:** Hệ thống có thể thực hiện Tự động Ánh xạ Hồ sơ thành công. Đầu vào (JSON đã được phân tích) ánh xạ chính xác tới Đầu ra (Hồ sơ Ứng viên đã được điền thông tin).
**Quy trình Nghiệp vụ liên quan:** BP-CV -01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-007
**Vai trò Người dùng liên quan:** Hệ thống
**Yêu cầu Phi chức năng liên quan:** NFR-CV -01

---
### FR-007 Tạo Mẫu Phỏng vấn
**Mã yêu cầu:** FR-007
**Tên yêu cầu:** Tạo Mẫu Phỏng vấn
**Mô tả:** Xác định cấu trúc phỏng vấn
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Công cụ Phỏng vấn bằng cách hỗ trợ tạo mẫu phỏng vấn.
**Tác nhân:** Nhà tuyển dụng
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Công cụ Phỏng vấn.
**Kích hoạt:** Nhà tuyển dụng lưu mẫu
**Luồng bình thường:**
1. Nhà tuyển dụng truy cập tính năng Tạo Mẫu Phỏng vấn.
2. Nhà tuyển dụng cung cấp Các câu hỏi, Giới hạn thời gian, Định dạng (Persona) AI.
3. Hệ thống xác thực dữ liệu đầu vào.
4. Hệ thống tạo bản ghi.
5. Hệ thống trả về Bản ghi Mẫu Phỏng vấn.
**Luồng thay thế:** Nhà tuyển dụng hủy bỏ quy trình trước khi gửi. Hệ thống loại bỏ dữ liệu.
**Luồng ngoại lệ:** Xác thực không thành công. Hệ thống làm nổi bật lỗi và chặn việc tạo.
**Đầu vào:** Các câu hỏi, Giới hạn thời gian, Định dạng AI
**Đầu ra:** Bản ghi Mẫu Phỏng vấn
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Công cụ Phỏng vấn.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Công cụ Phỏng vấn.
**Tiêu chí chấp nhận:** Nhà tuyển dụng có thể thực hiện Tạo Mẫu Phỏng vấn thành công. Đầu vào (Các câu hỏi, Giới hạn thời gian, Định dạng AI) ánh xạ chính xác tới Đầu ra (Bản ghi Mẫu Phỏng vấn).
**Quy trình Nghiệp vụ liên quan:** BP-INT-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-008
**Vai trò Người dùng liên quan:** Nhà tuyển dụng
**Yêu cầu Phi chức năng liên quan:** NFR-INT-01

---
### FR-008 Lời mời Ứng viên
**Mã yêu cầu:** FR-008
**Tên yêu cầu:** Lời mời Ứng viên
**Mô tả:** Gửi liên kết phỏng vấn
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Công cụ Phỏng vấn bằng cách hỗ trợ lời mời ứng viên.
**Tác nhân:** Nhà tuyển dụng
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Công cụ Phỏng vấn.
**Kích hoạt:** Nhà tuyển dụng thêm ứng viên vào chiến dịch
**Luồng bình thường:**
1. Kích hoạt: Nhà tuyển dụng thêm ứng viên vào chiến dịch.
2. Hệ thống khởi tạo quy trình Lời mời Ứng viên.
3. Hệ thống xử lý Danh sách Ứng viên, ID Mẫu.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Các URL Phỏng vấn duy nhất, Các công văn Email.
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Danh sách Ứng viên, ID Mẫu
**Đầu ra:** Các URL Phỏng vấn duy nhất, Các công văn Email
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Công cụ Phỏng vấn.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Công cụ Phỏng vấn.
**Tiêu chí chấp nhận:** Nhà tuyển dụng có thể thực hiện Lời mời Ứng viên thành công. Đầu vào (Danh sách Ứng viên, ID Mẫu) ánh xạ chính xác tới Đầu ra (Các URL Phỏng vấn duy nhất, Các công văn Email).
**Quy trình Nghiệp vụ liên quan:** BP-INT-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-009
**Vai trò Người dùng liên quan:** Nhà tuyển dụng
**Yêu cầu Phi chức năng liên quan:** NFR-INT-01

---
### FR-009 Kiểm tra Sẵn sàng của Hệ thống
**Mã yêu cầu:** FR-009
**Tên yêu cầu:** Kiểm tra Sẵn sàng của Hệ thống
**Mô tả:** Xác minh phần cứng và mạng
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Công cụ Phỏng vấn bằng cách hỗ trợ kiểm tra sẵn sàng của hệ thống.
**Tác nhân:** Ứng viên
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Công cụ Phỏng vấn.
**Kích hoạt:** Ứng viên nhấp vào bắt đầu phỏng vấn
**Luồng bình thường:**
1. Kích hoạt: Ứng viên nhấp vào bắt đầu phỏng vấn.
2. Hệ thống khởi tạo quy trình Kiểm tra Sẵn sàng của Hệ thống.
3. Hệ thống xử lý Trình duyệt API, Kiểm tra Băng thông.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Trạng thái Sẵn sàng (Đạt/Không đạt).
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Trình duyệt API, Kiểm tra Băng thông
**Đầu ra:** Trạng thái Sẵn sàng (Đạt/Không đạt)
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Công cụ Phỏng vấn.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Công cụ Phỏng vấn.
**Tiêu chí chấp nhận:** Ứng viên có thể thực hiện Kiểm tra Sẵn sàng của Hệ thống thành công. Đầu vào (Trình duyệt API, Kiểm tra Băng thông) ánh xạ chính xác tới Đầu ra (Trạng thái Sẵn sàng (Đạt/Không đạt)).
**Quy trình Nghiệp vụ liên quan:** BP-INT-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-010
**Vai trò Người dùng liên quan:** Ứng viên
**Yêu cầu Phi chức năng liên quan:** NFR-INT-01

---
### FR-010 Xác minh Danh tính
**Mã yêu cầu:** FR-010
**Tên yêu cầu:** Xác minh Danh tính
**Mô tả:** Khớp ứng viên với hồ sơ
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Công cụ Phỏng vấn bằng cách hỗ trợ xác minh danh tính.
**Tác nhân:** Ứng viên
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Công cụ Phỏng vấn.
**Kích hoạt:** Kiểm tra sẵn sàng đạt
**Luồng bình thường:**
1. Kích hoạt: Kiểm tra sẵn sàng đạt.
2. Hệ thống khởi tạo quy trình Xác minh Danh tính.
3. Hệ thống xử lý Ảnh chụp Webcam, Tài liệu ID.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Điểm tin cậy Xác minh.
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Ảnh chụp Webcam, Tài liệu ID
**Đầu ra:** Điểm tin cậy Xác minh
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Công cụ Phỏng vấn.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Công cụ Phỏng vấn.
**Tiêu chí chấp nhận:** Ứng viên có thể thực hiện Xác minh Danh tính thành công. Đầu vào (Ảnh chụp Webcam, Tài liệu ID) ánh xạ chính xác tới Đầu ra (Điểm tin cậy Xác minh).
**Quy trình Nghiệp vụ liên quan:** BP-INT-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-011
**Vai trò Người dùng liên quan:** Ứng viên
**Yêu cầu Phi chức năng liên quan:** NFR-INT-01

---
### FR-011 Cung cấp Câu hỏi
**Mã yêu cầu:** FR-011
**Tên yêu cầu:** Cung cấp Câu hỏi
**Mô tả:** Trình bày các câu hỏi do AI tạo/chọn
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Công cụ Phỏng vấn bằng cách hỗ trợ cung cấp câu hỏi.
**Tác nhân:** Hệ thống
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Công cụ Phỏng vấn.
**Kích hoạt:** Bắt đầu phỏng vấn / đã trả lời câu hỏi trước đó
**Luồng bình thường:**
1. Kích hoạt: Bắt đầu phỏng vấn / đã trả lời câu hỏi trước đó.
2. Hệ thống khởi tạo quy trình Cung cấp Câu hỏi.
3. Hệ thống xử lý Mẫu, Bối cảnh Ứng viên.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Câu hỏi bằng Văn bản/Âm thanh.
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Mẫu, Bối cảnh Ứng viên
**Đầu ra:** Lời nhắc Câu hỏi Văn bản/Âm thanh
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Công cụ Phỏng vấn.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Công cụ Phỏng vấn.
**Tiêu chí chấp nhận:** Hệ thống có thể thực hiện Cung cấp Câu hỏi thành công. Đầu vào (Mẫu, Bối cảnh Ứng viên) ánh xạ chính xác tới Đầu ra (Lời nhắc Câu hỏi Văn bản/Âm thanh).
**Quy trình Nghiệp vụ liên quan:** BP-INT-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-012
**Vai trò Người dùng liên quan:** Hệ thống
**Yêu cầu Phi chức năng liên quan:** NFR-INT-01

---
### FR-012 Ghi âm/Ghi hình
**Mã yêu cầu:** FR-012
**Tên yêu cầu:** Ghi âm/Ghi hình
**Mô tả:** Ghi lại phản hồi của ứng viên
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Công cụ Phỏng vấn bằng cách hỗ trợ ghi âm/ghi hình.
**Tác nhân:** Hệ thống
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Công cụ Phỏng vấn.
**Kích hoạt:** Ứng viên nhấp vào ghi
**Luồng bình thường:**
1. Kích hoạt: Ứng viên nhấp vào ghi.
2. Hệ thống khởi tạo quy trình Ghi âm/Ghi hình.
3. Hệ thống xử lý Luồng Mic/Cam.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Phân đoạn Phương tiện được Mã hóa.
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Luồng Mic/Cam
**Đầu ra:** Phân đoạn Phương tiện được Mã hóa
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Công cụ Phỏng vấn.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Công cụ Phỏng vấn.
**Tiêu chí chấp nhận:** Hệ thống có thể thực hiện Ghi âm/Ghi hình thành công. Đầu vào (Luồng Mic/Cam) ánh xạ chính xác tới Đầu ra (Phân đoạn Phương tiện được Mã hóa).
**Quy trình Nghiệp vụ liên quan:** BP-INT-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-013
**Vai trò Người dùng liên quan:** Hệ thống
**Yêu cầu Phi chức năng liên quan:** NFR-INT-01

---
### FR-013 Chống Gian lận theo Thời gian thực
**Mã yêu cầu:** FR-013
**Tên yêu cầu:** Chống Gian lận theo Thời gian thực
**Mô tả:** Giám sát hoạt động đáng ngờ
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Công cụ Phỏng vấn bằng cách hỗ trợ chống gian lận theo thời gian thực.
**Tác nhân:** Hệ thống
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Công cụ Phỏng vấn.
**Kích hoạt:** Chức năng ghi đang hoạt động
**Luồng bình thường:**
1. Kích hoạt: Chức năng ghi đang hoạt động.
2. Hệ thống khởi tạo quy trình Chống Gian lận theo Thời gian thực.
3. Hệ thống xử lý Nguồn cấp Video, Nguồn cấp Âm thanh, Tiêu điểm màn hình.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Các sự kiện cảnh báo (Nhiều khuôn mặt, mất tiêu điểm).
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Nguồn cấp Video, Nguồn cấp Âm thanh, Tiêu điểm màn hình
**Đầu ra:** Các sự kiện cảnh báo (Nhiều khuôn mặt, mất tiêu điểm)
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Công cụ Phỏng vấn.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Công cụ Phỏng vấn.
**Tiêu chí chấp nhận:** Hệ thống có thể thực hiện Chống Gian lận theo Thời gian thực thành công. Đầu vào (Nguồn cấp Video, Nguồn cấp Âm thanh, Tiêu điểm màn hình) ánh xạ chính xác tới Đầu ra (Các sự kiện cảnh báo (Nhiều khuôn mặt, mất tiêu điểm)).
**Quy trình Nghiệp vụ liên quan:** BP-INT-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-014
**Vai trò Người dùng liên quan:** Hệ thống
**Yêu cầu Phi chức năng liên quan:** NFR-INT-01

---
### FR-014 Chuyển đổi Giọng nói thành Văn bản
**Mã yêu cầu:** FR-014
**Tên yêu cầu:** Chuyển đổi Giọng nói thành Văn bản
**Mô tả:** Phiên âm âm thanh thành văn bản
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Đánh giá AI bằng cách hỗ trợ chuyển đổi giọng nói thành văn bản.
**Tác nhân:** Hệ thống
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Đánh giá AI.
**Kích hoạt:** Đã tải lên phân đoạn phương tiện
**Luồng bình thường:**
1. Kích hoạt: Đã tải lên phân đoạn phương tiện.
2. Hệ thống khởi tạo quy trình Chuyển đổi Giọng nói thành Văn bản.
3. Hệ thống xử lý Tệp âm thanh.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Văn bản phiên âm, Dấu thời gian.
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Tệp âm thanh
**Đầu ra:** Văn bản phiên âm, Dấu thời gian
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Đánh giá AI.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Đánh giá AI.
**Tiêu chí chấp nhận:** Hệ thống có thể thực hiện Chuyển đổi Giọng nói thành Văn bản thành công. Đầu vào (Tệp âm thanh) ánh xạ chính xác tới Đầu ra (Văn bản phiên âm, Dấu thời gian).
**Quy trình Nghiệp vụ liên quan:** BP-AI -01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-015
**Vai trò Người dùng liên quan:** Hệ thống
**Yêu cầu Phi chức năng liên quan:** NFR-AI -01

---
### FR-015 Phân tích Ngữ nghĩa
**Mã yêu cầu:** FR-015
**Tên yêu cầu:** Phân tích Ngữ nghĩa
**Mô tả:** Đánh giá nội dung câu trả lời
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Đánh giá AI bằng cách hỗ trợ phân tích ngữ nghĩa.
**Tác nhân:** Hệ thống
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Đánh giá AI.
**Kích hoạt:** Quá trình phiên âm hoàn tất
**Luồng bình thường:**
1. Kích hoạt: Quá trình phiên âm hoàn tất.
2. Hệ thống khởi tạo quy trình Phân tích Ngữ nghĩa.
3. Hệ thống xử lý Văn bản phiên âm, Tiêu chí câu trả lời mong đợi.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Điểm khớp Ngữ nghĩa.
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Văn bản phiên âm, Tiêu chí câu trả lời mong đợi
**Đầu ra:** Điểm khớp Ngữ nghĩa
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Đánh giá AI.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Đánh giá AI.
**Tiêu chí chấp nhận:** Hệ thống có thể thực hiện Phân tích Ngữ nghĩa thành công. Đầu vào (Văn bản phiên âm, Tiêu chí câu trả lời mong đợi) ánh xạ chính xác tới Đầu ra (Điểm khớp Ngữ nghĩa).
**Quy trình Nghiệp vụ liên quan:** BP-AI -01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-016
**Vai trò Người dùng liên quan:** Hệ thống
**Yêu cầu Phi chức năng liên quan:** NFR-AI -01

---
### FR-016 Phân tích Giọng điệu và Cảm xúc
**Mã yêu cầu:** FR-016
**Tên yêu cầu:** Phân tích Giọng điệu và Cảm xúc
**Mô tả:** Đánh giá phong cách trình bày
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Đánh giá AI bằng cách hỗ trợ phân tích giọng điệu và cảm xúc.
**Tác nhân:** Hệ thống
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Đánh giá AI.
**Kích hoạt:** Quá trình ghi âm hoàn tất
**Luồng bình thường:**
1. Kích hoạt: Quá trình ghi âm hoàn tất.
2. Hệ thống khởi tạo quy trình Phân tích Giọng điệu và Cảm xúc.
3. Hệ thống xử lý Tệp âm thanh, Bản phiên âm.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Điểm Kỹ năng Mềm (Giọng điệu, Sự tự tin).
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Tệp âm thanh, Bản phiên âm
**Đầu ra:** Điểm Kỹ năng Mềm (Giọng điệu, Sự tự tin)
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Đánh giá AI.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Đánh giá AI.
**Tiêu chí chấp nhận:** Hệ thống có thể thực hiện Phân tích Giọng điệu và Cảm xúc thành công. Đầu vào (Tệp âm thanh, Bản phiên âm) ánh xạ chính xác tới Đầu ra (Điểm Kỹ năng Mềm (Giọng điệu, Sự tự tin)).
**Quy trình Nghiệp vụ liên quan:** BP-AI -01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-017
**Vai trò Người dùng liên quan:** Hệ thống
**Yêu cầu Phi chức năng liên quan:** NFR-AI -01

---
### FR-017 Chấm điểm Toàn diện
**Mã yêu cầu:** FR-017
**Tên yêu cầu:** Chấm điểm Toàn diện
**Mô tả:** Tổng hợp tất cả các số liệu đánh giá
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Đánh giá AI bằng cách hỗ trợ chấm điểm toàn diện.
**Tác nhân:** Hệ thống
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Đánh giá AI.
**Kích hoạt:** Tất cả các câu trả lời đã được phân tích
**Luồng bình thường:**
1. Kích hoạt: Tất cả các câu trả lời đã được phân tích.
2. Hệ thống khởi tạo quy trình Chấm điểm Toàn diện.
3. Hệ thống xử lý Điểm thành phần, Trọng số.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Bảng điểm Phỏng vấn Cuối cùng.
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Điểm thành phần, Trọng số
**Đầu ra:** Bảng điểm Phỏng vấn Cuối cùng
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Đánh giá AI.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Đánh giá AI.
**Tiêu chí chấp nhận:** Hệ thống có thể thực hiện Chấm điểm Toàn diện thành công. Đầu vào (Điểm thành phần, Trọng số) ánh xạ chính xác tới Đầu ra (Bảng điểm Phỏng vấn Cuối cùng).
**Quy trình Nghiệp vụ liên quan:** BP-AI -01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-018
**Vai trò Người dùng liên quan:** Hệ thống
**Yêu cầu Phi chức năng liên quan:** NFR-AI -01

---
### FR-018 Xác định Khoảng trống Kỹ năng
**Mã yêu cầu:** FR-018
**Tên yêu cầu:** Xác định Khoảng trống Kỹ năng
**Mô tả:** Xác định các lĩnh vực còn yếu
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Trung tâm Học tập bằng cách hỗ trợ xác định khoảng trống kỹ năng.
**Tác nhân:** Hệ thống
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Trung tâm Học tập.
**Kích hoạt:** Hoàn tất chấm điểm
**Luồng bình thường:**
1. Kích hoạt: Hoàn tất chấm điểm.
2. Hệ thống khởi tạo quy trình Xác định Khoảng trống Kỹ năng.
3. Hệ thống xử lý Bảng điểm, Yêu cầu Vai trò Mục tiêu.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Danh sách các Khoảng trống Kỹ năng.
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Bảng điểm, Yêu cầu Vai trò Mục tiêu
**Đầu ra:** Danh sách các Khoảng trống Kỹ năng
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Trung tâm Học tập.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Trung tâm Học tập.
**Tiêu chí chấp nhận:** Hệ thống có thể thực hiện Xác định Khoảng trống Kỹ năng thành công. Đầu vào (Bảng điểm, Yêu cầu Vai trò Mục tiêu) ánh xạ chính xác tới Đầu ra (Danh sách các Khoảng trống Kỹ năng).
**Quy trình Nghiệp vụ liên quan:** BP-LEA-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-019
**Vai trò Người dùng liên quan:** Hệ thống
**Yêu cầu Phi chức năng liên quan:** NFR-LEA-01

---
### FR-019 Tạo Lộ trình
**Mã yêu cầu:** FR-019
**Tên yêu cầu:** Tạo Lộ trình
**Mô tả:** Tạo lộ trình học tập cá nhân hóa
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Trung tâm Học tập bằng cách hỗ trợ tạo lộ trình.
**Tác nhân:** Hệ thống
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Trung tâm Học tập.
**Kích hoạt:** Đã xác định khoảng trống
**Luồng bình thường:**
1. Kích hoạt: Đã xác định khoảng trống.
2. Hệ thống khởi tạo quy trình Tạo Lộ trình.
3. Hệ thống xử lý Các Khoảng trống Kỹ năng, Thư viện Nội dung.
4. Hệ thống thực thi các quy tắc nghiệp vụ.
5. Hệ thống tạo Lộ trình Học tập Tùy chỉnh.
**Luồng thay thế:** Quy trình bị gián đoạn. Hệ thống tạm dừng và lưu trạng thái.
**Luồng ngoại lệ:** Hệ thống con bắt buộc không khả dụng. Hệ thống ghi lại lỗi và cảnh báo cho quản trị viên.
**Đầu vào:** Các Khoảng trống Kỹ năng, Thư viện Nội dung
**Đầu ra:** Lộ trình Học tập Tùy chỉnh
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Trung tâm Học tập.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Trung tâm Học tập.
**Tiêu chí chấp nhận:** Hệ thống có thể thực hiện Tạo Lộ trình thành công. Đầu vào (Các Khoảng trống Kỹ năng, Thư viện Nội dung) ánh xạ chính xác tới Đầu ra (Lộ trình Học tập Tùy chỉnh).
**Quy trình Nghiệp vụ liên quan:** BP-LEA-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-020
**Vai trò Người dùng liên quan:** Hệ thống
**Yêu cầu Phi chức năng liên quan:** NFR-LEA-01

---
### FR-020 Tạo Thông tin Cơ bản
**Mã yêu cầu:** FR-020
**Tên yêu cầu:** Tạo Thông tin Cơ bản
**Mô tả:** Tạo mới một thông tin cơ bản
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Hồ sơ Ứng viên bằng cách hỗ trợ tạo thông tin cơ bản.
**Tác nhân:** Người dùng
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Hồ sơ Ứng viên.
**Kích hoạt:** Người dùng nhấp vào Thêm Thông tin Cơ bản
**Luồng bình thường:**
1. Người dùng truy cập tính năng Tạo Thông tin Cơ bản.
2. Người dùng cung cấp Các trường Thông tin Cơ bản.
3. Hệ thống xác thực dữ liệu đầu vào.
4. Hệ thống tạo bản ghi.
5. Hệ thống trả về Bản ghi Thông tin Cơ bản mới.
**Luồng thay thế:** Người dùng hủy bỏ quy trình trước khi gửi. Hệ thống loại bỏ dữ liệu.
**Luồng ngoại lệ:** Xác thực không thành công. Hệ thống làm nổi bật lỗi và chặn việc tạo.
**Đầu vào:** Các trường Thông tin Cơ bản
**Đầu ra:** Bản ghi Thông tin Cơ bản mới
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Hồ sơ Ứng viên.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Hồ sơ Ứng viên.
**Tiêu chí chấp nhận:** Người dùng có thể thực hiện Tạo Thông tin Cơ bản thành công. Đầu vào (Các trường Thông tin Cơ bản) ánh xạ chính xác tới Đầu ra (Bản ghi Thông tin Cơ bản mới).
**Quy trình Nghiệp vụ liên quan:** BP-CAN-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-021
**Vai trò Người dùng liên quan:** Người dùng
**Yêu cầu Phi chức năng liên quan:** NFR-CAN-01

---
### FR-021 Xem Thông tin Cơ bản
**Mã yêu cầu:** FR-021
**Tên yêu cầu:** Xem Thông tin Cơ bản
**Mô tả:** Đọc chi tiết thông tin cơ bản
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Hồ sơ Ứng viên bằng cách hỗ trợ xem thông tin cơ bản.
**Tác nhân:** Người dùng
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Hồ sơ Ứng viên.
**Kích hoạt:** Người dùng chọn Thông tin Cơ bản
**Luồng bình thường:**
1. Người dùng yêu cầu Xem Thông tin Cơ bản.
2. Hệ thống xác thực quyền truy cập.
3. Hệ thống truy xuất dữ liệu dựa trên ID Thông tin Cơ bản.
4. Hệ thống hiển thị Dữ liệu hiển thị Thông tin Cơ bản.
**Luồng thay thế:** Không tìm thấy dữ liệu khớp với tiêu chí. Hệ thống hiển thị trạng thái trống.
**Luồng ngoại lệ:** Truy cập bị từ chối. Hệ thống chuyển hướng đến trang không được ủy quyền.
**Đầu vào:** ID Thông tin Cơ bản
**Đầu ra:** Dữ liệu hiển thị Thông tin Cơ bản
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Hồ sơ Ứng viên.
**Ưu tiên:** Trung bình
**Phụ thuộc:** Yêu cầu thực thể cha trong Hồ sơ Ứng viên.
**Tiêu chí chấp nhận:** Người dùng có thể thực hiện Xem Thông tin Cơ bản thành công. Đầu vào (ID Thông tin Cơ bản) ánh xạ chính xác tới Đầu ra (Dữ liệu hiển thị Thông tin Cơ bản).
**Quy trình Nghiệp vụ liên quan:** BP-CAN-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-022
**Vai trò Người dùng liên quan:** Người dùng
**Yêu cầu Phi chức năng liên quan:** NFR-CAN-01

---
### FR-022 Cập nhật Thông tin Cơ bản
**Mã yêu cầu:** FR-022
**Tên yêu cầu:** Cập nhật Thông tin Cơ bản
**Mô tả:** Chỉnh sửa thông tin cơ bản hiện có
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Hồ sơ Ứng viên bằng cách hỗ trợ cập nhật thông tin cơ bản.
**Tác nhân:** Người dùng
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Hồ sơ Ứng viên.
**Kích hoạt:** Người dùng nhấp vào Sửa Thông tin Cơ bản
**Luồng bình thường:**
1. Người dùng yêu cầu sửa đổi Cập nhật Thông tin Cơ bản.
2. Hệ thống tải dữ liệu hiện có.
3. Người dùng nhập các thay đổi (Các trường Thông tin Cơ bản đã sửa đổi).
4. Hệ thống xác thực các thay đổi.
5. Hệ thống cập nhật bản ghi và trả về Bản ghi Thông tin Cơ bản đã cập nhật.
**Luồng thay thế:** Người dùng hủy sửa đổi. Hệ thống hoàn tác về trạng thái ban đầu.
**Luồng ngoại lệ:** Xác thực không thành công hoặc phát hiện cập nhật đồng thời. Hệ thống hủy bỏ cập nhật.
**Đầu vào:** Các trường Thông tin Cơ bản đã sửa đổi
**Đầu ra:** Bản ghi Thông tin Cơ bản đã cập nhật
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Hồ sơ Ứng viên.
**Ưu tiên:** Trung bình
**Phụ thuộc:** Yêu cầu thực thể cha trong Hồ sơ Ứng viên.
**Tiêu chí chấp nhận:** Người dùng có thể thực hiện Cập nhật Thông tin Cơ bản thành công. Đầu vào (Các trường Thông tin Cơ bản đã sửa đổi) ánh xạ chính xác tới Đầu ra (Bản ghi Thông tin Cơ bản đã cập nhật).
**Quy trình Nghiệp vụ liên quan:** BP-CAN-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-023
**Vai trò Người dùng liên quan:** Người dùng
**Yêu cầu Phi chức năng liên quan:** NFR-CAN-01

---
### FR-023 Xóa Thông tin Cơ bản
**Mã yêu cầu:** FR-023
**Tên yêu cầu:** Xóa Thông tin Cơ bản
**Mô tả:** Xóa thông tin cơ bản
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Hồ sơ Ứng viên bằng cách hỗ trợ xóa thông tin cơ bản.
**Tác nhân:** Người dùng
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Hồ sơ Ứng viên.
**Kích hoạt:** Người dùng nhấp vào Xóa Thông tin Cơ bản
**Luồng bình thường:**
1. Người dùng yêu cầu xóa Xóa Thông tin Cơ bản.
2. Hệ thống nhắc nhở xác nhận.
3. Người dùng xác nhận (ID Thông tin Cơ bản).
4. Hệ thống xóa mềm bản ghi.
5. Hệ thống trả về Trạng thái Xác nhận.
**Luồng thay thế:** Người dùng hủy tại lời nhắc xác nhận. Hệ thống hủy bỏ xóa.
**Luồng ngoại lệ:** Bản ghi bị khóa bởi các phụ thuộc. Hệ thống ngăn chặn việc xóa.
**Đầu vào:** ID Thông tin Cơ bản
**Đầu ra:** Trạng thái Xác nhận
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Hồ sơ Ứng viên.
**Ưu tiên:** Trung bình
**Phụ thuộc:** Yêu cầu thực thể cha trong Hồ sơ Ứng viên.
**Tiêu chí chấp nhận:** Người dùng có thể thực hiện Xóa Thông tin Cơ bản thành công. Đầu vào (ID Thông tin Cơ bản) ánh xạ chính xác tới Đầu ra (Trạng thái Xác nhận).
**Quy trình Nghiệp vụ liên quan:** BP-CAN-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-024
**Vai trò Người dùng liên quan:** Người dùng
**Yêu cầu Phi chức năng liên quan:** NFR-CAN-01

---
### FR-024 Tìm kiếm Thông tin Cơ bản
**Mã yêu cầu:** FR-024
**Tên yêu cầu:** Tìm kiếm Thông tin Cơ bản
**Mô tả:** Tìm kiếm/Lọc danh sách thông tin cơ bản
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Hồ sơ Ứng viên bằng cách hỗ trợ tìm kiếm thông tin cơ bản.
**Tác nhân:** Người dùng
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Hồ sơ Ứng viên.
**Kích hoạt:** Người dùng nhập từ khóa tìm kiếm
**Luồng bình thường:**
1. Người dùng yêu cầu Xem Tìm kiếm Thông tin Cơ bản.
2. Hệ thống xác thực quyền truy cập.
3. Hệ thống truy xuất dữ liệu dựa trên Truy vấn tìm kiếm, Bộ lọc.
4. Hệ thống hiển thị Danh sách Thông tin Cơ bản đã lọc.
**Luồng thay thế:** Không tìm thấy dữ liệu khớp với tiêu chí. Hệ thống hiển thị trạng thái trống.
**Luồng ngoại lệ:** Truy cập bị từ chối. Hệ thống chuyển hướng đến trang không được ủy quyền.
**Đầu vào:** Truy vấn tìm kiếm, Bộ lọc
**Đầu ra:** Danh sách Thông tin Cơ bản đã lọc
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Hồ sơ Ứng viên.
**Ưu tiên:** Trung bình
**Phụ thuộc:** Yêu cầu thực thể cha trong Hồ sơ Ứng viên.
**Tiêu chí chấp nhận:** Người dùng có thể thực hiện Tìm kiếm Thông tin Cơ bản thành công. Đầu vào (Truy vấn tìm kiếm, Bộ lọc) ánh xạ chính xác tới Đầu ra (Danh sách Thông tin Cơ bản đã lọc).
**Quy trình Nghiệp vụ liên quan:** BP-CAN-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-025
**Vai trò Người dùng liên quan:** Người dùng
**Yêu cầu Phi chức năng liên quan:** NFR-CAN-01

---
### FR-025 Tạo Hồ sơ Học vấn
**Mã yêu cầu:** FR-025
**Tên yêu cầu:** Tạo Hồ sơ Học vấn
**Mô tả:** Tạo mới hồ sơ học vấn
**Lý do Nghiệp vụ:** Kích hoạt các khả năng nghiệp vụ cần thiết cho Hồ sơ Ứng viên bằng cách hỗ trợ tạo hồ sơ học vấn.
**Tác nhân:** Người dùng
**Điều kiện tiên quyết:** Người dùng đã được xác thực. Đạt đủ quyền hạn cho Hồ sơ Ứng viên.
**Kích hoạt:** Người dùng nhấp vào Thêm Hồ sơ Học vấn
**Luồng bình thường:**
1. Người dùng truy cập tính năng Tạo Hồ sơ Học vấn.
2. Người dùng cung cấp Các trường Hồ sơ Học vấn.
3. Hệ thống xác thực dữ liệu đầu vào.
4. Hệ thống tạo bản ghi.
5. Hệ thống trả về Bản ghi Hồ sơ Học vấn mới.
**Luồng thay thế:** Người dùng hủy bỏ quy trình trước khi gửi. Hệ thống loại bỏ dữ liệu.
**Luồng ngoại lệ:** Xác thực không thành công. Hệ thống làm nổi bật lỗi và chặn việc tạo.
**Đầu vào:** Các trường Hồ sơ Học vấn
**Đầu ra:** Bản ghi Hồ sơ Học vấn mới
**Quy tắc Nghiệp vụ:** Phải tuân thủ quy tắc xác thực chung VR-01 và các quy tắc Hồ sơ Ứng viên.
**Ưu tiên:** Cao
**Phụ thuộc:** Yêu cầu thực thể cha trong Hồ sơ Ứng viên.
**Tiêu chí chấp nhận:** Người dùng có thể thực hiện Tạo Hồ sơ Học vấn thành công. Đầu vào (Các trường Hồ sơ Học vấn) ánh xạ chính xác tới Đầu ra (Bản ghi Hồ sơ Học vấn mới).
**Quy trình Nghiệp vụ liên quan:** BP-CAN-01
**Yêu cầu Nghiệp vụ liên quan:** BRQ-026
**Vai trò Người dùng liên quan:** Người dùng
**Yêu cầu Phi chức năng liên quan:** NFR-CAN-01

---
*Lưu ý: Để duy trì khả năng điều hướng của tài liệu, các yêu cầu chức năng CRUD (Tạo, Đọc, Cập nhật, Xóa) tiêu chuẩn còn lại và các yêu cầu cấp hệ thống được nhóm trong Phần 5.*

## 5. Yêu cầu Chức năng theo Mô-đun
Các bảng sau phân loại toàn bộ các yêu cầu chức năng theo từng mô-đun tương ứng.

### Xác thực
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-001 | Đăng ký Ứng viên | Đăng ký ứng viên mới | Ứng viên | Cao | Hành động |
| FR-002 | Đăng nhập SSO | Đăng nhập một lần cho Doanh nghiệp | Nhà tuyển dụng | Cao | Quy trình |
| FR-003 | Xác minh MFA | Thử thách xác thực đa yếu tố | Tất cả | Cao | Quy trình |

### Quản lý CV
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-004 | Tải lên Tệp CV | Tải lên tài liệu sơ yếu lý lịch | Ứng viên | Cao | Hành động |
| FR-005 | Công cụ Phân tích CV | Trích xuất văn bản từ CV | Hệ thống | Cao | Quy trình |
| FR-006 | Tự động Ánh xạ Hồ sơ | Ánh xạ dữ liệu CV vào hồ sơ | Hệ thống | Cao | Quy trình |

### Công cụ Phỏng vấn
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-007 | Tạo Mẫu Phỏng vấn | Xác định cấu trúc phỏng vấn | Nhà tuyển dụng | Cao | Hành động |
| FR-008 | Lời mời Ứng viên | Gửi liên kết phỏng vấn | Nhà tuyển dụng | Cao | Quy trình |
| FR-009 | Kiểm tra Sẵn sàng Hệ thống | Xác minh phần cứng và mạng | Ứng viên | Cao | Quy trình |
| FR-010 | Xác minh Danh tính | Khớp ứng viên với hồ sơ | Ứng viên | Cao | Quy trình |
| FR-011 | Cung cấp Câu hỏi | Trình bày các câu hỏi do AI tạo/chọn | Hệ thống | Cao | Quy trình |
| FR-012 | Ghi âm/Ghi hình | Ghi lại phản hồi của ứng viên | Hệ thống | Cao | Quy trình |
| FR-013 | Chống Gian lận Thời gian thực | Giám sát hoạt động đáng ngờ | Hệ thống | Cao | Quy trình |

### Đánh giá AI
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-014 | Chuyển đổi Giọng nói thành Văn bản | Phiên âm âm thanh thành văn bản | Hệ thống | Cao | Quy trình |
| FR-015 | Phân tích Ngữ nghĩa | Đánh giá nội dung câu trả lời | Hệ thống | Cao | Quy trình |
| FR-016 | Phân tích Giọng điệu và Cảm xúc | Đánh giá phong cách trình bày | Hệ thống | Cao | Quy trình |
| FR-017 | Chấm điểm Toàn diện | Tổng hợp tất cả các số liệu đánh giá | Hệ thống | Cao | Quy trình |

### Trung tâm Học tập
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-018 | Xác định Khoảng trống Kỹ năng | Xác định các lĩnh vực còn yếu | Hệ thống | Cao | Quy trình |
| FR-019 | Tạo Lộ trình | Tạo lộ trình học tập cá nhân hóa | Hệ thống | Cao | Quy trình |

### Hồ sơ Ứng viên
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-020 | Tạo Thông tin Cơ bản | Tạo mới một thông tin cơ bản | Người dùng | Cao | Hành động |
| FR-021 | Xem Thông tin Cơ bản | Đọc chi tiết thông tin cơ bản | Người dùng | Trung bình | Hành động |
| FR-022 | Cập nhật Thông tin Cơ bản | Chỉnh sửa thông tin cơ bản hiện có | Người dùng | Trung bình | Hành động |
| FR-023 | Xóa Thông tin Cơ bản | Xóa thông tin cơ bản | Người dùng | Trung bình | Hành động |
| FR-024 | Tìm kiếm Thông tin Cơ bản | Tìm kiếm/Lọc danh sách thông tin cơ bản | Người dùng | Trung bình | Hành động |
| FR-025 | Tạo Hồ sơ Học vấn | Tạo mới hồ sơ học vấn | Người dùng | Cao | Hành động |
| FR-026 | Xem Hồ sơ Học vấn | Đọc chi tiết hồ sơ học vấn | Người dùng | Trung bình | Hành động |
| FR-027 | Cập nhật Hồ sơ Học vấn | Chỉnh sửa hồ sơ học vấn hiện có | Người dùng | Trung bình | Hành động |
| FR-028 | Xóa Hồ sơ Học vấn | Xóa hồ sơ học vấn | Người dùng | Trung bình | Hành động |
| FR-029 | Tìm kiếm Hồ sơ Học vấn | Tìm kiếm/Lọc danh sách hồ sơ học vấn | Người dùng | Trung bình | Hành động |
| FR-030 | Tạo Kinh nghiệm Làm việc | Tạo mới kinh nghiệm làm việc | Người dùng | Cao | Hành động |
| FR-031 | Xem Kinh nghiệm Làm việc | Đọc chi tiết kinh nghiệm làm việc | Người dùng | Trung bình | Hành động |
| FR-032 | Cập nhật Kinh nghiệm Làm việc | Chỉnh sửa kinh nghiệm làm việc hiện có | Người dùng | Trung bình | Hành động |
| FR-033 | Xóa Kinh nghiệm Làm việc | Xóa kinh nghiệm làm việc | Người dùng | Trung bình | Hành động |
| FR-034 | Tìm kiếm Kinh nghiệm Làm việc | Tìm kiếm/Lọc danh sách kinh nghiệm làm việc | Người dùng | Trung bình | Hành động |
| FR-035 | Tạo Chứng chỉ | Tạo mới chứng chỉ | Người dùng | Cao | Hành động |
| FR-036 | Xem Chứng chỉ | Đọc chi tiết chứng chỉ | Người dùng | Trung bình | Hành động |
| FR-037 | Cập nhật Chứng chỉ | Chỉnh sửa chứng chỉ hiện có | Người dùng | Trung bình | Hành động |
| FR-038 | Xóa Chứng chỉ | Xóa chứng chỉ | Người dùng | Trung bình | Hành động |
| FR-039 | Tìm kiếm Chứng chỉ | Tìm kiếm/Lọc danh sách chứng chỉ | Người dùng | Trung bình | Hành động |
| FR-040 | Tạo Dự án | Tạo mới dự án | Người dùng | Cao | Hành động |
| FR-041 | Xem Dự án | Đọc chi tiết dự án | Người dùng | Trung bình | Hành động |
| FR-042 | Cập nhật Dự án | Chỉnh sửa dự án hiện có | Người dùng | Trung bình | Hành động |
| FR-043 | Xóa Dự án | Xóa dự án | Người dùng | Trung bình | Hành động |
| FR-044 | Tìm kiếm Dự án | Tìm kiếm/Lọc danh sách dự án | Người dùng | Trung bình | Hành động |
| FR-045 | Tạo Liên kết Mạng xã hội | Tạo mới liên kết mạng xã hội | Người dùng | Cao | Hành động |
| FR-046 | Xem Liên kết Mạng xã hội | Đọc chi tiết liên kết mạng xã hội | Người dùng | Trung bình | Hành động |
| FR-047 | Cập nhật Liên kết Mạng xã hội | Chỉnh sửa liên kết mạng xã hội hiện có | Người dùng | Trung bình | Hành động |
| FR-048 | Xóa Liên kết Mạng xã hội | Xóa liên kết mạng xã hội | Người dùng | Trung bình | Hành động |
| FR-049 | Tìm kiếm Liên kết Mạng xã hội | Tìm kiếm/Lọc danh sách liên kết mạng xã hội | Người dùng | Trung bình | Hành động |
| FR-050 | Tạo Thẻ Kỹ năng | Tạo mới thẻ kỹ năng | Người dùng | Cao | Hành động |
| FR-051 | Xem Thẻ Kỹ năng | Đọc chi tiết thẻ kỹ năng | Người dùng | Trung bình | Hành động |
| FR-052 | Cập nhật Thẻ Kỹ năng | Chỉnh sửa thẻ kỹ năng hiện có | Người dùng | Trung bình | Hành động |
| FR-053 | Xóa Thẻ Kỹ năng | Xóa thẻ kỹ năng | Người dùng | Trung bình | Hành động |
| FR-054 | Tìm kiếm Thẻ Kỹ năng | Tìm kiếm/Lọc danh sách thẻ kỹ năng | Người dùng | Trung bình | Hành động |
| FR-055 | Tạo Tùy chọn | Tạo mới tùy chọn | Người dùng | Cao | Hành động |
| FR-056 | Xem Tùy chọn | Đọc chi tiết tùy chọn | Người dùng | Trung bình | Hành động |
| FR-057 | Cập nhật Tùy chọn | Chỉnh sửa tùy chọn hiện có | Người dùng | Trung bình | Hành động |
| FR-058 | Xóa Tùy chọn | Xóa tùy chọn | Người dùng | Trung bình | Hành động |
| FR-059 | Tìm kiếm Tùy chọn | Tìm kiếm/Lọc danh sách tùy chọn | Người dùng | Trung bình | Hành động |

### Quản lý Nhà tuyển dụng
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-060 | Tạo Hồ sơ Công ty | Tạo mới hồ sơ công ty | Người dùng | Cao | Hành động |
| FR-061 | Xem Hồ sơ Công ty | Đọc chi tiết hồ sơ công ty | Người dùng | Trung bình | Hành động |
| FR-062 | Cập nhật Hồ sơ Công ty | Chỉnh sửa hồ sơ công ty hiện có | Người dùng | Trung bình | Hành động |
| FR-063 | Xóa Hồ sơ Công ty | Xóa hồ sơ công ty | Người dùng | Trung bình | Hành động |
| FR-064 | Tìm kiếm Hồ sơ Công ty | Tìm kiếm/Lọc danh sách hồ sơ công ty | Người dùng | Trung bình | Hành động |
| FR-065 | Tạo Phòng ban | Tạo mới phòng ban | Người dùng | Cao | Hành động |
| FR-066 | Xem Phòng ban | Đọc chi tiết phòng ban | Người dùng | Trung bình | Hành động |
| FR-067 | Cập nhật Phòng ban | Chỉnh sửa phòng ban hiện có | Người dùng | Trung bình | Hành động |
| FR-068 | Xóa Phòng ban | Xóa phòng ban | Người dùng | Trung bình | Hành động |
| FR-069 | Tìm kiếm Phòng ban | Tìm kiếm/Lọc danh sách phòng ban | Người dùng | Trung bình | Hành động |
| FR-070 | Tạo Thành viên Nhóm | Tạo mới thành viên nhóm | Người dùng | Cao | Hành động |
| FR-071 | Xem Thành viên Nhóm | Đọc chi tiết thành viên nhóm | Người dùng | Trung bình | Hành động |
| FR-072 | Cập nhật Thành viên Nhóm | Chỉnh sửa thành viên nhóm hiện có | Người dùng | Trung bình | Hành động |
| FR-073 | Xóa Thành viên Nhóm | Xóa thành viên nhóm | Người dùng | Trung bình | Hành động |
| FR-074 | Tìm kiếm Thành viên Nhóm | Tìm kiếm/Lọc danh sách thành viên nhóm | Người dùng | Trung bình | Hành động |
| FR-075 | Tạo Quyền hạn Vai trò | Tạo mới quyền hạn vai trò | Người dùng | Cao | Hành động |
| FR-076 | Xem Quyền hạn Vai trò | Đọc chi tiết quyền hạn vai trò | Người dùng | Trung bình | Hành động |
| FR-077 | Cập nhật Quyền hạn Vai trò | Chỉnh sửa quyền hạn vai trò hiện có | Người dùng | Trung bình | Hành động |
| FR-078 | Xóa Quyền hạn Vai trò | Xóa quyền hạn vai trò | Người dùng | Trung bình | Hành động |
| FR-079 | Tìm kiếm Quyền hạn Vai trò | Tìm kiếm/Lọc danh sách quyền hạn vai trò | Người dùng | Trung bình | Hành động |
| FR-080 | Tạo Chi tiết Thanh toán | Tạo mới chi tiết thanh toán | Người dùng | Cao | Hành động |
| FR-081 | Xem Chi tiết Thanh toán | Đọc chi tiết thanh toán | Người dùng | Trung bình | Hành động |
| FR-082 | Cập nhật Chi tiết Thanh toán | Chỉnh sửa chi tiết thanh toán hiện có | Người dùng | Trung bình | Hành động |
| FR-083 | Xóa Chi tiết Thanh toán | Xóa chi tiết thanh toán | Người dùng | Trung bình | Hành động |
| FR-084 | Tìm kiếm Chi tiết Thanh toán | Tìm kiếm/Lọc danh sách chi tiết thanh toán | Người dùng | Trung bình | Hành động |
| FR-085 | Tạo Khóa API | Tạo mới khóa API | Người dùng | Cao | Hành động |
| FR-086 | Xem Khóa API | Đọc chi tiết khóa API | Người dùng | Trung bình | Hành động |
| FR-087 | Cập nhật Khóa API | Chỉnh sửa khóa API hiện có | Người dùng | Trung bình | Hành động |
| FR-088 | Xóa Khóa API | Xóa khóa API | Người dùng | Trung bình | Hành động |
| FR-089 | Tìm kiếm Khóa API | Tìm kiếm/Lọc danh sách khóa API | Người dùng | Trung bình | Hành động |
| FR-090 | Tạo Điểm cuối Webhook | Tạo mới điểm cuối webhook | Người dùng | Cao | Hành động |
| FR-091 | Xem Điểm cuối Webhook | Đọc chi tiết điểm cuối webhook | Người dùng | Trung bình | Hành động |
| FR-092 | Cập nhật Điểm cuối Webhook | Chỉnh sửa điểm cuối webhook hiện có | Người dùng | Trung bình | Hành động |
| FR-093 | Xóa Điểm cuối Webhook | Xóa điểm cuối webhook | Người dùng | Trung bình | Hành động |
| FR-094 | Tìm kiếm Điểm cuối Webhook | Tìm kiếm/Lọc danh sách điểm cuối webhook | Người dùng | Trung bình | Hành động |

### Chiến dịch
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-095 | Tạo Yêu cầu Tuyển dụng | Tạo mới yêu cầu tuyển dụng | Người dùng | Cao | Hành động |
| FR-096 | Xem Yêu cầu Tuyển dụng | Đọc chi tiết yêu cầu tuyển dụng | Người dùng | Trung bình | Hành động |
| FR-097 | Cập nhật Yêu cầu Tuyển dụng | Chỉnh sửa yêu cầu tuyển dụng hiện có | Người dùng | Trung bình | Hành động |
| FR-098 | Xóa Yêu cầu Tuyển dụng | Xóa yêu cầu tuyển dụng | Người dùng | Trung bình | Hành động |
| FR-099 | Tìm kiếm Yêu cầu Tuyển dụng | Tìm kiếm/Lọc danh sách yêu cầu tuyển dụng | Người dùng | Trung bình | Hành động |
| FR-100 | Tạo Bản nháp Chiến dịch | Tạo mới bản nháp chiến dịch | Người dùng | Cao | Hành động |
| FR-101 | Xem Bản nháp Chiến dịch | Đọc chi tiết bản nháp chiến dịch | Người dùng | Trung bình | Hành động |
| FR-102 | Cập nhật Bản nháp Chiến dịch | Chỉnh sửa bản nháp chiến dịch hiện có | Người dùng | Trung bình | Hành động |
| FR-103 | Xóa Bản nháp Chiến dịch | Xóa bản nháp chiến dịch | Người dùng | Trung bình | Hành động |
| FR-104 | Tìm kiếm Bản nháp Chiến dịch | Tìm kiếm/Lọc danh sách bản nháp chiến dịch | Người dùng | Trung bình | Hành động |
| FR-105 | Tạo Đường ống Ứng viên | Tạo mới đường ống ứng viên | Người dùng | Cao | Hành động |
| FR-106 | Xem Đường ống Ứng viên | Đọc chi tiết đường ống ứng viên | Người dùng | Trung bình | Hành động |
| FR-107 | Cập nhật Đường ống Ứng viên | Chỉnh sửa đường ống ứng viên hiện có | Người dùng | Trung bình | Hành động |
| FR-108 | Xóa Đường ống Ứng viên | Xóa đường ống ứng viên | Người dùng | Trung bình | Hành động |
| FR-109 | Tìm kiếm Đường ống Ứng viên | Tìm kiếm/Lọc danh sách đường ống ứng viên | Người dùng | Trung bình | Hành động |
| FR-110 | Tạo Quy tắc Sàng lọc | Tạo mới quy tắc sàng lọc | Người dùng | Cao | Hành động |
| FR-111 | Xem Quy tắc Sàng lọc | Đọc chi tiết quy tắc sàng lọc | Người dùng | Trung bình | Hành động |
| FR-112 | Cập nhật Quy tắc Sàng lọc | Chỉnh sửa quy tắc sàng lọc hiện có | Người dùng | Trung bình | Hành động |
| FR-113 | Xóa Quy tắc Sàng lọc | Xóa quy tắc sàng lọc | Người dùng | Trung bình | Hành động |
| FR-114 | Tìm kiếm Quy tắc Sàng lọc | Tìm kiếm/Lọc danh sách quy tắc sàng lọc | Người dùng | Trung bình | Hành động |
| FR-115 | Tạo Phân tích Chiến dịch | Tạo mới phân tích chiến dịch | Người dùng | Cao | Hành động |
| FR-116 | Xem Phân tích Chiến dịch | Đọc chi tiết phân tích chiến dịch | Người dùng | Trung bình | Hành động |
| FR-117 | Cập nhật Phân tích Chiến dịch | Chỉnh sửa phân tích chiến dịch hiện có | Người dùng | Trung bình | Hành động |
| FR-118 | Xóa Phân tích Chiến dịch | Xóa phân tích chiến dịch | Người dùng | Trung bình | Hành động |
| FR-119 | Tìm kiếm Phân tích Chiến dịch | Tìm kiếm/Lọc danh sách phân tích chiến dịch | Người dùng | Trung bình | Hành động |
| FR-120 | Tạo Quy trình Tùy chỉnh | Tạo mới quy trình làm việc tùy chỉnh | Người dùng | Cao | Hành động |
| FR-121 | Xem Quy trình Tùy chỉnh | Đọc chi tiết quy trình tùy chỉnh | Người dùng | Trung bình | Hành động |
| FR-122 | Cập nhật Quy trình Tùy chỉnh | Chỉnh sửa quy trình tùy chỉnh hiện có | Người dùng | Trung bình | Hành động |
| FR-123 | Xóa Quy trình Tùy chỉnh | Xóa quy trình tùy chỉnh | Người dùng | Trung bình | Hành động |
| FR-124 | Tìm kiếm Quy trình Tùy chỉnh | Tìm kiếm/Lọc danh sách quy trình tùy chỉnh | Người dùng | Trung bình | Hành động |

### Thiết lập Phỏng vấn
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-125 | Tạo Ngân hàng Câu hỏi | Tạo mới ngân hàng câu hỏi | Người dùng | Cao | Hành động |
| FR-126 | Xem Ngân hàng Câu hỏi | Đọc chi tiết ngân hàng câu hỏi | Người dùng | Trung bình | Hành động |
| FR-127 | Cập nhật Ngân hàng Câu hỏi | Chỉnh sửa ngân hàng câu hỏi hiện có | Người dùng | Trung bình | Hành động |
| FR-128 | Xóa Ngân hàng Câu hỏi | Xóa ngân hàng câu hỏi | Người dùng | Trung bình | Hành động |
| FR-129 | Tìm kiếm Ngân hàng Câu hỏi | Tìm kiếm/Lọc danh sách ngân hàng câu hỏi | Người dùng | Trung bình | Hành động |
| FR-130 | Tạo Danh mục Câu hỏi | Tạo mới danh mục câu hỏi | Người dùng | Cao | Hành động |
| FR-131 | Xem Danh mục Câu hỏi | Đọc chi tiết danh mục câu hỏi | Người dùng | Trung bình | Hành động |
| FR-132 | Cập nhật Danh mục Câu hỏi | Chỉnh sửa danh mục câu hỏi hiện có | Người dùng | Trung bình | Hành động |
| FR-133 | Xóa Danh mục Câu hỏi | Xóa danh mục câu hỏi | Người dùng | Trung bình | Hành động |
| FR-134 | Tìm kiếm Danh mục Câu hỏi | Tìm kiếm/Lọc danh sách danh mục câu hỏi | Người dùng | Trung bình | Hành động |
| FR-135 | Tạo Tiêu chí Đánh giá | Tạo mới tiêu chí đánh giá | Người dùng | Cao | Hành động |
| FR-136 | Xem Tiêu chí Đánh giá | Đọc chi tiết tiêu chí đánh giá | Người dùng | Trung bình | Hành động |
| FR-137 | Cập nhật Tiêu chí Đánh giá | Chỉnh sửa tiêu chí đánh giá hiện có | Người dùng | Trung bình | Hành động |
| FR-138 | Xóa Tiêu chí Đánh giá | Xóa tiêu chí đánh giá | Người dùng | Trung bình | Hành động |
| FR-139 | Tìm kiếm Tiêu chí Đánh giá | Tìm kiếm/Lọc danh sách tiêu chí đánh giá | Người dùng | Trung bình | Hành động |
| FR-140 | Tạo Cài đặt Định dạng AI | Tạo mới cài đặt định dạng AI (AI Persona) | Người dùng | Cao | Hành động |
| FR-141 | Xem Cài đặt Định dạng AI | Đọc chi tiết cài đặt định dạng AI | Người dùng | Trung bình | Hành động |
| FR-142 | Cập nhật Cài đặt Định dạng AI | Chỉnh sửa cài đặt định dạng AI hiện có | Người dùng | Trung bình | Hành động |
| FR-143 | Xóa Cài đặt Định dạng AI | Xóa cài đặt định dạng AI | Người dùng | Trung bình | Hành động |
| FR-144 | Tìm kiếm Cài đặt Định dạng AI | Tìm kiếm/Lọc danh sách cài đặt định dạng AI | Người dùng | Trung bình | Hành động |
| FR-145 | Tạo Giới hạn Thời gian | Tạo mới giới hạn thời gian | Người dùng | Cao | Hành động |
| FR-146 | Xem Giới hạn Thời gian | Đọc chi tiết giới hạn thời gian | Người dùng | Trung bình | Hành động |
| FR-147 | Cập nhật Giới hạn Thời gian | Chỉnh sửa giới hạn thời gian hiện có | Người dùng | Trung bình | Hành động |
| FR-148 | Xóa Giới hạn Thời gian | Xóa giới hạn thời gian | Người dùng | Trung bình | Hành động |
| FR-149 | Tìm kiếm Giới hạn Thời gian | Tìm kiếm/Lọc danh sách giới hạn thời gian | Người dùng | Trung bình | Hành động |
| FR-150 | Tạo Thông điệp Chào mừng | Tạo mới thông điệp chào mừng | Người dùng | Cao | Hành động |
| FR-151 | Xem Thông điệp Chào mừng | Đọc chi tiết thông điệp chào mừng | Người dùng | Trung bình | Hành động |
| FR-152 | Cập nhật Thông điệp Chào mừng | Chỉnh sửa thông điệp chào mừng hiện có | Người dùng | Trung bình | Hành động |
| FR-153 | Xóa Thông điệp Chào mừng | Xóa thông điệp chào mừng | Người dùng | Trung bình | Hành động |
| FR-154 | Tìm kiếm Thông điệp Chào mừng | Tìm kiếm/Lọc danh sách thông điệp chào mừng | Người dùng | Trung bình | Hành động |
| FR-155 | Tạo Thông điệp Hoàn thành | Tạo mới thông điệp hoàn thành | Người dùng | Cao | Hành động |
| FR-156 | Xem Thông điệp Hoàn thành | Đọc chi tiết thông điệp hoàn thành | Người dùng | Trung bình | Hành động |
| FR-157 | Cập nhật Thông điệp Hoàn thành | Chỉnh sửa thông điệp hoàn thành hiện có | Người dùng | Trung bình | Hành động |
| FR-158 | Xóa Thông điệp Hoàn thành | Xóa thông điệp hoàn thành | Người dùng | Trung bình | Hành động |
| FR-159 | Tìm kiếm Thông điệp Hoàn thành | Tìm kiếm/Lọc danh sách thông điệp hoàn thành | Người dùng | Trung bình | Hành động |

### Thanh toán
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-160 | Tạo Gói Đăng ký | Tạo mới gói đăng ký | Người dùng | Cao | Hành động |
| FR-161 | Xem Gói Đăng ký | Đọc chi tiết gói đăng ký | Người dùng | Trung bình | Hành động |
| FR-162 | Cập nhật Gói Đăng ký | Chỉnh sửa gói đăng ký hiện có | Người dùng | Trung bình | Hành động |
| FR-163 | Xóa Gói Đăng ký | Xóa gói đăng ký | Người dùng | Trung bình | Hành động |
| FR-164 | Tìm kiếm Gói Đăng ký | Tìm kiếm/Lọc danh sách gói đăng ký | Người dùng | Trung bình | Hành động |
| FR-165 | Tạo Số dư Tín dụng | Tạo mới số dư tín dụng | Người dùng | Cao | Hành động |
| FR-166 | Xem Số dư Tín dụng | Đọc chi tiết số dư tín dụng | Người dùng | Trung bình | Hành động |
| FR-167 | Cập nhật Số dư Tín dụng | Chỉnh sửa số dư tín dụng hiện có | Người dùng | Trung bình | Hành động |
| FR-168 | Xóa Số dư Tín dụng | Xóa số dư tín dụng | Người dùng | Trung bình | Hành động |
| FR-169 | Tìm kiếm Số dư Tín dụng | Tìm kiếm/Lọc danh sách số dư tín dụng | Người dùng | Trung bình | Hành động |
| FR-170 | Tạo Phương thức Thanh toán | Tạo mới phương thức thanh toán | Người dùng | Cao | Hành động |
| FR-171 | Xem Phương thức Thanh toán | Đọc chi tiết phương thức thanh toán | Người dùng | Trung bình | Hành động |
| FR-172 | Cập nhật Phương thức Thanh toán | Chỉnh sửa phương thức thanh toán hiện có | Người dùng | Trung bình | Hành động |
| FR-173 | Xóa Phương thức Thanh toán | Xóa phương thức thanh toán | Người dùng | Trung bình | Hành động |
| FR-174 | Tìm kiếm Phương thức Thanh toán | Tìm kiếm/Lọc danh sách phương thức thanh toán | Người dùng | Trung bình | Hành động |
| FR-175 | Tạo Lịch sử Hóa đơn | Tạo mới lịch sử hóa đơn | Người dùng | Cao | Hành động |
| FR-176 | Xem Lịch sử Hóa đơn | Đọc chi tiết lịch sử hóa đơn | Người dùng | Trung bình | Hành động |
| FR-177 | Cập nhật Lịch sử Hóa đơn | Chỉnh sửa lịch sử hóa đơn hiện có | Người dùng | Trung bình | Hành động |
| FR-178 | Xóa Lịch sử Hóa đơn | Xóa lịch sử hóa đơn | Người dùng | Trung bình | Hành động |
| FR-179 | Tìm kiếm Lịch sử Hóa đơn | Tìm kiếm/Lọc danh sách lịch sử hóa đơn | Người dùng | Trung bình | Hành động |
| FR-180 | Tạo Nhật ký Giao dịch | Tạo mới nhật ký giao dịch | Người dùng | Cao | Hành động |
| FR-181 | Xem Nhật ký Giao dịch | Đọc chi tiết nhật ký giao dịch | Người dùng | Trung bình | Hành động |
| FR-182 | Cập nhật Nhật ký Giao dịch | Chỉnh sửa nhật ký giao dịch hiện có | Người dùng | Trung bình | Hành động |
| FR-183 | Xóa Nhật ký Giao dịch | Xóa nhật ký giao dịch | Người dùng | Trung bình | Hành động |
| FR-184 | Tìm kiếm Nhật ký Giao dịch | Tìm kiếm/Lọc danh sách nhật ký giao dịch | Người dùng | Trung bình | Hành động |
| FR-185 | Tạo Thông tin Thuế | Tạo mới thông tin thuế | Người dùng | Cao | Hành động |
| FR-186 | Xem Thông tin Thuế | Đọc chi tiết thông tin thuế | Người dùng | Trung bình | Hành động |
| FR-187 | Cập nhật Thông tin Thuế | Chỉnh sửa thông tin thuế hiện có | Người dùng | Trung bình | Hành động |
| FR-188 | Xóa Thông tin Thuế | Xóa thông tin thuế | Người dùng | Trung bình | Hành động |
| FR-189 | Tìm kiếm Thông tin Thuế | Tìm kiếm/Lọc danh sách thông tin thuế | Người dùng | Trung bình | Hành động |
| FR-190 | Tạo Yêu cầu Hoàn tiền | Tạo mới yêu cầu hoàn tiền | Người dùng | Cao | Hành động |
| FR-191 | Xem Yêu cầu Hoàn tiền | Đọc chi tiết yêu cầu hoàn tiền | Người dùng | Trung bình | Hành động |
| FR-192 | Cập nhật Yêu cầu Hoàn tiền | Chỉnh sửa yêu cầu hoàn tiền hiện có | Người dùng | Trung bình | Hành động |
| FR-193 | Xóa Yêu cầu Hoàn tiền | Xóa yêu cầu hoàn tiền | Người dùng | Trung bình | Hành động |
| FR-194 | Tìm kiếm Yêu cầu Hoàn tiền | Tìm kiếm/Lọc danh sách yêu cầu hoàn tiền | Người dùng | Trung bình | Hành động |

### Báo cáo
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-195 | Tạo Báo cáo Hiệu suất Ứng viên | Tạo mới báo cáo hiệu suất ứng viên | Người dùng | Cao | Hành động |
| FR-196 | Xem Báo cáo Hiệu suất Ứng viên | Đọc chi tiết báo cáo hiệu suất | Người dùng | Trung bình | Hành động |
| FR-197 | Cập nhật Báo cáo Hiệu suất Ứng viên | Chỉnh sửa báo cáo hiệu suất hiện có | Người dùng | Trung bình | Hành động |
| FR-198 | Xóa Báo cáo Hiệu suất Ứng viên | Xóa báo cáo hiệu suất | Người dùng | Trung bình | Hành động |
| FR-199 | Tìm kiếm Báo cáo Hiệu suất Ứng viên | Tìm kiếm/Lọc danh sách báo cáo | Người dùng | Trung bình | Hành động |
| FR-200 | Tạo Báo cáo Tổng kết Chiến dịch | Tạo mới báo cáo tổng kết chiến dịch | Người dùng | Cao | Hành động |
| FR-201 | Xem Báo cáo Tổng kết Chiến dịch | Đọc chi tiết báo cáo tổng kết | Người dùng | Trung bình | Hành động |
| FR-202 | Cập nhật Báo cáo Tổng kết Chiến dịch | Chỉnh sửa báo cáo tổng kết hiện có | Người dùng | Trung bình | Hành động |
| FR-203 | Xóa Báo cáo Tổng kết Chiến dịch | Xóa báo cáo tổng kết | Người dùng | Trung bình | Hành động |
| FR-204 | Tìm kiếm Báo cáo Tổng kết Chiến dịch | Tìm kiếm/Lọc danh sách báo cáo | Người dùng | Trung bình | Hành động |
| FR-205 | Tạo Báo cáo Sử dụng Hệ thống | Tạo mới báo cáo sử dụng hệ thống | Người dùng | Cao | Hành động |
| FR-206 | Xem Báo cáo Sử dụng Hệ thống | Đọc chi tiết báo cáo sử dụng hệ thống | Người dùng | Trung bình | Hành động |
| FR-207 | Cập nhật Báo cáo Sử dụng Hệ thống | Chỉnh sửa báo cáo sử dụng hệ thống | Người dùng | Trung bình | Hành động |
| FR-208 | Xóa Báo cáo Sử dụng Hệ thống | Xóa báo cáo sử dụng hệ thống | Người dùng | Trung bình | Hành động |
| FR-209 | Tìm kiếm Báo cáo Sử dụng Hệ thống | Tìm kiếm/Lọc danh sách báo cáo | Người dùng | Trung bình | Hành động |
| FR-210 | Tạo Báo cáo Thanh toán | Tạo mới báo cáo thanh toán | Người dùng | Cao | Hành động |
| FR-211 | Xem Báo cáo Thanh toán | Đọc chi tiết báo cáo thanh toán | Người dùng | Trung bình | Hành động |
| FR-212 | Cập nhật Báo cáo Thanh toán | Chỉnh sửa báo cáo thanh toán hiện có | Người dùng | Trung bình | Hành động |
| FR-213 | Xóa Báo cáo Thanh toán | Xóa báo cáo thanh toán | Người dùng | Trung bình | Hành động |
| FR-214 | Tìm kiếm Báo cáo Thanh toán | Tìm kiếm/Lọc danh sách báo cáo thanh toán | Người dùng | Trung bình | Hành động |
| FR-215 | Tạo Báo cáo Dấu vết Kiểm toán | Tạo mới báo cáo dấu vết kiểm toán | Người dùng | Cao | Hành động |
| FR-216 | Xem Báo cáo Dấu vết Kiểm toán | Đọc chi tiết báo cáo dấu vết kiểm toán | Người dùng | Trung bình | Hành động |
| FR-217 | Cập nhật Báo cáo Dấu vết Kiểm toán | Chỉnh sửa báo cáo kiểm toán hiện có | Người dùng | Trung bình | Hành động |
| FR-218 | Xóa Báo cáo Dấu vết Kiểm toán | Xóa báo cáo dấu vết kiểm toán | Người dùng | Trung bình | Hành động |
| FR-219 | Tìm kiếm Báo cáo Dấu vết Kiểm toán | Tìm kiếm/Lọc danh sách báo cáo | Người dùng | Trung bình | Hành động |
| FR-220 | Tạo Báo cáo Đa dạng & Hòa nhập | Tạo mới báo cáo đa dạng & hòa nhập | Người dùng | Cao | Hành động |
| FR-221 | Xem Báo cáo Đa dạng & Hòa nhập | Đọc chi tiết báo cáo | Người dùng | Trung bình | Hành động |
| FR-222 | Cập nhật Báo cáo Đa dạng & Hòa nhập | Chỉnh sửa báo cáo hiện có | Người dùng | Trung bình | Hành động |
| FR-223 | Xóa Báo cáo Đa dạng & Hòa nhập | Xóa báo cáo | Người dùng | Trung bình | Hành động |
| FR-224 | Tìm kiếm Báo cáo Đa dạng & Hòa nhập | Tìm kiếm/Lọc danh sách báo cáo | Người dùng | Trung bình | Hành động |

### Thông báo
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-225 | Tạo Mẫu Email | Tạo mới mẫu email | Người dùng | Cao | Hành động |
| FR-226 | Xem Mẫu Email | Đọc chi tiết mẫu email | Người dùng | Trung bình | Hành động |
| FR-227 | Cập nhật Mẫu Email | Chỉnh sửa mẫu email hiện có | Người dùng | Trung bình | Hành động |
| FR-228 | Xóa Mẫu Email | Xóa mẫu email | Người dùng | Trung bình | Hành động |
| FR-229 | Tìm kiếm Mẫu Email | Tìm kiếm/Lọc danh sách mẫu email | Người dùng | Trung bình | Hành động |
| FR-230 | Tạo Cài đặt SMS | Tạo mới cài đặt SMS | Người dùng | Cao | Hành động |
| FR-231 | Xem Cài đặt SMS | Đọc chi tiết cài đặt SMS | Người dùng | Trung bình | Hành động |
| FR-232 | Cập nhật Cài đặt SMS | Chỉnh sửa cài đặt SMS hiện có | Người dùng | Trung bình | Hành động |
| FR-233 | Xóa Cài đặt SMS | Xóa cài đặt SMS | Người dùng | Trung bình | Hành động |
| FR-234 | Tìm kiếm Cài đặt SMS | Tìm kiếm/Lọc danh sách cài đặt SMS | Người dùng | Trung bình | Hành động |
| FR-235 | Tạo Cảnh báo trong Ứng dụng | Tạo mới cảnh báo trong ứng dụng | Người dùng | Cao | Hành động |
| FR-236 | Xem Cảnh báo trong Ứng dụng | Đọc chi tiết cảnh báo trong ứng dụng | Người dùng | Trung bình | Hành động |
| FR-237 | Cập nhật Cảnh báo trong Ứng dụng | Chỉnh sửa cảnh báo hiện có | Người dùng | Trung bình | Hành động |
| FR-238 | Xóa Cảnh báo trong Ứng dụng | Xóa cảnh báo trong ứng dụng | Người dùng | Trung bình | Hành động |
| FR-239 | Tìm kiếm Cảnh báo trong Ứng dụng | Tìm kiếm/Lọc danh sách cảnh báo | Người dùng | Trung bình | Hành động |
| FR-240 | Tạo Quy tắc Thông báo | Tạo mới quy tắc thông báo | Người dùng | Cao | Hành động |
| FR-241 | Xem Quy tắc Thông báo | Đọc chi tiết quy tắc thông báo | Người dùng | Trung bình | Hành động |
| FR-242 | Cập nhật Quy tắc Thông báo | Chỉnh sửa quy tắc thông báo hiện có | Người dùng | Trung bình | Hành động |
| FR-243 | Xóa Quy tắc Thông báo | Xóa quy tắc thông báo | Người dùng | Trung bình | Hành động |
| FR-244 | Tìm kiếm Quy tắc Thông báo | Tìm kiếm/Lọc danh sách quy tắc | Người dùng | Trung bình | Hành động |
| FR-245 | Tạo Cài đặt Tóm tắt | Tạo mới cài đặt tóm tắt (digest) | Người dùng | Cao | Hành động |
| FR-246 | Xem Cài đặt Tóm tắt | Đọc chi tiết cài đặt tóm tắt | Người dùng | Trung bình | Hành động |
| FR-247 | Cập nhật Cài đặt Tóm tắt | Chỉnh sửa cài đặt tóm tắt hiện có | Người dùng | Trung bình | Hành động |
| FR-248 | Xóa Cài đặt Tóm tắt | Xóa cài đặt tóm tắt | Người dùng | Trung bình | Hành động |
| FR-249 | Tìm kiếm Cài đặt Tóm tắt | Tìm kiếm/Lọc danh sách cài đặt tóm tắt | Người dùng | Trung bình | Hành động |
| FR-250 | Tạo Cấu hình Đẩy Web | Tạo mới cấu hình đẩy web | Người dùng | Cao | Hành động |
| FR-251 | Xem Cấu hình Đẩy Web | Đọc chi tiết cấu hình đẩy web | Người dùng | Trung bình | Hành động |
| FR-252 | Cập nhật Cấu hình Đẩy Web | Chỉnh sửa cấu hình đẩy web hiện có | Người dùng | Trung bình | Hành động |
| FR-253 | Xóa Cấu hình Đẩy Web | Xóa cấu hình đẩy web | Người dùng | Trung bình | Hành động |
| FR-254 | Tìm kiếm Cấu hình Đẩy Web | Tìm kiếm/Lọc danh sách cấu hình đẩy web | Người dùng | Trung bình | Hành động |

### Cổng Quản trị
| ID | Tên | Mô tả | Tác nhân | Ưu tiên | Loại |
|---|---|---|---|---|---|
| FR-255 | Tạo Quản lý Khách thuê | Tạo mới quản lý khách thuê | Người dùng | Cao | Hành động |
| FR-256 | Xem Quản lý Khách thuê | Đọc chi tiết quản lý khách thuê | Người dùng | Trung bình | Hành động |
| FR-257 | Cập nhật Quản lý Khách thuê | Chỉnh sửa quản lý khách thuê hiện có | Người dùng | Trung bình | Hành động |
| FR-258 | Xóa Quản lý Khách thuê | Xóa quản lý khách thuê | Người dùng | Trung bình | Hành động |
| FR-259 | Tìm kiếm Quản lý Khách thuê | Tìm kiếm/Lọc danh sách quản lý khách thuê | Người dùng | Trung bình | Hành động |
| FR-260 | Tạo Cài đặt Hệ thống Toàn cầu | Tạo mới cài đặt hệ thống toàn cầu | Người dùng | Cao | Hành động |
| FR-261 | Xem Cài đặt Hệ thống Toàn cầu | Đọc chi tiết cài đặt hệ thống toàn cầu | Người dùng | Trung bình | Hành động |
| FR-262 | Cập nhật Cài đặt Hệ thống Toàn cầu | Chỉnh sửa cài đặt hệ thống toàn cầu hiện có | Người dùng | Trung bình | Hành động |
| FR-263 | Xóa Cài đặt Hệ thống Toàn cầu | Xóa cài đặt hệ thống toàn cầu | Người dùng | Trung bình | Hành động |
| FR-264 | Tìm kiếm Cài đặt Hệ thống Toàn cầu | Tìm kiếm/Lọc danh sách cài đặt hệ thống | Người dùng | Trung bình | Hành động |
| FR-265 | Tạo Cờ Tính năng | Tạo mới cờ tính năng (Feature Flags) | Người dùng | Cao | Hành động |
| FR-266 | Xem Cờ Tính năng | Đọc chi tiết cờ tính năng | Người dùng | Trung bình | Hành động |
| FR-267 | Cập nhật Cờ Tính năng | Chỉnh sửa cờ tính năng hiện có | Người dùng | Trung bình | Hành động |
| FR-268 | Xóa Cờ Tính năng | Xóa cờ tính năng | Người dùng | Trung bình | Hành động |
| FR-269 | Tìm kiếm Cờ Tính năng | Tìm kiếm/Lọc danh sách cờ tính năng | Người dùng | Trung bình | Hành động |
| FR-270 | Tạo Ngưỡng Mô hình | Tạo mới ngưỡng mô hình | Người dùng | Cao | Hành động |
| FR-271 | Xem Ngưỡng Mô hình | Đọc chi tiết ngưỡng mô hình | Người dùng | Trung bình | Hành động |
| FR-272 | Cập nhật Ngưỡng Mô hình | Chỉnh sửa ngưỡng mô hình hiện có | Người dùng | Trung bình | Hành động |
| FR-273 | Xóa Ngưỡng Mô hình | Xóa ngưỡng mô hình | Người dùng | Trung bình | Hành động |
| FR-274 | Tìm kiếm Ngưỡng Mô hình | Tìm kiếm/Lọc danh sách ngưỡng mô hình | Người dùng | Trung bình | Hành động |
| FR-275 | Tạo Yêu cầu Hỗ trợ | Tạo mới yêu cầu hỗ trợ (Support Tickets) | Người dùng | Cao | Hành động |
| FR-276 | Xem Yêu cầu Hỗ trợ | Đọc chi tiết yêu cầu hỗ trợ | Người dùng | Trung bình | Hành động |
| FR-277 | Cập nhật Yêu cầu Hỗ trợ | Chỉnh sửa yêu cầu hỗ trợ hiện có | Người dùng | Trung bình | Hành động |
| FR-278 | Xóa Yêu cầu Hỗ trợ | Xóa yêu cầu hỗ trợ | Người dùng | Trung bình | Hành động |
| FR-279 | Tìm kiếm Yêu cầu Hỗ trợ | Tìm kiếm/Lọc danh sách yêu cầu hỗ trợ | Người dùng | Trung bình | Hành động |
| FR-280 | Tạo Mạo danh Người dùng | Tạo mới mạo danh người dùng (User Impersonation) | Người dùng | Cao | Hành động |
| FR-281 | Xem Mạo danh Người dùng | Đọc chi tiết mạo danh người dùng | Người dùng | Trung bình | Hành động |
| FR-282 | Cập nhật Mạo danh Người dùng | Chỉnh sửa mạo danh người dùng hiện có | Người dùng | Trung bình | Hành động |
| FR-283 | Xóa Mạo danh Người dùng | Xóa mạo danh người dùng | Người dùng | Trung bình | Hành động |
| FR-284 | Tìm kiếm Mạo danh Người dùng | Tìm kiếm/Lọc danh sách mạo danh | Người dùng | Trung bình | Hành động |
| FR-285 | Tạo Xuất Dữ liệu | Tạo mới bản xuất dữ liệu | Người dùng | Cao | Hành động |
| FR-286 | Xem Xuất Dữ liệu | Đọc chi tiết xuất dữ liệu | Người dùng | Trung bình | Hành động |
| FR-287 | Cập nhật Xuất Dữ liệu | Chỉnh sửa bản xuất dữ liệu hiện có | Người dùng | Trung bình | Hành động |
| FR-288 | Xóa Xuất Dữ liệu | Xóa bản xuất dữ liệu | Người dùng | Trung bình | Hành động |
| FR-289 | Tìm kiếm Xuất Dữ liệu | Tìm kiếm/Lọc danh sách xuất dữ liệu | Người dùng | Trung bình | Hành động |

## 6. Ma trận Phụ thuộc Chức năng
| Mã Yêu cầu | Phụ thuộc Vào | Mô tả | Tác động Nghiệp vụ |
|---|---|---|---|
| FR-002 (Đăng nhập) | FR-001 (Đăng ký) | Không thể đăng nhập nếu không có tài khoản | Cao - Rào cản xác thực |
| FR-005 (Phân tích CV) | FR-004 (Tải lên) | Không thể phân tích nếu không có tệp | Cực kỳ quan trọng - Tự động hóa cốt lõi |
| FR-010 (Xác minh ID) | FR-009 (Kiểm tra Hệ thống) | Phần cứng phải hoạt động trước khi xác minh | Cao - Tính toàn vẹn phỏng vấn |
| FR-011 (Cung cấp) | FR-007 (Mẫu) | Cần có câu hỏi để cung cấp | Cực kỳ quan trọng - Thực hiện phỏng vấn |
| FR-014 (Phiên âm) | FR-012 (Ghi âm/Ghi hình) | Cần ghi âm/ghi hình trước | Cực kỳ quan trọng - Đánh giá AI |
| FR-015 (Ngữ nghĩa) | FR-014 (Phiên âm) | Cần văn bản để phân tích | Cực kỳ quan trọng - Đánh giá AI |
| FR-017 (Chấm điểm) | FR-015, FR-016 | Cần các điểm thành phần | Cực kỳ quan trọng - Báo cáo |
| FR-019 (Lộ trình) | FR-018 (Khoảng trống) | Cần biết các khoảng trống để vẽ lộ trình | Trung bình - Nâng cao kỹ năng |

## 7. Ma trận Truy xuất Nguồn gốc Chức năng
| Yêu cầu Nghiệp vụ | Quy trình Nghiệp vụ | Yêu cầu Chức năng | Vai trò Người dùng | Ca Kiểm thử | Tiêu chí Chấp nhận |
|---|---|---|---|---|---|
| BRQ-01: Tự động Sàng lọc | BP-REC-01 | FR-005 (Phân tích CV) | Ứng viên | TC-005 | JSON khớp với lược đồ |
| BRQ-02: Phỏng vấn Từ xa | BP-INT-02 | FR-011 (Cung cấp) | Hệ thống | TC-011 | Câu hỏi phát rõ ràng |
| BRQ-03: Đánh giá Công bằng | BP-EVAL-01 | FR-017 (Chấm điểm) | Hệ thống | TC-017 | Bảng điểm được tạo |
| BRQ-04: Ngăn ngừa Gian lận | BP-SEC-01 | FR-013 (Chống Gian lận) | Hệ thống | TC-013 | Gắn cờ khi mất khuôn mặt |
| BRQ-05: Phát triển Tài năng | BP-DEV-01 | FR-019 (Lộ trình) | Ứng viên | TC-019 | Lộ trình khớp với kỹ năng yếu |

## 8. Ánh xạ Quy tắc Nghiệp vụ Chức năng
| Quy tắc Nghiệp vụ | Yêu cầu Chức năng liên quan | Tác động | Ưu tiên |
|---|---|---|---|
| BR-01: Phải xác minh email trước phỏng vấn | FR-001, FR-002, FR-008 | Chặn truy cập nếu chưa xác minh | Cực kỳ quan trọng |
| BR-02: Kích thước CV không quá 10MB | FR-004 | Từ chối tải lên | Cao |
| BR-03: Tối đa 3 lần mất khuôn mặt/phiên | FR-013, FR-017 | Tự động đánh trượt ứng viên | Cực kỳ quan trọng |
| BR-04: Điểm AI < 40 sẽ tự động từ chối | FR-017, FR-045 | Trạng thái đường ống tự động | Cao |
| BR-05: Tín dụng bị trừ cho mỗi lần phỏng vấn | FR-008, FR-120 | Giảm số dư khách thuê | Cực kỳ quan trọng |

## 9. Yêu cầu Xử lý Lỗi
Hệ thống phải triển khai chức năng xử lý lỗi cho hơn 40 kịch bản sau:
| Mã Lỗi | Danh mục | Kịch bản | Phản hồi Chức năng | Ưu tiên |
|---|---|---|---|---|
| ERR-001 | Xác thực | Sai mật khẩu | Hiển thị 'Thông tin xác thực không hợp lệ', ghi log, tăng biến đếm khóa. | Cao |
| ERR-002 | Xác thực | Tài khoản bị khóa | Chặn đăng nhập, gửi email hướng dẫn mở khóa. | Cao |
| ERR-003 | Xác thực | Phiên hết hạn | Buộc đăng xuất, chuyển hướng đến đăng nhập kèm thông báo 'Phiên hết hạn'. | Cao |
| ERR-004 | Xác thực | Email chưa xác minh | Chặn đăng nhập, hiển thị liên kết gửi lại xác minh. | Cao |
| ERR-005 | Xác thực | MFA thất bại | Yêu cầu thử lại. Khóa sau 3 lần nhập sai OTP. | Cao |
| ERR-006 | Thanh toán | Không đủ tiền | Từ chối giao dịch, yêu cầu thẻ mới, giữ gói đăng ký ở trạng thái chờ. | Cao |
| ERR-007 | Thanh toán | Thẻ hết hạn | Từ chối giao dịch, thông báo cho nhà tuyển dụng về lỗi thanh toán. | Cao |
| ERR-008 | Thanh toán | Hết thời gian chờ cổng thanh toán | Thử lại ngầm 2 lần, sau đó hiển thị 'Hệ thống thanh toán đang bận, thử lại sau'. | Cao |
| ERR-009 | Thanh toán | Giao dịch trùng lặp | Kiểm tra Idempotency chặn tính phí, trả về trạng thái thành công của giao dịch gốc. | Cao |
| ERR-010 | Thanh toán | Tiền tệ không hợp lệ | Từ chối yêu cầu, mặc định sang USD hoặc tiền tệ địa phương được hỗ trợ. | Cao |
| ERR-011 | Phỏng vấn | Từ chối truy cập Micro | Chặn bắt đầu phỏng vấn. Hiển thị hướng dẫn cấp quyền trình duyệt. | Cao |
| ERR-012 | Phỏng vấn | Từ chối truy cập Camera | Chặn bắt đầu phỏng vấn. Hiển thị hướng dẫn cấp quyền trình duyệt. | Cao |
| ERR-013 | Phỏng vấn | Rớt mạng (Ứng viên) | Tạm dừng đồng hồ phỏng vấn. Hiển thị lớp phủ đang kết nối lại. Tự động tiếp tục khi có mạng. | Cao |
| ERR-014 | Phỏng vấn | Băng thông quá thấp | Giảm chất lượng video. Cảnh báo ứng viên. Nếu < mức tối thiểu, hủy phiên. | Cao |
| ERR-015 | Phỏng vấn | Công cụ AI quá tải | Chuyển sang xử lý bất đồng bộ. Hiển thị biểu tượng tải 'Đang tạo câu hỏi tiếp theo...'. | Cao |
| ERR-016 | Phỏng vấn | Phát hiện nhiều khuôn mặt | Ghi lại cờ chống gian lận, chụp khung hình có dấu thời gian, tiếp tục phỏng vấn. | Cao |
| ERR-017 | Phỏng vấn | Không phát hiện khuôn mặt | Tạm dừng phỏng vấn, hiển thị cảnh báo. Gắn cờ nếu vượt quá 5 giây. | Cao |
| ERR-018 | Phỏng vấn | Giọng nói không nhận diện được | Hiển thị lời nhắc 'Chúng tôi không nghe rõ bạn'. Cho phép thử lại 1 lần mỗi câu hỏi. | Cao |
| ERR-019 | Phỏng vấn | Đổi tab / Mất tiêu điểm | Ghi lại cờ chống gian lận. Hiển thị lớp phủ cảnh báo khi quay lại. | Cao |
| ERR-020 | Phỏng vấn | Phần cứng thay đổi giữa phiên | Tạm dừng phỏng vấn. Chạy lại kiểm tra sẵn sàng hệ thống. | Cao |
| ERR-021 | CV | Kích thước tệp vượt quá giới hạn | Từ chối tải lên. Hiển thị 'Kích thước tệp tối đa là 10MB'. | Cao |
| ERR-022 | CV | Loại tệp không được hỗ trợ | Từ chối tải lên. Hiển thị 'Chỉ hỗ trợ PDF và DOCX'. | Cao |
| ERR-023 | CV | PDF có mật khẩu bảo vệ | Từ chối phân tích. Yêu cầu ứng viên tải lên phiên bản đã mở khóa. | Cao |
| ERR-024 | CV | Tệp bị hỏng | Từ chối phân tích. Hiển thị 'Tệp không thể đọc được hoặc bị hỏng'. | Cao |
| ERR-025 | CV | PDF chỉ chứa hình ảnh (Không có văn bản OCR) | Chạy quy trình dự phòng OCR. Nếu thất bại, gắn cờ để nhập liệu thủ công. | Cao |
| ERR-026 | Danh tính | Tài liệu ID bị mờ | Từ chối xác minh. Yêu cầu chụp lại ảnh. | Cao |
| ERR-027 | Danh tính | Tên không khớp trên ID | Gắn cờ để nhà tuyển dụng xem xét thủ công. Cho phép phỏng vấn tiếp tục có điều kiện. | Cao |
| ERR-028 | Danh tính | ID hết hạn | Từ chối xác minh. Yêu cầu giấy tờ tùy thân hợp lệ. | Cao |
| ERR-029 | Danh tính | Loại ID không được hỗ trợ | Từ chối xác minh. Liệt kê các tài liệu được hỗ trợ. | Cao |
| ERR-030 | Danh tính | Ảnh selfie không khớp | Gắn cờ rủi ro cao. Cảnh báo nhà tuyển dụng ngay sau khi phỏng vấn. | Cao |
| ERR-031 | Hệ thống | Hết thời gian chờ cơ sở dữ liệu | Trả về trang lỗi 500 nhẹ nhàng. Cảnh báo đội SRE. | Cao |
| ERR-032 | Hệ thống | Vượt quá giới hạn tốc độ (Rate limit) | Trả về lỗi 429. Hiển thị 'Quá nhiều yêu cầu. Vui lòng đợi'. | Cao |
| ERR-033 | Hệ thống | Thiếu trường bắt buộc | Ngăn gửi biểu mẫu. Đánh dấu trường màu đỏ. | Cao |
| ERR-034 | Hệ thống | Trùng email khi đăng ký | Hiển thị 'Email đã được sử dụng'. Đề xuất đặt lại mật khẩu. | Cao |
| ERR-035 | Hệ thống | Từ chối quyền truy cập | Trả về lỗi 403. Chuyển hướng đến bảng điều khiển khách thuê. | Cao |
| ERR-036 | Hệ thống | Phát hiện đăng nhập đồng thời | Vô hiệu hóa phiên cũ. Giữ phiên mới nhất hoạt động. | Cao |
| ERR-037 | Hệ thống | Chế độ bảo trì đang hoạt động | Chặn tất cả các yêu cầu POST. Hiển thị màn hình bảo trì. | Cao |
| ERR-038 | Hệ thống | Định dạng dữ liệu không hợp lệ | Từ chối đầu vào. Hiển thị yêu cầu định dạng cụ thể. | Cao |
| ERR-039 | AI | Công cụ phiên âm ngoại tuyến | Đưa âm thanh vào hàng đợi để xử lý sau. Thông báo cho ứng viên về sự chậm trễ. | Cao |
| ERR-040 | AI | Nội dung bị đánh dấu là độc hại | Chặn tạo phản hồi. Cảnh báo quản trị viên. Ghi lại dữ liệu đầu vào. | Cao |

## 10. Thông báo
Hệ thống yêu cầu các sự kiện thông báo chức năng sau:
| Loại Thông báo | Kích hoạt | Người nhận | Kênh | Mục đích Nghiệp vụ |
|---|---|---|---|---|
| Xác minh Tài khoản | Đăng ký thành công | Ứng viên | Email | Xác thực danh tính người dùng |
| Đặt lại Mật khẩu | Người dùng yêu cầu đặt lại | Tất cả Người dùng | Email | Khôi phục tài khoản |
| Lời mời Phỏng vấn | Được thêm vào chiến dịch | Ứng viên | Email, SMS | Đưa ứng viên vào đường ống |
| Nhắc nhở Phỏng vấn | 24 giờ trước thời hạn | Ứng viên | Email, Đẩy (Push) | Giảm tỷ lệ không tham gia |
| Hoàn thành Phỏng vấn | Phiên được gửi | Ứng viên | Email | Ghi nhận việc hoàn thành |
| Đã có Đánh giá | Chấm điểm AI kết thúc | Nhà tuyển dụng | Email, Trong Ứng dụng | Thúc đẩy hành động của nhà tuyển dụng |
| Đã có Lộ trình | Khoảng trống kỹ năng được phân tích | Ứng viên | Email, Trong Ứng dụng | Gắn kết quá trình học tập của ứng viên |
| Thanh toán Thành công | Đã tính phí thẻ | Nhà tuyển dụng | Email | Cung cấp biên lai |
| Cảnh báo Tín dụng Thấp | Số dư < 10% | Nhà tuyển dụng | Email, Trong Ứng dụng | Ngăn chặn gián đoạn dịch vụ |
| Cảnh báo Chống Gian lận | Gắn cờ rủi ro cao | Nhà tuyển dụng | Trong Ứng dụng | Đảm bảo tính toàn vẹn của phỏng vấn |
| Bảo trì Hệ thống | Quản trị viên lên lịch downtime | Tất cả Người dùng | Banner Ứng dụng | Quản lý kỳ vọng của người dùng |
| Cập nhật Yêu cầu Hỗ trợ | Nhân viên hỗ trợ trả lời | Người dùng | Email | Luồng hỗ trợ khách hàng |

## 11. Báo cáo
| Tên Báo cáo | Mục đích | Đối tượng | Đầu vào | Đầu ra | Giá trị Nghiệp vụ |
|---|---|---|---|---|---|
| Bảng điểm Ứng viên | Chi tiết kết quả phỏng vấn | Nhà tuyển dụng | Điểm AI, Bản phiên âm | Tóm tắt PDF, Biểu đồ | Hỗ trợ ra quyết định |
| Phân tích Chiến dịch | Theo dõi chuyển đổi phễu | Nhà tuyển dụng | Dữ liệu đường ống | Tỷ lệ rớt, Thời gian tuyển dụng | Tối ưu hóa quy trình |
| Báo cáo Khoảng trống Kỹ năng | Xác định điểm yếu của nhóm | Nhà tuyển dụng | Điểm công nghệ tổng hợp | Đồ thị xu hướng | Lập kế hoạch đào tạo |
| Thanh toán & Sử dụng | Theo dõi tiêu thụ tín dụng | Nhà tuyển dụng | Nhật ký giao dịch | Mức sử dụng vs Chi phí | Kiểm soát tài chính |
| Tần suất Sử dụng Nền tảng | Theo dõi sức khỏe toàn hệ thống | Quản trị viên | Số liệu phiên | DAU, Số lượng phỏng vấn | Lập kế hoạch năng lực |
| Tiến độ Học tập | Theo dõi việc nâng cao kỹ năng | Ứng viên | Hoàn thành khóa học | Thanh tiến độ, Chứng chỉ | Gắn kết ứng viên |
| Đa dạng & Công bằng | Kiểm toán độ lệch của AI | Quản trị viên, Nhà tuyển dụng | Nhân khẩu học, Điểm số | Chỉ số tác động chênh lệch | Tuân thủ |

## 12. Chức năng Tìm kiếm & Lọc
Hệ thống phải cung cấp khả năng tìm kiếm, lọc và sắp xếp toàn diện trên các thực thể:
### Tìm kiếm Ứng viên (Góc nhìn Nhà tuyển dụng)
- **Tìm kiếm:** Tìm kiếm toàn văn trên Tên, Email, Kỹ năng, Văn bản sơ yếu lý lịch.
- **Bộ lọc:** Trạng thái (Đã mời, Đã hoàn thành, Đã chấm điểm), Khoảng Điểm AI (VD: >80), % Khớp kỹ năng, Ngày nộp đơn.
- **Sắp xếp:** Điểm AI (Cao đến Thấp), Ngày nộp đơn (Mới nhất trước).
- **Phân trang:** 20, 50, 100 mục mỗi trang.
- **Xuất dữ liệu:** Xuất CSV, Excel của chế độ xem đã lọc hiện tại.

### Tìm kiếm Chiến dịch
- **Tìm kiếm:** Tên Chiến dịch, ID Yêu cầu.
- **Bộ lọc:** Trạng thái (Đang hoạt động, Bản nháp, Đã đóng), Phòng ban, Người tạo.

### Tìm kiếm Học tập (Góc nhìn Ứng viên)
- **Tìm kiếm:** Tên khóa học, Chủ đề.
- **Bộ lọc:** Độ khó (Người mới bắt đầu, Trung cấp, Nâng cao), Định dạng (Video, Bài viết), Thời lượng.

## 13. Quy tắc Xác thực Dữ liệu
Các quy tắc xác thực chức năng được áp dụng trên toàn cầu:
| Mã Quy tắc | Trường/Thực thể | Quy tắc Xác thực | Thông báo Lỗi |
|---|---|---|---|
| VR-001 | Định dạng Email | Biểu thức chính quy chuẩn (user@domain.com) | Định dạng email không hợp lệ |
| VR-002 | Độ phức tạp Mật khẩu | Tối thiểu 8 ký tự, 1 Chữ hoa, 1 Số, 1 Ký tự đặc biệt | Mật khẩu không đáp ứng yêu cầu độ phức tạp |
| VR-003 | Tên | Tối thiểu 2, Tối đa 100 ký tự, không có ký tự đặc biệt | Tên là bắt buộc và phải hợp lệ |
| VR-004 | Điện thoại | Định dạng quốc tế E.164 | Định dạng số điện thoại không hợp lệ |
| VR-005 | Ngày sinh (DOB) | Phải > 16 tuổi trong quá khứ | Phải từ 16 tuổi trở lên |
| VR-006 | Kích thước CV | Tối đa 10 MB | Tệp vượt quá giới hạn 10MB |
| VR-007 | Loại CV | Loại MIME application/pdf, ms-word | Chỉ hỗ trợ PDF và DOCX |
| VR-008 | Giới hạn Thời gian Phỏng vấn | Từ 5 đến 120 phút | Giới hạn thời gian phải từ 5 đến 120 phút |
| VR-009 | Mua Tín dụng | Số nguyên > 0 | Phải mua ít nhất 1 tín dụng |
| VR-010 | Thẻ Tín dụng | Kiểm tra thuật toán Luhn | Số thẻ tín dụng không hợp lệ |
| VR-011 | Ngày hết hạn | MM/YY trong tương lai | Thẻ đã hết hạn |
| VR-012 | CVV | 3 hoặc 4 chữ số | CVV không hợp lệ |
| VR-013 | Truy vấn Tìm kiếm | Vô hiệu hóa chèn SQL / XSS | Ký tự tìm kiếm không hợp lệ |
| VR-014 | Định dạng URL | URI HTTP/HTTPS hợp lệ | URL không hợp lệ |
| VR-015 | Câu hỏi Tùy chỉnh | Tối thiểu 10 ký tự, Tối đa 1000 ký tự | Câu hỏi phải dài từ 10 đến 1000 ký tự |


## 14. KPI Chức năng
Hành vi hệ thống phải hỗ trợ về mặt chức năng cho việc đo lường các Chỉ số Hiệu suất Chính (KPI) sau:
| Mã KPI | Số liệu | Phương pháp Đo lường | Giá trị Mục tiêu |
|---|---|---|---|
| KPI-001 | Tỷ lệ Chuyển đổi Đăng ký | Tài khoản thành công / Số lượt truy cập trang đích | > 40% |
| KPI-002 | Tỷ lệ Thành công Phân tích CV | Lần phân tích thành công / Tổng số lần tải lên | > 95% |
| KPI-003 | Tỷ lệ Hoàn thành Phỏng vấn | Số phiên hoàn thành / Số lời mời đã gửi | > 75% |
| KPI-004 | Tỷ lệ Bỏ dở (Kiểm tra Kỹ thuật) | Bỏ dở tại khâu kiểm tra kỹ thuật / Tổng số lần bắt đầu | < 5% |
| KPI-005 | Thời gian Hoàn tất Chấm điểm AI | Thời gian từ lúc tải lên đến khi có bảng điểm | < 3 phút |
| KPI-006 | Tỷ lệ Dương tính Giả Chống Gian lận | Số cờ bị lật ngược / Tổng số cờ cảnh báo | < 10% |
| KPI-007 | Tỷ lệ Thành công Thanh toán | Số giao dịch được chấp thuận / Tổng số lần thử | > 98% |
| KPI-008 | Tỷ lệ Gắn kết Học tập | Số lộ trình đã bắt đầu / Số lộ trình được tạo | > 30% |
| KPI-009 | Việc áp dụng của Nhà tuyển dụng | Số chiến dịch đang hoạt động / Tổng số khách thuê đang hoạt động | > 2 mỗi tháng |
| KPI-010 | Nhận thức về Thời gian Hoạt động API | Số lệnh gọi API chức năng thành công / Tổng số | > 99.9% |


## 15. Ràng buộc Chức năng
Hệ thống bị ràng buộc bởi các ràng buộc chức năng sau:
1. **Hỗ trợ Trình duyệt:** Chức năng công cụ phỏng vấn chỉ được đảm bảo trên các trình duyệt hiện đại dựa trên Chromium (Chrome, Edge) và Safari do phụ thuộc vào WebRTC.
2. **Một Phỏng vấn Đang diễn ra:** Ứng viên chỉ có thể thực hiện một phiên phỏng vấn tại một thời điểm để ngăn chặn lỗi trạng thái đồng thời.
3. **Một Lộ trình Đang hoạt động:** Ứng viên bị giới hạn một lộ trình học tập đang hoạt động tại một thời điểm để duy trì sự tập trung.
4. **Thanh toán Trước Phân tích Cao cấp:** Các báo cáo cao cấp (VD: Thông tin sâu về Tính cách) bị khóa về mặt chức năng cho đến khi trừ đủ số tín dụng.
5. **Thời lượng Phỏng vấn Tối đa:** Giới hạn cứng là 120 phút cho mỗi phiên phỏng vấn để quản lý chi phí lưu trữ và xử lý AI.
6. **Ràng buộc Độ phân giải Video:** Video bị giới hạn chức năng ở độ phân giải 720p để tối ưu hóa băng thông.
7. **Ràng buộc Ngôn ngữ:** Chức năng đánh giá AI và chuyển đổi giọng nói thành văn bản hiện tại bị giới hạn ở tiếng Anh.

## 16. Cải tiến Chức năng trong Tương lai
Kiến trúc hệ thống và phạm vi chức năng hiện tại được thiết kế để dần hỗ trợ các tính năng trong lộ trình sau:
- **Ứng dụng Di động Native:** Mở rộng chức năng thực hiện phỏng vấn sang iOS và Android.
- **Chế độ Phỏng vấn Trực tiếp với Con người:** Mô-đun chức năng cho phép nhà tuyển dụng tham gia phiên WebRTC một cách linh hoạt.
- **Tích hợp ATS:** Đồng bộ hóa hai chiều với Workday, Greenhouse và Lever.
- **Tích hợp Lịch:** Đồng bộ hóa Outlook/Google Calendar để lên lịch phỏng vấn trực tiếp.
- **Cố vấn AI Tương tác:** Giao diện dựa trên trò chuyện để ứng viên thực hành trực tiếp trước khi đánh giá chính thức.
- **Trò chơi hóa & Bảng Xếp hạng (Gamification & Leaderboards):** Logic chức năng về điểm và huy hiệu trong Trung tâm Học tập.
- **Mở rộng SSO Doanh nghiệp:** Bổ sung các ánh xạ chức năng mạnh mẽ cho các cấu trúc Active Directory doanh nghiệp phức tạp.
- **Quyền truy cập API Công khai:** Cổng API chức năng dành cho khách hàng doanh nghiệp để xây dựng các đường ống tùy chỉnh.

## 17. Tóm tắt
Đặc tả Yêu cầu Chức năng (FRS) này cung cấp một bản thiết kế toàn diện về Hệ thống Phỏng vấn & Đánh giá Kỹ năng tích hợp AI (ISAS) dưới góc độ hành vi và nghiệp vụ. Bằng cách ghi lại chi tiết hơn 150 khả năng chức năng, hơn 40 kịch bản lỗi và các quy tắc xác thực mạnh mẽ, tài liệu này đóng vai trò là cơ sở chức năng tuyệt đối cho các nhóm kỹ thuật và QA.

Hệ thống được thiết kế để có khả năng mở rộng cao, cung cấp tính năng quản lý nhà tuyển dụng đa khách thuê (multi-tenant) mạnh mẽ, đồng thời duy trì trải nghiệm liền mạch, dễ tiếp cận và tự động cho ứng viên. Việc tuân thủ nghiêm ngặt khả năng truy xuất nguồn gốc (từ Yêu cầu Nghiệp vụ BR đến Yêu cầu Chức năng FR) đảm bảo rằng mỗi tính năng chức năng đều mang lại giá trị nghiệp vụ trực tiếp như được định nghĩa trong các mục tiêu chiến lược của dự án.