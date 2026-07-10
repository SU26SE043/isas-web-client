# Tài liệu Yêu cầu Nghiệp vụ: Quy trình Nghiệp vụ
*Mã tài liệu: ISAS-BRD-04*
*Phiên bản: 1.0*

## 1. Mục đích Tài liệu
Mục đích của Tài liệu Quy trình Nghiệp vụ này là định nghĩa và cấu trúc các luồng công việc vận hành cho Hệ thống Phỏng vấn & Đánh giá Kỹ năng được hỗ trợ bởi AI (ISAS). Tài liệu trình bày rõ cách thức giá trị nghiệp vụ được tạo ra thông qua các quy trình tiêu chuẩn, nêu chi tiết các tương tác giữa ứng viên, nhà tuyển dụng (doanh nghiệp), quản trị viên và lõi AI.

Là một thành phần cốt lõi của Tài liệu Yêu cầu Nghiệp vụ (BRD), tài liệu này chuyển đổi các nhu cầu kinh doanh cấp cao thành các luồng công việc thực tế, được quản lý chặt chẽ và tuân thủ các tiêu chuẩn doanh nghiệp BPMN 2.0 và BABOK v3.

**Đối tượng Đọc:**
*   Các bên liên quan về Nghiệp vụ (Lãnh đạo Nhân sự, Quản lý Tuyển dụng)
*   Kiến trúc sư Giải pháp Doanh nghiệp
*   Quản lý Sản phẩm (Product Manager) và Chuyên viên Phân tích Nghiệp vụ (BA)
*   Đội ngũ Đảm bảo Chất lượng (QA) và Tuân thủ

**Quản trị Quy trình:**
Tất cả các quy trình được phác thảo ở đây đều do Ban Quản lý Quy trình ISAS quản lý. Bất kỳ thay đổi nào đối với các luồng công việc cốt lõi (Cấp độ 2 trở lên) đều yêu cầu sự phê duyệt chính thức từ Hội đồng Tư vấn Thay đổi (Change Advisory Board - CAB).

---

## 2. Tổng quan Quy trình Nghiệp vụ
Nền tảng ISAS vận hành trên một vòng đời nghiệp vụ hợp nhất, được thiết kế để đánh giá, thẩm định và nâng cao kỹ năng cho ứng viên, đồng thời cung cấp các thông tin chi tiết có thể hành động cho nhà tuyển dụng. Hệ sinh thái này bao gồm các lĩnh vực nghiệp vụ chính sau:

*   **Quản lý Người dùng (User Management):** Đăng ký (onboarding), xác thực và quản trị bảo mật cho tất cả các tác nhân.
*   **Hành trình Ứng viên (Candidate Journey):** Xây dựng hồ sơ, phân tích trích xuất CV và theo dõi kỹ năng liên tục.
*   **Hành trình Doanh nghiệp (Employer Journey):** Tạo chiến dịch, theo dõi ứng viên và phân tích tuyển dụng.
*   **Đánh giá AI (AI Assessment):** Lõi nhận thức cốt lõi quản lý các cuộc phỏng vấn thời gian thực, theo dõi hành vi và chấm điểm dựa trên tiêu chí (rubric).
*   **Học tập & Lộ trình (Learning & Roadmap):** Lộ trình nâng cao kỹ năng sau đánh giá và môi trường luyện tập.
*   **Thanh toán (Payment):** Đăng ký gói (subscription), quản lý tín dụng (credit) và xử lý giao dịch.
*   **Quản trị (Administration):** Quản lý dữ liệu chủ (master data), cấu hình hệ thống và giám sát tổng thể.
*   **Phân tích & Báo cáo (Analytics & Reporting):** Thông tin chi tiết dựa trên giá trị, kết nối ứng viên và bảng điều khiển (dashboard) doanh nghiệp.
*   **Thông báo & Hỗ trợ (Notifications & Support):** Giao tiếp đa kênh và xử lý ngoại lệ.

---

## 3. Bức tranh Toàn cảnh Quy trình Nghiệp vụ Đầu - Cuối

### Cấp độ 0: Bức tranh Doanh nghiệp (Level 0)
*   **L0-01** Chuỗi Giá trị Đầu-Cuối ISAS

### Cấp độ 1: Lĩnh vực Nghiệp vụ (Level 1)
*   **L1-01** Thu hút & Quản lý Người dùng
*   **L1-02** Đánh giá Kỹ năng Ứng viên
*   **L1-03** Phát triển Năng lực Ứng viên
*   **L1-04** Hỗ trợ Tuyển dụng cho Doanh nghiệp
*   **L1-05** Quản lý Vận hành Nền tảng

### Cấp độ 2: Quy trình Cốt lõi & Cấp độ 3: Quy trình Con (Level 2 & 3)
*   **L2-01 Hoạt động Người dùng & Hồ sơ**
    *   BP-001 Đăng ký Người dùng
    *   BP-002 Xác thực
    *   BP-003 Quản lý Hồ sơ Ứng viên
    *   BP-004 Tải lên CV
    *   BP-005 Phân tích CV
*   **L2-02 Tương tác & Thương mại**
    *   BP-006 Khám phá Chiến dịch
    *   BP-007 Đăng ký tham gia Chiến dịch
    *   BP-008 Thanh toán
*   **L2-03 Hoạt động Phỏng vấn & Đánh giá**
    *   BP-009 Xác minh Danh tính
    *   BP-010 Kiểm tra Thiết bị
    *   BP-011 Khởi tạo Phỏng vấn
    *   BP-012 Phiên Phỏng vấn AI
    *   BP-013 Giám sát Phỏng vấn
    *   BP-014 Đánh giá AI
    *   BP-015 Xuất Báo cáo
    *   BP-016 Lịch sử Phiên
*   **L2-04 Học tập Liên tục**
    *   BP-017 Tạo Lộ trình Học tập
    *   BP-018 Đề xuất Học phần (Module) Học tập
    *   BP-019 Phiên Luyện tập
    *   BP-020 Theo dõi Tiến độ
    *   BP-021 Bảng Xếp hạng
    *   BP-022 Cấp Chứng chỉ
*   **L2-05 Hoạt động của Doanh nghiệp (Nhà tuyển dụng)**
    *   BP-023 Quản lý Chiến dịch của Doanh nghiệp
    *   BP-024 Bảng điều khiển Doanh nghiệp
*   **L2-06 Quản trị Nền tảng**
    *   BP-025 Hoạt động Quản trị
    *   BP-026 Quản lý Thông báo
    *   BP-027 Phân tích (Analytics)
    *   BP-028 Ghi log Kiểm toán (Audit Logging)
    *   BP-029 Quy trình Hỗ trợ
    *   BP-030 Bảo trì Hệ thống

---

## 4. Các Quy trình Nghiệp vụ Cốt lõi

### BP-001 Đăng ký Người dùng
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-001 |
| **Mục tiêu Nghiệp vụ** | Thiết lập danh tính nghiệp vụ duy nhất cho các tác nhân hệ thống. |
| **Mô tả** | Luồng công việc từ đầu đến cuối để thu thập thông tin người dùng, xác thực và tạo hồ sơ chính thức trên nền tảng. |
| **Tác nhân chính** | Ứng viên / Doanh nghiệp |
| **Tác nhân hỗ trợ** | Hệ thống |
| **Trình kích hoạt (Trigger)** | Người dùng bắt đầu đăng ký. |
| **Điều kiện tiên quyết** | Người dùng có địa chỉ email hợp lệ. |
| **Đầu vào** | Email, Mật khẩu, Tên, Vai trò |
| **Đầu ra** | Tài khoản Người dùng, Email xác minh |
| **Quy tắc Nghiệp vụ** | Email phải là duy nhất. Mật khẩu phải đáp ứng chính sách độ phức tạp. |
| **Điều kiện hậu quyết** | Trạng thái tài khoản là Chưa xác minh (chờ OTP). |
| **Tiêu chí Thành công** | Bản ghi tài khoản được tạo. |
| **Ngoại lệ** | Trùng email; Định dạng dữ liệu không hợp lệ. |
| **Tần suất** | Đột xuất, thường xuyên |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Rất quan trọng đối với việc thu hút người dùng. |

### BP-002 Xác thực
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-002 |
| **Mục tiêu Nghiệp vụ** | Xác minh danh tính người dùng để cấp quyền truy cập hệ thống một cách an toàn. |
| **Mô tả** | Quá trình đăng nhập vào nền tảng bằng thông tin xác thực hoặc SSO. |
| **Tác nhân chính** | Tất cả người dùng |
| **Tác nhân hỗ trợ** | Nhà cung cấp Xác thực |
| **Trình kích hoạt** | Người dùng yêu cầu truy cập. |
| **Điều kiện tiên quyết** | Tài khoản đã tồn tại và được xác minh. |
| **Đầu vào** | Thông tin xác thực hoặc Token SSO |
| **Đầu ra** | Token Phiên (Session Token) |
| **Quy tắc Nghiệp vụ** | Khóa tài khoản sau 5 lần thử thất bại. |
| **Điều kiện hậu quyết** | Phiên đăng nhập của người dùng hoạt động. |
| **Tiêu chí Thành công** | Session token được tạo ra. |
| **Ngoại lệ** | Thông tin xác thực không hợp lệ; Tài khoản bị khóa. |
| **Tần suất** | Rất thường xuyên |
| **Độ ưu tiên** | Nghiêm trọng (Critical) |
| **Giá trị Nghiệp vụ** | Đảm bảo an ninh và tính toàn vẹn của hệ thống. |

### BP-003 Quản lý Hồ sơ Ứng viên
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-003 |
| **Mục tiêu Nghiệp vụ** | Duy trì hồ sơ chuyên môn chính xác và cập nhật. |
| **Mô tả** | Quá trình ứng viên cập nhật kỹ năng, kinh nghiệm và thông tin cá nhân. |
| **Tác nhân chính** | Ứng viên |
| **Tác nhân hỗ trợ** | Hệ thống |
| **Trình kích hoạt** | Người dùng truy cập cài đặt hồ sơ. |
| **Điều kiện tiên quyết** | Người dùng đã đăng nhập. |
| **Đầu vào** | Dữ liệu hồ sơ (kỹ năng, kinh nghiệm, tiểu sử) |
| **Đầu ra** | Hồ sơ được cập nhật |
| **Quy tắc Nghiệp vụ** | Các trường bắt buộc phải được hoàn thành trước khi ứng tuyển chiến dịch. |
| **Điều kiện hậu quyết** | Dữ liệu hồ sơ được cập nhật trong kho lưu trữ. |
| **Tiêu chí Thành công** | Lưu hồ sơ thành công. |
| **Ngoại lệ** | Lỗi xác thực trên các trường thông tin. |
| **Tần suất** | Đột xuất |
| **Độ ưu tiên** | Trung bình |
| **Giá trị Nghiệp vụ** | Cung cấp dữ liệu chính xác cho việc kết nối AI. |

### BP-004 Tải lên CV
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-004 |
| **Mục tiêu Nghiệp vụ** | Đưa tài liệu sơ yếu lý lịch của ứng viên vào nền tảng. |
| **Mô tả** | Ứng viên tải CV lên theo các định dạng chuẩn để nền tảng sử dụng. |
| **Tác nhân chính** | Ứng viên |
| **Tác nhân hỗ trợ** | Hệ thống |
| **Trình kích hoạt** | Ứng viên bắt đầu tải lên. |
| **Điều kiện tiên quyết** | Đã đăng nhập. |
| **Đầu vào** | Tệp tin (PDF/DOCX) |
| **Đầu ra** | ID Tệp tin đã lưu |
| **Quy tắc Nghiệp vụ** | Kích thước tệp tối đa 10MB. Phải là PDF hoặc DOCX. |
| **Điều kiện hậu quyết** | Tệp được xếp hàng chờ phân tích. |
| **Tiêu chí Thành công** | Tệp được lưu trữ an toàn. |
| **Ngoại lệ** | Định dạng không hợp lệ; Tệp quá lớn. |
| **Tần suất** | Đột xuất |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Nền tảng cho việc phân tích trích xuất AI và kết nối (matching). |

### BP-005 Phân tích CV
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-005 |
| **Mục tiêu Nghiệp vụ** | Trích xuất dữ liệu có cấu trúc (kỹ năng, kinh nghiệm) từ CV phi cấu trúc. |
| **Mô tả** | Hệ thống phân tích cú pháp các CV đã tải lên bằng NLP và tự động cập nhật hồ sơ ứng viên. |
| **Tác nhân chính** | Hệ thống (Lõi AI) |
| **Tác nhân hỗ trợ** | Không có |
| **Trình kích hoạt** | Tải lên CV thành công (BP-004). |
| **Điều kiện tiên quyết** | Tệp tồn tại trong bộ nhớ. |
| **Đầu vào** | ID Tệp tin đã lưu |
| **Đầu ra** | Cấu trúc JSON đã trích xuất |
| **Quy tắc Nghiệp vụ** | Phải xác định được các kỹ năng cơ bản, thời gian làm việc và học vấn. |
| **Điều kiện hậu quyết** | Hồ sơ ứng viên được tự động điền. |
| **Tiêu chí Thành công** | Dữ liệu ánh xạ đúng vào các trường hồ sơ. |
| **Ngoại lệ** | Lỗi trích xuất; Văn bản không thể đọc được. |
| **Tần suất** | Mỗi lần tải lên |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Giảm thiểu việc nhập liệu thủ công và cho phép kết nối thông minh. |

### BP-006 Khám phá Chiến dịch
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-006 |
| **Mục tiêu Nghiệp vụ** | Cho phép ứng viên tìm kiếm các chiến dịch đánh giá/phỏng vấn phù hợp. |
| **Mô tả** | Ứng viên tìm kiếm, lọc và xem chi tiết các chiến dịch đang hoạt động của nhà tuyển dụng hoặc nền tảng. |
| **Tác nhân chính** | Ứng viên |
| **Tác nhân hỗ trợ** | Công cụ Tìm kiếm |
| **Trình kích hoạt** | Ứng viên điều hướng đến mục chiến dịch. |
| **Điều kiện tiên quyết** | Không có. |
| **Đầu vào** | Tiêu chí tìm kiếm |
| **Đầu ra** | Danh sách Chiến dịch |
| **Quy tắc Nghiệp vụ** | Chỉ các chiến dịch đang hoạt động và công khai mới được hiển thị. |
| **Điều kiện hậu quyết** | Ứng viên xem chi tiết chiến dịch. |
| **Tiêu chí Thành công** | Kết quả khớp với tiêu chí. |
| **Ngoại lệ** | Không tìm thấy kết quả. |
| **Tần suất** | Thường xuyên |
| **Độ ưu tiên** | Trung bình |
| **Giá trị Nghiệp vụ** | Thúc đẩy sự tương tác và khối lượng tham gia đánh giá. |

### BP-007 Đăng ký tham gia Chiến dịch
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-007 |
| **Mục tiêu Nghiệp vụ** | Đăng ký cho ứng viên vào một chiến dịch đánh giá cụ thể. |
| **Mô tả** | Ứng viên xác nhận ý định tham gia một chiến dịch và giữ chỗ. |
| **Tác nhân chính** | Ứng viên |
| **Tác nhân hỗ trợ** | Hệ thống |
| **Trình kích hoạt** | Ứng viên nhấp vào 'Đăng ký tham gia' (Enroll). |
| **Điều kiện tiên quyết** | Đã đăng nhập, hồ sơ đã hoàn thiện. |
| **Đầu vào** | ID Chiến dịch, ID Ứng viên |
| **Đầu ra** | Bản ghi Đăng ký tham gia |
| **Quy tắc Nghiệp vụ** | Ứng viên không được đăng ký hai lần trong cùng một chiến dịch đang hoạt động. |
| **Điều kiện hậu quyết** | Ứng viên đủ điều kiện để Thanh toán hoặc Khởi tạo Phỏng vấn. |
| **Tiêu chí Thành công** | Trạng thái đăng ký = Đang hoạt động (Active). |
| **Ngoại lệ** | Chiến dịch đã đầy; Không đủ điều kiện. |
| **Tần suất** | Thường xuyên |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Đảm bảo sự tham gia của ứng viên. |

### BP-008 Thanh toán
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-008 |
| **Mục tiêu Nghiệp vụ** | Xử lý các giao dịch tài chính cho các tính năng cao cấp hoặc chiến dịch. |
| **Mô tả** | Xử lý thẻ tín dụng, trừ tín dụng (credit) và xuất hóa đơn thông qua cổng thanh toán bên ngoài. |
| **Tác nhân chính** | Ứng viên / Doanh nghiệp |
| **Tác nhân hỗ trợ** | Cổng Thanh toán |
| **Trình kích hoạt** | Bắt đầu thanh toán. |
| **Điều kiện tiên quyết** | Giỏ hàng hoặc hóa đơn đã được tạo. |
| **Đầu vào** | Chi tiết Thanh toán |
| **Đầu ra** | Biên lai Giao dịch |
| **Quy tắc Nghiệp vụ** | Các dịch vụ chỉ được cung cấp khi giao dịch thanh toán thành công. |
| **Điều kiện hậu quyết** | Tín dụng tài khoản được cập nhật hoặc tính năng cao cấp được mở khóa. |
| **Tiêu chí Thành công** | Cổng thanh toán trả về mã Thành công. |
| **Ngoại lệ** | Thẻ bị từ chối; Cổng thanh toán hết thời gian chờ (timeout). |
| **Tần suất** | Đột xuất |
| **Độ ưu tiên** | Nghiêm trọng |
| **Giá trị Nghiệp vụ** | Hiện thực hóa doanh thu trực tiếp. |

### BP-009 Xác minh Danh tính
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-009 |
| **Mục tiêu Nghiệp vụ** | Đảm bảo người làm bài phỏng vấn chính là chủ tài khoản đã đăng ký. |
| **Mô tả** | Kiểm tra ID hoặc sinh trắc học theo thời gian thực trước khi vào môi trường đánh giá. |
| **Tác nhân chính** | Ứng viên |
| **Tác nhân hỗ trợ** | Dịch vụ AI Vision (Thị giác máy tính) |
| **Trình kích hoạt** | Ứng viên bắt đầu luồng phỏng vấn. |
| **Điều kiện tiên quyết** | Đã đăng ký tham gia chiến dịch. |
| **Đầu vào** | Hình ảnh Webcam |
| **Đầu ra** | Điểm số Độ tin cậy Xác minh |
| **Quy tắc Nghiệp vụ** | Điểm tin cậy phải vượt quá 85% để tự động tiến hành. |
| **Điều kiện hậu quyết** | Ứng viên được ủy quyền để phỏng vấn. |
| **Tiêu chí Thành công** | Cấp trạng thái Đã xác minh. |
| **Ngoại lệ** | Khuôn mặt không khớp; Không phát hiện khuôn mặt. |
| **Tần suất** | Mỗi cuộc phỏng vấn |
| **Độ ưu tiên** | Nghiêm trọng |
| **Giá trị Nghiệp vụ** | Duy trì tính toàn vẹn của bài đánh giá. |

### BP-010 Kiểm tra Thiết bị
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-010 |
| **Mục tiêu Nghiệp vụ** | Xác nhận khả năng của phần cứng và mạng trước khi đánh giá. |
| **Mô tả** | Xác minh có hệ thống về micrô, máy ảnh và băng thông. |
| **Tác nhân chính** | Hệ thống |
| **Tác nhân hỗ trợ** | Thiết bị của Ứng viên |
| **Trình kích hoạt** | Sau khi xác minh danh tính. |
| **Điều kiện tiên quyết** | Đã xác minh danh tính. |
| **Đầu vào** | Luồng dữ liệu phần cứng (Hardware streams) |
| **Đầu ra** | Báo cáo Chẩn đoán |
| **Quy tắc Nghiệp vụ** | Mic và Cam phải hoạt động. Ping < 200ms. |
| **Điều kiện hậu quyết** | Môi trường được khóa cho cuộc phỏng vấn. |
| **Tiêu chí Thành công** | Vượt qua tất cả các bài kiểm tra. |
| **Ngoại lệ** | Không tìm thấy phần cứng; Mạng kém. |
| **Tần suất** | Mỗi cuộc phỏng vấn |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Ngăn ngừa các lỗi kỹ thuật trong quá trình đánh giá. |

### BP-011 Khởi tạo Phỏng vấn
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-011 |
| **Mục tiêu Nghiệp vụ** | Cấp phát môi trường AI và tải logic đánh giá. |
| **Mô tả** | Hệ thống cấp phát tài nguyên AI, tải tiêu chí (rubric) miền thích hợp và thiết lập kết nối. |
| **Tác nhân chính** | Hệ thống |
| **Tác nhân hỗ trợ** | Lõi AI |
| **Trình kích hoạt** | Kiểm tra thiết bị thành công. |
| **Điều kiện tiên quyết** | Thiết bị được phê duyệt. |
| **Đầu vào** | ID Tiêu chí Chiến dịch (Campaign Rubric ID) |
| **Đầu ra** | ID Phiên hoạt động |
| **Quy tắc Nghiệp vụ** | Phiên bản AI phải được cấp phát trong vòng 15 giây. |
| **Điều kiện hậu quyết** | Giao diện phỏng vấn hiển thị cho ứng viên. |
| **Tiêu chí Thành công** | Trạng thái phiên = Hoạt động (Active). |
| **Ngoại lệ** | Hết thời gian chờ cấp phát tài nguyên. |
| **Tần suất** | Mỗi cuộc phỏng vấn |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Thiết lập trải nghiệm sản phẩm cốt lõi. |

### BP-012 Phiên Phỏng vấn AI
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-012 |
| **Mục tiêu Nghiệp vụ** | Thực hiện bài đánh giá đàm thoại tương tác, năng động. |
| **Mô tả** | Vòng lặp phỏng vấn cốt lõi: AI đặt câu hỏi, ứng viên trả lời, AI đánh giá theo thời gian thực để xác định câu hỏi tiếp theo. |
| **Tác nhân chính** | Lõi AI |
| **Tác nhân hỗ trợ** | Ứng viên |
| **Trình kích hoạt** | Khởi tạo hoàn tất. |
| **Điều kiện tiên quyết** | ID Phiên đang hoạt động. |
| **Đầu vào** | Âm thanh/Văn bản của Ứng viên |
| **Đầu ra** | Bản ghi (Transcripts) & Chỉ số Thời gian thực |
| **Quy tắc Nghiệp vụ** | Phỏng vấn kết thúc khi đáp ứng đủ tiêu chí (rubric) hoặc hết giờ. |
| **Điều kiện hậu quyết** | Phiên chuyển sang trạng thái hoàn thành. |
| **Tiêu chí Thành công** | Tất cả các chủ đề bắt buộc đều được đề cập. |
| **Ngoại lệ** | Ứng viên bỏ ngang; AI không phản hồi. |
| **Tần suất** | Mỗi cuộc phỏng vấn |
| **Độ ưu tiên** | Nghiêm trọng |
| **Giá trị Nghiệp vụ** | Phân phối giá trị chính của nền tảng ISAS. |

### BP-013 Giám sát Phỏng vấn
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-013 |
| **Mục tiêu Nghiệp vụ** | Phát hiện các điểm bất thường, gian lận hoặc sự cố kỹ thuật trong suốt phiên. |
| **Mô tả** | Quá trình chạy ngầm phân tích luồng video/âm thanh để phát hiện nhiều khuôn mặt, giọng nói nền, hoặc chuyển đổi tab (tab switching). |
| **Tác nhân chính** | Hệ thống (Chống gian lận) |
| **Tác nhân hỗ trợ** | Không có |
| **Trình kích hoạt** | Phỏng vấn bắt đầu. |
| **Điều kiện tiên quyết** | Phiên đang hoạt động. |
| **Đầu vào** | Từ xa (Telemetry) & Luồng A/V |
| **Đầu ra** | Cờ báo Dấu hiệu Bất thường (Anomaly Flags) |
| **Quy tắc Nghiệp vụ** | Chấm dứt phiên nếu phát hiện vi phạm nghiêm trọng (ví dụ: nhiều khuôn mặt > 10s). |
| **Điều kiện hậu quyết** | Các cờ báo được đính kèm vào báo cáo phiên. |
| **Tiêu chí Thành công** | Giám sát liên tục không có cảnh báo sai (false positives). |
| **Ngoại lệ** | Dịch vụ giám sát bị sập. |
| **Tần suất** | Liên tục trong quá trình phỏng vấn |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Duy trì sự tin cậy và tính hợp lệ của các bài đánh giá. |

### BP-014 Đánh giá AI
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-014 |
| **Mục tiêu Nghiệp vụ** | Đánh giá dữ liệu phỏng vấn đã thu thập dựa trên tiêu chí công việc (rubric). |
| **Mô tả** | Xử lý hậu kỳ (Post-processing) các bản ghi và dữ liệu hành vi để tạo ra điểm số chuẩn hóa. |
| **Tác nhân chính** | Lõi AI |
| **Tác nhân hỗ trợ** | Hệ thống |
| **Trình kích hoạt** | Phiên phỏng vấn kết thúc. |
| **Điều kiện tiên quyết** | Bản ghi (Transcripts) đã được chốt. |
| **Đầu vào** | Bản ghi, Tiêu chí (Rubric), Từ xa (Telemetry) |
| **Đầu ra** | Bảng điểm thô (Raw Scorecard) |
| **Quy tắc Nghiệp vụ** | Điểm số phải mang tính xác định (deterministic) dựa trên trọng số của tiêu chí. |
| **Điều kiện hậu quyết** | Dữ liệu được đưa vào hàng đợi để Xuất Báo cáo. |
| **Tiêu chí Thành công** | Điểm số được ánh xạ tới tất cả các năng lực. |
| **Ngoại lệ** | Hết thời gian xử lý (timeout). |
| **Tần suất** | Sau phỏng vấn |
| **Độ ưu tiên** | Nghiêm trọng |
| **Giá trị Nghiệp vụ** | Định lượng khách quan các kỹ năng của ứng viên. |

### BP-015 Xuất Báo cáo
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-015 |
| **Mục tiêu Nghiệp vụ** | Tạo các tài liệu dễ đọc tóm tắt kết quả đánh giá. |
| **Mô tả** | Định dạng bảng điểm thô thành định dạng PDF và các thông tin chi tiết trên bảng điều khiển cho cả Ứng viên và Doanh nghiệp. |
| **Tác nhân chính** | Hệ thống |
| **Tác nhân hỗ trợ** | Không có |
| **Trình kích hoạt** | Đánh giá AI hoàn tất. |
| **Điều kiện tiên quyết** | Bảng điểm được lưu. |
| **Đầu vào** | Bảng điểm thô |
| **Đầu ra** | Báo cáo PDF, Đối tượng (Object) Bảng điều khiển |
| **Quy tắc Nghiệp vụ** | Báo cáo của Ứng viên và Doanh nghiệp có mức độ hiển thị khác nhau (ví dụ: chi tiết chống gian lận bị ẩn đối với ứng viên). |
| **Điều kiện hậu quyết** | Báo cáo có sẵn để tải xuống. |
| **Tiêu chí Thành công** | PDF được tạo và có liên kết. |
| **Ngoại lệ** | Lỗi hiển thị (rendering). |
| **Tần suất** | Sau đánh giá |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Sản phẩm đầu ra hữu hình của nền tảng dành cho các bên liên quan. |

### BP-016 Lịch sử Phiên
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-016 |
| **Mục tiêu Nghiệp vụ** | Cung cấp quyền truy cập vào các cuộc phỏng vấn và kết quả trước đây. |
| **Mô tả** | Quy trình lưu trữ và truy xuất cho ứng viên và doanh nghiệp để xem lại hiệu suất trong quá khứ. |
| **Tác nhân chính** | Người dùng |
| **Tác nhân hỗ trợ** | Hệ thống |
| **Trình kích hoạt** | Người dùng truy cập tab Lịch sử. |
| **Điều kiện tiên quyết** | Đã đăng nhập. |
| **Đầu vào** | ID Người dùng |
| **Đầu ra** | Danh sách các phiên lịch sử |
| **Quy tắc Nghiệp vụ** | Dữ liệu được lưu giữ theo chính sách quyền riêng tư dữ liệu (ví dụ: 3 năm). |
| **Điều kiện hậu quyết** | Không có |
| **Tiêu chí Thành công** | Các bản ghi được hiển thị. |
| **Ngoại lệ** | Không có |
| **Tần suất** | Thường xuyên |
| **Độ ưu tiên** | Thấp |
| **Giá trị Nghiệp vụ** | Hỗ trợ theo dõi theo thời gian. |

### BP-017 Tạo Lộ trình Học tập
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-017 |
| **Mục tiêu Nghiệp vụ** | Cung cấp các định hướng phát triển có thể hành động dựa trên các khoảng trống kỹ năng (skill gaps). |
| **Mô tả** | Phân tích Bảng điểm Đánh giá AI để xác định điểm yếu và tạo một lộ trình học tập có cấu trúc. |
| **Tác nhân chính** | Lõi AI |
| **Tác nhân hỗ trợ** | Hệ thống |
| **Trình kích hoạt** | Việc xuất báo cáo hoàn tất. |
| **Điều kiện tiên quyết** | Đánh giá đã được chốt. |
| **Đầu vào** | Các khoảng trống trên Bảng điểm |
| **Đầu ra** | Lộ trình Cá nhân hóa |
| **Quy tắc Nghiệp vụ** | Lộ trình phải giải quyết các năng lực có điểm < 70%. |
| **Điều kiện hậu quyết** | Lộ trình hiển thị trong cổng thông tin Ứng viên. |
| **Tiêu chí Thành công** | Các node (nút) được tạo. |
| **Ngoại lệ** | Không có |
| **Tần suất** | Sau đánh giá |
| **Độ ưu tiên** | Trung bình |
| **Giá trị Nghiệp vụ** | Mở rộng giá trị nền tảng từ đánh giá sang phát triển. |

### BP-018 Đề xuất Học phần Học tập
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-018 |
| **Mục tiêu Nghiệp vụ** | Đề xuất nội dung cụ thể (video, bài viết) để giải quyết các nút lộ trình. |
| **Mô tả** | Kết nối nội dung học tập bên ngoài hoặc nội bộ với các khoảng trống kỹ năng được chỉ định. |
| **Tác nhân chính** | Hệ thống |
| **Tác nhân hỗ trợ** | Tích hợp Nội dung |
| **Trình kích hoạt** | Tạo Lộ trình. |
| **Điều kiện tiên quyết** | Lộ trình tồn tại. |
| **Đầu vào** | Các nút Lộ trình (Roadmap Nodes) |
| **Đầu ra** | Liên kết Nội dung |
| **Quy tắc Nghiệp vụ** | Liên kết phải hoạt động và có liên quan. |
| **Điều kiện hậu quyết** | Ứng viên có thể nhấp để học. |
| **Tiêu chí Thành công** | Các liên kết điền vào UI. |
| **Ngoại lệ** | Lỗi API bên ngoài. |
| **Tần suất** | Đột xuất |
| **Độ ưu tiên** | Trung bình |
| **Giá trị Nghiệp vụ** | Việc học tập có thể hành động được. |

### BP-019 Phiên Luyện tập
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-019 |
| **Mục tiêu Nghiệp vụ** | Cho phép ứng viên mô phỏng các cuộc phỏng vấn mà nhà tuyển dụng không nhìn thấy. |
| **Mô tả** | Môi trường phỏng vấn AI rủi ro thấp (low-stakes) tập trung vào phản hồi thay vì chấm điểm. |
| **Tác nhân chính** | Ứng viên |
| **Tác nhân hỗ trợ** | Lõi AI |
| **Trình kích hoạt** | Ứng viên bắt đầu luyện tập. |
| **Điều kiện tiên quyết** | Đủ tín dụng luyện tập (practice credits). |
| **Đầu vào** | Chủ đề đã chọn |
| **Đầu ra** | Báo cáo Phản hồi |
| **Quy tắc Nghiệp vụ** | Kết quả luyện tập không ảnh hưởng đến hồ sơ công khai. |
| **Điều kiện hậu quyết** | Bị trừ tín dụng luyện tập. |
| **Tiêu chí Thành công** | Phiên kết thúc và cung cấp phản hồi. |
| **Ngoại lệ** | Hết tín dụng. |
| **Tần suất** | Thường xuyên |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Tăng cường sự tự tin của ứng viên và tương tác trên nền tảng. |

### BP-020 Theo dõi Tiến độ
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-020 |
| **Mục tiêu Nghiệp vụ** | Trực quan hóa sự tiến bộ của ứng viên theo thời gian. |
| **Mô tả** | Tổng hợp các điểm số trong quá khứ và kết quả luyện tập thành các biểu đồ xu hướng. |
| **Tác nhân chính** | Hệ thống |
| **Tác nhân hỗ trợ** | Không có |
| **Trình kích hoạt** | Tải Bảng điều khiển (Dashboard). |
| **Điều kiện tiên quyết** | Dữ liệu tồn tại. |
| **Đầu vào** | Điểm số Lịch sử |
| **Đầu ra** | Biểu đồ Xu hướng |
| **Quy tắc Nghiệp vụ** | Không có |
| **Điều kiện hậu quyết** | Không có |
| **Tiêu chí Thành công** | Biểu đồ hiển thị chính xác. |
| **Ngoại lệ** | Không có |
| **Tần suất** | Thường xuyên |
| **Độ ưu tiên** | Thấp |
| **Giá trị Nghiệp vụ** | Trò chơi hóa (Gamification) và tạo động lực. |

### BP-021 Bảng Xếp hạng
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-021 |
| **Mục tiêu Nghiệp vụ** | Thúc đẩy trò chơi hóa (gamification) giữa các ứng viên trong các chiến dịch mở. |
| **Mô tả** | Xếp hạng ứng viên dựa trên điểm số đã ẩn danh cho các kỹ năng cụ thể. |
| **Tác nhân chính** | Hệ thống |
| **Tác nhân hỗ trợ** | Không có |
| **Trình kích hoạt** | Lịch trình công việc (Cron) / Tải View. |
| **Điều kiện tiên quyết** | Chiến dịch cho phép bảng xếp hạng. |
| **Đầu vào** | Điểm số được tổng hợp |
| **Đầu ra** | Danh sách được xếp hạng |
| **Quy tắc Nghiệp vụ** | Phải ẩn danh PII (Thông tin nhận dạng cá nhân) trừ khi người dùng đồng ý. |
| **Điều kiện hậu quyết** | Không có |
| **Tiêu chí Thành công** | Xếp hạng chính xác. |
| **Ngoại lệ** | Không có |
| **Tần suất** | Hàng ngày |
| **Độ ưu tiên** | Thấp |
| **Giá trị Nghiệp vụ** | Thúc đẩy sự tương tác cạnh tranh. |

### BP-022 Cấp Chứng chỉ
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-022 |
| **Mục tiêu Nghiệp vụ** | Cung cấp thông tin xác thực có thể kiểm chứng khi vượt qua các bài đánh giá quan trọng. |
| **Mô tả** | Phát hành chứng chỉ PDF có mật mã hoặc có thể xác minh khi ứng viên vượt qua mức điểm chuẩn (benchmark). |
| **Tác nhân chính** | Hệ thống |
| **Tác nhân hỗ trợ** | Không có |
| **Trình kích hoạt** | Điểm số > 85% trong chiến dịch có chứng chỉ. |
| **Điều kiện tiên quyết** | Đánh giá hoàn tất. |
| **Đầu vào** | Điểm Đánh giá |
| **Đầu ra** | Tài sản Chứng chỉ (Certificate Asset) |
| **Quy tắc Nghiệp vụ** | Chỉ các chiến dịch cao cấp cụ thể mới đủ điều kiện. |
| **Điều kiện hậu quyết** | Chứng chỉ được gửi qua email và có sẵn trên hồ sơ. |
| **Tiêu chí Thành công** | Tài sản được đúc (minted). |
| **Ngoại lệ** | Không có |
| **Tần suất** | Đột xuất |
| **Độ ưu tiên** | Trung bình |
| **Giá trị Nghiệp vụ** | Mang lại giá trị hữu hình cho sự nghiệp của ứng viên. |

### BP-023 Quản lý Chiến dịch của Doanh nghiệp
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-023 |
| **Mục tiêu Nghiệp vụ** | Cho phép nhà tuyển dụng tạo và cấu hình các đợt đánh giá. |
| **Mô tả** | Doanh nghiệp thiết lập mô tả công việc, kỹ năng bắt buộc, tiêu chí đạt và mốc thời gian. |
| **Tác nhân chính** | Doanh nghiệp (Nhà tuyển dụng) |
| **Tác nhân hỗ trợ** | Hệ thống |
| **Trình kích hoạt** | Doanh nghiệp nhấp vào 'Chiến dịch Mới'. |
| **Điều kiện tiên quyết** | Tài khoản doanh nghiệp đang hoạt động. |
| **Đầu vào** | Các Tham số Chiến dịch |
| **Đầu ra** | Chiến dịch đang Hoạt động |
| **Quy tắc Nghiệp vụ** | Phải có đủ tín dụng nền tảng (credits) để khởi chạy. |
| **Điều kiện hậu quyết** | Chiến dịch hiển thị với các ứng viên mục tiêu. |
| **Tiêu chí Thành công** | Trạng thái chuyển sang Đang hoạt động (Active). |
| **Ngoại lệ** | Không đủ tín dụng. |
| **Tần suất** | Đột xuất |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Chức năng cốt lõi của B2B. |

### BP-024 Bảng điều khiển Doanh nghiệp
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-024 |
| **Mục tiêu Nghiệp vụ** | Cung cấp thông tin chi tiết tổng hợp và theo dõi người ứng tuyển (ATS). |
| **Mô tả** | Doanh nghiệp xem các đường ống (pipelines), điểm số của ứng viên và bản ghi âm cuộc phỏng vấn. |
| **Tác nhân chính** | Doanh nghiệp |
| **Tác nhân hỗ trợ** | Hệ thống |
| **Trình kích hoạt** | Đăng nhập. |
| **Điều kiện tiên quyết** | Các chiến dịch có tồn tại. |
| **Đầu vào** | ID Doanh nghiệp |
| **Đầu ra** | Giao diện Bảng điều khiển |
| **Quy tắc Nghiệp vụ** | Không thể xem PII của ứng viên nếu ứng viên thu hồi quyền truy cập. |
| **Điều kiện hậu quyết** | Không có |
| **Tiêu chí Thành công** | Dữ liệu tổng hợp chính xác. |
| **Ngoại lệ** | Không có |
| **Tần suất** | Thường xuyên |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Hỗ trợ quyết định cho bộ phận Nhân sự (HR). |

### BP-025 Hoạt động Quản trị
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-025 |
| **Mục tiêu Nghiệp vụ** | Quản lý dữ liệu chủ của nền tảng và cấu hình khách hàng (tenant configuration). |
| **Mô tả** | Các thao tác của siêu quản trị viên (super-admin) bao gồm cập nhật phân loại (taxonomy), cấm người dùng và cài đặt chung. |
| **Tác nhân chính** | Quản trị viên (Admin) |
| **Tác nhân hỗ trợ** | Hệ thống |
| **Trình kích hoạt** | Truy cập cổng quản trị. |
| **Điều kiện tiên quyết** | Phân quyền Quản trị viên. |
| **Đầu vào** | Các thay đổi cấu hình |
| **Đầu ra** | Trạng thái Hệ thống được Cập nhật |
| **Quy tắc Nghiệp vụ** | Tất cả các hành động của admin phải được kiểm toán (audit) nghiêm ngặt. |
| **Điều kiện hậu quyết** | Các thay đổi trạng thái được áp dụng toàn cục. |
| **Tiêu chí Thành công** | Các thay đổi được xác nhận (commit). |
| **Ngoại lệ** | Quyền bị từ chối. |
| **Tần suất** | Thấp |
| **Độ ưu tiên** | Trung bình |
| **Giá trị Nghiệp vụ** | Bảo trì nền tảng. |

### BP-026 Quản lý Thông báo
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-026 |
| **Mục tiêu Nghiệp vụ** | Định tuyến cảnh báo đến người dùng một cách đáng tin cậy. |
| **Mô tả** | Quá trình tạo và gửi Email/SMS/Push dựa trên các sự kiện hệ thống. |
| **Tác nhân chính** | Hệ thống |
| **Tác nhân hỗ trợ** | Cổng Giao tiếp (Comms Gateway) |
| **Trình kích hoạt** | Kích hoạt bởi Event bus. |
| **Điều kiện tiên quyết** | Không có |
| **Đầu vào** | Payload sự kiện |
| **Đầu ra** | Thông điệp được điều phối |
| **Quy tắc Nghiệp vụ** | Tôn trọng tùy chọn từ chối (opt-out) của người dùng đối với các cảnh báo không quan trọng. |
| **Điều kiện hậu quyết** | Không có |
| **Tiêu chí Thành công** | Cổng báo 200 OK. |
| **Ngoại lệ** | Cổng (Gateway) ngoại tuyến. |
| **Tần suất** | Liên tục |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Giữ cho người dùng luôn được thông báo. |

### BP-027 Phân tích (Analytics)
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-027 |
| **Mục tiêu Nghiệp vụ** | Tạo ra các chỉ số BI (Business Intelligence) nội bộ cho sức khỏe của nền tảng. |
| **Mô tả** | Các tác vụ ETL (Trích xuất, Chuyển đổi, Tải) xử lý dữ liệu hệ thống vào các kho dữ liệu nội bộ. |
| **Tác nhân chính** | Hệ thống (Hàng loạt / Batch) |
| **Tác nhân hỗ trợ** | Kho Dữ liệu (Data Warehouse) |
| **Trình kích hoạt** | Lịch trình (Cron schedule). |
| **Điều kiện tiên quyết** | Không có |
| **Đầu vào** | CSDL Giao dịch (Transactional DB) |
| **Đầu ra** | Khối OLAP (OLAP Cubes) |
| **Quy tắc Nghiệp vụ** | Không có |
| **Điều kiện hậu quyết** | Bảng điều khiển BI được cập nhật. |
| **Tiêu chí Thành công** | Tác vụ hoàn thành. |
| **Ngoại lệ** | Tác vụ bị sập. |
| **Tần suất** | Hàng ngày |
| **Độ ưu tiên** | Trung bình |
| **Giá trị Nghiệp vụ** | Cung cấp thông tin chi tiết mang tính chiến lược. |

### BP-028 Ghi log Kiểm toán (Audit Logging)
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-028 |
| **Mục tiêu Nghiệp vụ** | Đảm bảo tính tuân thủ và khả năng truy xuất nguồn gốc của các hành động. |
| **Mô tả** | Ghi log bất biến các sự kiện nhạy cảm (Xác thực, thay đổi của Admin, truy cập PII). |
| **Tác nhân chính** | Hệ thống |
| **Tác nhân hỗ trợ** | CSDL Kiểm toán (Audit DB) |
| **Trình kích hoạt** | Sự kiện nhạy cảm. |
| **Điều kiện tiên quyết** | Không có |
| **Đầu vào** | Payload sự kiện |
| **Đầu ra** | Bản ghi Bất biến |
| **Quy tắc Nghiệp vụ** | Log không thể bị xóa hoặc sửa đổi. |
| **Điều kiện hậu quyết** | Không có |
| **Tiêu chí Thành công** | Ghi vào kho lưu trữ WORM (Write Once Read Many). |
| **Ngoại lệ** | Lỗi lưu trữ. |
| **Tần suất** | Liên tục |
| **Độ ưu tiên** | Nghiêm trọng |
| **Giá trị Nghiệp vụ** | An ninh và Tuân thủ. |

### BP-029 Quy trình Hỗ trợ
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-029 |
| **Mục tiêu Nghiệp vụ** | Giải quyết các vấn đề của người dùng một cách hiệu quả. |
| **Mô tả** | Luồng công việc tạo vé hỗ trợ (ticket) từ lúc người dùng gửi cho đến khi nhân viên giải quyết. |
| **Tác nhân chính** | Người dùng |
| **Tác nhân hỗ trợ** | Nhân viên Hỗ trợ (Support Agent) |
| **Trình kích hoạt** | Gửi ticket. |
| **Điều kiện tiên quyết** | Không có |
| **Đầu vào** | Chi tiết sự cố |
| **Đầu ra** | Ticket được giải quyết |
| **Quy tắc Nghiệp vụ** | Tuân thủ SLA (Cam kết chất lượng dịch vụ) dựa trên mức độ nghiêm trọng. |
| **Điều kiện hậu quyết** | Không có |
| **Tiêu chí Thành công** | Người dùng xác nhận đã giải quyết. |
| **Ngoại lệ** | Vi phạm SLA. |
| **Tần suất** | Đột xuất |
| **Độ ưu tiên** | Trung bình |
| **Giá trị Nghiệp vụ** | Đảm bảo sự hài lòng của khách hàng. |

### BP-030 Bảo trì Hệ thống
| Thuộc tính | Mô tả |
|---|---|
| **Mã quy trình** | BP-030 |
| **Mục tiêu Nghiệp vụ** | Đảm bảo tính ổn định của nền tảng và áp dụng các bản cập nhật. |
| **Mô tả** | Luồng công việc thời gian ngừng hoạt động (downtime) có kế hoạch, bao gồm truyền thông, thực thi và xác minh. |
| **Tác nhân chính** | Đội ngũ Vận hành (Operations) |
| **Tác nhân hỗ trợ** | Hệ thống |
| **Trình kích hoạt** | Cửa sổ bảo trì đã lên lịch. |
| **Điều kiện tiên quyết** | Được CAB Phê duyệt. |
| **Đầu vào** | Bản vá (Patch) / Cập nhật |
| **Đầu ra** | Hệ thống Đã được Nâng cấp |
| **Quy tắc Nghiệp vụ** | Người dùng phải được thông báo trước 48 giờ. |
| **Điều kiện hậu quyết** | Các bước kiểm tra sức khỏe hệ thống đều đạt (pass). |
| **Tiêu chí Thành công** | Thời gian downtime kết thúc. |
| **Ngoại lệ** | Phải khôi phục lại (Rollback). |
| **Tần suất** | Hàng tháng |
| **Độ ưu tiên** | Cao |
| **Giá trị Nghiệp vụ** | Độ tin cậy của Nền tảng. |

---

## 5. Chi tiết Luồng Công việc Nghiệp vụ

Phần này ánh xạ các bước theo trình tự thời gian cụ thể cho từng quy trình cốt lõi được định nghĩa trong Phần 4.

### Luồng: BP-001 Đăng ký Người dùng
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Người dùng | Cung cấp thông tin đăng ký | Không | Dữ liệu Form | Gói dữ liệu | Không | Không | Dữ liệu được gửi |
| 2 | Hệ thống | Xác thực tính duy nhất | Email có duy nhất? | Gói dữ liệu | Trạng thái xác thực | BR-001 | Lỗi trùng lặp | Dữ liệu hợp lệ |
| 3 | Hệ thống | Tạo bản ghi tài khoản | Không | Dữ liệu hợp lệ | ID Tài khoản | Không | Lỗi CSDL | Bản ghi được tạo |
| 4 | Hệ thống | Gửi OTP xác minh | Không | Email | Tin nhắn OTP | Không | Lỗi SMTP | Email được gửi |

### Luồng: BP-002 Xác thực
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Người dùng | Gửi thông tin xác thực | Không | Email/Mật khẩu | Yêu cầu | Không | Không | Thông tin được nhận |
| 2 | Hệ thống | Xác thực thông tin | Tìm thấy khớp? | Thông tin | Trạng thái Xác thực | BR-002 | Lỗi xác thực | Hợp lệ |
| 3 | Hệ thống | Kiểm tra trạng thái tài khoản | Có bị khóa không?| ID Tài khoản | Trạng thái | BR-003 | Lỗi bị khóa | Trạng thái được xác nhận |
| 4 | Hệ thống | Tạo phiên (Session) | Không | ID Người dùng | Token Xác thực | Không | Lỗi Token | Quyền truy cập được cấp |

### Luồng: BP-003 Quản lý Hồ sơ Ứng viên
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Ứng viên | Cập nhật chi tiết hồ sơ | Không | Dữ liệu hồ sơ mới | Gói dữ liệu | Không | Không | Cập nhật được nhập |
| 2 | Hệ thống | Xác thực dữ liệu đầu vào | Định dạng hợp lệ? | Gói dữ liệu | Trạng thái Xác thực | BR-004 | Lỗi Xác thực | Dữ liệu hợp lệ |
| 3 | Hệ thống | Lưu vào kho lưu trữ | Không | Dữ liệu hợp lệ | Xác nhận thành công| Không | Lỗi lưu trữ | Hồ sơ được cập nhật |

### Luồng: BP-004 Tải lên CV
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Ứng viên | Chọn và tải tệp lên | Không | Tài liệu | Luồng tệp (File stream)| Không | Không | Quá trình tải lên bắt đầu|
| 2 | Hệ thống | Kiểm tra định dạng/kích thước| Tệp hợp lệ? | Luồng tệp | Trạng thái kiểm tra | BR-005 | Thông báo từ chối | Tệp được phê duyệt |
| 3 | Hệ thống | Lưu trữ an toàn | Không | Tài liệu | ID Tệp | Không | Hết giờ lưu trữ | Tệp được lưu |

### Luồng: BP-005 Phân tích CV
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Truy xuất tệp CV | Không | ID Tệp | Văn bản tài liệu | Không | Lỗi tải tệp (Fetch error)| Tài liệu được tải |
| 2 | Lõi AI | Thực thi phân tích OCR/NLP | Đọc được không? | Văn bản tài liệu| JSON thô | Không | Lỗi phân tích | Dữ liệu được trích xuất |
| 3 | Hệ thống | Ánh xạ vào cấu trúc hồ sơ | Không | JSON thô | Dữ liệu ánh xạ | BR-006 | Cảnh báo ánh xạ | Dữ liệu được cấu trúc |
| 4 | Hệ thống | Cập nhật hồ sơ người dùng | Không | Dữ liệu ánh xạ| Xác nhận Cập nhật | Không | Không | Hồ sơ được điền |

### Luồng: BP-006 Khám phá Chiến dịch
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Ứng viên | Nhập tham số tìm kiếm | Không | Từ khóa, bộ lọc | Truy vấn | Không | Không | Thực thi tìm kiếm |
| 2 | Hệ thống | Truy xuất chiến dịch khớp | Có kết quả khớp?| Truy vấn | Danh sách Chiến dịch| BR-007 | Không có gì | Trả về danh sách |
| 3 | Hệ thống | Hiển thị chi tiết | Không | ID Chiến dịch | Mô tả Đầy đủ | Không | Không | Xem được chi tiết |

### Luồng: BP-007 Đăng ký tham gia Chiến dịch
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Ứng viên | Yêu cầu đăng ký | Không | ID Chiến dịch | Yêu cầu | Không | Không | Yêu cầu được nhận |
| 2 | Hệ thống | Kiểm tra đủ ĐK & Sức chứa| Đủ điều kiện? | Yêu cầu | Trạng thái | BR-008 | Lỗi từ chối | Được chấp thuận |
| 3 | Hệ thống | Tạo bản ghi đăng ký | Không | Trạng thái | ID Đăng ký | Không | Lỗi DB | Đã đăng ký |

### Luồng: BP-008 Thanh toán
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Người dùng | Gửi chi tiết thanh toán | Không | Info Thẻ | Payload bảo mật | Không | Không | Dữ liệu được bảo mật |
| 2 | Cổng TT | Xử lý giao dịch | Được chấp thuận? | Payload | Mã xác thực (Auth Code)| BR-009 | Thông báo từ chối | Đã giữ tiền |
| 3 | Hệ thống | Cập nhật quyền tài khoản | Không | Mã xác thực | Số dư đã cập nhật | Không | Chậm đồng bộ | Quyền được cấp |
| 4 | Hệ thống | Xuất biên lai | Không | ID Giao dịch | Biên lai PDF | Không | Không | Biên lai được gửi |

### Luồng: BP-009 Xác minh Danh tính
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Yêu cầu chụp camera | Không | Camera feed | Khung hình (Image frame)| Không | Camera bị chặn | Khung hình được chụp |
| 2 | Lõi AI | So sánh với dữ liệu gốc | Khớp > 85%? | Khung hình | Điểm số | BR-010 | Xác minh thất bại | Xác nhận trùng khớp |
| 3 | Hệ thống | Ghi log sự kiện xác minh | Không | Điểm số | Nhật ký Audit | Không | Không | Danh tính được xác minh|

### Luồng: BP-010 Kiểm tra Thiết bị
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Kiểm tra quyền A/V (Âm/Hình)| Được cấp quyền? | Trình duyệt API | Trạng thái | BR-011 | Từ chối cấp quyền| A/V đang hoạt động |
| 2 | Hệ thống | Đo độ trễ mạng | Ping < 200ms? | Gói tin (Packets)| Chỉ số độ trễ | BR-012 | Cảnh báo kết nối | Mạng ổn |
| 3 | Hệ thống | Phê duyệt thiết bị | Không | Các chỉ số | Token phê duyệt | Không | Không | Sẵn sàng bắt đầu |

### Luồng: BP-011 Khởi tạo Phỏng vấn
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Lấy tiêu chí (rubric) C.dịch | Không | ID Chiến dịch | JSON Tiêu chí | Không | Lỗi tải (Fetch) | Tiêu chí được tải |
| 2 | Hệ thống | Cấp phát Agent AI | Có sẵn không? | JSON Tiêu chí | ID Agent | Không | Hết thời gian chờ| Agent sẵn sàng |
| 3 | Hệ thống | Thiết lập WebRTC/Socket | Không | ID Agent | ID Phiên | Không | Lỗi Socket | Kết nối trực tiếp (live)|

### Luồng: BP-012 Phiên Phỏng vấn AI
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Lõi AI | Tạo và phân phối câu hỏi | Không | Trạng thái Tiêu chí| Lời nhắc Âm/Văn bản | Không | Lỗi tổng hợp giọng| Lời nhắc được đưa ra |
| 2 | Ứng viên | Cung cấp câu trả lời | Không | Âm/Văn bản | Payload phản hồi | Không | Im lặng quá lâu | Phản hồi được ghi nhận |
| 3 | Lõi AI | Xử lý NLP & Trích xuất chữ| Đầu vào hợp lệ? | Payload phản hồi | Dữ liệu ngữ nghĩa | Không | Không hiểu được | Dữ liệu được phân tích |
| 4 | Lõi AI | Xác định bước tiếp theo | Đã hết Tiêu chí? | Dữ liệu ngữ nghĩa | Logic bước kế tiếp | BR-013 | Không | Tiếp tục lặp hoặc dừng |

### Luồng: BP-013 Giám sát Phỏng vấn
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Phân tích luồng liên tục | Không | Luồng A/V | Phân tích khung hình | Không | Không | Luồng được xử lý |
| 2 | Hệ thống | Đánh giá quy tắc chống gian lận| Phát hiện vi phạm?| Phân tích khung hình | Sự kiện gắn cờ | BR-014 | Không | Trạng thái sạch hoặc gắn cờ|
| 3 | Hệ thống | Thực thi biện pháp | Nghiêm trọng? | Sự kiện gắn cờ | Cảnh báo / Hủy | BR-015 | Không | Hành động được thực thi|

### Luồng: BP-014 Đánh giá AI
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Biên dịch dữ liệu phiên | Không | CSDL Phiên | Dữ liệu tổng hợp | Không | Thiếu dữ liệu | Biên dịch xong |
| 2 | Lõi AI | Chấm điểm theo năng lực | Không | Dữ liệu tổng hợp | Điểm số các chiều | BR-016 | Không | Đã chấm điểm |
| 3 | Hệ thống | Lưu Bảng điểm | Không | Điểm số các chiều | ID Bảng điểm | Không | Lỗi DB | Đã lưu |

### Luồng: BP-015 Xuất Báo cáo
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Định dạng DL theo Vai trò | Vai trò=Doanh nghiệp?| Bảng điểm | Giao diện định dạng | BR-017 | Không | Dữ liệu được ánh xạ |
| 2 | Hệ thống | Tạo tài liệu PDF | Không | Giao diện định dạng | Tệp PDF | Không | Lỗi Render | Đã tạo PDF |
| 3 | Hệ thống | Phân phối thông báo | Không | ID Báo cáo | Cảnh báo được gửi | Không | Không | Người dùng được thông báo|

### Luồng: BP-016 Lịch sử Phiên
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Người dùng | Yêu cầu lịch sử | Không | Bộ lọc | Truy vấn | Không | Không | Đã thực thi truy vấn |
| 2 | Hệ thống | Truy xuất bản ghi | Không | Truy vấn | Mảng Lịch sử | Không | Không | Dữ liệu được truy xuất |

### Luồng: BP-017 Tạo Lộ trình Học tập
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Xác định khoảng trống KN | Điểm < 70%? | Bảng điểm | Danh sách thiếu hụt | BR-018 | Không | Đã tìm thấy lỗ hổng |
| 2 | Lõi AI | Ánh xạ vào giáo trình | Không | Danh sách thiếu hụt| Nút Giáo trình (Nodes)| Không | Không | Đã ánh xạ |
| 3 | Hệ thống | Xuất bản lộ trình | Không | Nút Giáo trình | Giao diện Lộ trình | Không | Không | Đã xuất bản |

### Luồng: BP-018 Đề xuất Học phần Học tập
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Truy vấn thư viện nội dung | Không | Tags (Thẻ) của Nút| Danh sách nội dung | Không | Lỗi API | Đã truy xuất nội dung |

### Luồng: BP-019 Phiên Luyện tập
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Ứng viên | Cấu hình buổi tập | Không | Cài đặt | Cấu hình (Config) | Không | Không | Đã cấu hình |
| 2 | Hệ thống | Chạy AI không giám sát | Không | Cấu hình | Bản ghi (Transcripts)| BR-019 | Không | Hoàn tất |
| 3 | Lõi AI | Tạo phản hồi mang tính XD | Không | Bản ghi | Giao diện Phản hồi | Không | Không | Đã gửi phản hồi |

### Luồng: BP-020 Theo dõi Tiến độ
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Tính toán Delta (Độ lệch)| Không | Lịch sử | Dữ liệu xu hướng | Không | Không | Đã tính toán |

### Luồng: BP-021 Bảng Xếp hạng
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Sắp xếp và ẩn danh | Có đồng ý (Opt-in)?| Điểm số | Thứ hạng | BR-020 | Không | Đã xếp hạng |

### Luồng: BP-022 Cấp Chứng chỉ
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Kiểm tra điều kiện | Điểm > 85? | Bảng điểm | Trạng thái | BR-021 | Không đủ ĐK| Đã duyệt |
| 2 | Hệ thống | Đúc (Mint) chứng chỉ | Không | Dữ liệu Người dùng| Tài sản (Asset) | Không | Không | Đã đúc |

### Luồng: BP-023 Quản lý Chiến dịch của Doanh nghiệp
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Doanh nghiệp | Xác định tham số chiến dịch| Không | Các đầu vào | Bản nháp | Không | Không | Nháp được lưu |
| 2 | Hệ thống | Xác minh tín dụng (Credits)| Tín dụng > 0? | Bản nháp | Phê duyệt | BR-022 | Lỗi tín dụng | Được phê duyệt |
| 3 | Hệ thống | Xuất bản chiến dịch | Không | Bản nháp | URL Hoạt động | Không | Không | Đã xuất bản |

### Luồng: BP-024 Bảng điều khiển Doanh nghiệp
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Tổng hợp chỉ số chiến dịch| Không | DB (CSDL) | Các chỉ số | Không | Không | Đã hiển thị (Render) |

### Luồng: BP-025 Hoạt động Quản trị
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Admin | Gửi thay đổi toàn cục | Không | Cấu hình | Payload | Không | Không | Đã gửi |
| 2 | Hệ thống | Xác minh quyền hạn | Là Admin? | Payload | Xác thực (Auth) | BR-023 | Bị từ chối | Đã ủy quyền |
| 3 | Hệ thống | Cam kết (Commit) và Audit| Không | Payload | Trạng thái DB | BR-024 | Không | Đã Commit |

### Luồng: BP-026 Quản lý Thông báo
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Kiểm tra tùy chọn | Có đồng ý nhận? | Sự kiện | Trạng thái | BR-025 | Bị chặn | Xử lý tiếp |
| 2 | Hệ thống | Gửi đi qua Gateway | Không | Payload | Phản hồi | Không | Thất bại | Đã gửi |

### Luồng: BP-027 Phân tích (Analytics)
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Thực thi ETL | Không | DB | Kho Dữ liệu | Không | Sự cố (Crash)| Đã đồng bộ |

### Luồng: BP-028 Ghi log Kiểm toán (Audit Logging)
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Hệ thống | Thêm mục nhật ký | Không | Payload | DB Kiểm toán | BR-026 | Báo động Ops | Đã lưu nhật ký |

### Luồng: BP-029 Quy trình Hỗ trợ
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Người dùng | Tạo Ticket (Vé) | Không | Chi tiết | ID Ticket | Không | Không | Đã tạo |
| 2 | Nhân viên | Giải quyết và trả lời | Đã giải quyết? | ID Ticket | Đóng vé (Closure)| Không | Leo thang | Đã đóng |

### Luồng: BP-030 Bảo trì Hệ thống
| Bước | Tác nhân | Hoạt động Nghiệp vụ | Quyết định | Đầu vào | Đầu ra | Quy tắc | Ngoại lệ | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|---|
| 1 | Đội Vận hành | Áp dụng bản vá | Thành công? | Code (Mã) | Trạng thái Mới | Không | Rollback | Đã nâng cấp |

---

## 6. Các Điểm Ra Quyết định (Decision Points)

| Mã Quyết định | Quyết định Nghiệp vụ | Điều kiện | Kết quả A | Kết quả B | Quy trình Liên quan |
|---|---|---|---|---|---|
| DEC-001 | Thanh toán thành công? | Cổng thanh toán xác nhận | Mở khóa Chiến dịch | Hiển thị Lỗi Từ chối | BP-008 |
| DEC-002 | Đã xác minh ID? | Độ tin cậy > 85% | Tiếp tục Kiểm tra Phần cứng| Từ chối Truy cập / Gắn cờ| BP-009 |
| DEC-003 | Thiết bị đạt chuẩn? | A/V Hoạt động, Ping < 200ms| Khởi tạo Phiên | Hiển thị Khắc phục sự cố | BP-010 |
| DEC-004 | Đánh giá AI hoàn tất? | Đạt đủ số lượng Tiêu chí | Kết thúc Phiên tự nhiên | Tiếp tục Đưa ra Lời nhắc | BP-012 |
| DEC-005 | Phát hiện gian lận? | Báo vi phạm nghiêm trọng | Chấm dứt Phỏng vấn | Ghi log Cảnh báo | BP-013 |
| DEC-006 | Đủ ĐK nhận Lộ trình? | Điểm năng lực < 70% | Tạo Nút (Node) học tập | Bỏ qua Năng lực | BP-017 |
| DEC-007 | Đủ ĐK nhận Chứng chỉ?| Tổng Điểm > 85% | Đúc (Mint) Chứng chỉ | Ghi log Kết quả Tiêu chuẩn| BP-022 |
| DEC-008 | Chiến dịch đang chạy? | Ngày Hiện tại < Ngày Kết thúc| Cho phép Đăng ký tham gia | Từ chối Đăng ký tham gia | BP-007 |
| DEC-009 | Tín dụng có đủ không? | Số dư >= Chi phí Chiến dịch | Xuất bản Chiến dịch | Yêu cầu Nạp tiền | BP-023 |
| DEC-010 | CV có đọc được không?| Độ tin cậy OCR > 80% | Phân tích ra JSON | Yêu cầu Nhập Thủ công | BP-005 |
| DEC-011 | Auth Admin hợp lệ? | Vai trò Người dùng = SuperAdmin| Xử lý Thay đổi Cấu hình | Từ chối Truy cập | BP-025 |
| DEC-012 | Email Duy nhất? | Không có trong DB | Tiếp tục | Báo lỗi Trùng lặp | BP-001 |
| DEC-013 | Đạt mức luyện tập tối thiểu?| Số lượt > 3 | Mở khóa Báo cáo Nâng cao | Khuyến khích Luyện tập | BP-019 |
| DEC-014 | Hồ sơ 100% hoàn thiện?| Tất cả các trường bắt buộc | Cho phép Ứng tuyển | Khóa quyền Ứng tuyển | BP-003 |
| DEC-015 | Đồng ý Bảng xếp hạng? | Cờ Quyền riêng tư (Privacy) = True| Hiện trên Bảng | Ẩn khỏi Bảng | BP-021 |

---

## 7. Ánh xạ Quy tắc Nghiệp vụ

| Mã Quy tắc | Quy tắc Nghiệp vụ | Quy trình Liên quan | Độ Ưu tiên | Tác động |
|---|---|---|---|---|
| BR-001 | Email người dùng phải là duy nhất trên toàn bộ hệ thống (tenant). | BP-001 | Cao | Ngăn chặn tài khoản trùng lặp. |
| BR-002 | Ứng viên phải hoàn thiện hồ sơ trước khi ứng tuyển. | BP-003, BP-007 | Cao | Đảm bảo tính đầy đủ của dữ liệu. |
| BR-003 | Khóa tài khoản sau 5 lần đăng nhập thất bại liên tiếp. | BP-002 | Nghiêm trọng | An ninh và Chống tấn công dò mật khẩu (brute force). |
| BR-004 | CV tải lên phải <10MB và ở định dạng PDF/DOCX. | BP-004 | Trung bình | Ngăn chặn phình bộ nhớ lưu trữ. |
| BR-005 | Chỉ cho phép một khuôn mặt đã được xác minh trong quá trình phỏng vấn. | BP-013 | Nghiêm trọng | Tính toàn vẹn chống gian lận. |
| BR-006 | Phỏng vấn tự động kết thúc nếu phát hiện gian lận nghiêm trọng. | BP-013 | Cao | Làm mất hiệu lực các phiên bị xâm phạm. |
| BR-007 | Báo cáo cao cấp yêu cầu thanh toán thành công (cleared). | BP-008, BP-015| Cao | Bảo vệ doanh thu. |
| BR-008 | Ứng viên phải vượt qua Xác minh ID để bắt đầu bài đánh giá. | BP-009 | Nghiêm trọng | Đảm bảo tính chống chối bỏ. |
| BR-009 | Chứng chỉ chỉ được tạo ra nếu điểm số > 85%. | BP-022 | Trung bình | Duy trì giá trị của chứng chỉ. |
| BR-010 | Lộ trình được xây dựng cho các năng lực có điểm < 70%. | BP-017 | Thấp | Nhắm mục tiêu học tập một cách hiệu quả. |
| BR-011 | Doanh nghiệp không thể xem PII của ứng viên nếu họ chọn Không đồng ý. | BP-024 | Nghiêm trọng | Tuân thủ quyền riêng tư dữ liệu. |
| BR-012 | Bảo trì hệ thống phải thông báo cho người dùng trước 48h. | BP-030 | Trung bình | Tuân thủ SLA. |
| BR-013 | Log kiểm toán (audit logs) phải là bất biến (WORM). | BP-028 | Nghiêm trọng | Truy xuất nguồn gốc mang tính pháp lý. |
| BR-014 | Việc đăng ký tham gia chiến dịch sẽ bị khóa khi đạt đủ số lượng. | BP-007 | Cao | Quản lý khối lượng đánh giá. |
| BR-015 | Phiên luyện tập không làm trừ tín dụng (credits) của doanh nghiệp. | BP-019 | Trung bình | Khuyến khích ứng viên chuẩn bị. |

---

## 8. Xử lý Ngoại lệ

| Mã Ngoại lệ | Nguyên nhân | Tác động Nghiệp vụ | Quy trình Khôi phục | Thông báo cho Người dùng | Phương án dự phòng (Fallback) |
|---|---|---|---|---|---|
| EXC-001 | Lỗi Xác thực | Người dùng bị chặn | Luồng Đặt lại Mật khẩu | "Thông tin đăng nhập không hợp lệ" | Liên hệ Bộ phận Hỗ trợ |
| EXC-002 | Lỗi Thanh toán | Doanh thu bị trì hoãn | Thử lại với thẻ mới | "Giao dịch Bị từ chối" | Giỏ hàng đã lưu |
| EXC-003 | Mất Kết nối Mạng | Buổi phỏng vấn bị rớt | Cho phép 2 phút kết nối lại | "Mất kết nối" | Khôi phục lại Trạng thái |
| EXC-004 | Camera không khả dụng| Không thể đánh giá | Nhắc nhở cấp quyền | "Bắt buộc có Camera" | Hủy bỏ Phiên |
| EXC-005 | Xác minh ID Thất bại | Rủi ro gian lận | Khóa Phiên | "Xác minh Thất bại" | HR Xem xét Thủ công |
| EXC-006 | Dịch vụ AI mất kết nối | Ngưng trệ (Outage) | Hoãn việc đánh giá | "Dịch vụ Bị suy giảm" | Email khi hệ thống ổn định |
| EXC-007 | Chiến dịch Hết hạn | Bỏ lỡ cơ hội | Chặn đăng ký | "Chiến dịch đã đóng" | Hiển thị Chiến dịch Tương tự |
| EXC-008 | Hết Tín dụng | Chặn doanh nghiệp | Yêu cầu nạp tiền | "Hết Tín dụng" | Lưu Bản nháp |
| EXC-009 | Lỗi Phân tích CV | Thiếu dữ liệu | Nhập liệu thủ công | "Không thể đọc CV" | Nhập qua Biểu mẫu (Form) |
| EXC-010 | Hết thời gian Phiên | Không hoạt động | Chấm dứt một cách an toàn| "Phiên đã Hết hạn" | Yêu cầu Đăng nhập mới |

---

## 9. Phụ thuộc Quy trình Nghiệp vụ

| Quy trình Tiền nhiệm | Quy trình Phụ thuộc | Loại Phụ thuộc | Mô tả |
|---|---|---|---|
| BP-001 Đăng ký | BP-002 Xác thực | Cứng (Hard) | Người dùng không thể xác thực nếu không có tài khoản. |
| BP-002 Xác thực | BP-003 Quản lý Hồ sơ | Cứng | Phải đăng nhập để chỉnh sửa hồ sơ. |
| BP-004 Tải lên CV | BP-005 Phân tích CV | Cứng | Tệp phải tồn tại trước khi phân tích. |
| BP-005 Phân tích CV | BP-006 Khám phá Chiến dịch | Mềm (Soft) | Kỹ năng được trích xuất cải thiện đề xuất chiến dịch. |
| BP-006 Khám phá Chiến dịch| BP-007 Đăng ký Chiến dịch | Cứng | Phải tìm thấy chiến dịch mới có thể đăng ký. |
| BP-007 Đăng ký Chiến dịch | BP-008 Thanh toán | Có điều kiện | Bắt buộc thanh toán nếu là chiến dịch cao cấp. |
| BP-007 Đăng ký Chiến dịch | BP-009 Xác minh Danh tính | Cứng | Phải đăng ký thì mới bắt đầu khâu kiểm tra trước phỏng vấn. |
| BP-009 Xác minh Danh tính | BP-010 Kiểm tra Thiết bị | Cứng | Danh tính phải được xác nhận trước khi cấp phát tài nguyên phần cứng. |
| BP-010 Kiểm tra Thiết bị | BP-011 Khởi tạo Phỏng vấn | Cứng | Thiết bị phải đạt thì mới kết nối được với AI. |
| BP-011 Khởi tạo Phỏng vấn | BP-012 Phiên Phỏng vấn AI | Cứng | Phiên phải khởi tạo thì mới trò chuyện được. |
| BP-012 Phiên Phỏng vấn AI | BP-014 Đánh giá AI | Cứng | Dữ liệu trò chuyện cần thiết cho việc chấm điểm. |
| BP-014 Đánh giá AI | BP-015 Xuất Báo cáo | Cứng | Điểm số thô cần thiết để xuất PDF. |
| BP-015 Xuất Báo cáo | BP-017 Tạo Lộ trình | Cứng | Báo cáo cuối cùng chỉ ra các lỗ hổng học tập. |
| BP-017 Tạo Lộ trình | BP-018 Đề xuất Học phần | Cứng | Cần có các nút (nodes) để đề xuất liên kết (links). |
| BP-023 Chiến dịch của DN | BP-006 Khám phá Chiến dịch | Cứng | Doanh nghiệp phải tạo chiến dịch trước khi ứng viên tìm thấy nó. |

---

## 10. Các Chỉ số Hiệu suất Chính (KPI) của Quy trình Nghiệp vụ

| Mã KPI | Tên Chỉ số | Mục tiêu | Tần suất Đo lường | Liên kết Quy trình |
|---|---|---|---|---|
| KPI-01 | Tỷ lệ Đăng ký Thành công | > 98% | Hàng ngày | BP-001 |
| KPI-02 | Tỷ lệ Lỗi Xác thực | < 2% | Hàng ngày | BP-002 |
| KPI-03 | Tỷ lệ Hoàn thiện Hồ sơ | > 85% | Hàng tuần | BP-003 |
| KPI-04 | Tỷ lệ Tải CV Thành công | > 99% | Hàng ngày | BP-004 |
| KPI-05 | Thời gian Xử lý CV Trung bình | < 5 giây | Thời gian thực | BP-005 |
| KPI-06 | Tỷ lệ Đăng ký Chiến dịch | > 60% từ Xem đến Đăng ký | Hàng tuần | BP-007 |
| KPI-07 | Tỷ lệ Thanh toán Thành công | > 95% | Hàng ngày | BP-008 |
| KPI-08 | Tỷ lệ Đạt Xác minh ID | > 90% ngay lần đầu | Hàng ngày | BP-009 |
| KPI-09 | Tỷ lệ Đạt Kiểm tra Thiết bị | > 95% | Hàng ngày | BP-010 |
| KPI-10 | Tỷ lệ Bỏ ngang Phỏng vấn | < 5% | Hàng ngày | BP-012 |
| KPI-11 | Tỷ lệ Hoàn thành Phỏng vấn | > 95% | Hàng ngày | BP-012 |
| KPI-12 | Thời gian Đánh giá AI | < 30 giây sau khi xong phiên | Thời gian thực | BP-014 |
| KPI-13 | Thời gian Xuất Báo cáo | < 10 giây | Thời gian thực | BP-015 |
| KPI-14 | Tỷ lệ Tạo Lộ trình | 100% người được đánh giá | Hàng tuần | BP-017 |
| KPI-15 | Độ Sử dụng Phiên Luyện tập | > 40% số ứng viên | Hàng tháng | BP-019 |
| KPI-16 | Tỷ lệ Hoàn thành Học tập | > 20% | Hàng tháng | BP-018 |
| KPI-17 | Tỷ lệ Cấp Chứng chỉ | < 15% (tính độc quyền) | Hàng tháng | BP-022 |
| KPI-18 | Thành công C.dịch Doanh nghiệp| > 5 người tuyển được / chiến dịch | Hàng quý | BP-023 |
| KPI-19 | Thời gian Tuyển dụng của DN | Giảm 40% | Hàng quý | L0-01 |
| KPI-20 | Tỷ lệ Mở Thông báo | > 60% | Hàng tuần | BP-026 |
| KPI-21 | Thời gian Trung bình Xử lý Lỗi | < 24 giờ | Hàng tuần | BP-029 |
| KPI-22 | Thời gian Hoạt động Hệ thống (Uptime)| 99.99% | Hàng tháng | BP-030 |
| KPI-23 | Tỷ lệ Phát hiện Gian lận | > 99% thực sự vi phạm (true positives)| Hàng tháng | BP-013 |
| KPI-24 | Sự Hài lòng của Ứng viên (CSAT) | > 4.5 / 5 | Liên tục | L0-01 |
| KPI-25 | Điểm Hài lòng của Doanh nghiệp | > 4.5 / 5 | Liên tục | L0-01 |

---

## 11. Ma trận Quy trình Liên chức năng

*R = Chịu trách nhiệm (Responsible), A = Phê duyệt/Trách nhiệm giải trình (Accountable), C = Tham vấn (Consulted), I = Thông báo (Informed)*

| Hạng mục Quy trình | Ứng viên | Doanh nghiệp | HR/Nhà tuyển dụng | Quản trị viên | Tài chính | Lõi AI | Hỗ trợ |
|---|---|---|---|---|---|---|---|
| BP-001 đến BP-005 (Hồ sơ)| R | I | I | A | - | R | C |
| BP-006 đến BP-008 (Đăng ký) | R | C | - | A | I | - | C |
| BP-009 đến BP-013 (Phỏng vấn)| R | I | - | A | - | R | C |
| BP-014 đến BP-016 (Đánh giá) | I | I | C | A | - | R | C |
| BP-017 đến BP-022 (Học tập) | R | I | - | A | - | R | C |
| BP-023 đến BP-024 (Doanh nghiệp)| I | R | R | A | I | - | C |
| BP-025 đến BP-030 (Quản trị) | I | I | I | R/A | I | I | R |

---

## 12. Quản trị Quy trình

*   **Quyền Sở hữu Quy trình:** Giám đốc Điều hành (COO) và Trưởng bộ phận Sản phẩm đồng sở hữu bức tranh toàn cảnh quy trình L0 và L1. Các Quản lý Sản phẩm (Product Manager) riêng lẻ sở hữu các quy trình L2 và L3.
*   **Luồng Phê duyệt:** Mọi sửa đổi đối với các quy trình nghiệp vụ cốt lõi đều yêu cầu gửi trình Hội đồng Tư vấn Thay đổi (CAB), đảm bảo không có tác động tiêu cực đến tính hợp lệ của việc chấm điểm AI hoặc tính tuân thủ pháp lý.
*   **Quản lý Thay đổi:** Các bản cập nhật đối với luồng công việc sẽ được truyền đạt thông qua ghi chú phát hành (Release Notes) (BP-026).
*   **Tuân thủ:** Các quy trình tuân thủ GDPR, CCPA và luật dữ liệu sinh trắc học của khu vực.
*   **Giám sát:** Đội ngũ Phân tích dữ liệu (Analytics team) (BP-027) liên tục theo dõi các KPI của quy trình.
*   **Cải tiến Liên tục:** Đánh giá hàng tháng về tỷ lệ CSAT và Tỷ lệ Bỏ ngang nhằm hợp lý hóa khâu Xác minh (BP-009) và Phỏng vấn (BP-012).
*   **Yêu cầu Kiểm toán:** Tất cả các thao tác của Quản trị viên và Doanh nghiệp đều phải được lưu trữ vào CSDL hệ thống WORM (BP-028) trong thời hạn 3 năm.

---

## 13. Rủi ro Quy trình

| Mã Rủi ro | Quy trình Nghiệp vụ | Rủi ro | Tác động | Khả năng xảy ra | Khắc phục |
|---|---|---|---|---|---|
| RSK-01 | BP-012 Phỏng vấn AI | Ứng viên bỏ ngang giữa phiên do lỗi UX | Cao | Trung bình | Triển khai UI trực quan, tự động lưu liên tục, hướng dẫn rõ ràng. |
| RSK-02 | BP-008 Thanh toán | Sự cố Cổng thanh toán ngăn cản việc chuyển đổi | Nghiêm trọng | Thấp | Triển khai cổng dự phòng phụ; thử lại theo hàng đợi (queued retries). |
| RSK-03 | BP-013 Giám sát | Phát hiện gian lận sai (False positive) | Cao | Trung bình | Tùy chọn có con người tham gia xem xét; tinh chỉnh ngưỡng tin cậy của AI. |
| RSK-04 | BP-014 Đánh giá AI | Hiện tượng AI ảo giác (Hallucination) khi chấm điểm | Nghiêm trọng | Thấp | Giới hạn nghiêm ngặt AI trong ánh xạ tiêu chí xác định; kiểm toán thường xuyên. |
| RSK-05 | BP-030 Bảo trì | Ngưng trệ dịch vụ ngoài kế hoạch | Cao | Thấp | Triển khai nền tảng Cloud Multi-AZ (Đa vùng sẵn sàng); môi trường staging nghiêm ngặt. |
| RSK-06 | BP-005 Phân tích CV | Lỗi khi phân tích các định dạng CV phi tiêu chuẩn | Trung bình | Cao | Phương án dự phòng chuyển sang luồng nhập liệu ứng viên thủ công. |
| RSK-07 | BP-009 Xác minh | Sinh trắc học nhận diện sai gây lỗi False Negative | Cao | Trung bình | Sử dụng các mô hình thị giác (vision models) bên thứ 3 khách quan, đã qua kiểm toán; cho phép ghi đè thủ công (manual override). |

---

## 14. Truy xuất Nguồn gốc Quy trình (Traceability)

| Quy trình Nghiệp vụ | Yêu cầu Nghiệp vụ | Vai trò Người dùng | Liên kết Kịch bản Kiểm thử | Tiêu chí Chấp nhận (Acceptance Criteria) |
|---|---|---|---|---|
| BP-001 Đăng ký | REQ-USR-01 | Ứng viên, Doanh nghiệp | TS-001 | Người dùng được tạo thành công trong DB |
| BP-005 Phân tích CV | REQ-AI-01 | Hệ thống | TS-005 | JSON ánh xạ thành công tới 90% các trường hồ sơ |
| BP-008 Thanh toán | REQ-FIN-01 | Ứng viên, Doanh nghiệp | TS-008 | Sổ cái tài khoản cập nhật trong vòng 2 giây |
| BP-012 Phỏng vấn AI | REQ-AI-02 | Ứng viên, Lõi AI | TS-012 | Độ trễ dưới 500ms cho mỗi lượt phản hồi |
| BP-014 Đánh giá AI | REQ-AI-03 | Lõi AI | TS-014 | Kết quả xuất ra tuân thủ tuyệt đối Lược đồ Tiêu chí (Rubric Schema) |
| BP-017 Lộ trình | REQ-LRN-01 | Ứng viên, Lõi AI | TS-017 | Các nút sinh ra ánh xạ đúng với điểm số dưới 70% |
| BP-023 Chiến dịch | REQ-EMP-01 | Doanh nghiệp | TS-023 | Chiến dịch được xuất bản và có thể tìm kiếm được |
| BP-028 Ghi log Kiểm toán| REQ-SEC-01 | Hệ thống | TS-028 | Mục nhập nhật ký được ký xác thực bằng mật mã (cryptographically signed) |

---

## 15. Tóm tắt Quy trình Nghiệp vụ

Nền tảng ISAS hoạt động dựa trên một vòng đời được tích hợp chặt chẽ, được thiết kế để loại bỏ tối đa sự cản trở mang tính thủ công trong quy trình tuyển dụng. Bằng cách tự động hóa việc xây dựng hồ sơ ứng viên (BP-001 đến BP-005), điều phối liền mạch các đánh giá bảo mật (BP-009 đến BP-014) và đưa ra các thông tin phát triển có thể thực thi (BP-017 đến BP-022), nền tảng mang lại giá trị to lớn cho cả hai mảng B2B và B2C.

**Yếu tố Thành công:**
1.  **Xác minh không trở ngại:** Đảm bảo BP-009 và BP-010 hoạt động đáng tin cậy để ngăn chặn việc ứng viên bỏ ngang.
2.  **Mức độ trôi chảy khi đàm thoại:** Độ trễ và độ chính xác của BP-012 sẽ quyết định cảm nhận của người dùng về nền tảng.
3.  **Đánh giá Khách quan:** BP-014 phải luôn khách quan, mang tính xác định (deterministic) và hoàn toàn minh bạch.

**Mở rộng Quy trình trong Tương lai:**
Các giai đoạn tương lai sẽ giới thiệu thêm các quy trình tuân thủ được bản địa hóa, đánh giá đa ngôn ngữ và các luồng công việc tích hợp sâu với hệ thống theo dõi ứng viên (ATS - Applicant Tracking System) nhằm nhúng ISAS sâu hơn vào hệ sinh thái tuyển dụng của doanh nghiệp.