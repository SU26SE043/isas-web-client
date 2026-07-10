# Đặc tả Luồng Người dùng [cite: 1]

## 1. Mục đích Tài liệu [cite: 1]

**Mục đích của Luồng Người dùng** [cite: 1]
Đặc tả Luồng Người dùng định nghĩa các hành trình người dùng toàn trình (end-to-end) trong Hệ thống Đánh giá Kỹ năng & Phỏng vấn bằng AI (ISAS) [cite: 1]. Tài liệu này phác thảo cách các chân dung người dùng khác nhau tương tác với hệ thống để đạt được các mục tiêu kinh doanh của họ, nêu chi tiết các tương tác từng bước, các điểm quyết định và phản hồi của hệ thống mà không quy định bố cục giao diện người dùng cụ thể [cite: 1].

**Mối quan hệ với BRD** [cite: 1]
Tài liệu này chuyển đổi các mục tiêu kinh doanh và yêu cầu cấp cao được thiết lập trong Tài liệu Yêu cầu Nghiệp vụ (BRD) thành các mô hình tương tác lấy con người làm trung tâm và mang tính thực tiễn [cite: 1].

**Mối quan hệ với Quy trình Nghiệp vụ** [cite: 1]
Luồng người dùng đại diện cho việc thực thi hệ thống của các Mô hình Quy trình Nghiệp vụ (BPMN) [cite: 1]. Trong khi các quy trình nghiệp vụ tập trung vào luồng công việc của tổ chức, thì luồng người dùng tập trung vào tương tác giữa người và máy tính cần thiết để thực thi các luồng công việc đó [cite: 1].

**Mối quan hệ với Yêu cầu Chức năng** [cite: 1]
Mỗi bước trong một luồng người dùng đều liên kết trực tiếp với một hoặc nhiều Yêu cầu Chức năng (FR) [cite: 1]. Các luồng người dùng cung cấp bối cảnh cho việc *tại sao* và *khi nào* một yêu cầu chức năng được gọi [cite: 1].

**Đối tượng Độc giả** [cite: 1]
- Chuyên viên Thiết kế UX/UI [cite: 1]
- Chuyên viên Phân tích Nghiệp vụ (Business Analysts) [cite: 1]
- Chủ sở hữu Sản phẩm & Quản lý Sản phẩm (Product Owners & Product Managers) [cite: 1]
- Đội ngũ Phát triển & Đảm bảo Chất lượng (QA) [cite: 1]
- Kiến trúc sư Giải pháp (Solution Architects) [cite: 1]

## 2. Chân dung Người dùng (User Personas) [cite: 1]

| ID Chân dung | Chân dung | Mô tả | Mục tiêu | Vấn đề Khó khăn (Pain Points) | Nhiệm vụ Chính | Tiêu chí Thành công |
|---|---|---|---|---|---|---|
| PR-01 | Khách | Khách truy cập chưa xác thực đang khám phá ISAS. [cite: 1] | Hiểu giá trị hệ thống; xem các chiến dịch công khai; đăng ký. [cite: 1] | Thiếu hiểu biết về đánh giá AI; giá cả không rõ ràng. [cite: 1] | Duyệt các trang công khai; Đăng ký. [cite: 1] | Tỷ lệ chuyển đổi đăng ký thành công. [cite: 1] |
| PR-02 | Ứng viên | Người tìm việc hoặc chuyên gia đang đánh giá kỹ năng. [cite: 1] | Thực hiện phỏng vấn AI; nhận phản hồi có tính thực tiễn; được tuyển dụng. [cite: 1] | Lo lắng về phỏng vấn bằng AI; các vấn đề thiết lập kỹ thuật. [cite: 1] | Hoàn thiện hồ sơ; làm bài phỏng vấn; xem báo cáo. [cite: 1] | Hoàn thành phỏng vấn và nhận thức phản hồi tích cực. [cite: 1] |
| PR-03 | Quản trị viên Nhà tuyển dụng | Chủ tài khoản chính của một doanh nghiệp. [cite: 1] | Quản lý gói đăng ký; giám sát toàn bộ hoạt động tuyển dụng. [cite: 1] | Phức tạp trong thanh toán; thiếu tầm nhìn toàn diện. [cite: 1] | Mua gói dịch vụ; quản lý vai trò trong nhóm; xem xét ROI. [cite: 1] | Sử dụng ngân sách hiệu quả và ROI tuyển dụng cao. [cite: 1] |
| PR-04 | Chuyên viên Tuyển dụng | Người dùng vận hành tạo các chiến dịch. [cite: 1] | Tìm kiếm ứng viên nhanh chóng; lọc các nhân tài hàng đầu. [cite: 1] | Mất thời gian sàng lọc CV không đạt yêu cầu; chu kỳ tuyển dụng chậm. [cite: 1] | Tạo chiến dịch; mời ứng viên; chọn lọc danh sách ngắn (shortlist). [cite: 1] | Giảm 40% thời gian tuyển dụng. [cite: 1] |
| PR-05 | Quản lý Tuyển dụng | Người ra quyết định cho một vai trò cụ thể. [cite: 1] | Tìm ra người phù hợp nhất về kỹ thuật; xem xét các thông tin chi tiết từ AI. [cite: 1] | Phỏng vấn mất quá nhiều thời gian; đánh giá không nhất quán. [cite: 1] | Đọc báo cáo đánh giá AI; so sánh các ứng viên. [cite: 1] | Tuyển dụng thành công với tỷ lệ giữ chân nhân viên cao. [cite: 1] |
| PR-06 | Người phỏng vấn | Chuyên gia am hiểu lĩnh vực tham gia vào các vòng cuối. [cite: 1] | Xem các ghi chú sơ bộ của AI trước khi tương tác trực tiếp. [cite: 1] | Thiếu bối cảnh về các kỹ năng cơ bản của ứng viên. [cite: 1] | Xem lịch sử ứng viên và điểm số kỹ năng cụ thể. [cite: 1] | Tối ưu hóa trọng tâm của vòng phỏng vấn cuối. [cite: 1] |
| PR-07 | Hỗ trợ | Nhân viên chăm sóc khách hàng Cấp 1/Cấp 2. [cite: 1] | Giải quyết nhanh chóng các vấn đề của ứng viên/nhà tuyển dụng. [cite: 1] | Thiếu công cụ chẩn đoán lỗi kỹ thuật/AI. [cite: 1] | Xem các yêu cầu hỗ trợ (tickets); kiểm tra nhật ký phiên người dùng; leo thang sự cố. [cite: 1] | Tuân thủ SLA; điểm CSAT (Sự hài lòng của khách hàng) cao. [cite: 1] |
| PR-08 | Tài chính | Kiểm soát viên tài chính nội bộ. [cite: 1] | Đảm bảo ghi nhận doanh thu; kiểm toán thanh toán. [cite: 1] | Sự sai lệch giữa mức sử dụng và thanh toán. [cite: 1] | Xem bảng điều khiển tài chính; xuất nhật ký giao dịch. [cite: 1] | Độ chính xác đối soát đạt 100%. [cite: 1] |
| PR-09 | Quản trị viên | Người quản lý vận hành nội bộ ISAS. [cite: 1] | Kiểm duyệt nội dung; cấu hình các quy tắc hệ thống. [cite: 1] | Sự can thiệp thủ công vào các quy trình tự động. [cite: 1] | Quản lý người dùng; kiểm duyệt chiến dịch; thiết lập quy tắc. [cite: 1] | Đảm bảo thời gian hoạt động của hệ thống và hiệu quả vận hành. [cite: 1] |
| PR-10 | Quản trị viên Hệ thống | Chuyên gia CNTT/Hạ tầng. [cite: 1] | Duy trì sức khỏe hệ thống, bảo mật và tích hợp AI. [cite: 1] | Hệ thống ngừng hoạt động; giới hạn tốc độ API. [cite: 1] | Theo dõi nhật ký (logs); cấu hình cài đặt AI; quản lý bảo mật. [cite: 1] | Hệ thống sẵn sàng 99.99%. [cite: 1] |

## 3. Tổng quan Hành trình Người dùng [cite: 1]

### Hành trình của Khách [cite: 1]
Trang đích -> Khám phá Tính năng -> Bảng giá -> Đăng ký -> Bảng điều khiển Ứng viên/Nhà tuyển dụng. [cite: 1]

### Hành trình của Ứng viên [cite: 1]
Làm quen hệ thống (Onboarding) -> Tải lên Hồ sơ & CV -> AI phân tích CV -> Khám phá Chiến dịch -> Kiểm tra Hệ thống/Thiết bị -> Thực hiện Phỏng vấn AI -> Xuất Báo cáo -> Lộ trình Học tập & Thực hành -> Chứng nhận Kỹ năng. [cite: 1]

### Hành trình của Nhà tuyển dụng [cite: 1]
Đăng ký & Xác minh -> Mua Gói dịch vụ -> Tạo Chiến dịch -> Mời Ứng viên -> Giám sát Thời gian thực -> Xem Báo cáo AI -> Lọc & Tuyển dụng -> Quản lý Nhóm & Thanh toán. [cite: 1]

### Hành trình của Quản trị viên [cite: 1]
Xem Bảng điều khiển -> Kiểm duyệt Người dùng & Chiến dịch -> Xử lý Sự cố Leo thang -> Cấu hình Hệ thống -> Kiểm toán & Báo cáo. [cite: 1]

### Hành trình Hỗ trợ [cite: 1]
Nhận Phiếu hỗ trợ (Ticket) -> Trích xuất Bối cảnh Người dùng -> Chẩn đoán Vấn đề (VD: Lỗi video) -> Đưa ra Giải pháp -> Giao tiếp -> Đóng Phiếu. [cite: 1]

## 4. Luồng Người dùng của Ứng viên [cite: 1]

- UF-001 Đăng ký [cite: 1]
- UF-002 Đăng nhập [cite: 1]
- UF-003 Quên Mật khẩu [cite: 1]
- UF-004 Xác minh Email [cite: 1]
- UF-005 Hoàn thiện Hồ sơ [cite: 1]
- UF-006 Tải CV lên [cite: 1]
- UF-007 AI Phân tích CV [cite: 1]
- UF-008 Duyệt các Chiến dịch [cite: 1]
- UF-009 Chi tiết Chiến dịch [cite: 1]
- UF-010 Mua Tín dụng / Gói đăng ký [cite: 1]
- UF-011 Bắt đầu Phỏng vấn [cite: 1]
- UF-012 Xác minh Danh tính [cite: 1]
- UF-013 Kiểm tra Thiết bị [cite: 1]
- UF-014 Phỏng vấn AI [cite: 1]
- UF-015 Tạm dừng Phỏng vấn [cite: 1]
- UF-016 Tiếp tục Phỏng vấn [cite: 1]
- UF-017 Hoàn thành Phỏng vấn [cite: 1]
- UF-018 Xem Báo cáo AI [cite: 1]
- UF-019 So sánh Kết quả [cite: 1]
- UF-020 Tạo Lộ trình Học tập [cite: 1]
- UF-021 Trung tâm Học tập [cite: 1]
- UF-022 Phiên Thực hành [cite: 1]
- UF-023 Theo dõi Tiến độ [cite: 1]
- UF-024 Nhận Chứng chỉ [cite: 1]
- UF-025 Tải Chứng chỉ [cite: 1]
- UF-026 Xem Lịch sử [cite: 1]
- UF-027 Quản lý Hồ sơ [cite: 1]
- UF-028 Thông báo [cite: 1]
- UF-029 Liên hệ Hỗ trợ [cite: 1]
- UF-030 Đăng xuất [cite: 1]

## 5. Luồng Người dùng của Nhà tuyển dụng [cite: 1]

- UF-101 Đăng ký Nhà tuyển dụng [cite: 1]
- UF-102 Xác minh Công ty [cite: 1]
- UF-103 Tạo Chiến dịch [cite: 1]
- UF-104 Chỉnh sửa Chiến dịch [cite: 1]
- UF-105 Xuất bản Chiến dịch [cite: 1]
- UF-106 Mời Ứng viên [cite: 1]
- UF-107 Xem Báo cáo AI [cite: 1]
- UF-108 Quản lý Ứng viên [cite: 1]
- UF-109 Mua Gói dịch vụ [cite: 1]
- UF-110 Bảng điều khiển Phân tích [cite: 1]
- UF-111 Đóng Chiến dịch [cite: 1]
- UF-112 Xuất Báo cáo [cite: 1]
- UF-113 Quản lý Nhóm [cite: 1]
- UF-114 Thanh toán [cite: 1]
- UF-115 Thông báo [cite: 1]

## 6. Luồng Người dùng của Quản trị viên [cite: 1]

- UF-201 Quản lý Người dùng [cite: 1]
- UF-202 Phân quyền Vai trò [cite: 1]
- UF-203 Quản lý Quyền [cite: 1]
- UF-204 Kiểm duyệt Chiến dịch [cite: 1]
- UF-205 Cấu hình Hệ thống [cite: 1]
- UF-206 Cấu hình AI [cite: 1]
- UF-207 Quản lý Nội dung [cite: 1]
- UF-208 Quản lý Học tập [cite: 1]
- UF-209 Mẫu Thông báo [cite: 1]
- UF-210 Nhật ký Kiểm toán (Audit Logs) [cite: 1]
- UF-211 Bảng điều khiển Phân tích [cite: 1]
- UF-212 Quản lý Hỗ trợ [cite: 1]
- UF-213 Bảo trì Hệ thống [cite: 1]

## 7. Luồng Người dùng Hỗ trợ [cite: 1]

- UF-301 Xem Phiếu Hỗ trợ (Tickets) [cite: 1]
- UF-302 Phân công Phiếu Hỗ trợ [cite: 1]
- UF-303 Giải quyết Phiếu Hỗ trợ [cite: 1]
- UF-304 Leo thang Sự cố [cite: 1]
- UF-305 Cơ sở Kiến thức [cite: 1]
- UF-306 Giao tiếp với Khách hàng [cite: 1]
- UF-307 Theo dõi Sự cố [cite: 1]

## 8. Đặc tả Luồng Chi tiết [cite: 1]

### Đặc tả Luồng: UF-014 Phỏng vấn AI [cite: 1]

**ID Luồng**: UF-014 [cite: 1]
**Tên Luồng**: Thực thi Phỏng vấn AI [cite: 1]
**Chân dung Chính**: Ứng viên (PR-02) [cite: 1]
**Mục tiêu Kinh doanh**: Tiến hành đánh giá hành vi và kỹ thuật tự động, không thiên vị. [cite: 1]
**Trình kích hoạt (Trigger)**: Ứng viên nhấp vào 'Bắt đầu Đánh giá' sau khi hoàn thành UF-013 (Kiểm tra Thiết bị). [cite: 1]
**Điều kiện tiên quyết**: Người dùng đã được xác thực, xác minh, kiểm tra thiết bị đạt, chiến dịch đang hoạt động. [cite: 1]
**Điều kiện hậu quyết**: Dữ liệu phỏng vấn được thu thập, báo cáo AI được tạo, Trạng thái ứng viên được cập nhật. [cite: 1]
**Tiêu chí Thành công**: Ứng viên hoàn thành tất cả câu hỏi; AI phân tích và chấm điểm thành công các câu trả lời. [cite: 1]
**Mức độ Ưu tiên**: Thiết yếu (P0) [cite: 1]
**Quy trình Kinh doanh Liên quan**: BP-04 Thực thi Đánh giá [cite: 1]
**Yêu cầu Chức năng Liên quan**: FR-AI-01 đến FR-AI-15 [cite: 1]
**Quy tắc Kinh doanh Liên quan**: BR-INT-01 (Thời lượng tối đa 60 phút), BR-INT-02 (Giám sát đang hoạt động). [cite: 1]

## 9. Luồng Từng bước [cite: 1]

### Các bước của UF-014 [cite: 1]

| Bước | Chủ thể (Actor) | Hành động | Phản hồi của Hệ thống | Quyết định | Luồng Thay thế | Quy tắc Nghiệp vụ | Kết quả Mong đợi |
|---|---|---|---|---|---|---|---|
| 1 | Ứng viên | Nhấp 'Bắt đầu Đánh giá' [cite: 1] | Khởi tạo môi trường phỏng vấn, khóa tab trình duyệt. [cite: 1] | - | - | BR-INT-02 [cite: 1] | UI chuyển sang chế độ toàn màn hình. [cite: 1] |
| 2 | Hệ thống | AI thiết lập bối cảnh [cite: 1] | Truy xuất sơ đồ kỹ năng của chiến dịch và tạo lời chào mở đầu. [cite: 1] | - | - | FR-AI-01 [cite: 1] | Hình đại diện/Giọng nói chào mừng ứng viên. [cite: 1] |
| 3 | Ứng viên | Nghe/Đọc phần giới thiệu [cite: 1] | Kích hoạt đèn báo đang ghi âm. [cite: 1] | - | - | - | Ứng viên sẵn sàng cho Câu 1 (Q1). [cite: 1] |
| 4 | Hệ thống | Hỏi Câu 1 [cite: 1] | AI tổng hợp giọng nói cho Q1 dựa trên nội dung được tạo tự động. [cite: 1] | - | - | FR-AI-03 [cite: 1] | Q1 được trình bày bằng âm thanh và hình ảnh. [cite: 1] |
| 5 | Ứng viên | Trả lời Q1 bằng lời nói [cite: 1] | Ghi lại âm thanh/video, phiên mã giọng nói theo thời gian thực. [cite: 1] | - | UF-014-A1 (Im lặng) [cite: 1] | BR-INT-05 [cite: 1] | Bản chép lời (Transcript) được tạo. [cite: 1] |
| 6 | Hệ thống | Phân tích câu trả lời [cite: 1] | NLP đánh giá độ chính xác kỹ thuật, giọng điệu và từ khóa. [cite: 1] | Theo dõi? [cite: 1] | UF-014-A2 (Câu hỏi phụ) [cite: 1] | FR-AI-06 [cite: 1] | Điểm được lưu trữ nội bộ. [cite: 1] |
| 7 | Hệ thống | Tiếp tục vòng lặp [cite: 1] | Lặp lại các Bước 4-6 cho tất cả các kỹ năng được yêu cầu. [cite: 1] | Câu cuối? [cite: 1] | - | BR-INT-01 [cite: 1] | Tất cả kỹ năng đã được đánh giá. [cite: 1] |
| 8 | Hệ thống | Giám sát tính trung thực [cite: 1] | Liên tục kiểm tra ngầm theo dõi ánh mắt và tiếng ồn xung quanh. [cite: 1] | Vi phạm? [cite: 1] | EX-045 (Phát hiện gian lận) [cite: 1] | BR-PROC-01 [cite: 1] | Duy trì tính minh bạch cao. [cite: 1] |
| 9 | Ứng viên | Nhấp 'Hoàn thành' [cite: 1] | Dừng ghi âm, tải lên các gói dữ liệu cuối cùng. [cite: 1] | - | EX-015 (Lỗi mạng) [cite: 1] | - | Dữ liệu được bảo mật trên máy chủ. [cite: 1] |
| 10 | Hệ thống | Tính Điểm [cite: 1] | Tổng hợp tất cả điểm thành phần của AI vào báo cáo cuối cùng. [cite: 1] | - | - | FR-REP-01 [cite: 1] | Bắt đầu trạng thái xử lý. [cite: 1] |
| 11 | Hệ thống | Chuyển hướng người dùng [cite: 1] | Hiển thị trang 'Cảm ơn' và các bước tiếp theo. [cite: 1] | - | - | - | Luồng hoàn tất. [cite: 1] |

## 10. Điểm Quyết định [cite: 1]

| ID Quyết định | Điều kiện | Luồng Có (Yes) | Luồng Không (No) | Quy tắc Kinh doanh |
|---|---|---|---|---|
| DP-01 | Người dùng đã Xác thực? [cite: 1] | Tiếp tục đến Bảng điều khiển [cite: 1] | Chuyển hướng đến Đăng nhập [cite: 1] | BR-SEC-01 [cite: 1] |
| DP-02 | Email đã được Xác minh? [cite: 1] | Cho phép Truy cập Hồ sơ [cite: 1] | Yêu cầu Xác minh [cite: 1] | BR-SEC-02 [cite: 1] |
| DP-03 | Gói đăng ký đang Hoạt động? [cite: 1] | Cho phép Tạo Chiến dịch [cite: 1] | Chuyển hướng đến Bảng giá [cite: 1] | BR-PAY-01 [cite: 1] |
| DP-04 | Kiểm tra Thiết bị Đạt? [cite: 1] | Tiếp tục Kiểm tra Danh tính [cite: 1] | Hiển thị Hướng dẫn Khắc phục Sự cố [cite: 1] | BR-SYS-05 [cite: 1] |
| DP-05 | Danh tính đã được Xác minh? [cite: 1] | Tiếp tục Phỏng vấn [cite: 1] | Gắn cờ để Xem xét Thủ công [cite: 1] | BR-SEC-08 [cite: 1] |
| DP-06 | CV có khớp với Mô tả Công việc? (AI) [cite: 1] | Hiển thị Mức độ Phù hợp Cao [cite: 1] | Hiển thị Cảnh báo Phù hợp Thấp [cite: 1] | BR-AI-04 [cite: 1] |
| DP-07 | Ứng viên Đủ điều kiện nhận Chứng chỉ? [cite: 1] | Hiển thị Nút Chứng chỉ [cite: 1] | Hiển thị Lộ trình Học tập [cite: 1] | BR-CERT-01 [cite: 1] |
| DP-08 | AI có Phát hiện Gian lận? [cite: 1] | Chấm dứt / Gắn cờ Phiên [cite: 1] | Tiếp tục Phỏng vấn [cite: 1] | BR-PROC-03 [cite: 1] |
| DP-09 | Nhà tuyển dụng có Tín dụng? [cite: 1] | Gửi Lời mời [cite: 1] | Nhắc Yêu cầu Mua thêm [cite: 1] | BR-PAY-02 [cite: 1] |
| DP-10 | Đã quá Hạn chót Chiến dịch? [cite: 1] | Ẩn Chiến dịch [cite: 1] | Hiển thị Chiến dịch [cite: 1] | BR-CAMP-09 [cite: 1] |

## 11. Các Luồng Thay thế [cite: 1]

### UF-014-A1: Ứng viên Im lặng (Không phát hiện phản hồi) [cite: 1]
Nếu ứng viên không nói gì trong 15 giây, AI sẽ đưa ra lời nhắc: 'Tôi không nghe rõ lắm. Bạn có muốn tôi lặp lại câu hỏi không?' [cite: 1]. Nếu vẫn im lặng sau 15 giây nữa, AI chuyển sang câu hỏi tiếp theo và đánh dấu điểm của câu hỏi hiện tại là 0 [cite: 1].

### UF-014-A2: Câu hỏi Phụ Động [cite: 1]
Nếu ứng viên đưa ra câu trả lời không đầy đủ, AI sẽ tự động tạo một câu hỏi phụ (ví dụ: 'Bạn có thể nói rõ hơn về cách bạn tối ưu hóa truy vấn cơ sở dữ liệu không?') [cite: 1]. Điều này thêm một bước vào vòng lặp và làm tinh chỉnh điểm kỹ thuật [cite: 1].

### UF-103-A1: Lưu Chiến dịch thành Bản nháp [cite: 1]
Nhà tuyển dụng quyết định không xuất bản ngay lập tức [cite: 1]. Họ nhấp vào 'Lưu Bản nháp' [cite: 1]. Hệ thống bỏ qua các quy tắc xác thực đối với danh sách ứng viên bắt buộc và lưu lại trạng thái [cite: 1]. Trình kích hoạt: UF-104 Chỉnh sửa Chiến dịch để tiếp tục [cite: 1].

## 12. Các Luồng Ngoại lệ [cite: 1]

| ID Ngoại lệ | Kịch bản Ngoại lệ | Trình kích hoạt | Xử lý Hệ thống / Khôi phục | Chân dung Giải quyết |
|---|---|---|---|---|
| EX-01 | Thông tin xác thực không hợp lệ [cite: 1] | UF-002 | Hiển thị lỗi, tăng số lần thử không thành công. Khóa sau 5 lần. [cite: 1] | Ứng viên/Hỗ trợ [cite: 1] |
| EX-02 | Tài khoản bị khóa [cite: 1] | UF-002 | Hiển thị thông báo khóa, gửi email mở khóa. [cite: 1] | Ứng viên [cite: 1] |
| EX-03 | Liên kết Đặt lại Mật khẩu hết hạn [cite: 1] | UF-003 | Nhắc người dùng yêu cầu liên kết mới. [cite: 1] | Ứng viên [cite: 1] |
| EX-04 | Email đã tồn tại [cite: 1] | UF-001 | Đề xuất đăng nhập hoặc quên mật khẩu. [cite: 1] | Ứng viên [cite: 1] |
| EX-05 | Tệp CV quá lớn [cite: 1] | UF-006 | Từ chối tệp, hiển thị giới hạn kích thước (5MB). [cite: 1] | Ứng viên [cite: 1] |
| EX-06 | Định dạng CV không được hỗ trợ [cite: 1] | UF-006 | Từ chối tệp, liệt kê định dạng hỗ trợ (PDF, DOCX). [cite: 1] | Ứng viên [cite: 1] |
| EX-07 | AI Lỗi khi phân tích CV [cite: 1] | UF-007 | Chuyển sang nhập biểu mẫu thủ công. [cite: 1] | Ứng viên [cite: 1] |
| EX-08 | Thanh toán bị Ngân hàng từ chối [cite: 1] | UF-010 | Hiển thị lỗi cổng thanh toán, đề xuất thẻ khác. [cite: 1] | Nhà tuyển dụng [cite: 1] |
| EX-09 | Không đủ Tín dụng [cite: 1] | UF-106 | Chặn lời mời, chuyển hướng đến UF-109. [cite: 1] | Nhà tuyển dụng [cite: 1] |
| EX-10 | Trùng tên Chiến dịch [cite: 1] | UF-103 | Yêu cầu nhập tên duy nhất. [cite: 1] | Nhà tuyển dụng [cite: 1] |
| EX-11 | Không có Ứng viên nào được chọn [cite: 1] | UF-106 | Vô hiệu hóa nút 'Gửi Lời mời'. [cite: 1] | Nhà tuyển dụng [cite: 1] |
| EX-12 | Không phát hiện Webcam [cite: 1] | UF-013 | Dừng luồng, cung cấp hướng dẫn khắc phục sự cố thiết bị. [cite: 1] | Ứng viên [cite: 1] |
| EX-13 | Không phát hiện Micro [cite: 1] | UF-013 | Dừng luồng, cung cấp hướng dẫn khắc phục sự cố thiết bị. [cite: 1] | Ứng viên [cite: 1] |
| EX-14 | Băng thông không đủ [cite: 1] | UF-013 | Hiện cảnh báo, chặn phỏng vấn nếu < 1Mbps. [cite: 1] | Ứng viên [cite: 1] |
| EX-15 | Rớt mạng khi đang Phỏng vấn [cite: 1] | UF-014 | Tự động tạm dừng, lưu bộ đệm, hiển thị vòng quay kết nối lại. [cite: 1] | Hệ thống [cite: 1] |
| EX-16 | Trình duyệt bị lỗi (Crash) khi đang Phỏng vấn [cite: 1] | UF-014 | Lưu trạng thái trên máy chủ; cho phép tiếp tục qua UF-016. [cite: 1] | Ứng viên [cite: 1] |
| EX-17 | Xác minh ID bị mờ [cite: 1] | UF-012 | Yêu cầu chụp lại ảnh ID. [cite: 1] | Ứng viên [cite: 1] |
| EX-18 | Khuôn mặt không khớp [cite: 1] | UF-012 | Gắn cờ để nhân viên tuyển dụng duyệt thủ công, cho phép bắt đầu tạm thời. [cite: 1] | Ứng viên/Tuyển dụng [cite: 1] |
| EX-19 | Hết thời gian Chuyển giọng nói thành văn bản của AI [cite: 1] | UF-014 | Chuyển sang API dự phòng, thông báo cho quản trị hệ thống. [cite: 1] | Hệ thống [cite: 1] |
| EX-20 | Phát hiện nhiều khuôn mặt [cite: 1] | UF-014 | Đưa ra cảnh báo trên màn hình, ghi lại vi phạm. [cite: 1] | Hệ thống [cite: 1] |
| EX-21 | Người dùng rời khỏi màn hình [cite: 1] | UF-014 | Tạm dừng phỏng vấn, đưa ra cảnh báo. [cite: 1] | Ứng viên [cite: 1] |
| EX-22 | Phát hiện giọng nói trong nền [cite: 1] | UF-014 | Ghi lại sự kiện cho báo cáo, đưa ra cảnh báo hình ảnh. [cite: 1] | Hệ thống [cite: 1] |
| EX-23 | Hết thời gian Phiên (Do không hoạt động) [cite: 1] | Chung | Tự động đăng xuất, yêu cầu xác thực lại. [cite: 1] | Ứng viên/Nhà TD [cite: 1] |
| EX-24 | Lỗi ghi Cơ sở dữ liệu [cite: 1] | Hệ thống | Xếp hàng giao dịch, cảnh báo quản trị, hiển thị lỗi chung. [cite: 1] | Quản trị viên [cite: 1] |
| EX-25 | Dịch vụ AI không khả dụng [cite: 1] | UF-014 | Dừng nhẹ nhàng, thông báo ứng viên thử lại sau, cảnh báo IT. [cite: 1] | Quản trị viên [cite: 1] |
| EX-26 | Bị Từ chối Quyền của Vai trò [cite: 1] | Chung | Chuyển hướng đến bảng điều khiển, ghi lại truy cập trái phép. [cite: 1] | Hệ thống [cite: 1] |
| EX-27 | URL Chiến dịch không hợp lệ [cite: 1] | UF-008 | Hiển thị trang 404/Chiến dịch đã hết hạn. [cite: 1] | Ứng viên [cite: 1] |
| EX-28 | Tạo Chứng chỉ Không thành công [cite: 1] | UF-024 | Thêm vào hàng đợi thử lại, thông báo người dùng kiểm tra lại sau. [cite: 1] | Hệ thống [cite: 1] |
| EX-29 | Lỗi Xuất Video [cite: 1] | UF-107 | Chỉ hiển thị bản ghi văn bản, ghi lại lỗi video. [cite: 1] | Nhà tuyển dụng [cite: 1] |
| EX-30 | Dữ liệu xuất quá lớn [cite: 1] | UF-112 | Xử lý bất đồng bộ, gửi email khi hoàn tất. [cite: 1] | Nhà tuyển dụng [cite: 1] |
| EX-31 | Trình duyệt không được hỗ trợ [cite: 1] | UF-011 | Chặn truy cập, liệt kê trình duyệt hỗ trợ (Chrome, Edge). [cite: 1] | Ứng viên [cite: 1] |
| EX-32 | Trình chặn quảng cáo gây can thiệp [cite: 1] | UF-013 | Yêu cầu người dùng tắt trình chặn quảng cáo cho WebRTC. [cite: 1] | Ứng viên [cite: 1] |
| EX-33 | Bị từ chối chia sẻ màn hình [cite: 1] | UF-013 | Dừng luồng, giải thích yêu cầu cho mục đích giám sát. [cite: 1] | Ứng viên [cite: 1] |
| EX-34 | Ứng viên Từ chối AI [cite: 1] | UF-011 | Dừng luồng, thông báo cho nhà tuyển dụng về việc từ chối. [cite: 1] | Ứng viên [cite: 1] |
| EX-35 | Hết thời gian Tạo Báo cáo [cite: 1] | UF-018 | Hiển thị 'Đang xử lý', thông báo qua email khi hoàn tất. [cite: 1] | Hệ thống [cite: 1] |
| EX-36 | Mã giảm giá không hợp lệ [cite: 1] | UF-010 | Đánh dấu trường, hiển thị 'Mã không hợp lệ hoặc Hết hạn'. [cite: 1] | Nhà tuyển dụng [cite: 1] |
| EX-37 | Gói đăng ký hết hạn [cite: 1] | UF-103 | Chuyển hướng thanh toán, khóa tính năng tạo chiến dịch. [cite: 1] | Nhà tuyển dụng [cite: 1] |
| EX-38 | Đã đạt Số lượng người dùng tối đa [cite: 1] | UF-113 | Đề xuất nâng cấp lên cấp cao hơn. [cite: 1] | Nhà tuyển dụng [cite: 1] |
| EX-39 | Vượt quá Giới hạn tốc độ API [cite: 1] | Hệ thống | Hạn chế yêu cầu (Throttle), áp dụng thuật toán lùi lũy thừa. [cite: 1] | Hệ thống [cite: 1] |
| EX-40 | Gửi Phiếu hỗ trợ thất bại [cite: 1] | UF-029 | Lưu bản nháp cục bộ, nhắc dùng phương án gửi email thủ công dự phòng. [cite: 1] | Ứng viên [cite: 1] |
| EX-41 | Số điện thoại không hợp lệ [cite: 1] | UF-005 | Lỗi xác thực Regex, nhắc nhập đúng định dạng. [cite: 1] | Ứng viên [cite: 1] |
| EX-42 | Phát hiện Âm vang (Echo) [cite: 1] | UF-013 | Nhắc người dùng sử dụng tai nghe. [cite: 1] | Ứng viên [cite: 1] |
| EX-43 | Phát hiện Ánh sáng yếu [cite: 1] | UF-013 | Nhắc người dùng cải thiện ánh sáng phòng. [cite: 1] | Ứng viên [cite: 1] |
| EX-44 | Phát hiện VPN/Proxy [cite: 1] | UF-011 | Cảnh báo hoặc chặn dựa trên quy tắc giới hạn địa lý của nhà tuyển dụng. [cite: 1] | Ứng viên [cite: 1] |
| EX-45 | Độ tin cậy về Gian lận cao [cite: 1] | UF-014 | Tự động kết thúc phỏng vấn (Cấu hình bởi Nhà tuyển dụng). [cite: 1] | Hệ thống [cite: 1] |
| EX-46 | Người dùng Yêu cầu Xóa dữ liệu [cite: 1] | UF-027 | Khởi tạo quy trình xóa mềm trong thời gian chờ 30 ngày. [cite: 1] | Quản trị viên [cite: 1] |
| EX-47 | Tải tệp lên độc hại [cite: 1] | UF-006 | Cách ly tệp, cấm IP, thông báo cho SecOps. [cite: 1] | Quản trị Hệ thống [cite: 1] |
| EX-48 | Phát hiện Đăng nhập đồng thời [cite: 1] | UF-002 | Vô hiệu hóa phiên trước, bắt buộc đăng nhập mới. [cite: 1] | Hệ thống [cite: 1] |
| EX-49 | Thiếu Thông tin JD [cite: 1] | UF-103 | Ngăn AI trích xuất kỹ năng, nhắc nhập thủ công. [cite: 1] | Nhà tuyển dụng [cite: 1] |
| EX-50 | Đồng bộ ATS bên ngoài thất bại [cite: 1] | Hệ thống | Xếp hàng dữ liệu tải (payload), cảnh báo Quản trị viên Nhà TD. [cite: 1] | Nhà tuyển dụng [cite: 1] |

## 13. Các Luồng Tương tác Chéo giữa các Vai trò [cite: 1]

**Ứng viên ↔ Nhà tuyển dụng** [cite: 1]
Tương tác chính là bất đồng bộ [cite: 1]. Nhà tuyển dụng tạo Chiến dịch (UF-103) và Mời Ứng viên (UF-106) [cite: 1]. Ứng viên nhận được thông báo, hoàn thành Phỏng vấn AI (UF-014) [cite: 1]. Nhà tuyển dụng xem lại Báo cáo AI (UF-107) và cập nhật trạng thái ứng viên (UF-108), việc này kích hoạt một thông báo gửi lại cho Ứng viên (UF-028) [cite: 1].

**Nhà tuyển dụng ↔ Quản trị viên** [cite: 1]
Nếu nhà tuyển dụng gắn cờ báo cáo AI là không chính xác, nó sẽ kích hoạt phiếu hỗ trợ [cite: 1]. Quản trị viên (PR-09) truy cập vào hệ thống phụ trợ (backend) (UF-204) để kiểm duyệt kết quả AI, điều chỉnh trọng số tính điểm (UF-206) và giải quyết phiếu hỗ trợ (UF-303) [cite: 1].

**Ứng viên ↔ AI** [cite: 1]
Sự tương tác chuyên sâu nhất [cite: 1]. AI tự động điều chỉnh hành vi của nó dựa trên màn thể hiện theo thời gian thực của ứng viên [cite: 1]. Điều này liên quan đến chuyển đổi giọng nói thành văn bản, xử lý ngôn ngữ tự nhiên, tạo lời nhắc động và phân tích hành vi theo thời gian thực [cite: 1].

## 14. Ma trận Luồng Người dùng [cite: 1]

| Luồng Người dùng | Khách | Ứng viên | Nhà TD | Chuyên viên TD | Người phỏng vấn | Hỗ trợ | Quản trị viên | Hệ thống |
|---|---|---|---|---|---|---|---|---|
| UF-001 Đăng ký [cite: 1] | C | C | - | - | - | - | - | R |
| UF-014 Phỏng vấn AI [cite: 1] | - | C | - | - | - | - | - | R/U |
| UF-103 Tạo Chiến dịch [cite: 1] | - | - | C | C | - | - | - | R |
| UF-107 Xem Báo cáo [cite: 1] | - | - | R | R | R | - | - | U |
| UF-303 Giải quyết Hỗ trợ [cite: 1] | - | - | - | - | - | C/U | U | R |
*(C = Tạo/Khởi tạo, R = Đọc/Xử lý, U = Cập nhật, D = Xóa) [cite: 1]*

## 15. KPI của Luồng Người dùng [cite: 1]

| ID KPI | Chỉ số Đo lường (Metric) | Cách Đo lường | Mục tiêu |
|---|---|---|---|
| KPI-01 | Tỷ lệ Chuyển đổi Đăng ký [cite: 1] | Số khách truy cập so với số người hoàn thành UF-001 [cite: 1] | > 15% [cite: 1] |
| KPI-02 | Tỷ lệ Tải CV thành công [cite: 1] | Số lần thử so với số lần hoàn thành UF-006 [cite: 1] | > 98% [cite: 1] |
| KPI-03 | Độ chính xác của Phân tích CV bằng AI [cite: 1] | Số chỉnh sửa thủ công cần thiết sau UF-007 [cite: 1] | < 5% [cite: 1] |
| KPI-04 | Tỷ lệ Bỏ dở Phỏng vấn [cite: 1] | Số người bắt đầu UF-011 so với số người hoàn thành UF-017 [cite: 1] | < 10% [cite: 1] |
| KPI-05 | Tỷ lệ Lỗi Kiểm tra Thiết bị [cite: 1] | Số phiên bản UF-013 bị lỗi [cite: 1] | < 5% [cite: 1] |
| KPI-06 | Thời lượng Phỏng vấn Trung bình [cite: 1] | Thời gian từ lúc bắt đầu đến khi kết thúc UF-014 [cite: 1] | 25 - 45 phút [cite: 1] |
| KPI-07 | Độ trễ Tạo Báo cáo [cite: 1] | Thời gian giữa lúc UF-017 hoàn thành và UF-018 khả dụng [cite: 1] | < 2 phút [cite: 1] |
| KPI-08 | Điểm Hài lòng của Ứng viên [cite: 1] | Khảo sát sau phỏng vấn [cite: 1] | > 4.2 / 5.0 [cite: 1] |
| KPI-09 | Thời gian Tạo Chiến dịch [cite: 1] | Thời gian để hoàn thành UF-103 [cite: 1] | < 5 phút [cite: 1] |
| KPI-10 | Tỷ lệ Tin cậy AI của Nhà tuyển dụng [cite: 1] | Các báo cáo bị Nhà tuyển dụng ghi đè thủ công [cite: 1] | < 2% [cite: 1] |
| KPI-11 | Thời gian Tuyển dụng [cite: 1] | Từ lúc xuất bản Chiến dịch đến trạng thái Ứng viên được Thuê [cite: 1] | Giảm 40% [cite: 1] |
| KPI-12 | Thành công Xác minh Danh tính [cite: 1] | Tỷ lệ đạt UF-012 ở lần thử đầu tiên [cite: 1] | > 95% [cite: 1] |
| KPI-13 | Tần suất Lỗi Mạng [cite: 1] | Số lần xảy ra EX-15 [cite: 1] | < 3% số cuộc phỏng vấn [cite: 1] |
| KPI-14 | Tỷ lệ Tạo Lộ trình Học tập [cite: 1] | Số Ứng viên sử dụng UF-020 [cite: 1] | > 30% [cite: 1] |
| KPI-15 | Tỷ lệ Sử dụng Phiên Thực hành [cite: 1] | Số Ứng viên sử dụng UF-022 [cite: 1] | > 20% [cite: 1] |
| KPI-16 | Tỷ lệ Hoàn thành Chứng chỉ [cite: 1] | Số lượng bắt đầu UF-024 so với số nhận được [cite: 1] | > 15% [cite: 1] |
| KPI-17 | Tỷ lệ Gia hạn Đăng ký [cite: 1] | Các Nhà tuyển dụng gia hạn trong UF-109 [cite: 1] | > 85% [cite: 1] |
| KPI-18 | Tỷ lệ Thanh toán Thất bại [cite: 1] | Số lần xảy ra EX-08 [cite: 1] | < 2% [cite: 1] |
| KPI-19 | Chuyển hướng Phiếu Hỗ trợ [cite: 1] | Số lần sử dụng Cơ sở Kiến thức UF-305 [cite: 1] | > 40% [cite: 1] |
| KPI-20 | Tỷ lệ Giải quyết trong Cuộc gọi Đầu tiên (FCR) [cite: 1] | Các phiếu được giải quyết ngay trong UF-303 [cite: 1] | > 70% [cite: 1] |
| KPI-21 | Thời gian Hoạt động của Hệ thống [cite: 1] | Mức độ khả dụng tổng thể của tất cả các UF [cite: 1] | 99.99% [cite: 1] |
| KPI-22 | Người dùng Hoạt động Hàng ngày (Ứng viên) [cite: 1] | Số lượt đăng nhập riêng biệt của ứng viên (UF-002) [cite: 1] | Theo dõi Tăng trưởng [cite: 1] |
| KPI-23 | Người dùng Hoạt động Hàng ngày (Nhà TD) [cite: 1] | Số lượt đăng nhập riêng biệt của nhà tuyển dụng [cite: 1] | Theo dõi Tăng trưởng [cite: 1] |
| KPI-24 | Tỷ lệ Phát hiện Gian lận [cite: 1] | Các phỏng vấn bị cờ bởi EX-45 [cite: 1] | < 1% (Dương tính thật) [cite: 1] |
| KPI-25 | Thời gian Phản hồi API (AI) [cite: 1] | Độ trễ trung bình của bước tạo AI [cite: 1] | < 800ms [cite: 1] |
| KPI-26 | Tốc độ Xác minh Email [cite: 1] | Thời gian hoàn thành UF-004 [cite: 1] | < 1 phút [cite: 1] |
| KPI-27 | Khả năng Gửi Thông báo [cite: 1] | Tỷ lệ thành công của các bộ kích hoạt UF-028 [cite: 1] | > 99% [cite: 1] |
| KPI-28 | Lỗi Tương thích Trình duyệt [cite: 1] | Số lần xảy ra EX-31 [cite: 1] | < 1% [cite: 1] |
| KPI-29 | Thời gian Hành động Kiểm duyệt Của Admin [cite: 1] | Thời gian hoàn thành các nhiệm vụ UF-204 [cite: 1] | < 24 giờ [cite: 1] |
| KPI-30 | Tính Toàn vẹn Nhật ký Kiểm toán [cite: 1] | Mức độ đầy đủ của việc theo dõi UF-210 [cite: 1] | 100% [cite: 1] |

## 16. Các Nguyên tắc Trải nghiệm Người dùng [cite: 1]

- **Tính Nhất quán**: Các thuật ngữ (ví dụ: 'Chiến dịch', 'Tín dụng', 'Đánh giá') phải được giữ giống hệt nhau trên tất cả các luồng [cite: 1].
- **Giảm thiểu Ma sát**: Quá trình làm quen của Khách chuyển thành Ứng viên (UF-001) yêu cầu số lượng trường tối thiểu [cite: 1]. Cơ chế tiết lộ thông tin dần dần (Progressive disclosure) áp dụng cho UF-005 (Hoàn thiện Hồ sơ) [cite: 1].
- **Khả năng Truy cập**: Tất cả các luồng phải đáp ứng tiêu chuẩn WCAG 2.1 AA [cite: 1]. Phỏng vấn AI (UF-014) phải hỗ trợ trình đọc màn hình và phụ đề đóng cho người khiếm thính [cite: 1].
- **Phản hồi Rõ ràng**: Trạng thái hệ thống phải luôn hiển thị [cite: 1]. Ví dụ: trong quá trình tạo báo cáo, hệ thống phải hiển thị thanh tiến trình hoặc thời gian dự kiến còn lại [cite: 1].
- **Ưu tiên Phòng ngừa Lỗi hơn Khôi phục**: Kiểm tra Thiết bị (UF-013) ngăn ngừa thất bại trong Phỏng vấn AI (UF-014) [cite: 1]. Thiết kế chủ động này ngăn chặn các lỗi ngoại lệ xếp tầng [cite: 1].
- **Sự Tin tưởng & Minh bạch**: Xác minh Danh tính (UF-012) và Giám sát phải hiển thị các tuyên bố miễn trừ trách nhiệm về quyền riêng tư rõ ràng trước khi kích hoạt phần cứng [cite: 1].

## 17. Ma trận Truy xuất Nguồn gốc Luồng Người dùng [cite: 1]

| Yêu cầu Kinh doanh | Quy trình Kinh doanh | Yêu cầu Chức năng | Luồng Người dùng | Tiêu chí Chấp nhận |
|---|---|---|---|---|
| BR-01 Giảm thời gian TD [cite: 1] | BP-02 Tìm nguồn ứng viên [cite: 1] | FR-EMP-05 [cite: 1] | UF-103 Tạo Chiến dịch [cite: 1] | Chiến dịch được xuất bản trong < 5 phút. [cite: 1] |
| BR-02 Đánh giá Tự động [cite: 1] | BP-04 Thực thi [cite: 1] | FR-AI-03 [cite: 1] | UF-014 Phỏng vấn AI [cite: 1] | AI tiến hành một cuộc phỏng vấn 5 câu hỏi thành công. [cite: 1] |
| BR-03 Chấm điểm Khách quan [cite: 1] | BP-05 Đánh giá [cite: 1] | FR-AI-08 [cite: 1] | UF-018 Xem Báo cáo AI [cite: 1] | Điểm số được tạo hoàn toàn dựa trên các tiêu chí (rubrics) đã cấu hình. [cite: 1] |
| BR-04 Nâng cao Kỹ năng [cite: 1] | BP-06 Phát triển [cite: 1] | FR-LRN-01 [cite: 1] | UF-020 Tạo Lộ trình [cite: 1] | Lộ trình khớp với các kỹ năng còn yếu từ UF-018. [cite: 1] |
| BR-05 Bảo mật Doanh nghiệp [cite: 1] | BP-07 Quản trị [cite: 1] | FR-SEC-02 [cite: 1] | UF-012 Xác minh Danh tính [cite: 1] | Khuôn mặt người dùng khớp với tài liệu ID. [cite: 1] |

## 18. Các Luồng Người dùng Tương lai [cite: 1]

- **Ứng dụng Di động (UF-4xx)**: Các luồng gốc cho iOS/Android tập trung vào Thông báo Đẩy và các phiên thực hành khi đang di chuyển [cite: 1].
- **Enterprise SSO (UF-5xx)**: Các luồng tích hợp SAML/OAuth bỏ qua bước đăng ký tiêu chuẩn cho các khách hàng doanh nghiệp [cite: 1].
- **Tích hợp ATS (UF-6xx)**: Luồng đẩy các báo cáo AI trực tiếp vào Workday, Greenhouse hoặc Lever mà không cần rời khỏi giao diện ATS [cite: 1].
- **Trò chơi hóa (UF-7xx)**: Các luồng Bảng xếp hạng và Thành tích cho Trung tâm Học tập của Ứng viên [cite: 1].
- **Chuyển giao Phỏng vấn Trực tiếp (UF-8xx)**: Luồng chuyển tiếp từ một cuộc phỏng vấn AI thành công sang một hội nghị truyền hình trực tiếp đã được lên lịch với Người phỏng vấn thực tế (PR-06) [cite: 1].

## 19. Tóm tắt [cite: 1]

Đặc tả Luồng Người dùng lập bản đồ một cách toàn diện hệ sinh thái ISAS trên 8 chân dung riêng biệt [cite: 1]. 
- **Hành trình của Ứng viên** nhấn mạnh mạnh mẽ vào sự tiến triển liền mạch, ít lo lắng từ giai đoạn làm quen đến đánh giá bằng AI và học tập liên tục [cite: 1].
- **Hành trình của Nhà tuyển dụng** tập trung vào việc triển khai chiến dịch nhanh chóng, xử lý hàng loạt và sàng lọc danh sách ngắn dựa trên dữ liệu [cite: 1].
- **Hành trình của Quản trị viên** cung cấp các đòn bẩy cần thiết để duy trì tính toàn vẹn của hệ thống, độ chính xác của AI và hỗ trợ tổng thể [cite: 1].

Bằng cách tuân thủ nghiêm ngặt các luồng này, đội ngũ phát triển và thiết kế đảm bảo rằng các yêu cầu chức năng được đáp ứng trong một khuôn khổ tối ưu, lấy con người làm trung tâm, hoàn thành tầm nhìn sản phẩm của doanh nghiệp [cite: 1].