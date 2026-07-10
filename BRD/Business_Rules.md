# 08_Quy_tac_Nghiep_vu.md

## 1. Mục đích Tài liệu

### 1.1 Mục đích
Tài liệu Đặc tả Quy tắc Nghiệp vụ (BRS) này thiết lập bộ tiêu chuẩn cuối cùng về các chính sách vận hành, ràng buộc, xác thực, logic ra quyết định và cấu trúc quản trị kiểm soát Hệ thống Phỏng vấn & Đánh giá Kỹ năng bằng AI (ISAS). Nó đóng vai trò như một bản "hiến pháp" vận hành của nền tảng, chính thức hóa cách các khái niệm nghiệp vụ tương tác với nhau, thực thi việc tuân thủ các quy định và bảo vệ tính toàn vẹn của tổ chức.

### 1.2 Phạm vi
Tài liệu này bao trùm tất cả các lĩnh vực chức năng cốt lõi của hệ sinh thái doanh nghiệp ISAS, bao gồm nhưng không giới hạn ở: Xác thực Đa yếu tố (MFA), Quản lý Tài khoản Đa khách thuê (Multi-Tenant), Quản lý Hồ sơ Ứng viên & CV Nâng cao, Vòng đời Chiến dịch Tự động, Đăng ký Đa tiền tệ, Phỏng vấn Đồng bộ/Bất đồng bộ bằng AI, Phát hiện Gian lận thời gian thực, Đánh giá Kỹ năng AI có Trọng số, Tạo Lộ trình Học tập Động, Chứng chỉ Kỹ thuật số Xác minh bằng Mật mã, và Khung Tuân thủ Doanh nghiệp. Tài liệu này loại trừ mọi chi tiết triển khai kỹ thuật như thành phần UI/UX, lập chỉ mục cơ sở dữ liệu cụ thể, cấu trúc định tuyến API hoặc định nghĩa hạ tầng đám mây cấp thấp.

### 1.3 Đối tượng Hướng tới
Tài liệu này được thiết kế cho các bên liên quan trong toàn bộ vòng đời doanh nghiệp:
*   **Product Owners và Senior Business Analysts:** Để xác thực sự phù hợp trong vận hành và đánh giá các yêu cầu thay đổi.
*   **Enterprise Solution Architects và Developers:** Để xây dựng các kiến trúc phần mềm tất định phản ánh chính xác các ràng buộc của tổ chức.
*   **Quality Assurance Engineers:** Để thiết kế các kịch bản kiểm thử tự động, kịch bản xác thực và danh sách kiểm tra tuân thủ.
*   **Compliance and Legal Officers (Cán bộ Pháp lý và Tuân thủ):** Để kiểm toán việc tuân thủ các luật bảo mật dữ liệu toàn cầu (GDPR, CCPA), các giao thức bảo mật và tiêu chuẩn tuyển dụng công bằng.

### 1.4 Mối quan hệ với Tài liệu Yêu cầu Nghiệp vụ (BRD)
Trong khi BRD phác thảo *những gì* là mục tiêu và khả năng cấp cao của nền tảng, thì BRS chính thức hóa *cách thức* các mục tiêu đó bị giới hạn một cách có hệ thống. BRD nêu rõ mong muốn nghiệp vụ về việc sàng lọc ứng viên tự động; BRS này xác định chính xác các điều kiện cấu trúc, ngưỡng thuật toán và các ràng buộc cứng mà quá trình sàng lọc đó phải tuân theo khi vận hành.

### 1.5 Mối quan hệ với Yêu cầu Chức năng
Yêu cầu chức năng xác định các hành động phần mềm và tương tác của người dùng. BRS này cung cấp các nền tảng logic cơ bản mà các yêu cầu chức năng đó phải gọi đến. Một yêu cầu chức năng chỉ định rằng người dùng có thể nhấp vào nút "Thanh toán"; quy tắc nghiệp vụ tương ứng xác định xem các điều kiện về tính toán tín dụng, giới hạn gói cước và tiêu chí tạo hóa đơn đã được đáp ứng trước khi thực thi chức năng phần mềm đó hay chưa.

### 1.6 Tầm quan trọng của Quy tắc Nghiệp vụ
Các quy tắc nghiệp vụ bảo vệ trí tuệ tổ chức, thực thi tính nhất quán trong vận hành trên các môi trường phân tán, giảm thiểu rủi ro tuân thủ và cho phép ra quyết định tự động. Bằng cách tách biệt logic nghiệp vụ khỏi mã nguồn, tổ chức đảm bảo tính linh hoạt, khả năng kiểm toán và hành vi tất định tuyệt đối của các công cụ AI tự động.

---

## 2. Tổng quan Quy tắc Nghiệp vụ

### 2.1 Định nghĩa Quy tắc Nghiệp vụ
Phù hợp với Ngữ nghĩa Từ vựng Nghiệp vụ và Quy tắc Nghiệp vụ (SBVR) và BABOK v3, quy tắc nghiệp vụ là một chỉ thị định nghĩa hoặc ràng buộc một số khía cạnh của doanh nghiệp. Nó nhằm mục đích khẳng định cấu trúc nghiệp vụ hoặc để kiểm soát, tác động đến hành vi của doanh nghiệp.

### 2.2 Các phân loại Quy tắc
Để đảm bảo phân loại cấu trúc nghiêm ngặt, nền tảng ISAS phân loại logic vận hành của mình thành sáu loại riêng biệt:
*   **Policy Rules - Quy tắc Chính sách (PLY):** Các chỉ thị vận hành cấp cao quản lý chiến lược tổ chức, lập trường pháp lý và các mô hình trên toàn nền tảng.
*   **Validation Rules - Quy tắc Xác thực (VAL):** Các ràng buộc cấu trúc áp dụng cho đầu vào, cấu hình và trạng thái dữ liệu để đảm bảo tính đúng đắn của hệ thống và ngăn ngừa lỗi.
*   **Decision Rules - Quy tắc Quyết định (DEC):** Logic cấu trúc đa biến, có điều kiện nhằm đánh giá các bộ đầu vào để tạo ra kết quả vận hành tất định hoặc thay đổi trạng thái.
*   **Calculation Rules - Quy tắc Tính toán (CAL):** Các công thức toán học, thống kê và đại số tính toán giá cả, ngưỡng động, điểm AI và tổng hợp số liệu.
*   **Authorization Rules - Quy tắc Phân quyền (AUT):** Các ranh giới ràng buộc rõ ràng ánh xạ các vai trò trong tổ chức, gói đăng ký và hệ thống phân cấp đa khách thuê (multi-tenant) vào các tương tác hệ thống.
*   **Compliance Rules - Quy tắc Tuân thủ (CMP):** Các quy định pháp lý, đạo đức, quy định và kiểm toán đảm bảo tuân thủ nghiêm ngặt các đạo luật địa phương và quốc tế.

### 2.3 Quản trị Quy tắc
Mỗi quy tắc nghiệp vụ trong tài liệu này được coi là một tài sản doanh nghiệp. Các quy tắc phải tuân theo việc đánh phiên bản nghiêm ngặt, quản lý thay đổi chính thức, đánh giá hàng năm và lập bản đồ truy xuất nguồn gốc tự động. Không có quy tắc nghiệp vụ nào được phép sửa đổi, bỏ qua hoặc loại bỏ mà không có sự phê duyệt chính thức từ Hội đồng Tư vấn Thay đổi (CAB) và Kiến trúc sư Quy tắc Nghiệp vụ được chỉ định.

---

## 3. Danh mục Quy tắc Nghiệp vụ

Nền tảng ISAS phân tách các quy tắc của mình thành hai mươi (20) danh mục hoạt động cốt lõi để đảm bảo bao phủ toàn diện chức năng mà không có khoảng trống:

| Mã Danh mục | Tên Danh mục | Mô tả Phạm vi Chức năng |
| :--- | :--- | :--- |
| **AUT** | Authentication (Xác thực) | Ranh giới bảo mật, chính sách đa yếu tố và ràng buộc tính toàn vẹn phiên. |
| **ACC** | Account Management (Quản lý Tài khoản) | Cấu trúc khách thuê (tenant), quy trình đăng ký và giới hạn tổ chức. |
| **PRF** | Profile Management (Quản lý Hồ sơ) | Tính toàn vẹn dữ liệu cấu trúc cho hồ sơ cá nhân và tổ chức. |
| **CVM** | CV Management (Quản lý CV) | Ngưỡng phân tích cú pháp tài liệu, xác thực dữ liệu và ràng buộc trích xuất. |
| **CAM** | Campaign Management (Quản lý Chiến dịch) | Vòng đời vận hành, giới hạn và thông số hiển thị của các nhiệm vụ tuyển dụng. |
| **PAY** | Payment & Subscriptions (Thanh toán & Đăng ký) | Cấu trúc phí, lịch thanh toán, logic tín dụng và ranh giới giao dịch. |
| **INT** | Interview Execution (Thực hiện Phỏng vấn) | Giới hạn luồng ứng viên theo thời gian thực, quy tắc môi trường và bộ đếm thời gian. |
| **IDV** | Identity Verification (Xác minh Danh tính) | Tiêu chí khớp sinh trắc học, kiểm soát gian lận và giới hạn xác minh pháp lý. |
| **AIA** | AI Assessment (Đánh giá AI) | Logic tính điểm, chuẩn hóa, giá trị độ tin cậy và tiêu chí đề xuất. |
| **RDM** | Learning Roadmap (Lộ trình Học tập) | Xây dựng chương trình giảng dạy động, lỗ hổng kỹ năng và tiến trình thích ứng. |
| **CRT** | Certificates (Chứng chỉ) | Tiêu chí cấp phát, xác thực tính toàn vẹn mật mã và logic thu hồi. |
| **REP** | Reports & Analytics (Báo cáo & Phân tích) | Tổng hợp dữ liệu, quy tắc che giấu (masking), giới hạn chéo khách thuê và số liệu. |
| **NOT** | Notifications (Thông báo) | Trình kích hoạt sự kiện, tùy chọn kênh, lịch gửi và giới hạn SLA. |
| **ADM** | Administration (Quản trị) | Kiểm soát cấu hình toàn hệ thống, cờ tính năng (feature flags) và ghi đè cách ly khách thuê. |
| **SEC** | Security (Bảo mật) | Mã hóa, quy tắc zero-trust, giới hạn kịch bản chéo trang (XSS) và chính sách tường lửa. |
| **CMP** | Compliance & Legal (Tuân thủ & Pháp lý) | Khung pháp lý, tiêu chí GDPR/CCPA và bộ lọc cơ hội bình đẳng. |
| **AUD** | Audit & Logging (Kiểm toán & Ghi nhật ký) | Theo dõi lịch sử bất biến, theo dõi tuân thủ và theo dõi quản trị. |
| **DGV** | Data Governance (Quản trị Dữ liệu) | Che giấu dữ liệu, lịch trình tiêu hủy, lưu trữ lịch sử và ranh giới bản địa hóa dữ liệu. |
| **VAL** | Input Validation (Xác thực Đầu vào) | Xác minh dữ liệu có cấu trúc nguyên thủy và phức tạp trên tất cả các điểm truy cập hệ thống. |
| **DEC** | Core Operational Decisions (Quyết định Vận hành Cốt lõi) | Các thay đổi trạng thái nghiệp vụ cấp vĩ mô được xác định bởi các đánh giá đa biến. |

---

## 4. Chi tiết Quy tắc Nghiệp vụ

Phần này chứa danh mục gốc toàn diện về các quy tắc cốt lõi của doanh nghiệp. (Lưu ý: Các quy tắc dành riêng cho danh mục và bảng xác thực toàn diện được mở rộng đầy đủ trong các Phần từ 5 đến 17).

### 4.1 Mô hình Bố cục Cấu trúc
Mỗi quy tắc tuân theo các thuộc tính cấu trúc nghiêm ngặt được xác định dưới đây để đảm bảo khả năng đo lường và kiểm thử tuyệt đối:
*   **Rule ID:** Chuỗi chữ và số duy nhất, có thể dự đoán được (`BRL-XXX`).
*   **Rule Statement:** Ràng buộc cấu trúc rõ ràng sử dụng các động từ khuyết thiếu bắt buộc (`PHẢI/MUST`, `KHÔNG ĐƯỢC/MUST NOT`, `NÊN/SHOULD`, `KHÔNG NÊN/SHOULD NOT`) như được định nghĩa trong ISO/IEC/IEEE 29148.
*   **Business Justification:** Lý do rõ ràng về mặt doanh nghiệp, quản lý rủi ro, tài chính hoặc pháp lý cho sự tồn tại của quy tắc.

### 4.2 Sổ đăng ký Quy tắc Cốt lõi Toàn diện (BRL-001 đến BRL-070)

| Rule ID | Tên Quy tắc | Danh mục | Tuyên bố Quy tắc | Lý do Nghiệp vụ | Kết quả Mong đợi | Mức ưu tiên |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BRL-001** | Cách ly Chéo Khách thuê | Tài khoản | Dữ liệu thuộc về một Khách thuê (Tenant) KHÔNG ĐƯỢC phép hiển thị, truy cập hoặc truy vấn bởi bất kỳ người dùng nào từ một Khách thuê khác trong bất kỳ trường hợp nào. | Quyền riêng tư dữ liệu, trách nhiệm pháp lý và phân tách nghiêm ngặt về đa khách thuê theo luật. | Cách ly dữ liệu tuyệt đối giữa các khách hàng doanh nghiệp riêng biệt. | Đặc biệt nghiêm trọng |
| **BRL-002** | Sự Đồng ý Rõ ràng của Ứng viên | Tuân thủ | Một ứng viên PHẢI chấp nhận rõ ràng Chính sách Đánh giá AI và Xử lý Dữ liệu trước khi bắt đầu bất kỳ cuộc phỏng vấn hoặc ghi âm nào. | Tuân thủ GDPR Điều 6/9 và nguyên tắc sinh trắc học CCPA. | Bị chặn thực thi nếu từ chối hoặc rút lại sự đồng ý. | Đặc biệt nghiêm trọng |
| **BRL-003** | Chuẩn hóa Tiền tệ | Thanh toán | Tất cả các bản ghi giao dịch, hóa đơn và giá trị tín dụng trong hệ thống lõi PHẢI được tính toán và theo dõi bằng giá trị cơ sở USD. | Loại bỏ sự sai lệch trong kế toán và lỗi dao động chéo tiền tệ. | Sổ cái đa tiền tệ thống nhất, nhất quán, có thể kiểm toán được. | Cao |
| **BRL-004** | Loại trừ Hình ảnh Base64 | Quản lý CV | Các tệp CV chứa nội dung đã được phân tích cú pháp KHÔNG ĐƯỢC giữ lại hình ảnh base64 thô nội tuyến trong đối tượng dữ liệu văn bản có thể tìm kiếm được trích xuất. | Tối ưu hóa chi phí lưu trữ vận hành và sự ổn định hiệu suất hệ thống. | Các chỉ mục trích xuất văn bản sạch không có tải trọng quá lớn. | Trung bình |
| **BRL-005** | Tính Đơn nhất của Phòng Phỏng vấn | Phỏng vấn | Một Ứng viên KHÔNG ĐƯỢC sở hữu nhiều hơn một phiên phỏng vấn đang hoạt động, chưa hết hạn trên toàn bộ nền tảng tại bất kỳ thời điểm nào. | Ngăn chặn lạm dụng nền tảng, khai thác tính đồng thời và gian lận song song. | Các nỗ lực khởi tạo phòng thứ cấp bị chấm dứt ngay lập tức. | Cao |
| **BRL-006** | Bắt buộc Chuẩn hóa Điểm | Đánh giá AI | Mọi điểm số gốc của mô hình đánh giá AI PHẢI được chuẩn hóa toán học theo thang đo chuẩn từ 0.00 đến 100.00 trước khi lưu trữ. | Cho phép so sánh chéo công bằng, minh bạch giữa các mô hình và sàng lọc nhân tài thống nhất. | Các số liệu hiệu suất ứng viên có cấu trúc nhất quán trên các chiến dịch. | Cao |
| **BRL-007** | Khóa Thu hồi Chứng chỉ | Chứng chỉ | Khi một chứng chỉ kỹ năng đã cấp chính thức bị đánh dấu là Bị thu hồi (Revoked), trạng thái xác thực của nó PHẢI vĩnh viễn trả về false và không thể hoàn tác. | Giữ gìn độ tin cậy, bảo mật và tính toàn vẹn tuyệt đối của các thông tin xác thực trên nền tảng. | Các nỗ lực xác minh của bên thứ ba thất bại với trạng thái 'Bị thu hồi' mang tính mô tả. | Đặc biệt nghiêm trọng |
| **BRL-008** | Ngủ đông Người dùng Không hoạt động | Tài khoản | Các tài khoản không có hoạt động đăng nhập thành công trong 365 ngày liên tục PHẢI tự động bị gắn cờ là Không hoạt động và bị đình chỉ đăng nhập. | Giảm thiểu các rủi ro tấn công bề mặt bảo mật và chi phí cấp phép hệ thống vận hành. | Quyền truy cập của người dùng bị chặn cho đến khi có sự kích hoạt lại rõ ràng từ quản trị viên. | Trung bình |
| **BRL-009** | Vòng đời Token Động | Xác thực | Token phiên xác thực API PHẢI tự động hết hạn chính xác 15 phút sau khi phát hành nếu không có hoạt động giao dịch nào xảy ra. | Giảm thiểu rủi ro cướp phiên, sử dụng token trái phép và rò rỉ dữ liệu. | Hết hạn yêu cầu ứng dụng máy khách hoàn tất quy trình xác thực lại trong im lặng. | Cao |
| **BRL-010** | Tính Bất biến Kiểm toán Doanh nghiệp | Kiểm toán | Các mục được ghi vào sổ cái kiểm toán hệ thống KHÔNG ĐƯỢC cập nhật, xóa hoặc sắp xếp lại bởi bất kỳ vai trò người dùng nào, kể cả Super Admins. | Tuân thủ Sox, SOC2 và các quy định chống giả mạo quốc tế. | Mô hình thực thi nhật ký chỉ thêm (append-only) được xác thực bằng mật mã. | Đặc biệt nghiêm trọng |
| **BRL-011** | Ngưỡng Đạt Tối thiểu | Học tập | Một học viên PHẢI đạt điểm mô-đun tổng hợp từ 80.00% trở lên để đánh dấu một mô-đun chủ đề cốt lõi trên lộ trình là Đã hoàn thành (Completed). | Đảm bảo sự thành thạo kỹ năng nghiêm ngặt trước khi thăng cấp lên các khái niệm nâng cao. | Khóa tự động các mô-đun ở phía sau cho đến khi đạt được điểm mục tiêu. | Cao |
| **BRL-012** | Ràng buộc Xuất bản Chiến dịch | Chiến dịch | Nhà tuyển dụng KHÔNG ĐƯỢC xuất bản chiến dịch phỏng vấn mà không xác định ít nhất một kỹ năng mục tiêu rõ ràng và một mô hình đánh giá bắt buộc. | Ngăn ngừa luồng công việc người dùng bị lỗi và bảo vệ các tác vụ phân tích AI ở phía sau. | Hệ thống ném ra lỗi xác thực chặn việc đổi trạng thái thành "Đã xuất bản". | Cao |
| **BRL-013** | Kiểm tra Tính năng Gói đăng ký | Thanh toán | Hệ thống PHẢI chặn quyền truy cập vào các tính năng phân tích nâng cao nếu trạng thái gói đăng ký hiện tại của Nhà tuyển dụng là Grace_Period (Thời gian ân hạn). | Khuyến khích thanh toán gói đăng ký đúng hạn và bảo vệ giá trị hệ thống cao cấp. | Người dùng được chuyển hướng an toàn đến màn hình gia hạn gói đăng ký tài khoản. | Cao |
| **BRL-014** | Chấm dứt Giám thị Tích hợp | Phỏng vấn | Nếu mô-đun giám thị tự động phát hiện tình trạng "Vi phạm Nghiêm trọng", hệ thống PHẢI ngay lập tức gắn cờ nhật ký thực thi bài kiểm tra. | Duy trì tính toàn vẹn cấu trúc tuyệt đối của quá trình sàng lọc tự động. | Ứng viên được phép hoàn thành nhưng bản ghi được gắn cờ ngay lập tức cho bộ phận Nhân sự. | Cao |
| **BRL-015** | Quy tắc Che giấu PII | Phân tích | Các trường thông tin nhận dạng cá nhân (PII) của Ứng viên (Tên, Số điện thoại, Email) PHẢI được che giấu khi dữ liệu đánh giá thô được xuất vào các báo cáo chuẩn mực công khai. | Ngăn ngừa rò rỉ dữ liệu ngẫu nhiên và tuân thủ luật pháp toàn cầu. | Các tệp xuất hiển thị mã định danh ẩn danh thay thế cho PII thực sự. | Đặc biệt nghiêm trọng |
| **BRL-016** | Giới hạn SLA Thông báo | Thông báo | Các cảnh báo bảo mật nghiêm trọng của hệ thống (Đổi Mật khẩu, Tắt MFA) PHẢI được gửi đến kênh đã đăng ký của người nhận trong vòng 3 giây. | Giảm thiểu rủi ro chiếm đoạt tài khoản đang hoạt động và tăng cường bảo vệ người dùng. | Gửi ngay lập tức qua các mạng hàng đợi độ trễ thấp. | Đặc biệt nghiêm trọng |
| **BRL-017** | Xóa sạch theo Lịch Trình Lữu trữ | Quản trị DL | Hồ sơ ứng viên được đánh dấu để xóa hoàn toàn PHẢI được xóa sạch hoàn toàn khỏi hệ thống lưu trữ dữ liệu đang hoạt động trong vòng 30 ngày kể từ ngày yêu cầu. | Thực thi tuân thủ pháp luật đối với khung "Quyền được Lãng quên" của GDPR. | Tiêu hủy không thể đảo ngược mọi hồ sơ vật lý và các bản sao lưu liên quan. | Đặc biệt nghiêm trọng |
| **BRL-018** | Giới hạn Kích thước CV Tối thiểu | Quản lý CV | Kích thước tệp tài liệu CV của ứng viên tải lên KHÔNG ĐƯỢC nhỏ hơn 10 Kilobyte (KB). | Ngăn chặn việc phân tích cú pháp các tệp trống, tải trọng bị hỏng hoặc các lỗ hổng hệ thống. | Từ chối tệp ngay lập tức trước khi chuyển đến hàng đợi xử lý phía sau. | Thấp |
| **BRL-019** | Bắt buộc Thực thi Đa yếu tố | Xác thực | Người dùng có vai trò quản trị (Tenant Admin, Super Admin) PHẢI hoàn tất Xác thực Đa yếu tố trong mỗi chuỗi đăng nhập. | Bảo vệ các quyền lợi hệ thống cấp cao khỏi việc lộ lọt thông tin xác thực. | Quyền truy cập bị từ chối cho đến khi cung cấp thành công mã thông báo xác minh thứ cấp. | Đặc biệt nghiêm trọng |
| **BRL-020** | Bộ lọc Thiên vị Điểm số Gian lận | Đánh giá AI | Trọng số đánh giá hệ thống KHÔNG ĐƯỢC sử dụng giới tính, độ tuổi, chủng tộc hoặc giọng địa phương làm biến số trong thuật toán chấm điểm. | Thực thi luật bình đẳng cơ hội việc làm và loại bỏ sự thiên vị thuật toán. | Các số liệu tuân thủ được chuẩn hóa trên toàn bộ các mô hình AI đã được đào tạo. | Đặc biệt nghiêm trọng |
| **BRL-021** | Chỗ ngồi (Seat) Tối đa cho Workspace | Tài khoản | Một Khách thuê Doanh nghiệp (Enterprise Tenant) KHÔNG ĐƯỢC vượt quá phân bổ chỗ ngồi hoạt động tối đa được xác định trong hợp đồng Gói đăng ký đang hoạt động của họ. | Đảm bảo tuân thủ cấp phép chính xác và bảo vệ doanh thu. | Các nỗ lực thêm ghế bị từ chối kèm theo lời đề nghị nâng cấp gói cước rõ ràng. | Cao |
| **BRL-022** | Quy tắc Hết hạn Lời mời | Chiến dịch | Một liên kết lời mời phỏng vấn Ứng viên PHẢI tự động mất hiệu lực sau chính xác 14 ngày theo lịch kể từ thời điểm tạo. | Quản lý tính hợp lệ của đường ống tuyển dụng và ngăn chặn các nỗ lực kiểm tra lỗi thời. | Truy cập liên kết hết hạn sẽ hiển thị giao diện yêu cầu gia hạn động. | Trung bình |
| **BRL-023** | Khóa Tiết lộ Phản hồi | Đánh giá AI | Các điểm thành phần đánh giá chi tiết bằng AI và ghi chú phản hồi KHÔNG ĐƯỢC tiết lộ cho ứng viên trừ khi được Chủ sở hữu Chiến dịch ủy quyền rõ ràng. | Bảo vệ các phương pháp sàng lọc độc quyền của nhà tuyển dụng và chiến lược doanh nghiệp. | Giao diện ứng viên chỉ hiển thị cập nhật trạng thái hoàn thành ở cấp độ cao. | Trung bình |
| **BRL-024** | Thời gian Tạo Hóa đơn | Thanh toán | Một hóa đơn PDF có thể xác minh PHẢI được tạo động và gắn dấu thời gian trong vòng 60 giây sau bất kỳ giao dịch thanh toán thành công nào. | Đáp ứng các tiêu chuẩn pháp lý về kế toán tài chính và thuế doanh nghiệp. | Tự động gửi biên lai thanh toán đến email liên hệ thanh toán. | Cao |
| **BRL-025** | Xác thực Camera Thiết bị | Phỏng vấn | Hệ thống PHẢI chặn vào phòng đánh giá có giám thị nếu luồng camera được kích hoạt bằng phần cứng đang hoạt động không được xác minh một cách chủ động. | Điều kiện tiên quyết cần thiết cho việc xác minh trực quan chống gian lận tự động. | Hiển thị rào cản chẩn đoán mang tính thông tin hướng dẫn kiểm tra phần cứng. | Đặc biệt nghiêm trọng |
| **BRL-026** | Giới hạn Tạo lại Lộ trình | Học tập | Một ứng viên KHÔNG ĐƯỢC kích hoạt hành động tạo lại lộ trình học tập bằng AI quá hai lần trong một chu kỳ 24 giờ duy nhất. | Ngăn chặn việc khai thác vòng lặp tính toán AI chi phí cao do cố ý hoặc vô tình. | Yêu cầu bị điều tiết (throttle) bằng bộ đếm thời gian. | Trung bình |
| **BRL-027** | Hết hạn Xác minh | Xác minh DT | Token phê duyệt xác minh danh tính Ứng viên PHẢI duy trì giá trị cấu trúc hợp lệ tối đa trong 180 ngày theo lịch. | Đảm bảo hồ sơ nhận dạng vật lý được cập nhật vì lý do tuân thủ. | Hệ thống buộc xác minh lại nếu ứng viên làm bài kiểm tra sau khi hết hạn. | Cao |
| **BRL-028** | Phân bổ Thời gian Ân hạn | Thanh toán | Các gói đăng ký không vượt qua quy tắc xử lý thanh toán tự động PHẢI được cấp giới hạn cứng là 7 ngày theo lịch trong Trạng thái Grace_Period. | Ngăn chặn sự gián đoạn kinh doanh thảm khốc của khách hàng do lỗi ngân hàng tạm thời. | Các thông báo tự động hàng ngày được kích hoạt trong khi quyền truy cập nền tảng vẫn tiếp tục. | Cao |
| **BRL-029** | Truy cập Cửa sổ Bảo trì | Quản trị | Trong suốt thời gian bảo trì hệ thống theo lịch, tất cả các phiên người dùng không phải quản trị viên PHẢI được ngắt kết nối an toàn kèm theo thông báo trạng thái. | Bảo vệ trạng thái cơ sở dữ liệu vận hành đang hoạt động khỏi bị đột biến và lỗi đồng bộ. | Người dùng thấy thông báo ngoại tuyến sạch sẽ, có thương hiệu với thời gian phục hồi chính xác. | Trung bình |
| **BRL-030** | Khóa Duy nhất của Chứng chỉ | Chứng chỉ | Mọi chứng chỉ được cấp PHẢI chứa một chuỗi băm (hash) mật mã SHA-256 duy nhất trên toàn cầu được tính toán từ ID ứng viên, ID kỹ năng và ngày cấp. | Ngăn chặn việc làm giả động, nhân bản hoặc thao túng thông tin xác thực. | Bản ghi theo dõi kỹ thuật số không thể thay đổi, có thể xác minh công khai. | Đặc biệt nghiêm trọng |
| **BRL-031** | Giới hạn Hồ Chiến dịch | Chiến dịch | Các khách thuê thương mại Gói Standard KHÔNG ĐƯỢC duy trì hơn 5 chiến dịch đánh giá tuyển dụng hoạt động đồng thời vào bất kỳ lúc nào. | Thiết lập ranh giới gói thương mại và thúc đẩy quá trình kiếm tiền từ nền tảng. | Hệ thống yêu cầu tạm dừng chiến dịch cũ trước khi khởi chạy chiến dịch mới. | Cao |
| **BRL-032** | Kiểm tra Độ Hoàn thiện Hồ sơ | Hồ sơ | Số liệu hoàn thành hồ sơ ứng viên PHẢI bằng hoặc vượt quá 70% trước khi người dùng có thể nộp đơn trực tiếp vào các chiến dịch tuyển dụng mở. | Đảm bảo nhà tuyển dụng nhận được tiêu chuẩn cơ sở về dữ liệu ứng viên. | Hành động bị chặn với chỉ báo trực quan làm nổi bật các trường bị thiếu. | Trung bình |
| **BRL-033** | Phiên Quản trị Đồng thời | Xác thực | Một tài khoản người dùng duy nhất sở hữu các đặc quyền quản trị KHÔNG ĐƯỢC duy trì các phiên xác thực đang hoạt động đồng thời. | Kiểm soát việc chia sẻ thông tin xác thực và tăng cường trách nhiệm kiểm chứng doanh nghiệp. | Phiên hoạt động cũ nhất sẽ tự động bị chấm dứt khi đăng nhập mới. | Cao |
| **BRL-034** | Độ chính xác Micro-giây | Kiểm toán | Mọi bản ghi giao dịch và dấu thời gian của sổ cái kiểm toán lịch sử PHẢI được ghi lại bằng định dạng UTC với độ chính xác đến micro-giây. | Điều cần thiết để đặt hàng mật mã và khám nghiệm bảo mật mạng sau sự cố. | Xác nhận chuỗi tuyệt đối, không thể tranh cãi bên trong các lớp cơ sở dữ liệu. | Đặc biệt nghiêm trọng |
| **BRL-035** | Bộ đệm Mất kết nối Mạng | Phỏng vấn | Hệ thống PHẢI dành cho ứng viên tổng cộng 300 giây bộ đệm ngắt kết nối mạng không bị phạt cho mỗi cuộc phỏng vấn. | Tính toán các sự khác biệt về kết nối thực tế trên toàn cầu mà không đánh trượt một cách bất công. | Đồng hồ đánh giá tạm dừng, hoạt động trở lại ngay sau khi phục hồi liên kết. | Cao |
| **BRL-036** | Tính Nhất quán Trọng số | Đánh giá AI | Tổng của tất cả các trọng số kỹ năng riêng biệt được gán cho một mô hình đánh giá PHẢI bằng chính xác 100.00%. | Điều kiện tiên quyết về mặt toán học để có các số liệu điểm hợp lệ, dự đoán được, tất định. | Không thể lưu cấu hình chiến dịch nếu tồn tại bất kỳ sự sai lệch tổng nào. | Đặc biệt nghiêm trọng |
| **BRL-037** | Dọn dẹp Đóng Chiến dịch | Chiến dịch | Khi một chiến dịch tuyển dụng chuyển sang trạng thái "Đã đóng", tất cả các lời mời ứng viên chưa được thực thi PHẢI tự động bị vô hiệu hóa. | Ngăn chặn các mục ứng viên muộn vào trong quy trình tuyển dụng đã hoàn tất. | Truy cập liên kết đánh giá sẽ kích hoạt trang trạng thái chiến dịch đã đóng. | Trung bình |
| **BRL-038** | Bất biến Giá động | Thanh toán | Sự thay đổi trong mức giá bán lẻ công khai của gói đăng ký KHÔNG ĐƯỢC làm thay đổi tỷ lệ thanh toán đang hoạt động của khách hàng có hợp đồng có thời hạn đã khóa. | Đảm bảo xuất hóa đơn tài chính dự đoán được và tôn trọng pháp lý đối với việc khóa giá. | Hệ thống ánh xạ các tài khoản hiện có sang các phiên bản biểu giá cũ trong quá trình gia hạn. | Cao |
| **BRL-039** | Ràng buộc Tuổi Hợp pháp | Tài khoản | Nền tảng KHÔNG ĐƯỢC cho phép đăng ký bất kỳ tài khoản ứng viên nào mà ngày sinh được khai báo cho thấy độ tuổi dưới 16. | Đảm bảo tuân thủ tuyệt đối các quy tắc của COPPA, GDPR dành cho trẻ vị thành niên và quy chế lao động trẻ em. | Đăng ký thất bại ngay lập tức kèm theo thông báo không đủ điều kiện về độ tuổi. | Đặc biệt nghiêm trọng |
| **BRL-040** | Tắt Thông báo Khuyến mại | Thông báo | Hệ thống PHẢI tắt tất cả các loại thông báo khuyến mại đối với người dùng đã chuyển tùy chọn liên lạc trên tài khoản của họ sang trạng thái "Vô hiệu hóa" (Disabled). | Tuân thủ luật chống thư rác quốc tế (CAN-SPAM, CASL). | Chỉ các thông báo quan trọng về bảo mật và giao dịch mới được chuyển tới người dùng. | Đặc biệt nghiêm trọng |
| **BRL-041** | Ràng buộc Xuất Ứng viên Hàng loạt | Phân tích | Người dùng Tenant Admin KHÔNG ĐƯỢC xuất hơn 10.000 danh mục đánh giá ứng viên hoàn chỉnh trong một thao tác xuất tệp hàng loạt duy nhất. | Bảo vệ tài nguyên hệ thống khỏi các nỗ lực tấn công từ chối dịch vụ trích xuất dữ liệu. | Vượt quá giới hạn sẽ kích hoạt cảnh báo quản trị để chia nhỏ truy vấn. | Trung bình |
| **BRL-042** | Quy tắc Tự động Nộp Hết giờ | Phỏng vấn | Khi bộ đếm thời gian của một câu hỏi phỏng vấn đạt chính xác tới 00:00, hệ thống PHẢI buộc lưu và tải lên bộ đệm câu trả lời đã ghi hiện tại. | Loại bỏ sự thao túng độ dài câu trả lời của ứng viên và tạo sự công bằng logic. | Tự động chuyển tiếp liền mạch sang khối câu hỏi tiếp theo trong trình tự. | Cao |
| **BRL-043** | Gắn cờ Khác biệt Kỹ năng | Đánh giá AI | Nếu sự sai lệch thống kê giữa các công cụ đánh giá AI vượt quá 30.00%, hệ thống PHẢI định tuyến hồ sơ đến hàng đợi kiểm toán con người. | Giảm thiểu kết quả bất thường của mạng nơ-ron và cung cấp sự an toàn về điểm số tuyệt đối. | Trạng thái đánh giá ứng viên chuyển thành "Đang chờ Xem xét Thủ công". | Cao |
| **BRL-044** | Liên kết Tài liệu Mật mã | Chứng chỉ | Tất cả các trang xác minh chứng chỉ có thể truy cập công khai PHẢI sử dụng truyền tải độc quyền HTTPS và tra cứu các bản ghi thông qua GUID không tuần tự. | Ngăn chặn các cuộc tấn công quét mã (scraping) tuần tự có hệ thống và bảo vệ hồ sơ. | URL xác thực công khai an toàn, có thể đọc được bởi các bên xác minh bên ngoài được ủy quyền. | Cao |
| **BRL-045** | Cửa sổ Thực thi Hoàn tiền | Thanh toán | Khoản phân bổ hoàn tiền đã được quản trị viên phê duyệt PHẢI được xử lý điện tử và thanh toán qua cổng thanh toán trong vòng 3 ngày làm việc. | Đảm bảo quan hệ tốt đẹp với khách hàng doanh nghiệp và sổ sách cân đối cấu trúc. | Tự động theo dõi đối soát số dư của mục sổ cái tín dụng. | Trung bình |
| **BRL-046** | Giới hạn Tải CV Tối đa | Quản lý CV | Một tài khoản người dùng ứng viên KHÔNG ĐƯỢC lưu trữ đồng thời quá 5 phiên bản tài liệu CV khác nhau trong workspace đang hoạt động của họ. | Hạn chế mức tiêu thụ dung lượng lưu trữ và giảm bớt sự nhầm lẫn về hồ sơ. | Việc tải lên tài liệu thứ 6 sẽ nhắc nhở việc yêu cầu chọn và ghi đè lên tệp cũ. | Thấp |
| **BRL-047** | Entropy Mật khẩu Tối thiểu | Xác thực | Mật khẩu do người dùng xác định PHẢI đáp ứng tính toán entropy tối thiểu là 60 bit trước khi được xác thực để băm trong cơ sở dữ liệu. | Phòng thủ chống lại từ điển tự động tinh vi và phá mã bạo lực (brute-force). | Chỉ báo tương tác trực quan ngăn các hành động gửi cho đến khi quy tắc được thông qua. | Đặc biệt nghiêm trọng |
| **BRL-048** | Khóa Điều kiện Tiên quyết Lộ trình | Học tập | Hệ thống PHẢI chặn quyền truy cập vào một mô-đun học tập nếu người dùng chưa hoàn thành tất cả các mục điều kiện tiên quyết mang tính cấu trúc đã được ánh xạ rõ ràng. | Đảm bảo các cấu trúc sư phạm nền tảng và lộ trình phát triển logic của học viên. | Các trạng thái bị khóa hiển thị lộ trình theo dõi phụ thuộc được chia mục rõ ràng. | Trung bình |
| **BRL-049** | Luồng Giám thị Thứ cấp | Phỏng vấn | Nếu một chiến dịch bắt buộc giám thị bằng hai camera, hệ thống PHẢI chấm dứt phiên nếu liên kết thiết bị di động thứ cấp bị rớt >60s. | Đảm bảo các giới hạn tuân thủ nâng cao được duy trì chặt chẽ trong các bài thi rủi ro cao. | Chuỗi cảnh báo mượt mà dẫn đến khóa phiên nếu luồng không thể kết nối lại. | Cao |
| **BRL-050** | Lập Hóa đơn Đơn Tiền tệ | Thanh toán | Một đối tượng sổ cái hóa đơn KHÔNG ĐƯỢC kết hợp các mục hàng (line items) được tính toán bằng các loại tiền tệ cơ bản khác nhau trong một tài liệu sao kê duy nhất. | Điều kiện tiên quyết để tuân thủ thuế quan theo quy định một cách rõ ràng. | Các giao dịch mua bán khác nhau sẽ gọi các tác vụ tạo hóa đơn riêng biệt một cách sạch sẽ. | Đặc biệt nghiêm trọng |
| **BRL-051** | Giới hạn Thời gian Phân tích CV | Quản lý CV | Công cụ phân tích tự động PHẢI hoàn tất việc trích xuất văn bản và thực thể từ tệp CV đã tải lên trong ngưỡng tuyệt đối là 45 giây. | Duy trì SLA hệ thống vận hành chặt chẽ và đảm bảo số liệu UX tích cực. | Hết thời gian chờ sẽ hủy bỏ tác vụ, cập nhật trạng thái thành Thất bại (Failed) và ghi cảnh báo. | Trung bình |
| **BRL-052** | Bắt buộc Miền Công ty | Tài khoản | Việc đăng ký của Nhà tuyển dụng yêu cầu quyền truy cập cấp doanh nghiệp PHẢI sử dụng địa chỉ miền email không công khai, có thể xác minh được. | Giảm thiểu lừa đảo thông tin xác thực, mạo danh và thiết lập doanh nghiệp giả. | Các miền chung (gmail, yahoo) bị chặn thiết lập workspace doanh nghiệp. | Cao |
| **BRL-053** | Ký duyệt Cấu hình Hệ thống | Quản trị | Các thay đổi cấu hình vận hành toàn cầu ảnh hưởng đến giá cả, giới hạn hoặc mô hình AI PHẢI nhận được phê duyệt chữ ký số kép (dual). | Triển khai bảo mật tuân thủ quy tắc "Bốn mắt" cổ điển để chặn rủi ro nội gián. | Hệ thống giữ các sửa đổi ở trạng thái chờ cho đến khi admin thứ hai được ủy quyền ký. | Đặc biệt nghiêm trọng |
| **BRL-054** | Khóa Xác minh Đánh giá | Đánh giá AI | Khi Nhà tuyển dụng chính thức đánh dấu điểm đánh giá của một ứng viên là "Đã xem xét" (Reviewed), giá trị điểm được tính toán PHẢI bị khóa vĩnh viễn. | Ngăn chặn việc sửa đổi số liệu sau bài thi một cách có chủ ý hoặc gian lận từ người tuyển dụng. | Khả năng chỉnh sửa điểm số hoàn toàn bị loại bỏ khỏi giao diện workspace. | Cao |
| **BRL-055** | Logic Hủy kích hoạt Workspace | Tài khoản | Việc vô hiệu hóa workspace chính của doanh nghiệp PHẢI ngay lập tức truyền trạng thái đình chỉ thừa kế xuống tất cả các ghế (seat) người dùng phụ được liên kết. | Đảm bảo kiểm soát hoạt động và chấm dứt quyền truy cập dữ liệu doanh nghiệp ngay lập tức. | Tất cả các nhà tuyển dụng được liên kết đều mất quyền truy cập vào ứng dụng trong vòng 5 giây. | Đặc biệt nghiêm trọng |
| **BRL-056** | Cấm Phiên Tạm thời | Xác thực | Một địa chỉ IP thể hiện nhiều hơn 50 lần thử xác thực thất bại trong khoảng thời gian 5 phút PHẢI bị đưa vào danh sách đen tạm thời trong 1 giờ. | Chiến lược tiêu chuẩn để giảm thiểu tấn công dò mật khẩu tự động ở lớp mạng (brute-force). | Bỏ qua các gói kết nối ở cổng biên trước khi chúng chạm đến tài nguyên xử lý. | Đặc biệt nghiêm trọng |
| **BRL-057** | Tổng hợp Báo cáo Động | Phân tích | Các bản tóm tắt phân tích trải dài trên các khoảng thời gian lịch sử KHÔNG ĐƯỢC tính toán các số liệu từ các tập dữ liệu cũ hơn gói lưu giữ dữ liệu của khách thuê. | Căn chỉnh giới hạn thực thi phân tích theo chính sách hủy dữ liệu hợp pháp. | Hệ thống giới hạn cứng phạm vi ngày dữ liệu theo các cửa sổ hiển thị được phép lưu trữ. | Cao |
| **BRL-058** | Kiểm tra Hết hạn Chứng chỉ | Chứng chỉ | Tiến trình nền (daemon) xác nhận tự động của hệ thống PHẢI kiểm tra ngày hiệu lực của chứng chỉ vào mỗi đêm và cập nhật các mục hết hạn thành trạng thái "Đã hết hạn". | Giữ nguyên mức độ liên quan về mặt thời gian và độ chính xác của ngành đối với chứng chỉ. | Lượt xem xác nhận công khai tự động cập nhật động các chỉ báo trạng thái. | Trung bình |
| **BRL-059** | Căn chỉnh Đa Ngôn ngữ | Chiến dịch | Nếu một chiến dịch được gắn cờ cho một ngôn ngữ địa phương hóa cụ thể, câu hỏi phỏng vấn và công cụ AI PHẢI sử dụng cấu hình ngôn ngữ tương ứng đó. | Tránh sự không phù hợp về nhận thức, bất thường về điểm số và lỗi phân tích. | Xác thực địa phương hóa tiêu chuẩn trên các giao diện dành cho ứng viên. | Cao |
| **BRL-060** | Cách ly Feature Flag (Cờ tính năng) | Quản trị | Hệ thống PHẢI thực thi các trường hợp riêng biệt của cây cờ tính năng cho mỗi tenant, đảm bảo các tính năng thử nghiệm không lọt vào các tầng sản xuất chung. | Đảm bảo sự ổn định khi chạy và cách ly các lỗi beta khỏi các doanh nghiệp cốt lõi. | Các tính năng mục tiêu chỉ kích hoạt đối với các GUID của tenant đã được định cấu hình. | Cao |
| **BRL-061** | Cấm Khởi động lại Bài Đánh giá | Phỏng vấn | Một người dùng ứng viên đã hoàn thành thành công và nộp bài đánh giá phỏng vấn KHÔNG ĐƯỢC phép khởi động lại phiên đó. | Loại bỏ các lợi ích kiểm tra lặp đi lặp lại không công bằng và duy trì tính hợp lệ của điểm số. | Các yêu cầu điều hướng phòng sau đó sẽ chuyển hướng thẳng đến màn hình hoàn thành. | Cao |
| **BRL-062** | Ngăn chặn Số dư Âm | Thanh toán | Không có giao dịch vận hành nền tảng hoặc tính toán sử dụng tín dụng nào ĐƯỢC phép làm số dư tín dụng gói đăng ký của doanh nghiệp giảm xuống dưới 0. | Xóa bỏ các lỗ hổng thất thoát doanh thu và quản lý các ràng buộc toàn vẹn giao dịch. | Các hoạt động yêu cầu chi tiêu tài nguyên vượt quá số dư hiện tại sẽ bị hủy bỏ. | Đặc biệt nghiêm trọng |
| **BRL-063** | Tiêu hủy Mã băm Sinh trắc học | Quản trị DL | Các bức ảnh nhận dạng gốc trên khuôn mặt được chụp trong quá trình kiểm tra danh tính PHẢI bị tiêu hủy trong vòng 24 giờ sau khi có phê duyệt trạng thái xác minh thành công. | Tuân thủ các khung quy tắc sinh trắc học nghiêm ngặt và giảm thiểu tác động nếu rò rỉ. | Chỉ giữ lại chuỗi tọa độ toán học vector đã được ẩn danh. | Đặc biệt nghiêm trọng |
| **BRL-064** | Che giấu Cơ hội Bình đẳng | Tuân thủ | Khi tùy chọn ẩn danh (blind-hiring) được kích hoạt, hệ thống PHẢI loại bỏ một cách có hệ thống mọi chỉ báo nhân khẩu học của hồ sơ khỏi tầm nhìn của nhà tuyển dụng. | Ngăn chặn sự thiên vị trong tuyển dụng vô thức và tuân thủ các tiêu chuẩn cơ hội bình đẳng. | Tên ứng viên được thay thế bằng mã màu chung hoặc thẻ trình tự. | Trung bình |
| **BRL-065** | Nhật ký Nhịp tim Hệ thống | Kiểm toán | Các màn hình giám sát tính toàn vẹn của hạ tầng hệ thống tự động PHẢI ghi lại "nhịp tim" kiểm tra sức khỏe chức năng với khoảng thời gian cố định là 10 giây một lần. | Rất quan trọng để phát hiện sớm sự xuống cấp của hệ thống và SLA tính sẵn sàng cao. | Định tuyến trực tiếp các chỉ báo bất thường đến các nhóm quản trị mạng. | Cao |
| **BRL-066** | Theo dõi Ghi đè Điểm Thủ công | Đánh giá AI | Mọi điều chỉnh thủ công do nhà tuyển dụng áp dụng đối với xếp hạng đánh giá AI tự động PHẢI yêu cầu một chuỗi văn bản diễn giải đi kèm. | Đảm bảo trách nhiệm giải trình minh bạch và khả năng phòng thủ pháp lý của các đánh giá. | Những thay đổi sẽ bị từ chối nếu không có ghi chú mô tả chứa tối thiểu 20 ký tự. | Cao |
| **BRL-067** | Bắt buộc Khớp Văn bản CV | Quản lý CV | Một tệp CV được tải lên PHẢI mang lại ít nhất 50 từ (chữ cái) riêng biệt khi trích xuất văn bản để được coi là một ứng viên đủ điều kiện phân tích cú pháp. | Lọc các tệp đính kèm bị hỏng, đồ họa hoàn toàn không thể đọc được hoặc tài liệu ảo. | Thông báo từ chối kèm theo hướng dẫn để tải lên hồ sơ văn bản tiêu chuẩn. | Trung bình |
| **BRL-068** | Dọn dẹp Phụ thuộc Lộ trình | Học tập | Nếu ứng viên xóa một khả năng trong hồ sơ kỹ năng cốt lõi cơ bản, bất kỳ đường dẫn phụ thuộc nào trên lộ trình học tập đang hoạt động PHẢI bị đóng băng. | Duy trì mức độ phù hợp liên tục của các mục tiêu giáo dục với trạng thái thực tế của người dùng. | Hệ thống kích hoạt cảnh báo chỉ ra các điều chỉnh hồ sơ kỹ năng bắt buộc. | Thấp |
| **BRL-069** | Chữ ký Webhook An toàn | Quản trị | Mọi payload webhook gửi đi do hệ thống phân phối đến các công cụ của bên thứ ba PHẢI được ký bằng mã khóa HMAC SHA-256. | Ngăn chặn giả mạo giao dịch, tiêm thông báo bên ngoài và giả mạo dữ liệu. | Bên nhận xác thực tính toàn vẹn của payload dựa trên các bí mật không gian làm việc chia sẻ. | Cao |
| **BRL-070** | Khóa Hệ thống Khẩn cấp | Bảo mật | Nếu cờ chỉ báo vi phạm dữ liệu được bật cho một tenant, hệ thống PHẢI ngay lập tức vô hiệu hóa mọi phiên làm việc của người dùng đang hoạt động cho không gian làm việc của tenant đó. | Mô hình ngăn chặn zero-trust ngay lập tức để bảo vệ các khối tài sản thông tin của doanh nghiệp. | Người dùng bị đẩy ra các cổng đăng nhập chưa được xác thực một cách an toàn ngay lập tức. | Đặc biệt nghiêm trọng |

---

## 5. Quy tắc Xác thực (Authentication Rules)

Phần này chính thức hóa các ranh giới về xác danh, xác thực và vòng đời phiên (session) cốt lõi cho mọi lớp tương tác của hệ thống.

### 5.1 Bảng Đặc tả Quy tắc Xác thực (AUT-001 đến AUT-015)

| Rule ID | Tên Quy tắc | Tuyên bố Quy tắc Vận hành | Lý do Nghiệp vụ | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **AUT-001** | Khóa Danh tính Duy nhất | Mỗi địa chỉ email của tài khoản người dùng đã đăng ký PHẢI duy nhất trên toàn cầu trong toàn bộ bối cảnh cơ sở dữ liệu hệ thống. | Loại bỏ xung đột danh tính và sự mơ hồ trong định tuyến. | Từ chối nỗ lực đăng ký trùng lặp với các lỗi không tiết lộ thông tin. |
| **AUT-002** | Cấu trúc Độ phức tạp Mật khẩu | Mật khẩu người dùng PHẢI chứa tối thiểu 12 ký tự, bao gồm ít nhất 1 chữ in hoa, 1 chữ in thường, 1 chữ số và 1 ký hiệu đặc biệt. | Giảm thiểu tấn công dictionary và credential stuffing (nhồi thông tin xác thực) tự động. | Từ chối đầu vào trước khi băm (hashing) nếu không đáp ứng tham số. |
| **AUT-003** | Ngưỡng Khóa Brute Force | Một tài khoản PHẢI bị khóa một cách hệ thống trong 30 phút sau chính xác 5 lần thử xác thực thất bại liên tiếp. | Bảo vệ các điểm cuối hệ thống chống lại việc đoán thông tin xác thực tự động. | Khóa phiên và gửi một email thông báo tài khoản. |
| **AUT-004** | Yêu cầu Email Hoạt động | Một tài khoản người dùng KHÔNG ĐƯỢC đăng nhập vào nền tảng nếu trường trạng thái xác minh liên kết của nó được đặt thành False. | Đảm bảo tính hợp lệ của đường dẫn liên lạc và chặn các đăng ký do robot. | Chuỗi đăng nhập dừng ở bước kiểm tra thông tin đăng nhập với lời nhắc xác minh. |
| **AUT-005** | Ngăn chặn Tài khoản Bị đình chỉ | Một tài khoản có cờ trạng thái "Bị đình chỉ" (Suspended) PHẢI bị chặn ngay lập tức, không được phép khởi tạo bất kỳ phiên nào. | Thực thi các hành động chính sách hành chính và pháp lý không chậm trễ. | Hệ thống xuất ra thông báo tài khoản bị vô hiệu hóa trên màn hình đăng nhập. |
| **AUT-006** | Chấm dứt Phiên Không hoạt động | Một phiên web tương tác PHẢI bị hủy sau chính xác 30 phút không có bất kỳ thao tác nào từ giao diện máy khách. | Giảm rủi ro chiếm quyền điều khiển phiên cục bộ trong môi trường công cộng. | Token bị vô hiệu hóa; trình duyệt buộc chuyển hướng đến đăng nhập. |
| **AUT-007** | Đăng nhập Đa phiên Nghiêm ngặt | Tài khoản người dùng Ứng viên KHÔNG ĐƯỢC duy trì nhiều hơn một mã thông báo phiên web hoạt động cùng một lúc. | Ngăn chặn ứng viên gian lận trên nhiều thiết bị và chia sẻ tài khoản. | Khởi tạo phiên mới sẽ vô hiệu hóa sạch sẽ phiên trước đó. |
| **AUT-008** | Lệnh Thực thi Đa yếu tố | Tất cả các vai trò Quản trị viên và Nhà tuyển dụng PHẢI cung cấp mã OTP theo thời gian (TOTP) hợp lệ trong chuỗi xác thực. | Bảo vệ các tài khoản có đặc quyền cao hơn đang nắm giữ dữ liệu PII của ứng viên. | Chặn quyền truy cập không gian làm việc cho đến khi mã số cấp 2 được xác thực. |
| **AUT-009** | Ngưỡng Xác thực lại | Người dùng PHẢI được nhắc nhập lại mật khẩu chính của họ trước khi thay đổi các mục hồ sơ quan trọng (Email, Mật khẩu, Cài đặt MFA). | Bảo mật nâng cao để bảo vệ quyền kiểm soát tài khoản khỏi bị cướp. | Hành động bị chặn cho đến khi gửi lại token xác thực hợp lệ mới. |
| **AUT-010** | Giới hạn Vòng đời Magic Link | Token đặt lại mật khẩu và liên kết đăng nhập ma thuật (magic links) gửi qua thông báo PHẢI tự động hết hạn đúng 1 giờ sau khi tạo. | Giảm thiểu các lỗ hổng liên quan đến các mục email chưa đọc hoặc bị chặn. | Truy cập vào token đã hết hạn sẽ hiển thị màn hình báo liên kết không hợp lệ. |
| **AUT-011** | Khóa Mật khẩu Lịch sử | Khi người dùng thay đổi mật khẩu, giá trị mới KHÔNG ĐƯỢC khớp với bất kỳ mã băm nào trong số 5 mật khẩu cũ nhất được lưu trữ. | Phá vỡ các hành vi đổi mật khẩu luân phiên có hệ thống. | Từ chối đầu vào kèm thông báo lỗi về việc tái sử dụng mật khẩu. |
| **AUT-012** | Bộ lọc Thông tin Xác thực Bị lộ | Hệ thống PHẢI kiểm tra chéo các lựa chọn mật khẩu mới với các cơ sở dữ liệu mật khẩu bị rò rỉ công khai trước khi chấp nhận thay đổi. | Tránh sử dụng các mật khẩu đã biết là bị lộ lọt. | Từ chối mật khẩu nếu bị gắn cờ trong các cơ sở dữ liệu rò rỉ công khai. |
| **AUT-013** | Xác thực Cross-Origin | Yêu cầu xác thực PHẢI chỉ được đánh giá nếu được gửi từ các miền nguồn gốc hệ thống được liệt kê trong whitelist của công ty. | Bảo vệ hệ thống nhận dạng cốt lõi khỏi rủi ro giả mạo yêu cầu chéo trang (CSRF). | Yêu cầu bắt nguồn từ các miền chưa đăng ký sẽ bị loại bỏ ngay lập tức. |
| **AUT-014** | Xoay vòng Khóa Truy cập API | Khóa truy cập API do hệ thống tạo PHẢI bị buộc xoay vòng hoặc vô hiệu hóa đúng 365 ngày kể từ ngày tạo. | Giới hạn dấu chân thiệt hại của các khóa dành cho nhà phát triển chưa được xoay vòng. | Yêu cầu API dùng khóa hết hạn trả về trạng thái 401 Unauthorized. |
| **AUT-015** | Chỉ thị Tiêm Captcha | Hệ thống PHẢI đưa ra thử thách CAPTCHA mã hóa bắt buộc sau 3 lần thử đăng nhập thất bại từ một IP duy nhất. | Hạn chế các cuộc tấn công kịch bản tốc độ cao trước khi kích hoạt khóa cứng. | Người dùng phải giải một câu đố (hình ảnh/âm thanh) để gửi lại đầu vào. |

---

## 6. Quy tắc Ứng viên (Candidate Rules)

Chính sách hoạt động quản lý quá trình giới thiệu, lập hồ sơ và giới hạn không gian làm việc của các ứng viên tài năng.

### 6.1 Bảng Đặc tả Quy tắc Ứng viên (CND-001 đến CND-015)

| Rule ID | Tên Quy tắc | Tuyên bố Quy tắc Vận hành | Lý do Nghiệp vụ | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **CND-001** | Bước Onboarding Bắt buộc | Một ứng viên PHẢI hoàn thành các trường thông tin nhận dạng chính (Họ tên, Quốc gia, Kỹ năng Mục tiêu) trước khi vào phòng phỏng vấn. | Đảm bảo hồ sơ ngữ cảnh đầy đủ tồn tại cho công cụ đánh giá. | Quyền truy cập vào các chiến dịch đánh giá hoạt động bị chặn cho đến khi hoàn tất. |
| **CND-002** | Chính sách Đính kèm CV Rõ ràng | Một ứng viên PHẢI đính kèm một tệp CV hợp lệ vào hồ sơ của họ trước khi truy cập các công cụ sàng lọc chiến dịch tự động. | Tập dữ liệu phân tích cơ sở cần thiết cho việc căn chỉnh sơ yếu lý lịch bằng AI chuẩn. | Đường ống nộp đơn vẫn bị khóa, hiển thị các yêu cầu còn thiếu. |
| **CND-003** | Định dạng Tài liệu CV Cho phép | Tài liệu đính kèm CV PHẢI được gửi duy nhất bằng các định dạng cấu trúc PDF, DOC, hoặc DOCX. | Duy trì sự an toàn và khả năng tương thích của các công cụ phân tích. | Các định dạng tệp không tuân thủ sẽ bị từ chối ngay lập tức. |
| **CND-004** | Quy tắc Giới hạn Kích thước | Kích thước tệp CV được tải lên KHÔNG ĐƯỢC vượt quá mức trần tối đa là 15 Megabytes (MB). | Tránh cạn kiệt bộ đệm (memory buffer) và các vectơ tấn công từ chối dịch vụ. | Quy trình tải lên bị chặn ngay lập tức kèm thông báo rõ ràng về giới hạn. |
| **CND-005** | Công cụ Đánh giá Độ Hoàn thiện | Điểm số độ hoàn thiện hồ sơ ứng viên PHẢI đạt mức tối thiểu 70% để cho phép lập chỉ mục trên thị trường nhân tài công khai. | Bảo vệ danh tiếng chất lượng của nền tảng đối với các nhà tuyển dụng. | Các hồ sơ không đạt chuẩn sẽ bị loại khỏi kết quả tìm kiếm. |
| **CND-006** | Mức trần Lộ trình Học tập | Một workspace ứng viên KHÔNG ĐƯỢC giữ nhiều hơn một Lộ trình Học tập AI (đang hoạt động) tại một thời điểm. | Tập trung năng lực xử lý ứng viên và bảo vệ các chỉ số hệ thống AI. | Việc tạo một lộ trình mới sẽ tự động lưu trữ lộ trình đang hoạt động. |
| **CND-007** | Giới hạn Thực thi Đơn phòng | Người dùng ứng viên KHÔNG ĐƯỢC thực hiện luồng quy trình trả lời câu hỏi ở nhiều hơn một phòng thi tại bất kỳ thời điểm nào. | Loại bỏ các vòng lặp mẹo bố cục nhiều trình duyệt và cơ hội gian lận. | Các nỗ lực truy cập sau trả về một rào cản lỗi đánh giá đồng thời. |
| **CND-008** | Giới hạn Xác thực Gói đăng ký | Quyền truy cập vào bảng phân tích nghề nghiệp cao cấp hoặc báo cáo so sánh ngành YÊU CẦU có cấp độ đăng ký Premium của ứng viên hợp lệ. | Bảo vệ chiến lược kiếm tiền cho các mô-đun phân tích tự phục vụ nâng cao. | Tài khoản không phải Premium sẽ thấy các màn hình nâng cấp và định giá. |
| **CND-009** | Quy tắc Khớp Tên Hồ sơ | Tên được cung cấp trong hồ sơ ứng viên PHẢI khớp với tên được trích xuất từ tài liệu nhận dạng vật lý hợp pháp đã xác thực. | Tiêu chuẩn xác minh cốt lõi để đối chiếu danh tính với điểm số. | Các điểm khác biệt bị gắn cờ sẽ buộc đưa vào hàng đợi xác minh thủ công. |
| **CND-010** | Hạn chế Phiên Thực hành | Ứng viên sử dụng gói Miễn phí (Free Tier) KHÔNG ĐƯỢC thực hiện hơn 3 mô phỏng phỏng vấn thực hành trong vòng 30 ngày. | Kiểm soát chi phí cơ sở hạ tầng và khuyến khích phân tách cấp gói cước. | Giao diện vô hiệu hóa các nút mô phỏng kèm theo lộ trình nâng cấp rõ ràng. |
| **CND-011** | Giới hạn Tự khai báo Kỹ năng | Hồ sơ ứng viên KHÔNG ĐƯỢC tự khai báo quá 20 nút kỹ năng nghề nghiệp riêng biệt trong hồ sơ cốt lõi. | Ngăn chặn hành vi nhồi nhét từ khóa làm hỏng sự căn chỉnh bằng máy. | Form nhập liệu chặn việc thêm tag kỹ năng khi đã đạt mức 20. |
| **CND-012** | Nộp bài Hoàn chỉnh Cuối cùng | Khi ứng viên xác nhận nộp kết quả phỏng vấn cuối cùng, trạng thái của bài thi PHẢI vĩnh viễn chuyển sang Review_Pending. | Ngăn chặn việc sửa đổi, xóa hoặc thao túng các câu trả lời trái phép. | Đường dẫn nhập dữ liệu bị đóng hoàn toàn; quyền truy cập chuyển sang chỉ xem. |
| **CND-013** | Xóa Tài khoản & Giữ liệu | Khi ứng viên yêu cầu xóa toàn bộ tài khoản, các quy trình thanh lọc dữ liệu PHẢI bắt đầu với cửa sổ ân hạn an toàn là 14 ngày. | Cho phép khôi phục việc xóa nhầm và bảo toàn dữ liệu ứng dụng. | Hồ sơ bị ẩn khỏi chế độ công khai trong giai đoạn chờ tạm thời. |
| **CND-014** | Tái ứng tuyển Đa ứng dụng | Ứng viên KHÔNG ĐƯỢC nộp đơn lại vào cùng một chiến dịch của doanh nghiệp trong vòng 90 ngày kể từ khi bị từ chối rõ ràng. | Ngăn ngừa việc làm bài kiểm tra lặp lại và ổn định hàng đợi nhà tuyển dụng. | Các nút nộp đơn đổi thành màn hình bộ đếm đếm ngược thời gian. |
| **CND-015** | Cấp huy hiệu Đã Xác minh | Hồ sơ KHÔNG ĐƯỢC hiển thị huy hiệu 'Tài năng Đã xác minh' trừ khi Cả Xác minh ID và 1 bài đánh giá đạt > 85%. | Giữ gìn các số liệu tin cậy của thị trường bên ngoài và việc xác minh chứng chỉ. | Việc tạo trạng thái có hệ thống chỉ xảy ra khi cả hai khóa logic đều vượt qua. |

---

## 7. Quy tắc Nhà tuyển dụng (Employer Rules)

Các chính sách quản lý không gian làm việc của tổ chức, quản lý chiến dịch và các ràng buộc tương tác chéo giữa các tenant.

### 7.1 Bảng Đặc tả Quy tắc Nhà tuyển dụng (EMP-001 đến EMP-015)

| Rule ID | Tên Quy tắc | Tuyên bố Quy tắc Vận hành | Lý do Nghiệp vụ | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **EMP-001** | Kiểm tra Tính hợp pháp Công ty | Một workspace Nhà tuyển dụng PHẢI vượt qua các quy tắc kiểm tra sổ đăng ký doanh nghiệp trước khi trạng thái chuyển sang Active_Verified. | Ngăn chặn các công ty bình phong (shell) và hoạt động gian lận từ việc thu thập (scrape) tài năng. | Tài khoản chưa xác minh không được xuất bản các chiến dịch công khai. |
| **EMP-002** | Siêu dữ liệu Bắt buộc | Một cấu hình chiến dịch PHẢI xác định rõ Tiêu đề, Mô tả CV, Ngày hết hạn và Kỹ năng mục tiêu trước khi xuất bản. | Đảm bảo ứng viên có mục tiêu rõ ràng trong quá trình thi. | Nỗ lực xuất bản sẽ báo lỗi xác thực về các trường còn thiếu. |
| **EMP-003** | Vòng đời Chiến dịch | Tuổi thọ hoạt động của một chiến dịch KHÔNG ĐƯỢC vượt quá mức trần tối đa tuyệt đối là 180 ngày theo lịch kể từ ngày xuất bản. | Ngăn chặn sự trì trệ dữ liệu và khóa tài nguyên cấu trúc trong các workspace. | Đến ngày thứ 181, trạng thái chiến dịch tự động chuyển sang Archived (Lưu trữ). |
| **EMP-004** | Giới hạn Chiến dịch theo Gói | Số lượng tối đa các chiến dịch hoạt động đồng thời PHẢI tuân thủ nghiêm ngặt các giới hạn được xác định bởi gói đăng ký. | Bảo vệ các mô hình kiếm tiền theo gói đăng ký doanh nghiệp. | Các chiến dịch mới duy trì ở trạng thái Nháp cho đến khi lưu trữ các chiến dịch cũ. |
| **EMP-005** | Giới hạn Lời mời Ứng viên | Nhà tuyển dụng KHÔNG ĐƯỢC gửi liên kết mời đánh giá trừ khi số dư tín dụng workspace của họ lớn hơn không (0). | Thực thi các quy tắc thanh toán tiêu thụ tín dụng trước khi sử dụng tài nguyên. | Trình kích hoạt gửi bị lỗi với popups nạp tiền tín dụng ngay lập tức. |
| **EMP-006** | Cách ly Phân tích Chéo Tenant | Người dùng của Nhà tuyển dụng KHÔNG ĐƯỢC xem các bản tóm tắt phân tích ứng viên riêng lẻ được tạo cho một tenant thương mại khác. | Ranh giới bảo mật dữ liệu cơ bản ngăn chặn việc săn trộm nhân tài. | Hệ thống từ chối các truy vấn chéo bất hợp pháp với nhật ký rõ ràng. |
| **EMP-007** | Hết hạn Đăng ký | Nếu trạng thái đăng ký của Nhà tuyển dụng chuyển sang Lapsed (Đã quá hạn), quyền truy cập dashboard PHẢI chuyển sang trạng thái chỉ xem (read-only). | Thúc đẩy gia hạn hợp đồng đồng thời ngăn ngừa khiếu nại về mất dữ liệu. | Việc tạo/sửa đổi các chiến dịch hoặc xem điểm số mới sẽ bị chặn. |
| **EMP-008** | Giới hạn Số ghế (Seat) Tuyển dụng | Người dùng Tenant Admin KHÔNG ĐƯỢC phân bổ số lượng tài khoản phụ vượt quá tổng số lượng ghế được chỉ định bởi gói đăng ký doanh nghiệp của họ. | Thực thi các số liệu tuân thủ cấp phép người dùng trên các phân khúc. | Đường dẫn thực thi mời người dùng sẽ chặn các đầu vào mới khi đạt mức tối đa. |
| **EMP-009** | Giới hạn Câu hỏi Tùy chỉnh | Một người dùng Nhà tuyển dụng KHÔNG ĐƯỢC tải lên quá 100 câu hỏi tình huống tùy chỉnh cho mỗi khối đánh giá chiến dịch cá nhân. | Quản lý trọng lượng cấu hình DB và bảo vệ giới hạn kiểm tra. | Mảng UI từ chối bổ sung các mục vượt quá 100 với một hộp cảnh báo. |
| **EMP-010** | Ranh giới Xuất Nhóm Tài năng | Vai trò người dùng Nhà tuyển dụng KHÔNG ĐƯỢC tải xuống bản ghi xác minh sinh trắc học thô của ứng viên trong bất kỳ gói nào. | Giảm nhẹ trách nhiệm pháp lý theo các quy tắc nghiêm ngặt về quyền riêng tư. | Tệp xuất loại trừ hình ảnh thô, chỉ giữ lại các trường trạng thái. |
| **EMP-011** | Phục hồi Chiến dịch | Một chiến dịch đã lưu trữ/đóng KHÔNG NÊN được kích hoạt lại nếu dấu thời gian đóng cửa của nó lớn hơn 365 ngày. | Bảo toàn tính toàn vẹn của dữ liệu lưu trữ và trạng thái lịch sử. | Workspace nhắc người tạo chiến dịch khởi tạo một bản sao chiến dịch mới. |
| **EMP-012** | Định dạng File Thương hiệu | Logo tùy chỉnh của Nhà tuyển dụng sử dụng cho ứng viên PHẢI là định dạng PNG/SVG dưới 2 MB. | Đảm bảo tính nhất quán bố cục và UI trên các màn hình động. | Từ chối các tệp không vượt qua kiểm tra kích thước, định dạng. |
| **EMP-013** | Khóa Thời gian Ứng viên | Nhà tuyển dụng KHÔNG ĐƯỢC chỉnh sửa mục tiêu kỹ năng của chiến dịch sau khi có một ứng viên đã nộp bài thành công. | Ngăn chặn việc dời cột gôn làm sai lệch sự căn chỉnh chấm điểm giữa chừng. | Đầu vào trên bố cục bị đóng băng, hiển thị cờ khóa phụ thuộc. |
| **EMP-014** | Phân quyền Chia sẻ Workspace | Truy cập vào thư mục tuyển dụng nội bộ PHẢI tuân theo cấu trúc vai trò được ánh xạ trong cây workspace của tenant đó. | Tuân thủ bảo mật tổ chức nội bộ và phân chia nhiệm vụ. | Người dùng không có vai trò phù hợp sẽ gặp giao diện từ chối quyền truy cập. |
| **EMP-015** | Bắt buộc Lưu Nhật ký Kiểm toán | Các hoạt động quản trị workspace của nhà tuyển dụng PHẢI được lưu trữ để truy vấn trong cơ sở dữ liệu kiểm toán ít nhất 7 năm. | Tuân thủ tiêu chuẩn kế toán doanh nghiệp và các quy định pháp y. | Quá trình dọn dẹp hệ thống (daemon) sẽ bỏ qua các cơ sở dữ liệu nhật ký này. |

---

## 8. Quy tắc Thanh toán (Payment Rules)

Logic tiền tệ, cấu trúc sổ cái, các phép tính và ràng buộc vòng đời giao dịch.

### 8.1 Bảng Đặc tả Quy tắc Thanh toán (PAY-001 đến PAY-015)

| Rule ID | Tên Quy tắc | Tuyên bố Quy tắc Vận hành | Lý do Nghiệp vụ | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **PAY-001** | Xác nhận Ủy quyền Trước | Truy cập vào dịch vụ nền tảng doanh nghiệp cao cấp PHẢI bị chặn cho đến khi nhận được token callback thành công từ cổng thanh toán. | Tiêu diệt việc sử dụng số dư gian lận và ngăn ngừa mất doanh thu. | Việc kích hoạt trong thời gian thực chỉ xảy ra khi giao dịch rõ ràng. |
| **PAY-002** | Ranh giới Hoàn tiền | Yêu cầu hoàn tiền đăng ký KHÔNG ĐƯỢC xử lý nếu được khởi tạo muộn hơn 14 ngày sau thời điểm giao dịch. | Thiết lập giới hạn thu nhập ổn định và ngăn ngừa trục lợi từ nền tảng. | Yêu cầu quá 14 ngày sẽ tự động bị từ chối bởi quy trình quản trị tài chính. |
| **PAY-003** | Gửi Hóa đơn PDF Tự động | Hệ thống PHẢI tự động tạo hóa đơn thuế hợp lệ trong vòng 60 giây sau bất kỳ sự kiện tính phí giao dịch nào. | Đáp ứng các quy định kế toán doanh nghiệp pháp lý trên toàn cầu. | Worker nền tự động tạo và gửi email đính kèm thanh toán đã ký. |
| **PAY-004** | Máy Trạng thái Giao dịch | Một mục sổ cái thanh toán KHÔNG ĐƯỢC chuyển sang trạng thái "Active" (Hoạt động) nếu chỉ báo xác minh chính của nó trả về "Failed". | Giữ gìn tính đúng đắn của phương pháp kế toán ghi sổ kép trên các cụm dữ liệu. | Giao dịch ánh xạ sang trạng thái Hủy; tất cả quá trình tạo tài sản dừng lại. |
| **PAY-005** | Cách ly Tiền tệ Giao dịch | Tất cả các hệ thống tính toán tài chính cốt lõi PHẢI tính toán số tiền giao dịch dựa trên giá trị tỷ giá hối đoái USD. | Loại bỏ phương sai theo dõi đa tiền tệ phức tạp trên hệ thống sổ sách. | Việc chuyển đổi theo thời gian thực xảy ra ở cổng thanh toán trước khi ánh xạ về lõi. |
| **PAY-006** | Logic Tự động Gia hạn | Các mô hình gói đăng ký hoạt động PHẢI tự động kích hoạt chu kỳ tính phí chính xác 24 giờ trước thời gian hết hạn của chu kỳ hiện tại. | Ngăn chặn sự gián đoạn dịch vụ của khách hàng do trễ múi giờ. | Cổng thanh toán gọi lệnh thu tiền; thành công kéo dài thời gian truy cập. |
| **PAY-007** | Khấu trừ Tín dụng Tự động | Bắt đầu chuỗi phân tích hồ sơ AI tự động PHẢI tiêu thụ ngay lập tức chính xác 1 đơn vị tín dụng từ số dư của tenant. | Theo dõi việc thực thi thu tiền trả-tiền-theo-mức-sử-dụng nghiêm ngặt. | Số dư giảm đi 1; worker nền kích hoạt sau khi khấu trừ thành công. |
| **PAY-008** | Lên lịch Thử lại Giao dịch | Nếu việc tính phí gói bị lỗi, hệ thống PHẢI thử lại giao dịch đúng 3 lần trong khoảng thời gian 7 ngày trước khi đình chỉ workspace. | Tối ưu hóa việc thu doanh thu đồng thời giảm thiểu khóa người dùng đột ngột. | Các lần thử lại chạy vào Ngày 1, Ngày 3, và Ngày 7. |
| **PAY-009** | Giới hạn Mua sắm Vi mô | Các giao dịch nạp tín dụng cục bộ đơn lẻ KHÔNG ĐƯỢC có giá trị tài chính thấp hơn $10.00 USD. | Quản lý chi phí quản lý cổng thanh toán để bảo vệ biên lợi nhuận. | Giao diện xác thực đầu vào giới hạn các mục nhập có giá trị thấp. |
| **PAY-010** | Bảo tồn Workspace Lỗi Thanh toán | Khi tenant rơi vào trạng thái Bị đình chỉ do lỗi thanh toán, dữ liệu cốt lõi KHÔNG ĐƯỢC xóa trong vòng ít nhất 90 ngày. | Cung cấp đường dẫn phục hồi khách hàng đồng thời ngăn mất dữ liệu vĩnh viễn. | Tài khoản bị đóng băng nhưng các mục trong DB vẫn nguyên vẹn để phục hồi. |
| **PAY-011** | Cách ly Chargeback (Bồi hoàn) | Bất kỳ workspace nào kích hoạt khiếu nại bồi hoàn tài chính (chargeback) PHẢI ngay lập tức bị đưa vào trạng thái Khóa Bảo mật. | Giảm thiểu rủi ro gian lận giao dịch và hạn chế trách nhiệm pháp lý. | Tất cả quyền truy cập hệ thống bị đóng băng cho đến khi giải quyết xong tranh chấp. |
| **PAY-012** | Tính Thuế Doanh nghiệp | Giá trị thuế bán hàng khu vực áp dụng PHẢI được tính toán động dựa trên địa chỉ doanh nghiệp cung cấp. | Đảm bảo tuân thủ tuyệt đối các quy tắc thuế của tiểu bang, quốc gia, quốc tế. | Hóa đơn phân tách rõ ràng phí cơ sở và các dòng thuế xác định động. |
| **PAY-013** | Mã Ghi đè Giá Doanh nghiệp | Giá hợp đồng doanh nghiệp đàm phán tùy chỉnh PHẢI dùng mã ghi đè được ủy quyền bởi Phó chủ tịch (VP). | Kiểm soát các tham số chiết khấu doanh nghiệp và bảo vệ lợi nhuận. | Hệ thống chặn các cấu hình thanh toán tùy chỉnh không có chữ ký hợp lệ. |
| **PAY-014** | Giới hạn Hết hạn Tín dụng | Tín dụng đánh giá vận hành riêng lẻ được mua ngoài gói PHẢI hết hạn sau đúng 365 ngày kể từ ngày mua. | Quản lý các nghĩa vụ bảng cân đối kế toán dài hạn và thúc đẩy hoạt động. | Số dư hệ thống giảm xuống, ghi một mục sổ cái hết hạn rõ ràng. |
| **PAY-015** | Cắt giảm Tài nguyên khi Hạ cấp | Khi KH hạ cấp gói, các cấu hình đang hoạt động của workspace PHẢI được cắt giảm có hệ thống để đáp ứng mức trần mới. | Ngăn chặn khai thác các tính năng cao cấp bên trong các gói cước thấp. | Chiến dịch hoạt động dư thừa chuyển sang trạng thái Tạm dừng dựa trên thứ tự tạo. |

---

## 9. Quy tắc Phỏng vấn (Interview Rules)

Các ràng buộc về môi trường, hành vi, vận hành và thủ tục trong việc quản lý bài kiểm tra tự động và trực tiếp.

### 9.1 Bảng Đặc tả Quy tắc Phỏng vấn (INT-001 đến INT-015)

| Rule ID | Tên Quy tắc | Tuyên bố Quy tắc Vận hành | Lý do Nghiệp vụ | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **INT-001** | Bắt buộc Truy cập Camera | Giao diện kiểm tra PHẢI xác minh quyền đối với camera hệ thống trước khi mở khóa các phần tử câu hỏi kiểm tra. | Yêu cầu cấu trúc cốt lõi để xác minh và theo dõi trực quan tự động. | Ứng viên lưu lại trên màn hình chẩn đoán cho đến khi quyền được cấp. |
| **INT-002** | Yêu cầu Luồng Ghi âm | Ứng dụng kiểm tra PHẢI liên tục lấy mẫu tín hiệu âm thanh từ micro phần cứng đã được xác minh trong suốt phiên. | Cần thiết để phân tích giọng nói, xử lý thực thể và phát hiện tiếng ồn. | Khởi tạo phiên bị hủy nếu tín hiệu micro giảm xuống bằng không. |
| **INT-003** | Khớp Sinh trắc học | Ứng viên PHẢI hoàn thành kiểm tra xác thực danh tính khuôn mặt trước khi vào các phòng kiểm tra chiến dịch an toàn. | Ngăn chặn việc thay người thi và đảm bảo tính toàn vẹn của bài thi. | Màn hình chặn quyền truy cập nếu ảnh chụp thực tế không khớp với hồ sơ. |
| **INT-004** | Ràng buộc Hiện diện Đơn lẻ | Mô hình giám thị tự động PHẢI đưa ra cảnh báo vi phạm nghiêm trọng nếu phát hiện có hơn một khuôn mặt khác biệt trong khung hình. | Ngăn chặn sự hỗ trợ của bên thứ ba trong quá trình làm bài thi. | Cảnh báo được gắn cờ vào tiến trình lịch sử; cảnh báo trực tiếp cho ứng viên. |
| **INT-005** | Thực thi Đếm ngược Câu hỏi | Mọi câu hỏi đánh giá PHẢI hoạt động dưới một bộ đếm ngược độc lập được xác định bởi các quy tắc chiến dịch. | Chuẩn hóa điều kiện thi và ngăn chặn việc cố tình làm dài câu trả lời. | Chặn quyền nhập câu hỏi khi thời gian chạm mức 00:00. |
| **INT-006** | Mức trần Tạm dừng Phỏng vấn | Một người dùng ứng viên KHÔNG ĐƯỢC tạm dừng một phiên kiểm tra có giám thị quá 2 lần tổng cộng. | Hạn chế cơ hội tìm kiếm thông tin bên ngoài bằng cách ngắt kết nối. | Nút Tạm dừng sẽ biến mất khỏi giao diện khi chạm giới hạn. |
| **INT-007** | Tự động Nộp bài do Hết giờ | Khi tổng thời gian cho phép của phiên hết hạn, hệ thống PHẢI buộc lưu và nộp tất cả dữ liệu thu được. | Ngăn chặn các phiên không hoàn thành làm trì trệ các hàng đợi xử lý. | Môi trường kiểm tra đóng, gửi kết quả trực tiếp đến hàng đợi AI. |
| **INT-008** | Phục hồi Kết nối Gián đoạn | Hệ thống PHẢI cho phép một ứng viên bị ngắt kết nối vào lại phòng nếu thời gian phiên vẫn còn hiệu lực. | Đối xử công bằng với các biến động mạng thực tế. | Bố cục trình duyệt cố gắng kết nối lại tự động và phục hồi trạng thái. |
| **INT-009** | Leo thang Trả lời Gian lận | Khi phát hiện sự kiện gian lận, hệ thống PHẢI ghi nhật ký sự cố và gắn cờ hồ sơ tính điểm cuối cùng. | Bảo vệ trải nghiệm của ứng viên khỏi bị dừng đột ngột nhưng vẫn đảm bảo tính tin cậy. | Ứng viên hoàn thành bài thi nhưng bảng điều khiển sẽ đánh dấu là Đã xâm phạm. |
| **INT-010** | Khóa Trạng thái Tiếp tục | Khi vào lại phòng thi sau sự cố sập mạng, ứng viên PHẢI tiếp tục từ đúng chỉ mục câu hỏi hiện đang thực hiện. | Ngăn chặn ứng viên quay lại các câu hỏi trước để thay đổi đáp án. | Giao diện chỉ hiển thị dữ liệu trạng thái theo trình tự thời gian đang hoạt động. |
| **INT-011** | Chiều dài Câu trả lời Tối thiểu | Một bài nộp phỏng vấn PHẢI chứa ít nhất 15 giây nội dung âm thanh giọng nói thì mới được coi là hợp lệ. | Đảm bảo sự hiện diện của dữ liệu lời nói đáng kể cho các mô hình AI. | Các bài nộp ngắn hơn sẽ kích hoạt lời nhắc yêu cầu trả lời đầy đủ hơn. |
| **INT-012** | Khóa Trình duyệt Toàn màn hình | Các phiên phỏng vấn có giám thị PHẢI yêu cầu giao diện trình duyệt của ứng viên hoạt động ở chế độ toàn màn hình độc quyền. | Hạn chế việc sử dụng song song các ứng dụng desktop hoặc tìm kiếm khác. | Thoát chế độ toàn màn hình sẽ kích hoạt cảnh báo vi phạm. |
| **INT-013** | Ngưỡng Tiếng ồn Nền | Hệ thống PHẢI đưa ra cảnh báo nếu mức độ tiếng ồn xung quanh vượt quá 65 decibel trong 10 giây liên tục. | Duy trì tín hiệu âm thanh rõ ràng để đánh giá ngôn ngữ chính xác. | Ứng viên nhận được thông báo cảnh báo trực quan để tìm không gian yên tĩnh hơn. |
| **INT-014** | Ranh giới Hết hạn Phiên Rõ ràng | Một phiên phỏng vấn chưa hoàn thành PHẢI tự động chuyển sang trạng thái "Hết hạn" đúng 24 giờ sau khi khởi tạo. | Giữ cho dữ liệu đường ống tuyển dụng luôn mới và giải phóng tài nguyên. | Token kết nối trở nên không hợp lệ, ngăn truy cập sau đó. |
| **INT-015** | Ghi đè Giám thị Thủ công | Quyền Tenant Admin PHẢI có quyền xóa cờ gian lận của giám thị tự động sau khi xem xét thủ công. | Cho phép sự phán đoán của con người sửa các lỗi dương tính giả (false-positive). | Form nhận xét ghi lại lý do chính đáng của admin để theo dõi kiểm toán. |

---

## 10. Quy tắc Đánh giá AI (AI Assessment Rules)

Các chính sách thuật toán, thống kê, đánh giá và tiết lộ đối với các mô-đun chấm điểm tự động.

### 10.1 Bảng Đặc tả Quy tắc Đánh giá AI (AIA-001 đến AIA-015)

| Rule ID | Tên Quy tắc | Tuyên bố Quy tắc Vận hành | Lý do Nghiệp vụ | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **AIA-001** | Quy tắc Trình tự Tuần tự hóa | Đường ống đánh giá AI KHÔNG ĐƯỢC thực thi cho đến khi tất cả các đoạn văn bản trả lời và tệp âm thanh được lưu trữ. | Ngăn ngừa hỏng dữ liệu và đảm bảo mô hình chấm điểm hoạt động ổn định. | Hàng đợi xử lý giữ các mục cho đến khi xác minh dữ liệu hoàn chỉnh. |
| **AIA-002** | Thời lượng Trả lời Tối thiểu | Các mô hình AI PHẢI bỏ qua các phân đoạn câu trả lời bằng giọng nói có tổng thời lượng dưới 5 giây. | Tránh tạo ra các lỗi toán học do đầu vào âm thanh không đủ. | Bỏ qua phân đoạn ngắn, ghi nhãn không thể đánh giá. |
| **AIA-003** | Ngưỡng Tự tin Thuật toán | Nếu một kích thước AI trả về điểm độ tin cậy thấp hơn 60%, hệ thống PHẢI đánh dấu chỉ số đó là Không đáng tin cậy. | Bảo vệ độ tin cậy đánh giá và ngăn chặn các quyết định tự động bất thường. | Kích thước cụ thể này kích hoạt theo dõi thủ công cho con người. |
| **AIA-004** | Chuẩn hóa Điểm theo Phạm vi | Mọi điểm năng lực phụ PHẢI được chuẩn hóa bằng phân phối z-score theo phạm vi từ 0 đến 100. | Cho phép so sánh kỹ năng hợp lệ trên các biến thể thử nghiệm khác nhau. | Nhà tuyển dụng thấy thang hiệu suất được chuẩn hóa và nhất quán. |
| **AIA-005** | Tính toán Đa biến có Trọng số | Điểm đánh giá tổng hợp PHẢI được tính toán bằng các giá trị trọng số kỹ năng chính xác được chỉ định trong chiến dịch. | Tôn trọng các ưu tiên tuyển dụng do nhà tuyển dụng đưa ra. | Thay đổi trọng số sẽ cập nhật lịch sử điểm trên toàn chiến dịch. |
| **AIA-006** | Logic Công cụ Đề xuất | Hệ thống KHÔNG ĐƯỢC tạo huy hiệu 'Rất được Khuyến nghị' trừ khi điểm cốt lõi của ứng viên >= 85. | Duy trì tiêu chuẩn nhân tài cao cấp. | Ứng viên dưới 85 nhận phân loại tiêu chuẩn dựa trên hiệu suất. |
| **AIA-007** | Rào cản Xuất bản Điểm | Điểm đánh giá KHÔNG ĐƯỢC hiển thị cho đến khi tất cả các tác vụ mô hình nội bộ kết thúc thành công. | Ngăn hiển thị điểm số không đầy đủ trên trang tổng quan. | Trạng thái tiếp tục là Processing cho đến khi xác nhận từ AI engine rõ ràng. |
| **AIA-008** | Phân tách Dữ liệu Đa Khách thuê | Một instance mô hình AI KHÔNG ĐƯỢC dùng dữ liệu chấm điểm từ Tenant A để tối ưu hóa/đào tạo cho Tenant B. | Bảo vệ nghiêm ngặt ranh giới IP doanh nghiệp và luật về quyền riêng tư. | Các tham số mô hình được lưu trữ bên trong các hệ thống lưu trữ biệt lập. |
| **AIA-009** | Tính Đủ điều kiện Học tập | Logic lộ trình học tập PHẢI tập trung vào khoảng cách kỹ năng (khi điểm đánh giá < 70). | Nhắm mục tiêu nội dung đào tạo vào các lỗ hổng thực tế. | Hệ thống hiển thị các chương trình dựa trên các nút kỹ năng yếu. |
| **AIA-010** | Xác minh Mật độ Từ khóa Kỹ thuật | Các mô hình đánh giá mã lệnh (code) PHẢI kiểm tra tính đúng đắn của cú pháp trước khi đánh giá logic. | Đảm bảo mô hình đánh giá logic đang hoạt động thực tế. | Việc nộp mã sai cú pháp sẽ mặc định nhận điểm 0 trong quá trình biên dịch. |
| **AIA-011** | Loại trừ Phân tích Cảm xúc | Hệ thống tính điểm năng lực cốt lõi KHÔNG ĐƯỢC sử dụng thông số cảm xúc để thay đổi các giá trị kỹ năng kỹ thuật. | Giảm thiểu định kiến về sự đa dạng thần kinh và bảo vệ tính trung lập. | Các thành phần đánh giá trích xuất khả năng kỹ thuật độc lập với giọng điệu. |
| **AIA-012** | Nhất quán Phiên bản Mô hình | Các bài đánh giá trong một chiến dịch duy nhất PHẢI dùng cùng một phiên bản AI từ đầu đến cuối. | Đảm bảo đánh giá công bằng bằng cách ngăn thay đổi mô hình giữa chừng. | Cập nhật hệ thống áp dụng cho các chiến dịch mới thay vì thay đổi luồng cũ. |
| **AIA-013** | Lọc Chỉ số Đạo văn | Nếu câu trả lời có tỷ lệ khớp văn bản vượt quá 40%, hồ sơ PHẢI bị gắn cờ để con người xem xét. | Phát hiện gian lận copy-paste từ web công cộng hoặc AI prompts. | Hồ sơ hiển thị chỉ báo cảnh báo đạo văn. |
| **AIA-014** | Tóm tắt Báo cáo Động tự động | Công cụ tóm tắt AI PHẢI trích xuất ít nhất 3 đặc điểm tích cực riêng biệt và 2 lĩnh vực cần cải thiện. | Cung cấp giá trị phản hồi thiết thực cho các nhóm tuyển dụng. | Các báo cáo tạo ra mạng lưới phản hồi có cấu trúc thay vì văn bản chung chung. |
| **AIA-015** | Xác minh Sai lệch Liên tục | Hệ thống PHẢI giám sát sự thay đổi điểm số và báo cáo nếu độ lệch thay đổi 15% so với tháng trước. | Phát hiện sớm sự trôi dạt (drift) của mô hình. | Hệ thống báo hiệu đội ngũ kỹ thuật để kiểm toán tính nhất quán của mô hình. |

---

## 11. Quy tắc Lộ trình Học tập (Learning Roadmap Rules)

Việc tạo chương trình giảng dạy, các mốc quan trọng và ràng buộc khắc phục lỗ hổng kỹ năng.

### 11.1 Bảng Đặc tả Quy tắc Lộ trình Học tập (RDM-001 đến RDM-015)

| Rule ID | Tên Quy tắc | Tuyên bố Quy tắc Vận hành | Lý do Nghiệp vụ | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **RDM-001** | Điều kiện Tiên quyết | Một ứng viên PHẢI hoàn thành ít nhất 1 bài kiểm tra chẩn đoán trước khi tạo Lộ trình học AI. | Cung cấp dữ liệu cơ sở cần thiết để xây dựng kế hoạch đào tạo. | Yêu cầu tạo mới bị chặn cho đến khi có dữ liệu kiểm tra chẩn đoán. |
| **RDM-002** | Bản đồ Ngưỡng Lỗ hổng | Công cụ tạo lộ trình PHẢI chỉ bao gồm các kỹ năng mà hiệu suất đánh giá dưới 75%. | Tập trung vào những lĩnh vực phát triển chưa đạt yêu cầu. | Các chủ đề vượt 75% bị loại trừ khỏi kế hoạch khắc phục. |
| **RDM-003** | Giới hạn Làm mới Lộ trình | Ứng viên KHÔNG ĐƯỢC tạo lại lộ trình thủ công nhiều hơn 2 lần trong 30 ngày. | Kiểm soát tài nguyên xử lý và khuyến khích tập trung vào các kế hoạch hiện tại. | Tùy chọn làm mới bị khóa, hiển thị ngày cài đặt lại tiếp theo có sẵn. |
| **RDM-004** | Trình tự Lịch sử Học tập | Bố cục lộ trình PHẢI hiển thị các mô-đun học tập theo thứ tự từ cơ bản đến nâng cao. | Tuân theo các mô hình học tập có cấu trúc. | Các phần nâng cao bị khóa cho đến khi hoàn tất cơ bản. |
| **RDM-005** | Xác thực Tiên quyết Mô-đun | Giao diện học tập PHẢI chặn vào các mô-đun nâng cao cho đến khi bài kiểm tra tiên quyết đạt tối thiểu 80%. | Đảm bảo thành thạo khái niệm trước khi chuyển sang nội dung cấp cao. | Các tác vụ chọn bị vô hiệu hóa kèm hiển thị các mục tiên quyết. |
| **RDM-006** | Tiêu chí Hoàn thành Rõ ràng | Trạng thái mô-đun KHÔNG ĐƯỢC chuyển thành "Completed" cho đến khi cả video và bài trắc nghiệm đều hoàn tất. | Đảm bảo tương tác kỹ lưỡng với tài liệu. | Cập nhật trạng thái động khi hoàn tất cả 2 điều kiện. |
| **RDM-007** | Tính Tiến độ Tuyến tính | Các chỉ số về tiến trình lộ trình PHẢI được tính bằng tỷ lệ phần trăm các mô-đun đã hoàn thành so với tổng số đã phân công. | Cung cấp tầm nhìn tiến bộ rõ ràng. | Trang tổng quan cập nhật thanh tiến trình. |
| **RDM-008** | Chính sách Cầu nối Chứng chỉ | Hệ thống học tập KHÔNG ĐƯỢC công nhận các mục bên ngoài trừ khi được xác minh qua cầu nối API chính thức. | Bảo vệ uy tín nền tảng bằng cách xác thực các tuyên bố bên ngoài. | Việc tự khai báo thủ công bị đánh dấu "Unverified". |
| **RDM-009** | Ước tính Thời lượng Động | Mỗi Lộ trình học PHẢI tính số giờ hoàn thành ước lượng dựa trên các biến phức tạp. | Giúp ứng viên lên kế hoạch thời gian một cách hiệu quả. | Giao diện hiển thị ước tính thời gian cạnh tiêu đề bài học. |
| **RDM-010** | Kiểm tra Nội dung Hết hạn | Nếu một mô-đun dùng nội dung đã bị ngưng, hệ thống PHẢI thay bằng một tương đương đang hoạt động trong vòng 24h. | Ngăn ngừa sự thất vọng của người dùng. | Tác vụ bảo trì hoán đổi các liên kết hỏng vào ban đêm. |
| **RDM-011** | Chính sách Chia sẻ Đánh giá | Các chỉ số về lộ trình học tập của ứng viên KHÔNG ĐƯỢC chia sẻ cho Nhà tuyển dụng mà không có sự đồng ý. | Bảo vệ sự riêng tư trong không gian phát triển kỹ năng thấp rủi ro. | Nhà tuyển dụng chỉ thấy các chứng chỉ thi đã được xác minh. |
| **RDM-012** | Ưu tiên Mô-đun Đề xuất | Logic tạo lộ trình PHẢI ưu tiên các mô-đun được liên kết trực tiếp với các chiến dịch tuyển dụng mở trong khu vực của người dùng. | Tối đa hóa giá trị việc làm thực tế của lộ trình học tập. | Các mô-đun này sẽ nhận hiển thị mức độ ưu tiên cao trong không gian làm việc. |
| **RDM-013** | Khóa Thất bại Trắc nghiệm | Nếu người dùng thi trượt 1 bài quiz 3 lần, hệ thống PHẢI áp đặt khóa học tập trong 24 giờ. | Ngăn chiến thuật đoán bừa và khuyến khích đọc lại tài liệu. | Giao diện hiển thị bộ đếm đếm ngược khi vào quiz. |
| **RDM-014** | Tạo Lộ trình Vi mô (Micro) | Hệ thống PHẢI phân chia theo các khối cột mốc rõ ràng không mất quá 120 phút để hoàn thành. | Hỗ trợ thói quen học tập nhỏ lẻ và giảm mệt mỏi giao diện. | Các khóa học dài được chia nhỏ thành các cấu trúc hợp lý. |
| **RDM-015** | Quy tắc Lưu trữ | Lộ trình học không hoạt động (abandoned) PHẢI được chuyển vào kho lưu trữ sau 180 ngày. | Dọn sạch bảng lưu trữ và cải thiện tốc độ tải tổng thể. | Dữ liệu chuyển sang lưu trữ lạnh nhưng vẫn có thể phục hồi theo yêu cầu. |

---

## 12. Quy tắc Chứng chỉ (Certificate Rules)

Thiết kế chứng chỉ, chữ ký điện tử, xác thực và các ràng buộc thu hồi bằng lập trình.

### 12.1 Bảng Đặc tả Quy tắc Chứng chỉ (CRT-001 đến CRT-015)

| Rule ID | Tên Quy tắc | Tuyên bố Quy tắc Vận hành | Lý do Nghiệp vụ | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **CRT-001** | Khóa Ngưỡng Đạt | Hệ thống KHÔNG ĐƯỢC tạo chứng chỉ kỹ năng trừ khi điểm đánh giá liên quan đạt từ 80.00% trở lên. | Chuẩn hóa giá trị cấp chứng chỉ và duy trì niềm tin thị trường bên ngoài. | Điểm dưới 80 sẽ không kích hoạt hệ thống sinh tài liệu. |
| **CRT-002** | Mức trần Hoàn thành Khóa học | Một chứng chỉ lộ trình học tập PHẢI yêu cầu trạng thái hoàn thành 100% tất cả các mô-đun được ánh xạ. | Xác nhận sự tham gia toàn diện vào mọi yếu tố đào tạo. | Việc tạo tự động kích hoạt khi trạng thái cuối cùng đổi thành Hoàn thành. |
| **CRT-003** | Khóa Nhận dạng Mật mã | Mọi chứng chỉ kỹ năng PHẢI chứa một chuỗi xác nhận SHA-256 duy nhất trên toàn cầu trong bản ghi của nó. | Ngăn chặn giả mạo và hỗ trợ kiểm tra của bên thứ ba độc lập. | Cấu trúc đầu ra bổ sung một chuỗi xác minh duy nhất vào mỗi tệp. |
| **CRT-004** | Trạng thái Thu hồi Dứt khoát | Nếu một chứng chỉ bị thu hồi do gian lận, trạng thái xác thực hệ thống của nó PHẢI vĩnh viễn trả về False. | Bảo vệ độ tin cậy của nền tảng chống lại việc gian lận hoặc khai gian. | Các liên kết xác thực hiển thị thông báo "Bị thu hồi" (Revoked) in đậm, rõ ràng. |
| **CRT-005** | Truy cập Xác minh Công khai | Giao diện xác minh PHẢI cho phép người dùng bên thứ ba xác thực chứng chỉ mà không cần đăng nhập. | Đơn giản hóa việc kiểm tra cho các nhóm HR bên ngoài. | Truy cập URL xác minh hiển thị chi tiết chứng chỉ suôn sẻ. |
| **CRT-006** | Chính sách Hết hạn | Các chứng chỉ do nền tảng tạo PHẢI duy trì hiệu lực tối đa trong vòng 730 ngày kể từ ngày phát hành. | Đảm bảo dữ liệu kỹ năng bắt kịp với sự thay đổi của ngành. | Hồ sơ hết hạn hiển thị băng rôn cảnh báo trạng thái rõ ràng. |
| **CRT-007** | Giới hạn Tải xuống PDF | Ứng viên KHÔNG ĐƯỢC tải xuống chứng chỉ kỹ thuật số nếu trạng thái xác minh hồ sơ của họ chưa được xác nhận (IDV). | Ngăn chặn việc người dùng chưa được xác minh xuất dữ liệu có đóng dấu. | Các tùy chọn giao diện tải xuống chỉ mở khóa sau khi qua kiểm tra danh tính. |
| **CRT-008** | Chèn Siêu dữ liệu Tự động | Bản ghi siêu dữ liệu chứng chỉ PHẢI bao gồm ID ứng viên, ID kỹ năng, Ngày cấp và Phiên bản mô hình. | Duy trì khả năng truy xuất đầy đủ cho quy trình kiểm toán doanh nghiệp. | Các bản ghi dữ liệu tập hợp thông tin hoàn chỉnh trước khi ký tệp. |
| **CRT-009** | Vị trí Cầu nối Huy hiệu | Hệ thống PHẢI cung cấp các cấu trúc chia sẻ siêu dữ liệu tiêu chuẩn cho LinkedIn, Twitter... | Thúc đẩy khả năng hiển thị thương hiệu và phát triển hữu cơ. | Hồ sơ ứng viên kết xuất các liên kết chia sẻ mạng xã hội trực tiếp. |
| **CRT-010** | Thu hồi Hồi tố | Vai trò Super Admin PHẢI nắm quyền thu hồi chứng chỉ hồi tố nếu gian lận được phát hiện sau này. | Cho phép hành động sửa sai khi phát hiện gian lận sau thi cử. | Sự thay đổi trường trạng thái được cập nhật ngay lập tức vào sổ cái lịch sử. |
| **CRT-011** | Chặn Tạo Trùng lặp | Hệ thống PHẢI chặn việc tạo ra chứng chỉ trùng lặp cho một kỹ năng đã có chứng chỉ hợp lệ. | Ngăn chặn các bản ghi bị nhân đôi. | Các điểm số cao tiếp theo sẽ cập nhật hồ sơ hiện tại thay vì sinh tệp mới. |
| **CRT-012** | Bộ nhớ đệm Xác minh | Công cụ xác minh PHẢI kiểm tra chéo trạng thái chứng chỉ dựa trên một cơ sở dữ liệu sổ cái chỉ thêm (append-only). | Triển khai theo dõi bảo mật cao để ngăn chặn giả mạo dữ liệu trực tiếp. | Các lệnh gọi xác minh sẽ đối chiếu chữ ký với các rễ (root) mật mã hệ thống. |
| **CRT-013** | Thương hiệu Tùy chỉnh Doanh nghiệp | Doanh nghiệp KHÔNG ĐƯỢC bao gồm logo công ty lên chứng chỉ trừ khi đang dùng gói Premium. | Bảo vệ các quy tắc thương hiệu doanh nghiệp và thúc đẩy nâng cấp nền tảng. | Gói tiêu chuẩn tạo chứng chỉ với mẫu chung của nền tảng. |
| **CRT-014** | Khóa Thay đổi Tên | Tên hiển thị trên chứng chỉ đã cấp KHÔNG ĐƯỢC thay đổi trừ khi tài liệu nhận dạng pháp lý được xác minh lại. | Ngăn người dùng chuyển thông tin chứng chỉ đã lấy sang cho người khác. | Các trường form bị khóa sau khi sinh ra chứng chỉ. |
| **CRT-015** | Cảnh báo Hết hạn Tự động | Hệ thống thông báo PHẢI gửi bản cập nhật 60 ngày trước khi một chứng chỉ chạm mức hết hạn. | Nhắc ứng viên thi lại, hỗ trợ mức độ tương tác liên tục với nền tảng. | Trình tự động đặt lời nhắc gửi đến tài khoản. |

---

## 13. Quy tắc Thông báo (Notification Rules)

Tương tác khách hàng dựa trên sự kiện, mốc thời gian về cấp độ dịch vụ (SLA) và logic định tuyến đa kênh.

### 13.1 Bảng Đặc tả Quy tắc Thông báo (NOT-001 đến NOT-015)

| Rule ID | Tên Quy tắc | Tuyên bố Quy tắc Vận hành | Lý do Nghiệp vụ | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **NOT-001** | Nhắc nhở Phỏng vấn Tự động | Hệ thống PHẢI gửi lời nhắc phỏng vấn 24 giờ và 1 giờ trước một phiên đánh giá trực tiếp được lên lịch. | Giảm tỷ lệ ứng viên vắng mặt và giữ cho quy trình tuyển dụng đúng hạn. | Trình Cron chạy các hành động tin nhắn đúng lúc mục tiêu. |
| **NOT-002** | Biên lai Thanh toán Thực tế | Các biên lai giao dịch PHẢI được gửi đến email thanh toán trong 30 giây sau khi thu tiền thành công. | Cung cấp xác nhận tài chính rõ ràng. | Việc thanh toán thành công tạo và gửi biên lai ngay lập tức. |
| **NOT-003** | Cảnh báo Hoàn tất Lộ trình Học | Hệ thống PHẢI báo cho ứng viên trong 5 phút sau khi Lộ trình học động của họ được tạo xong. | Khuyến khích sự tham gia ngay lập tức của người dùng. | Tác vụ tạo hoàn thành sẽ gọi các cảnh báo in-app và email ngay tức khắc. |
| **NOT-004** | Thông báo Chứng chỉ Ngay lập tức | Mô-đun thông báo PHẢI báo cho ứng viên ngay lập tức khi chứng chỉ được tạo thành công. | Mang lại trải nghiệm UX tích cực bằng cách ăn mừng thành tích ứng viên. | Thành công tạo file PDF sẽ được gửi ngay vào hàng đợi thông báo. |
| **NOT-005** | Mốc Chiến dịch Thực tế | Hệ thống PHẢI cập nhật cho Nhà tuyển dụng khi lượng đơn nộp đạt 50%, 100%, và 150% so với mục tiêu. | Giúp đội ngũ nhân sự giám sát sức khỏe chiến dịch không cần theo dõi thủ công. | Việc kiểm tra được kích hoạt trên hệ thống mỗi khi đạt mốc. |
| **NOT-006** | Khuyến cáo Downtime Hệ thống | Thông báo về cửa sổ bảo trì hệ thống PHẢI được gửi đến tất cả người dùng hoạt động trước 48 giờ. | Tuân theo SLA cấp dịch vụ tiêu chuẩn. | Biểu ngữ trên toàn hệ thống và chiến dịch email được tung ra trước 48 giờ. |
| **NOT-007** | SLA Cập nhật Vé Hỗ trợ | Phản hồi từ quầy hỗ trợ PHẢI được gửi về kênh của người dùng trong 2 phút kể từ khi kỹ thuật viên gửi (submit). | Duy trì vòng trải nghiệm dịch vụ khách hàng liên tục. | Hoạt động trên giao diện hỗ trợ sẽ gọi các worker gửi thông báo tức thì. |
| **NOT-008** | Cảnh báo Sự kiện Bảo mật | Thông báo an ninh (cập nhật MFA, thay mật khẩu) PHẢI được gửi đồng thời qua email và SMS. | Giúp người dùng phát hiện thay đổi bất hợp pháp kịp thời. | Bỏ qua các hàng đợi ưu tiên thấp để định tuyến gửi tức thì. |
| **NOT-009** | Tóm tắt Digest Thông minh | Các thông báo phi quan trọng (lượt xem hồ sơ) PHẢI được gộp thành email tóm tắt hằng ngày. | Tránh mệt mỏi về mặt giao tiếp và giữ người dùng khỏi đánh dấu spam. | Hệ thống chạy lệnh tổng hợp để gửi 1 lần lúc 08:00 sáng. |
| **NOT-010** | Trò chuyện Trực tiếp | Mọi giao tiếp giữa ứng viên và nhà tuyển dụng PHẢI thông qua hệ thống nội bộ của nền tảng. | Bảo vệ quyền riêng tư PII ứng viên và duy trì sự tuân thủ. | Hiển thị thông tin liên lạc cá nhân trực tiếp bị che giấu. |
| **NOT-011** | Vô hiệu hóa Email Bị từ chối | Nếu 1 email rơi vào trạng thái "Hard-bounce", hệ thống PHẢI đánh dấu địa chỉ đó là Inactive. | Bảo vệ uy tín miền (domain authority) của hệ thống trước các cỗ máy duyệt mail. | Webhook bắt sự kiện bounce và ghi vào cơ sở dữ liệu. |
| **NOT-012** | Quy tắc Giờ địa phương | Tin nhắn tiếp thị KHÔNG ĐƯỢC phép gửi từ 21:00 đến 08:00 theo múi giờ địa phương của người dùng. | Tôn trọng giờ nghỉ ngơi và cải thiện tỷ lệ chuyển đổi. | Hàng đợi xem xét múi giờ (Timezone) trước khi xuất thông báo. |
| **NOT-013** | Ngôn ngữ Thông báo | Thông báo PHẢI khớp với cấu hình ngôn ngữ tùy chọn của ứng viên trong hồ sơ của họ. | Đảm bảo liên lạc thân thiện. | Logic nạp tệp bản địa hóa khi cấu trúc tin nhắn. |
| **NOT-014** | Tắt Chức năng Opt-Out | Người dùng KHÔNG ĐƯỢC từ chối nhận các thông báo về an ninh, bảo mật, và thanh toán. | Đảm bảo chuyển giao thông tin pháp lý bắt buộc. | Giao diện loại bỏ Checkbox Opt-Out đối với một số danh mục thiết yếu. |
| **NOT-015** | Lưu Trữ Tin nhắn | Mọi thông báo đã gửi PHẢI được lưu trữ tại DB hệ thống (audit) tối thiểu 3 năm. | Hỗ trợ giải quyết tranh chấp pháp lý và cung cấp đường dẫn tuân thủ. | Công cụ xuất message ghi đè một bản lưu vào lịch sử. |

---

## 14. Quy tắc Quản trị (Administrative Rules)

Cấu hình hệ thống, điều chỉnh doanh nghiệp, feature flags và các điều khiển tổng thể toàn cầu.

### 14.1 Bảng Đặc tả Quy tắc Quản trị (ADM-001 đến ADM-015)

| Rule ID | Tên Quy tắc | Tuyên bố Quy tắc Vận hành | Lý do Nghiệp vụ | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **ADM-001** | Giới hạn Cấp Quyền | Quyền Super Admin KHÔNG ĐƯỢC phân bổ mà không có sự chấp thuận minh bạch của CISO (GĐ An ninh Thông tin). | Giảm thiểu rủi ro truy cập nội bộ bằng cách hạn chế quyền hạn cao nhất. | Thay đổi đặc quyền chờ trạng thái pending đến khi có dấu ký (sign-off). |
| **ADM-002** | Khôi phục Xác thực Đa yếu tố | Reset cấu hình MFA của một người dùng PHẢI đòi hỏi 2 nhân viên hỗ trợ cùng xác minh chéo danh tính. | Ngăn chặn tấn công Social Engineering chiếm quyền điều khiển. | MFA giữ trạng thái khóa đến khi nhân viên thứ 2 xác nhận. |
| **ADM-003** | Nhật ký Biến số Hệ thống | Các biến số hệ thống (giá cả, hạn mức) KHÔNG ĐƯỢC phép thay đổi nếu thiếu một lệnh Change-Order có hồ sơ. | Theo dõi cấu hình để phục vụ các cuộc kiểm toán (Audits). | Mọi Update sẽ bị từ chối trừ phi gắn kèm với một số ID được phép. |
| **ADM-004** | Sao lưu Doanh nghiệp | Quá trình sao lưu mã hóa hoàn toàn CSDL PHẢI tự động chạy mỗi 24 tiếng lưu trữ ở cấu hình đa vùng (multi-region). | Đảm bảo tính liên tục của doanh nghiệp (BCP) nếu sự cố dữ liệu. | Các quá trình sao lưu tự động kích hoạt lúc 01:00 UTC. |
| **ADM-005** | Cách ly Feature Flag Sản xuất | Tính năng thử nghiệm qua cờ tính năng PHẢI tách riêng biệt qua Tenant ID để phòng lỗi lan truyền. | Thử nghiệm an toàn cho nhóm khách hàng quy định cụ thể. | Hệ thống kiểm tra Flag states của Tenant để quyết định View. |
| **ADM-006** | Mức Trần Thời gian Bảo trì | Các cửa sổ bảo trì định kỳ KHÔNG ĐƯỢC vượt quá 4 giờ mỗi tháng dương lịch. | Bảo vệ các hợp đồng SLA và mức khả dụng (High-Availability). | Bảo trì hệ thống được lập lịch để vừa khít vào các chu kỳ này. |
| **ADM-007** | Lưu giữ Dữ liệu Không hoạt động | Hồ sơ ứng viên trên tài khoản bất động quá 3 năm PHẢI bị lưu trữ sang hệ thống lưu trữ dài hạn bảo mật (Cold storage). | Giảm phí chi trả DB hoạt động. | Migrate dữ liệu sang kho trữ chậm hằng năm. |
| **ADM-008** | Khôi phục Cold Storage | Việc lấy dữ liệu từ cold storage PHẢI được hoàn thành trong vòng 48 giờ sau khi Admin yêu cầu. | Cân bằng chi phí sử dụng hệ thống so với nhu cầu sử dụng thực tế. | Khôi phục toàn bộ bảng DB chỉ trong <48 tiếng. |
| **ADM-009** | Xóa sạch Doanh nghiệp Toàn diện | Lệnh "Hard-purge" một không gian tài khoản Enterprise PHẢI yêu cầu cửa sổ pending 30 ngày. | Phòng chống vô ý nhấn xóa toàn bộ cơ sở hạ tầng thông tin ứng viên. | Chuyển sang trạng thái hidden pending-deletion trong 30 ngày rồi mới xóa hẳn. |
| **ADM-010** | Whitelist Nhóm IP Bên thứ 3 | API hội nhập bên thứ 3 PHẢI được yêu cầu gửi lưu lượng chỉ từ các IP được khai báo trong danh sách Whitelist. | Thêm lớp bảo mật hạ tầng mạng ở doanh nghiệp. | Lưu lượng rác lập tức bị trả mã 403 Forbidden. |
| **ADM-011** | Quy tắc Tự Scale | Khối tài nguyên bộ nhớ tự động mở rộng sức mạnh nếu tổng tải đạt 75% trong 5 phút. | Giải tỏa sự nghẽn cổ chai trong quá trình thi cử ồ ạt. | Monitors tự động Scale-up resource. |
| **ADM-012** | Giới hạn Cường độ API | Mã khóa API hoạt động dưới mức trần 1000 lượt request / phút theo cửa sổ trượt (rolling window). | Bảo vệ tải nền tảng trước mã chạy sai hoặc lạm dụng. | Ném lỗi Standard rate-limiting. |
| **ADM-013** | Tiêu chuẩn Mã hóa Cơ sở dữ liệu | Dữ liệu nhạy cảm (Mật mã, hình ảnh định danh) PHẢI sử dụng định dạng mã hóa bảo mật chuẩn AES-256 at-rest (lưu trữ). | Đảm bảo tính an toàn nếu máy chủ lộ dữ liệu thô. | Hệ thống mã hóa trước khi write. |
| **ADM-014** | Vô hiệu hóa Phiên qua Trạng thái | Nâng trạng thái tenant sang dạng Suspended PHẢI ngay lập tức hủy mọi phiên người dùng đang sống ở tenant đó. | Hủy phiên mọi nhân viên dưới cấp ở Enterprise đang trễ hóa đơn. | Đẩy tất cả ra trang đăng nhập trong tíc tắc. |
| **ADM-015** | Thói quen Scan Lỗ hổng | Quét bảo mật tự động PHẢI quét lên mọi cơ sở dữ liệu và mạng liên đới mỗi tuần. | Chủ động tìm bug để giảm nguy cơ xâm nhập sâu. | Các máy quét chạy hằng tuần và đổ báo cáo Alert. |

---

## 15. Quy tắc Tuân thủ (Compliance Rules)

Luật về quyền riêng tư dữ liệu, quy định về tuyển dụng cơ hội bình đẳng và các tuân thủ đánh giá quốc tế.

### 15.1 Bảng Đặc tả Quy tắc Tuân thủ (CMP-001 đến CMP-015)

| Rule ID | Tên Quy tắc | Tuyên bố Quy tắc Vận hành | Lý do Nghiệp vụ | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **CMP-001** | Khung Quyền Riêng Tư (General) | Hệ thống PHẢI cung cấp cho ứng viên tùy chọn trích xuất toàn bộ dữ liệu cá nhân theo dạng tập tin (Export). | Đáp ứng lệnh luật di động dữ liệu (Data Portability) của GDPR. | Có một nút Download Export Data. |
| **CMP-002** | Đồng ý Sinh trắc học Rõ ràng | Dữ liệu Sinh trắc học (nhận dạng khuôn mặt) KHÔNG ĐƯỢC xử lý nếu thiếu check-box Opt-in từ phía người dùng. | Tuân thủ nghiêm ngặt luật CCPA và BIPA về khuôn mặt. | Máy scan không quét cho đến khi User click Consent. |
| **CMP-003** | Vòng đời Duy trì Dữ liệu | Lịch sử nộp đơn KHÔNG có phản hồi sẽ bị tự động xóa sau 24 tháng theo quy tắc làm sạch chuẩn. | Tuân theo chính sách thu nhỏ bộ nhớ theo chuẩn Privacy Framework. | Background workers clear dữ liệu hằng tháng. |
| **CMP-004** | Nhật ký Bất biến (Immutable) | Các Logs cập nhật quyền hạn PHẢI lưu xuống định dạng chỉ được Append (thêm vào) mà không thể thay đổi. | Cho phép SOC2 Audits được chính xác, chống giả mạo bằng cách ghi đè thông tin tài khoản. | Ngăn bất kỳ nhân viên nào tự xóa Logs của họ. |
| **CMP-005** | Phân quyền RBAC | Quyền truy cập hồ sơ ứng viên PHẢI được khóa cứng theo Vai trò (Roles) trong cấu trúc nội bộ. | Ngăn chặn lợi dụng xem hồ sơ của phòng ban khác. | Trả lỗi và chặn quyền xem hồ sơ (View Access). |
| **CMP-006** | Mã hóa PII (Personally Identifiable Information) | Thông tin PII PHẢI chạy dưới chế độ Encryption In-Transit và At-Rest. | Bảo vệ người dùng bị rò rỉ dữ liệu. | Tôn trọng và đảm bảo sử dụng HTTPS và TLS connection. |
| **CMP-007** | Lọc Cơ hội Bình đẳng | Mô hình chấm điểm KHÔNG ĐƯỢC thêm chỉ số Tuổi Tác/Giới Tính/Dân Tộc làm hệ số lọc (Demographic Filter). | Ngăn chặn hành vi Bias trong tuyển dụng toàn cầu. | Bỏ hoàn toàn thông số giới tính ra khỏi ML Model Training. |
| **CMP-008** | Định vị Dữ liệu Vùng (Localization) | Hồ sơ ứng viên PHẢI lưu hành ở máy chủ nằm ở đúng lãnh thổ/khu vực quốc gia mà họ đang cư trú (Data Residency). | Không vi phạm luật về vị trí dữ liệu. | Routing dữ liệu sang các kho lưu trữ tại US/EU hay VN tương ứng. |
| **CMP-009** | Xóa sổ "Right-to-Forget" | Lệnh yêu cầu xóa từ một người dùng đã được Verify PHẢI tiêu hủy mọi record (bao gồm bản lưu) trong 30 ngày. | Khớp với lệnh Right-to-be-Forgotten từ GDPR Article 17. | Các workers tự quét và diệt (wipe-out) mọi dữ liệu sạch sẽ. |
| **CMP-010** | Tuyên bố Sử dụng AI Rõ ràng | Hệ thống PHẢI cho ứng viên biết rõ rằng một "AI Bots" đang tham gia chấm điểm họ trong bài thi. | Tránh vi phạm quy chuẩn về quyền người tiêu dùng trong thuật toán. | Giao diện phỏng vấn hiển thị "Evaluated by AI engine". |
| **CMP-011** | Thiết kế Khả năng Tiếp cận | Các khung test của ứng viên PHẢI tương thích tiêu chuẩn tối thiểu WCAG 2.1 cấp AA. | Hỗ trợ cho ứng viên có khuyết tật thao tác bàn phím (Keyboard Navigation) hoặc bằng tai nghe (Screen Reader). | Layout có phím tắt chuẩn và alt-text hoàn chỉnh. |
| **CMP-012** | Đánh giá Quyền riêng tư Bên thứ 3 | Các đối tác tham gia cung cấp API PHẢI hoàn tất một bản Audit quyền riêng tư hằng năm. | Loại trừ lỗi bảo mật chuỗi cung ứng (Supply Chain Risk). | API đối tác bị pause nếu thiếu chứng nhận (certs). |
| **CMP-013** | Kiểm soát Giới hạn Tuổi | Luồng Đăng ký (Onboarding) PHẢI ngăn ứng viên thiết lập account nếu ngày sinh < 16 tuổi. | Tuân theo bộ luật bảo vệ trẻ vị thành niên (COPPA/GDPR). | Nút Submit bị chặn lại kèm lỗi Date of Birth không hợp lệ. |
| **CMP-014** | Cảnh báo Vi phạm Dữ liệu | Nếu xác nhận Breach xảy ra, Hệ thống PHẢI lập tức thông cáo (Notified) trong vòng 72 giờ. | Mức độ cảnh báo tối thượng đối với bộ luật GDPR. | Hệ thống khẩn cấp phân phối tin nhắn đi khắp mọi users. |
| **CMP-015** | Quyền Khiếu nại AI tự động | Ứng viên rớt (Rejected) bởi bộ lọc AI PHẢI có quyền gửi 1 vé (Ticket) yêu cầu chuyên gia con người thẩm định lại bài thi. | Bảo vệ khỏi lỗi tự động hoặc rớt nhầm (False-negatives). | Có một nút Request Human Review ở bảng từ chối (Rejection Panel). |

---

## 16. Quy tắc Xác thực Đầu vào (Validation Rules)

Phần này chi tiết các kiểm tra dữ liệu kinh doanh rõ ràng xuyên suốt các điểm truy cập. Hệ thống phải xử lý các đầu vào một cách có chủ đích theo các ranh giới này.

### 16.1 Bảng Lược đồ Xác thực Toàn diện (VAL-001 đến VAL-080)

| ID | Trường Đích (Input Target) | Tuyên bố Ràng buộc Xác thực | Lỗi / Hành động Xử lý |
| :--- | :--- | :--- | :--- |
| **VAL-001** | User Email | Phải chứa duy nhất một ký hiệu `@` và phần mở rộng miền hợp lệ, không có khoảng trắng. | Từ chối đầu vào; nhắc định dạng email chuẩn. |
| **VAL-002** | User Email Length | Độ dài cấu trúc tuyệt đối không được vượt quá 255 ký tự. | Cắt bớt và chặn gửi bằng thông báo lỗi. |
| **VAL-003** | Phone Number | Chỉ chứa số, khoảng trắng và có thể dấu `+` ở đầu. | Xóa ký tự không hợp lệ; cảnh báo sai định dạng. |
| **VAL-004** | Phone Length | Độ dài tối thiểu 7 và tối đa 15 ký tự. | Từ chối nộp; làm nổi bật số lượng ký tự vượt quá. |
| **VAL-005** | CV Upload Format | Đuôi file bắt buộc là `.pdf`, `.doc`, hoặc `.docx`. | Chặn tải lên; hiển thị yêu cầu định dạng. |
| **VAL-006** | CV File Size | Lớn hơn 10 KB và nhỏ hơn 15 MB. | Hủy tải; hiển thị hộp cảnh báo giới hạn kích thước. |
| **VAL-007** | Custom Logo Dimensions | Chiều rộng/cao tối đa 2048 pixels. | Từ chối ảnh; yêu cầu thay đổi kích thước. |
| **VAL-008** | Custom Logo Size | Kích thước file tối đa 2 MB. | Từ chối tải luồng; hiển thị lỗi dung lượng file. |
| **VAL-009** | Campaign Expiry Date | Ít nhất 24 giờ kể từ thời điểm tạo hiện tại. | Chặn lựa chọn; buộc chọn các ngày tương lai. |
| **VAL-010** | Campaign Expiry Range | Không được vượt quá 180 ngày kể từ ngày tạo. | Giới hạn field; hiển thị thời hạn tối đa. |
| **VAL-011** | User Password | Phải khớp quy tắc bảo mật (>= 12 ký tự, hoa, thường, ký hiệu). | Vô hiệu hóa submit; chỉ ra các điều kiện còn thiếu. |
| **VAL-012** | Date of Birth | Tuổi ứng viên phải nằm trong khoảng từ 16 đến 100 tuổi. | Chặn đăng ký; hiển thị lỗi giới hạn độ tuổi. |
| **VAL-013** | Workspace Seat Count | Phải là số nguyên lớn hơn 0. | Bỏ qua đầu vào; reset về mốc ghế mặc định (baseline). |
| **VAL-014** | Workspace Seat Ceiling | Không vượt quá mức trần tối đa của gói cước đang trả. | Giới hạn số nhập; bật thông báo Upgrade. |
| **VAL-015** | Campaign Title | Độ dài ký tự từ 5 tới 100 ký tự. | Chặn Save; hiển thị gợi ý chiều dài text. |
| **VAL-016** | Job Description | Phải dài hơn 100 ký tự để cung cấp đủ ngữ cảnh. | Báo động độ ngắn; chặn Save. |
| **VAL-017** | Skill Tags Allocation | Phải chọn ít nhất 1 và không quá 20 Tag Kỹ năng. | Khóa thao tác thêm Tag; báo giới hạn. |
| **VAL-018** | Credit Purchase Count | Là số nguyên giới hạn từ 10 tới 10,000 credit. | Chỉ sửa số, xóa bỏ các ký tự (Text/Symbol). |
| **VAL-019** | Currency Price Value | Số tiền quy đổi không được là con số âm (Negative). | Trả về Default Tier; gắn lỗi báo Error Math. |
| **VAL-020** | Assessment Skill Weights | Tổng số điểm phần trăm các kỹ năng gán vào bắt buộc phải = 100%. | Không cho Lưu; cảnh báo sai số điểm thiếu/thừa. |
| **VAL-021** | Question Timer Value | Từ 30 đến 600 giây cho mỗi phần câu hỏi. | Tự reset mức an toàn 60 giây nếu bị cố nhập quá tải. |
| **VAL-022** | Custom Question Text | Chuỗi ký tự cho câu hỏi cá nhân phải từ 10 tới 1000 ký tự. | Chặn Add question; thông báo quy tắc. |
| **VAL-023** | Assessment Pause Limit | Chỉ được cấp từ 0 tới tối đa 5 quyền tạm dừng (Pause). | Tự giới hạn ở cấp 5 nếu chỉnh quá cao. |
| **VAL-024** | Disconnect Buffer Limit | Thời gian ân hạn mất kết nối chỉ từ 60 tới 600 giây (Max 10 phút). | Tự động trả về chuẩn an toàn (10p) nếu sai. |
| **VAL-025** | AI Score Calibration | Điểm phải nằm trong khung (0.00 – 100.00). | Gắn lỗi Bug nếu Model xuất số dị biệt. |
| **VAL-026** | AI Confidence Index | Chỉ số tin cậy là số thập phân (0.00 - 1.00). | Nếu dưới 0.60 sẽ cắm cờ gửi Manual Review. |
| **VAL-027** | Passing Threshold Field | Ngưỡng Pass phải được Setup từ 50.00% – 95.00%. | Khóa thao tác tùy biến số nếu vi phạm. |
| **VAL-028** | Certificate Expiry Date | Chỉnh xác 730 ngày (2 Năm) tính từ ngày sinh (Generate). | Auto điền không được đổi bằng thao tác User. |
| **VAL-029** | Verification Token String | Chuỗi ký tự định dạng GUID (36 số và chữ). | Báo lỗi không tra cứu được (Broken Link). |
| **VAL-030** | Country Selection | Chuỗi vùng phải chuẩn form ISO 3166-1 alpha-2. | Tự động dựa trên IP nếu trống. |
| **VAL-031** | Postal Code Field | Khớp với quy chuẩn bộ Zip/Postal riêng rẽ của 1 nước. | Highlight đỏ nếu lỗi cấu trúc. |
| **VAL-032** | Corporate Website URL | Đòi hỏi có đuôi Web chuẩn Prefix bảo mật (https://). | Reject setup thiếu https. |
| **VAL-033** | Unique Tax Identifier | Form mã số thuế doanh nghiệp (Độ dài tùy Quốc gia). | Tạm dừng kiểm tra, cắm cờ Invalid Tax. |
| **VAL-034** | Webhook Target URL | Địa chỉ nhận Webhook phải Secure (https). | Chặn lưu Webhook nếu gửi bằng Http. |
| **VAL-035** | Dynamic Search Query | Không được dài trên 150 ký tự tại Search Box. | Truncate cắt đứt tự động ở ký tự 150. |
| **VAL-036** | Notification Batch Size | Chạy batch từ 10 – 500 records. | Chia nhỏ Queue về dạng chuẩn 500/lượt tự động. |
| **VAL-037** | Campaign Target Capacity | Dung lượng lượng ứng viên là 1 số nguyên >0. | Chặn Setup Campaign. |
| **VAL-038** | Voucher Discount Rate | 1.00% tới 100.00%. | Không cho tạo Coupon nếu vi phạm. |
| **VAL-039** | Voucher Expiry Parameter | Thời gian chạy khuyến mãi tối đa 365 ngày (1 năm). | Không cho Save thay đổi quá mốc này. |
| **VAL-040** | Practice Session Limit | 1 tới 10 bài luyện thi tối đa. | Giới hạn theo Gói (Tier) người dùng đăng ký. |
| **VAL-041** | Profile Summary Field | Chuỗi tiểu sử < 2000 ký tự. | Disable ô nhập (Text box), đếm ngược Text. |
| **VAL-042** | Work Experience Duration | Thời gian đi làm 0 đến 600 Tháng (50 Năm). | Chặn các con số sai ảo; buộc nhập đúng tháng. |
| **VAL-043** | Academic Grade Value | Đổi điểm địa phương về một khung chung. | Auto Convert bằng Tables (GPA scale). |
| **VAL-044** | Base64 Content Filter | File Text không được nhúng Base64 Images. | Tự xóa Images ra khỏi luồng xử lý văn bản AI. |
| **VAL-045** | Audio Recording Duration | File ghi âm bắt buộc là 15 tới 300 giây. | Gắn lỗi Empty, skip xử lý nếu quá ngắn. |
| **VAL-046** | Audio Input Decibels | Cao hơn 10 decibels (Có tiếng). | Cảnh báo Mic lỗi, Ứng viên phải chỉnh lại hệ thống. |
| **VAL-047** | Video Feed Frame Rate | Bắt buộc chạy nhanh hơn 15fps. | Cảnh báo Lag lên thanh tiến trình kiểm tra (Proctor). |
| **VAL-048** | Facial Overlap Index | Mức độ trùng khớp nhân dạng (Face) > 75%. | Kéo còi Gian Lận (Cheating) nếu trượt xa số. |
| **VAL-049** | Plagiarism Match Rate | 0.00% - 100.00%. | Gửi Manual (chấm tay) nếu điểm copy > 40%. |
| **VAL-050** | Module Sequencing Index | Sort index (Thứ tự) phải là số nguyên > 1. | Auto xếp theo Setup Rules. |
| **VAL-051** | Quiz Question Pool | Section bài học buộc phải có >= 5 Quiz (Câu hỏi). | Không cho Publish mô-đun bài tập (Module). |
| **VAL-052** | Multiple Choice Options | Mỗi câu trắc nghiệm bắt buộc phải có từ 2 – 6 lựa chọn (Options). | Không cho lưu hệ thống câu hỏi nếu thiếu option. |
| **VAL-053** | Correct Answer Index | Câu hỏi trắc nghiệm phải có lựa chọn (Key) đáp án đúng. | Block lưu bài giảng thiếu thông số Keys. |
| **VAL-054** | Content Video Duration | Video Bài Học Lộ trình: 60 - 3600 giây (1 tới 60 Phút). | Chặn các đoạn phim siêu nặng; gợi ý chia nhỏ bài học. |
| **VAL-055** | Support Ticket Category | Đúng với các danh mục thiết kế sẵn (Sales/Bugs/General). | Tự nhảy sang nhóm (General) nếu không rõ. |
| **VAL-056** | Custom Domain Field | Viết đúng tên miền (.com) không kèm tiền tố (http). | Báo lỗi định dạng (Bad request). |
| **VAL-057** | IP Access Filter | Nhập IP ở form tiêu chuẩn IPv4 hoặc IPv6. | Chặn Setup Rules nếu địa chỉ Subnet sai. |
| **VAL-058** | Session Invalidation Code | Lý do vô hiệu hóa (Code Reason) lấy từ bộ chuẩn. | Nếu trống sẽ quy ra (General Reason). |
| **VAL-059** | Feedback Note Length | Tối thiểu >= 20 Ký tự text tay (Note). | Buộc viết lý do tại sao đổi điểm đánh giá AI của ứng viên. |
| **VAL-060** | Content Localization Code | Đúng với ISO tag Localize. | Quay trở về tiếng Anh nếu Locale code (Unknown). |
| **VAL-061** | API Payload Ceiling | Payload API không nặng quá 5 Megabyte. | Cắt đường API, ném trả mã Lỗi dung lượng. |
| **VAL-062** | Batch Upload Row Cap | File Bulk không quá 1000 hàng. | Dừng phân tích hàng sau 1000, bắt tách nhỏ file. |
| **VAL-063** | Custom Skill Node Name | Tên Kỹ năng tự do dài 2 đến 50 Ký tự. | Báo lỗi nếu bao gồm các mã nhúng (Symbols/Emojis). |
| **VAL-064** | Evaluation Margin Error | Sai lệch AI đánh giá < 30%. | Nếu 2 Bot cho 2 mức điểm chênh lớn, ném ra Human Review. |
| **VAL-065** | Refund Amount Field | Hoàn tiền (Refund) không lớn hơn Khoản Tiền Đã Thu gốc (Original). | Chặn tiến trình Refund (Tiền lớn hơn thu là ảo). |
| **VAL-066** | Retry Schedule Interval | Thời gian (Wait-Time) thử lại Bill: 12h - 72h. | Trả lại (12h mặc định) nếu tham số ghi sai form. |
| **VAL-067** | Cache Lifespan Parameter | 60 – 3600 Giây. | Mặc định 300 Giây nếu bỏ trống setup. |
| **VAL-068** | Maintenance Alert Lead | Mốc Leadtime (Thông Báo) >= 48H. | Chặn lịch bảo trì nếu mốc thông báo gấp gáp. |
| **VAL-069** | Report Date Scope | Date Query xuất báo cáo <= 365 Ngày (1 Năm). | Khóa Filter lại, bắt chỉnh lại lịch. |
| **VAL-070** | CSV Export Field Count | Số lượng Cột (Columns) CSV phải bằng số Cột quy chiếu Template Data. | Dừng xuất (Export Error) nếu 2 cột không bằng độ dài (Mis-align). |
| **VAL-071** | Audit Event Identifier | Type code chuẩn ở Actions log. | Mặc định Event General Activity nếu rỗng. |
| **VAL-072** | Data Masking Rule | Tag Masking nhận diện rõ chuẩn nhạy cảm. | Gắn lớp che Masking mặc định (Generic) lên Text lạ. |
| **VAL-073** | Retention Period Field | Limit ở cấu hình (Config) phải 30 - 2555 ngày. | Trả lại trong khung (30 - 2555) nếu gõ sai số. |
| **VAL-074** | Profile View Increment | Đếm Views theo thứ tự tăng +1 (Increment). | Bỏ qua thao tác đếm view tùy chỉnh giả (Hack Views). |
| **VAL-075** | Captcha Success Token | Key Token phải khớp hệ thống cấp Captcha. | Khóa Account đăng nhập nếu Token Captcha failed. |
| **VAL-076** | Password Expiry Schedule | Mật mã hết hạn: 30 - 180 Ngày. | Default là 90 Ngày nếu Admin cố tình ko cài giới hạn. |
| **VAL-077** | Device Hardware String | File logs đọc cấu hình phần cứng chỉ dùng Text sạch. | Xóa Clean-text các phần mềm độc hại có thể tiêm qua Logs. |
| **VAL-078** | System Event Priority | Priority Tags chuẩn (Low, Medium, High, Critical). | Tự nhảy sang Low Priority nếu khai báo Unknown. |
| **VAL-079** | Campaign Invite Expiry | Link thư mời 1-30 Ngày (Max). | Khóa cấu hình ngày nếu ngoài phạm vi chuẩn. |
| **VAL-080** | Cryptographic Hash Length | Độ dài băm Mật mã là chuẩn 64 Hexadecimals (SHA-256). | Từ chối sinh (Generate) bất kỳ tệp File không khớp Signature Length. |

---

## 17. Quy tắc Quyết định (Decision Rules)

Các quyết định điều hành doanh nghiệp tất định được quản lý bởi các điều kiện đa biến.

### 17.1 Ma trận Quyết định Vận hành Cấp Vĩ mô

| Decision ID | Quyết định Cốt lõi Đích | Các Điều kiện Đa biến được Đánh giá | Kết quả Hệ thống Tất định | Tác động Nghiệp vụ Doanh nghiệp |
| :--- | :--- | :--- | :--- | :--- |
| **DEC-001** | Đủ điều kiện tạo Lộ trình học AI? | Test Chẩn đoán Hoàn tất AND Điểm Kỹ năng < 75% AND Số lộ trình đang có = 0. | Trạng thái chuyển thành: **Eligible (Đủ ĐK)**; kích hoạt tạo Lộ trình. | Tập trung tài nguyên nền tảng cho người có khoảng trống kỹ năng rõ ràng. |
| **DEC-002** | Đủ điều kiện cấp Chứng chỉ? | Khóa học = 100% AND Bài Kiểm tra Cuối kỳ >= 80.00% AND Account = Verified. | Trạng thái chuyển thành: **Approved**; Sinh Chứng chỉ PDF. | Duy trì chuẩn mực đánh giá chất lượng cho hệ thống Credentials. |
| **DEC-003** | Cấp quyền Premium Access? | Trả Callback (Cổng thanh toán) = Success OR Balance >= Giá Gói OR Contract = Hợp lệ. | Trạng thái chuyển thành: **Access_Granted**; Khóa mở mọi chức năng Premium. | Bảo vệ doanh thu của doanh nghiệp. |
| **DEC-004** | Đã Vượt qua Phỏng vấn (Passed)? | Điểm Tổng (Composite) >= Ngưỡng Chiến dịch AND Giám thị (Proctor) = Clean AND Tỷ lệ Đạo văn < 40%. | Trạng thái chuyển thành: **Passed**; chuyển vào danh sách chờ nhà tuyển dụng. | Tiết kiệm thời gian sàng lọc của HR. |
| **DEC-005** | Chiến dịch Tuyển dụng Đóng? | Tuổi Campaign > 180 Ngày OR Lấp đủ vị trí = True OR Yêu cầu đóng bằng tay = True. | Trạng thái chuyển thành: **Archived**; Tắt link mời ứng viên. | Xóa rác và lãng phí cho CSDL dữ liệu. |
| **DEC-006** | Hóa đơn Sub được Chấp nhận? | Cổng = Cleared AND Mức rủi ro (Risk) < Ngưỡng AND Billing form = Chuẩn. | Trạng thái chuyển thành: **Settled**; Cấp quyền gia hạn cho Tier 30 ngày. | Giảm thiểu tỷ lệ Rủi ro tài chính & tự động hóa hóa đơn. |

---

## 18. Giải quyết Xung đột Quy tắc

Các hướng dẫn về cấu trúc để xử lý các ràng buộc chồng chéo, ưu tiên quy tắc và ngoại lệ vận hành.

### 18.1 Hệ thống phân cấp Bậc Ưu tiên
Khi các quy tắc dẫn đến các kết quả xung đột, hệ thống ưu tiên theo thứ tự sau:
1.  **Cấp 1: Các Quy tắc Pháp lý & Bảo mật Zero-Trust (CMP / SEC):** ưu tiên tuyệt đối; không thể bị sửa đổi bởi các cấu hình nền tảng khác.
2.  **Cấp 2: Quy tắc Tài chính Doanh nghiệp & Thanh toán (PAY):** ưu tiên hơn các cấu hình hoạt động tài khoản chung.
3.  **Cấp 3: Ràng buộc Cấu hình Workspace (ADM / EMP):** kiểm soát các thiết lập của từng khách thuê cá nhân.
4.  **Cấp 4: Quy tắc Ứng dụng & Ứng viên Chung (CND / PRF):** tương tác cơ bản.

### 18.2 Quá trình Giải quyết Xung đột
*   **Xử lý Tự động:** Nếu logic trùng khớp đồng thời, hệ thống xử lý chạy quy tắc cấp độ cao nhất. Lỗi của cấp độ thấp hơn bị loại bỏ và lưu vào Logs.
*   **Ghi đè Thủ công:** Ngoại lệ vận hành cho Cấp 1 & 2 bị cấm. Cấp 3 có thể cập nhật nếu Khách hàng (Enterprise Client) yêu cầu có chữ ký (Tenant Admin) và được duyệt bởi Product Manager.
*   **Đường dẫn Leo thang:** Nếu lỗi xung đột gây sập/lỗi tiến trình hệ thống, Giao dịch sẽ vào "Chế độ Chờ an toàn" (Safe Hold State). Hệ thống báo kỹ sư thiết kế để gỡ rối trong vòng 24H.

---

## 19. Quản trị Quy tắc (Rule Governance)

Quản lý vòng đời quy tắc, kiểm soát thay đổi và tài liệu liên đới.

### 19.1 Chu kỳ Chỉ số Đời sống Vận hành

```
  [ Draft / Dự thảo ] ──> [ Chuyên gia Đánh giá ] ──> [ Hội đồng Phê duyệt (CAB) ]
                                                            │
  [ Hủy bỏ / Lưu trữ ] <── [ Update Quy tắc ]    <── [ Đưa vào Sản xuất Core ]
```

### 19.2 Chính sách Kiểm soát Thay đổi (Change Management)
*   **Sở hữu Quy tắc:** "Business Rules Architect" nắm giữ cấu trúc tổng thể. Các phần được quản trị riêng biệt bởi domain product managers.
*   **Tiến trình Phê duyệt:** Thay đổi bắt buộc có sự tham gia giữa Senior Business Analyst, Enterprise Architect, & một thành viên ban Pháp lý (Compliance Officer).
*   **Tiêu chuẩn Version:** Tracking rules bằng Versioning tiêu chuẩn (`vMajor.Minor`). Thay thế văn phong nhỏ thì đổi Minor; Thay đổi logic tính điểm thì thay đổi Major.
*   **Lịch Trình Kiểm Tra:** Tất cả các quy tắc nghiệp vụ hoạt động đều trải qua một đánh giá toàn diện mỗi năm (hàng năm) để đảm bảo tuân thủ cập nhật thị trường/luật riêng tư mới.
*   **Định dạng Document:** Master business rule này (`08_Quy_tac_Nghiep_vu.md`) phải được cập nhật lại trong vòng 24H khi có giấy phê duyệt.

---

## 20. Ma trận Truy xuất Nguồn gốc Quy tắc

Đường dẫn cấu trúc đi từ Các Yêu cầu cơ sở tới Parameter hệ thống.

| Req ID | Tên Yêu cầu Nghiệp vụ | Quy trình Nghiệp vụ Cốt lõi | Các Quy tắc Chính (Rules) | Đối tượng Chức năng Đích | Vai trò Người dùng | Kịch bản Kiểm thử |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BR-01** | Sàng lọc Tài năng An toàn | Nhập môn (Onboarding) | BRL-002, AUT-008, CMP-002 | Chuỗi Xác minh ID Sinh trắc | Candidate, Recruiter | TC-AUT-094 |
| **BR-02** | Phân tích CV Tự động | Tiếp nhận ứng viên | BRL-018, CND-003, VAL-006 | Document Parsing Queue | Candidate User | TC-CVM-112 |
| **BR-03** | Đánh giá qua Thuật toán | Vòng đời Sàng lọc | BRL-006, AIA-005, DEC-004 | Assessment Compute Engine | AI Evaluator Module | TC-AIA-304 |
| **BR-04** | Cấp Chứng chỉ Kỹ năng | Chợ Tài năng | BRL-030, CRT-003, DEC-002 | Certificate Generator | Candidate, Third-Party | TC-CRT-215 |
| **BR-05** | Bảo vệ Doanh thu | Thanh toán Gói đăng ký | BRL-028, PAY-006, VAL-019 | Recurring Payment Engine | Corporate Billing Contact| TC-PAY-042 |

---

## 21. Chỉ số KPI Quy tắc Nghiệp vụ

Hiệu suất và số liệu chứng minh hệ thống đang áp dụng thành công.

### 21.1 Danh mục Mục tiêu KPI Tổng hợp

| Metric ID | Tên Mục tiêu Hiệu suất (Metric Target) | Biên giới Đạt được (Success) | Chu kỳ Đo lường | Công thức Nền tảng |
| :--- | :--- | :--- | :--- | :--- |
| **KPI-001** | Độ chính xác Xác thực Đầu vào | >= 99.98% Entries sạch sẽ | 30 Ngày (Rolling) | (Entries Hợp lệ / Tổng số Entries) * 100 |
| **KPI-002** | Nộp bài Thi Đầy đủ (Submissions) | >= 94.50% tỷ lệ | Quý | (Test hoàn thành / Test đã Bắt đầu) * 100 |
| **KPI-003** | Tốc độ Xây Lộ trình Học | >= 98.00% Xây trong <5 Phút | Tháng | (Xây xong trong thời gian / Tổng xây) * 100 |
| **KPI-004** | Độ chuẩn Xác tạo Certs | 100.00% Không có lỗi sinh file | Năm | (Cert đúng cấu trúc / Tổng Cert cấp) * 100 |
| **KPI-005** | Thanh toán Thành công (Lần 1) | >= 96.50% | Tháng | (Thu tiền thành công / Tổng thanh toán) * 100 |
| **KPI-006** | Vi phạm Tiêu chuẩn (Gian lận) | <= 0.15% Số Session | 30 Ngày (Rolling) | (Phiên cắm cờ đỏ / Tổng số lượng thi) * 100 |
| **KPI-007** | Phát hiện Lỗi (Gian lận) Chuẩn | >= 99.10% Trực diện | Quý | (Gian lận thật sự / Tổng cắm cờ True fraud) * 100 |
| **KPI-008** | Chấm xong AI Toàn vẹn | >= 99.90% Finished Quota | Tháng | (Đánh giá hoàn tất / Tổng lượt Thi) * 100 |
| **KPI-009** | Tuân thủ Luật Pháp Lý | 100.00% | Năm | Kết quả từ các cơ quan Audits ngoài. |
| **KPI-010** | Cách ly Tenant Data | 0 Leaks chéo (Zero leaks) | Vĩnh viễn | Báo cáo theo dõi bảo mật. |
| **KPI-011** | CV Parsing Success Rate | >= 97.50% Extract văn bản sạch | Tháng | (Parse Thành công / Tổng File tải lên) * 100 |
| **KPI-012** | Average Processing Time | <= 30 Giây 1 hồ sơ CV | 30 Ngày (Rolling) | Tổng Giờ Parsing / Tổng số CV xử lý. |
| **KPI-013** | Authentication Token Lifespans | 100.00% 15 Phút Hết hạn | Hàng tuần | (Token Hết hạn chuẩn / Tổng Sessions) * 100 |
| **KPI-014** | Multi-Factor Adoption Rate | 100.00% Admin bị buộc MFA | Tháng | (Admins thiết lập / Tổng lượng Admin) * 100 |
| **KPI-015** | Profile Onboarding Completeness| >= 82.00% Vượt qua 70% Rate | Quý | (Profile >70% / Tổng lượng Profiles) * 100 |
| **KPI-016** | Tỷ lệ Reconnection | >= 95.00% Vào lại OK | Tháng | (Kết nối lại Thành công / Tổng Disconnects) * 100 |
| **KPI-017** | Custom Test Balance Integrity | 100.00% Không có Lỗi Balance (Âm) | Vĩnh viễn | Các giao dịch cắm cờ (Trừ tiền bị sai). |
| **KPI-018** | Tốc độ Xóa User (Privacy Wipe) | 100.00% Wipe out trong 30 days | Quý | (Account bị Delete < 30 ngày / Tổng Request) * 100 |
| **KPI-019** | Critical Notification Dispatch | >= 99.50% Tin Gửi ra trong 3s | 30 Ngày (Rolling) | (Tin gửi dưới 3s / Tổng Tin Urgent) * 100 |
| **KPI-020** | Độ Ổn định của Model AI | >= 98.90% Điểm Tương đồng | Quý | Bài kiểm tra thuật toán so sánh với kết quả trước đó. |
| **KPI-021** | Active Campaign Lifecycle Limits | 100.00% Tự động Lưu trong 180 ngày | Hàng tuần | (Số Archived Camps / Số Hết hạn) * 100 |
| **KPI-022** | Verification Link Expirations | 100.00% Cắt Link sau 14 Ngày | Tháng | Audited Link Access sau ngày thứ 14. |
| **KPI-023** | API Key Rotation Compliance | 100.00% Rotation < 365 Ngày | Năm | (API Rotate kịp thời / Số API đang sống) * 100 |
| **KPI-024** | Automated Refund Timelines | >= 95.00% Hoàn tiền trong 3 Ngày | Quý | (Hoàn lại Tiền < 3 Ngày / Tổng Tickets) * 100 |
| **KPI-025** | System Infrastructure Heartbeats | >= 99.99% Nhịp đập ổn định | Tháng | (Captured Pings / Expected Ping) * 100 |
| **KPI-026** | API Rate Limiting Blocks | 100.00% Khóa chặn thành công | Hàng tuần | Yêu cầu bị Dropped / Số lần vượt Overuses. |
| **KPI-027** | Custom Weights Validation Match| 100.00% Lỗi bằng (Bằng = 100%) | Vĩnh viễn | Tổng số Campaign lưu không bằng 100% (Phải = 0). |
| **KPI-028** | Public Verifications Integrity | 100.00% Link Không có Tính tuần tự | Tháng | Report số lần Scraping Links ngẫu nhiên. |
| **KPI-029** | Inactive User Account Suspensions| >= 99.00% Auto-suspend Cũ | Năm | (Khóa cũ / Tổng Cũ) * 100 |
| **KPI-030** | Database Encryption Accuracy | 100.00% Mọi thứ đã mã hóa At-Rest | Hàng tuần | Report Data Tables. |

---

## 22. Rủi ro liên quan đến Quy tắc Nghiệp vụ

Rủi ro, lỗ hổng hoạt động của hệ thống và giải pháp phòng tránh.

### 22.1 Kiến trúc Giảm thiểu Rủi ro

| Risk ID | Source Rule / Area | Rủi ro Tiềm tàng (Potential Business Risk) | Mức độ Ảnh hưởng (Impact) | Khả năng Xảy ra (Likelihood) | Chiến lược Khắc phục Hệ thống (Mitigation) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-001** | BRL-020 / Đánh giá AI | Lệch chuẩn thuật toán làm thay đổi hoặc thiên vị điểm ứng viên. | Cao | Trung bình | Chạy thuật toán Calibration hằng tuần với dataset chuẩn. |
| **RSK-002** | VAL-005 / Parsing CV | Payload file dị biệt qua mặt được Check Filter (PDF). | Đặc biệt nghiêm trọng | Thấp | Xây dựng trình đọc (Parsing) ở mô-đun biệt lập (Sandbox worker). |
| **RSK-003** | PAY-006 / Thanh Toán | Cổng tính phí chậm dẫn tới Loop (Trả nhiều lần) | Cao | Trung bình | Khóa giao dịch chặt chẽ bằng Mã token Payment Gateway (Idempotency Key). |
| **RSK-004** | CRT-003 / Chứng chỉ | Server xác minh bị sập làm người ngoài đánh giá chứng chỉ là giả. | Cao | Thấp | Cache thông tin vào bộ đệm Multi-region Networks độc lập. |
| **RSK-005** | AUT-007 / Quản trị Session| Khai thác phiên đăng nhập lỏng nạp câu trả lời giả. | Cao | Trung bình | Kiểm tra Trạng thái kết nối theo thời gian thực (Real-time tracking). |
| **RSK-006** | CMP-008 / Bản địa Vùng | Region Cloud sập dẫn tới Data chạy sang quốc gia khác để Sync (Phạm luật). | Đặc biệt nghiêm trọng | Thấp | Cài đặt Data Locks để ngăn cản việc truyền ra biên giới (Cross-border sync locks). |
| **RSK-007** | ADM-009 / Xóa nhầm | Các User thao tác tay xóa lộn 1 Công ty khỏi hệ thống (Accidental Wipe). | Cao | Thấp | Áp dụng Soft-delete delay (Lệnh Chờ 14-30 ngày) mới cho Clear khỏi DB. |

---

## 23. Quy tắc Nghiệp vụ Tương lai (Future Business Rules)

Các hướng đi, hệ thống dự tính sẽ được cập nhật sắp tới vào khung quản trị quy tắc.

*   **BRL-F01 (Liên kết Doanh nghiệp - Enterprise Federation):** Workspace Đa công ty PHẢI cho phép thiết lập và dùng chung một cơ sở Users nhưng dữ liệu phải được băm đa phân (Multi-tenant).
*   **BRL-F02 (Mở rộng Tuân thủ Toàn cầu):** Cấu hình tính điểm PHẢI tự động linh hoạt điều chỉnh theo luật lao động của vùng sở tại của ứng viên (Residence Area).
*   **BRL-F03 (Gói Đăng ký Người hướng dẫn AI):** Lộ trình học tập của ứng viên NÊN bổ sung quyền Coach AI (Trợ lý tự động thời gian thực) với mô hình thanh toán thu theo tín dụng (Credit) tách biệt.
*   **BRL-F04 (Giao dịch Mạng lưới Nhân tài):** Các chứng chỉ tài năng (Verified Portfolios) CÓ THỂ được mở hiển thị (Visible) ra chợ cho đối tác thứ 3 thuê, sau quá trình Opt-in (Đồng thuận kép - Double opt-in).
*   **BRL-F05 (Đường dẫn Kỹ năng Gamification):** Lộ trình học NÊN được trang bị Level/Điểm, theo chuẩn mực Certification rules để sinh ra Badge/Achievement cho ứng viên.

---

## 24. Tóm tắt (Summary)

### 24.1 Khung Quản lý Quy tắc Tổ chức
Hệ thống Đánh giá Kỹ năng và Phỏng vấn bằng AI (ISAS) hoạt động bên trong một khung quy tắc chính sách nghiệp vụ, ranh giới tuân thủ và mô hình xử lý dữ liệu tất định rõ ràng. Tài liệu này đóng vai trò như một nguồn sự thật duy nhất (Single Source of Truth) cho các quy tắc hoạt động của nền tảng, giữ cho các ưu tiên kinh doanh hoàn toàn độc lập với việc thực thi mã.

### 24.2 Biện pháp Bảo vệ Hệ thống Chính
*   **Bảo mật Tenant:** Mô hình cô lập nghiêm ngặt (Strict Isolation) đảm bảo việc chia tách dữ liệu cho doanh nghiệp không bị xâm phạm.
*   **Tính Toàn vẹn Đầu vào:** Xác minh toàn diện dữ liệu đầu vào chặn các payload (mã) độc hại tại mọi cửa khẩu API.
*   **Tính Nhất quán Thuật toán:** Mô hình chuẩn hóa (Calibration Models) đưa ra cái nhìn chấm điểm công bằng nhất (Unbiased Results).
*   **Bảo vệ Pháp lý:** Kiểm tra quyền tuân thủ trực tiếp (Built-in) đảm bảo quá trình thuê nhân sự không vi phạm định kiến vùng miền và quốc tế.

### 24.3 Kiến trúc Phát triển Liên tục
Bằng cách tuân theo các hướng dẫn phân tích kinh doanh tiêu chuẩn, tài liệu này cung cấp một cấu trúc sạch sẽ cho việc mở rộng quy mô nền tảng. Chỉ mục hệ thống đảm bảo khả năng theo dõi rõ ràng, cho phép tích hợp linh hoạt các tính năng tương lai mà vẫn giữ vững độ ổn định khi triển khai vào nền tảng cốt lõi của doanh nghiệp.