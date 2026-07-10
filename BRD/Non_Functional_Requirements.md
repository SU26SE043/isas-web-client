# 07_Yêu_Cầu_Phi_Chức_Năng (07_Non_Functional_Requirements)

## 1. Mục đích Tài liệu
### 1.1 Mục đích
Mục đích của Tài liệu Đặc tả Yêu cầu Phi chức năng (NFRS) này là xác định các thuộc tính chất lượng, mục tiêu hiệu suất, ràng buộc bảo mật và tiêu chí vận hành cho Hệ thống Phỏng vấn & Đánh giá Kỹ năng tích hợp AI (ISAS). Nó thiết lập các tiêu chuẩn kỹ thuật cần thiết để đảm bảo hệ thống an toàn, có khả năng mở rộng, đáng tin cậy và tuân thủ các tiêu chuẩn doanh nghiệp.

### 1.2 Phạm vi
Tài liệu này bao trùm tất cả các yêu cầu phi chức năng (NFR) cho nền tảng ISAS, bao gồm ứng dụng web, giao diện di động, các endpoint API, công cụ xử lý AI, tầng cơ sở dữ liệu và hạ tầng đám mây.

### 1.3 Đối tượng Độc giả
Tài liệu này dành cho các Kiến trúc sư Giải pháp, Kỹ sư Đám mây, đội ngũ DevSecOps, Kỹ sư Kiểm thử Tự động hóa (QA), Kiểm toán viên Bảo mật và các Bên liên quan về Kỹ thuật.

### 1.4 Mối quan hệ với BRD
NFRS này hỗ trợ Tài liệu Yêu cầu Nghiệp vụ (BRD) bằng cách thiết lập các rào chắn kỹ thuật và khả năng vận hành cần thiết để hiện thực hóa giá trị nghiệp vụ.

### 1.5 Mối quan hệ với Yêu cầu Chức năng
Trong khi Yêu cầu Chức năng định nghĩa hệ thống *làm gì*, tài liệu này định nghĩa hệ thống thực hiện các chức năng đó *tốt như thế nào* trong nhiều điều kiện khác nhau.

### 1.6 Tầm quan trọng của các Thuộc tính Chất lượng
Việc tuân thủ nghiêm ngặt các NFR này đảm bảo tính ổn định cấp doanh nghiệp, giảm thiểu rủi ro bảo mật, đảm bảo tuân thủ quy định và cung cấp trải nghiệm người dùng liền mạch, vốn là những yếu tố cốt lõi cho sự chấp nhận và thành công của nền tảng ISAS.

## 2. Tổng quan về Thuộc tính Chất lượng
NFRS này được mô hình hóa dựa trên **Mô hình Chất lượng Phần mềm ISO/IEC 25010**, bao gồm các khía cạnh sau:
*   **Hiệu suất (Performance Efficiency):** Thời gian phản hồi, lưu lượng (throughput) và mức độ sử dụng tài nguyên.
*   **Độ tin cậy (Reliability):** Khả năng chịu lỗi, khả năng phục hồi và thời gian hoạt động của hệ thống.
*   **Tính sẵn sàng (Availability):** Mức độ sẵn sàng vận hành và khung giờ bảo trì.
*   **Bảo mật (Security):** Tính bảo mật, tính toàn vẹn, chống chối bỏ và khả năng quy trách nhiệm.
*   **Khả năng bảo trì (Maintainability):** Tính mô-đun, khả năng tái sử dụng, khả năng kiểm thử và khả năng sửa đổi.
*   **Khả năng mở rộng (Scalability):** Khả năng xử lý khối lượng công việc ngày càng tăng thông qua mở rộng theo chiều ngang/chiều dọc.
*   **Tính dễ sử dụng (Usability):** Khả năng học hỏi, tính vận hành và bảo vệ người dùng khỏi lỗi.
*   **Khả năng tiếp cận (Accessibility):** Tuân thủ WCAG 2.2 AA để hỗ trợ mọi người dùng.
*   **Tính tương thích (Compatibility):** Cùng tồn tại và khả năng tương tác với các hệ thống khác.
*   **Tính di động (Portability):** Khả năng thích ứng và cài đặt trên các môi trường khác nhau.
*   **Khả năng tương tác (Interoperability):** Khả năng trao đổi dữ liệu qua các API chuẩn hóa.
*   **Khả năng kiểm toán & Quan sát (Auditability & Observability):** Tính minh bạch của hệ thống thông qua log, số liệu (metrics) và truy vết (tracing).

## 3. Các Hạng mục Yêu cầu Phi chức năng
Các yêu cầu trong tài liệu này được phân loại vào các lĩnh vực sau:
1. Hiệu suất (Performance)
2. Tính sẵn sàng (Availability)
3. Độ tin cậy (Reliability)
4. Bảo mật (Security)
5. Quyền riêng tư (Privacy)
6. Tuân thủ (Compliance)
7. Khả năng tiếp cận (Accessibility)
8. Tính dễ sử dụng (Usability)
9. Bản địa hóa (Localization)
10. Khả năng mở rộng (Scalability)
11. Khả năng bảo trì (Maintainability)
12. Khả năng hỗ trợ (Supportability)
13. Khả năng quan sát (Observability)
14. Giám sát (Monitoring)
15. Ghi log (Logging)
16. Sao lưu & Phục hồi (Backup & Recovery)
17. Triển khai (Deployment)
18. Hạ tầng (Infrastructure)
19. Khôi phục sau Thảm họa (Disaster Recovery)
20. Tính liên tục của Doanh nghiệp (Business Continuity)
21. Tính tương thích (Compatibility)
22. Khả năng tương tác (Interoperability)
23. Lưu giữ Dữ liệu (Data Retention)
24. Yêu cầu Vận hành (Operational Requirements)

## 4. Yêu cầu Phi chức năng Chi tiết
Các phần tiếp theo (5-19) chứa các NFR chi tiết, có thể đo lường được. Mỗi yêu cầu bao gồm ID duy nhất, tên, mô tả, lý do nghiệp vụ, tiêu chí chấp nhận, phương pháp đo lường, mức độ ưu tiên, module liên quan và yêu cầu nghiệp vụ (BR) liên quan.

## 5. Yêu cầu về Hiệu suất (Performance Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| PERF-001 | Tải Trang Web | Các trang tĩnh phải tải nhanh. | Giữ chân người dùng. | Thời gian tải < 1.5s cho phân vị 90 (90th percentile). | Giám sát tổng hợp. | Cao | Web UI | BR-01 |
| PERF-002 | Tải Dashboard | Bảng điều khiển của Ứng viên/Nhà tuyển dụng phải hiển thị nhanh. | Tính dễ sử dụng. | Bảng điều khiển hiển thị trong < 2.0s. | Công cụ APM. | Cao | Dashboard | BR-02 |
| PERF-003 | Độ trễ API | Thời gian phản hồi của các API REST/GraphQL cốt lõi. | Khả năng phản hồi của hệ thống. | p95 thời gian phản hồi < 200ms. | Số liệu API Gateway. | Nghiêm trọng | API | BR-03 |
| PERF-004 | Độ trễ Xử lý AI | Khả năng AI đánh giá câu trả lời phỏng vấn. | Cảm giác phản hồi theo thời gian thực. | Phân tích văn bản < 3s; Video < 30s. | Truy vết log. | Cao | AI Engine | BR-04 |
| PERF-005 | Truy vấn CSDL | Các truy vấn giao dịch cốt lõi. | Ngăn ngừa nghẽn cổ chai. | Truy vấn đọc < 50ms p95. | DB Performance Insights. | Cao | CSDL | BR-05 |
| PERF-006 | Phản hồi Tìm kiếm | Tìm kiếm và lọc kỹ năng. | Hiệu quả UX. | Trả về kết quả tìm kiếm trong < 500ms. | Số liệu Elasticsearch. | TB | Tìm kiếm | BR-06 |
| PERF-007 | Hiệu suất Tải lên | Tải lên CV và video. | Trải nghiệm ứng viên. | Tải lên tệp 10MB trong < 3s trên đường truyền 50Mbps. | Telemetry phía client. | TB | Lưu trữ | BR-07 |
| PERF-008 | Người dùng Đồng thời | Hỗ trợ người dùng hoạt động đồng thời. | Mở rộng cho khách hàng doanh nghiệp. | Hỗ trợ 10,000 người dùng hoạt động đồng thời. | Kiểm thử tải. | Nghiêm trọng | Hạ tầng | BR-08 |
| PERF-009 | Phỏng vấn Đồng thời Tối đa | Hỗ trợ phỏng vấn video đồng thời. | Chức năng nghiệp vụ cốt lõi. | Hỗ trợ 2,000 phiên WebRTC hoạt động đồng thời. | Kiểm thử tải. | Nghiêm trọng | Phỏng vấn | BR-09 |
| PERF-010 | Lưu lượng API | Xử lý khối lượng yêu cầu API cao. | Ngăn ngừa DDoS/điều tiết (throttling). | Hỗ trợ 5,000 TPS toàn cầu. | API Gateway. | Cao | API | BR-10 |
| PERF-011 | Xử lý Tác vụ Nền | Các tác vụ bất đồng bộ như email, tạo báo cáo. | Thông báo kịp thời. | Các tác vụ được xử lý trong < 60s từ hàng đợi. | Giám sát Hàng đợi. | TB | Workers | BR-11 |
| PERF-012 | Chuyển mã Video (Transcoding) | Xử lý video sau phỏng vấn. | Cung cấp khả năng phát lại. | Chuyển mã video 10 phút trong < 2 phút. | Log pipeline. | TB | Media | BR-12 |
| PERF-013 | Tạo Báo cáo | Xuất kết quả đánh giá ra PDF/Excel. | Quy trình làm việc của NTD. | Xuất file sẵn sàng trong < 5s. | APM. | TB | Báo cáo | BR-13 |
| PERF-014 | Độ trễ Mạng tại Edge | Phân phối nội dung qua CDN. | Hiệu suất toàn cầu. | Tài nguyên tĩnh được phân phối < 50ms toàn cầu. | Số liệu CDN. | Cao | CDN | BR-14 |
| PERF-015 | Sử dụng Bộ nhớ | Giới hạn bộ nhớ của máy chủ ứng dụng. | Chi phí/Tính ổn định. | Các container sử dụng < 80% RAM vào thời gian cao điểm. | CloudWatch/Datadog. | Cao | Hạ tầng | BR-15 |

## 6. Yêu cầu về Tính sẵn sàng (Availability Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| AVAIL-001 | Uptime Nền tảng | Tính sẵn sàng của hệ thống cốt lõi. | Tuân thủ SLA. | Thời gian hoạt động 99.99% không tính bảo trì theo lịch. | Pingdom/Datadog. | Nghiêm trọng | Tất cả | BR-16 |
| AVAIL-002 | Khung giờ Bảo trì | Giới hạn thời gian downtime dự kiến. | Giảm thiểu gián đoạn. | Ưu tiên triển khai không gây downtime; tối đa 2 giờ vào cuối tuần. | Log thay đổi. | Cao | Hạ tầng | BR-17 |
| AVAIL-003 | Thời gian Chuyển đổi dự phòng (Failover) | Chuyển đổi DB Active-passive. | Tính liên tục. | Chuyển đổi CSDL hoàn tất trong < 30 giây. | Chaos testing. | Nghiêm trọng | CSDL | BR-18 |
| AVAIL-004 | RTO (Recovery Time Objective) | Thời gian phục hồi sau thảm họa. | Tính liên tục kinh doanh. | RTO <= 4 giờ. | Diễn tập DR. | Nghiêm trọng | Nền tảng | BR-19 |
| AVAIL-005 | RPO (Recovery Point Objective) | Dữ liệu mất mát tối đa cho phép. | Tính toàn vẹn dữ liệu. | RPO <= 15 phút. | Log sao lưu. | Nghiêm trọng | CSDL | BR-20 |
| AVAIL-006 | Suy giảm Dịch vụ | Hoạt động khi một thành phần bị lỗi. | Trải nghiệm người dùng. | Các module không thiết yếu hỏng một cách âm thầm mà không ảnh hưởng module cốt lõi. | Bơm lỗi (Fault injection). | Cao | Kiến trúc | BR-21 |
| AVAIL-007 | Sẵn sàng Cao (HA) | Dự phòng qua các Availability Zones (AZ). | Ngăn chặn điểm lỗi đơn lẻ (SPOF). | Được triển khai tối thiểu trên 3 AZ. | Đánh giá hạ tầng. | Nghiêm trọng | Hạ tầng | BR-22 |
| AVAIL-008 | Sẵn sàng CDN | Tính sẵn sàng của tài nguyên tĩnh. | Phạm vi tiếp cận toàn cầu. | CDN đảm bảo thời gian hoạt động 99.999%. | SLA nhà cung cấp. | Cao | CDN | BR-23 |
| AVAIL-009 | Giới hạn Tỷ lệ API an toàn | Hành vi khi đạt giới hạn. | Bảo vệ hệ thống. | Trả về HTTP 429 mà không ngắt kết nối. | Kiểm thử API. | Cao | API | BR-24 |
| AVAIL-010 | Chế độ Ngoại tuyến (Mobile) | Hoạt động của app khi không có mạng. | Sự linh hoạt cho ứng viên. | Ứng dụng cache dữ liệu và đồng bộ khi online. | Kiểm thử thủ công. | TB | Mobile App | BR-25 |

## 7. Yêu cầu về Khả năng mở rộng (Scalability Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| SCAL-001 | Mở rộng theo Chiều ngang | Mở rộng node Web/API. | Xử lý tải động. | Các nhóm auto-scale thêm node trong < 60s dựa trên CPU. | Số liệu Cloud. | Nghiêm trọng | Hạ tầng | BR-26 |
| SCAL-002 | Mở rộng DB theo Chiều dọc | Giới hạn mở rộng CSDL. | Tăng trưởng tương lai. | CSDL hỗ trợ mở rộng dọc lên 128 vCPU mà không cần di chuyển. | Đánh giá kiến trúc. | Cao | CSDL | BR-27 |
| SCAL-003 | Tăng trưởng Lưu trữ | Lưu trữ đối tượng cho video/CV. | Lưu giữ dữ liệu. | Hỗ trợ quy mô PetaByte một cách liền mạch. | Số liệu S3/Blob. | Nghiêm trọng | Lưu trữ | BR-28 |
| SCAL-004 | Đột biến Lưu lượng | Xử lý đánh giá hàng loạt/đột biến. | Các sự kiện Marketing. | Xử lý lượng truy cập tăng 500% trong 5 phút mà không bị suy giảm. | Kiểm thử chịu tải. | Cao | Nền tảng | BR-29 |
| SCAL-005 | Khách hàng Doanh nghiệp Đồng thời | Mở rộng quy mô khách thuê (B2B tenants). | Tăng trưởng doanh nghiệp. | Hỗ trợ 10,000 tổ chức thuê bao khác nhau. | Kiểm thử tải. | Cao | Cốt lõi | BR-30 |
| SCAL-006 | Ứng viên Đồng thời | Mở rộng quy mô phiên của ứng viên. | Quy mô đánh giá. | Hỗ trợ 100,000 phiên kiểm tra hoạt động. | Kiểm thử tải. | Cao | Đánh giá | BR-31 |
| SCAL-007 | Auto-scaling Node AI | Mở rộng GPU/Compute cho AI. | Hiệu năng / Chi phí. | Mở rộng các instance GPU trong vòng 3 phút khi hàng đợi ùn ứ. | Số liệu hàng đợi. | Cao | AI Engine | BR-32 |
| SCAL-008 | Mở rộng Toàn cầu | Triển khai đa khu vực (multi-region). | Giảm độ trễ. | Kiến trúc hỗ trợ triển khai active-active liền mạch đa khu vực. | Đánh giá kiến trúc. | TB | Hạ tầng | BR-33 |
| SCAL-009 | Phân vùng Dữ liệu | Sharding/Partitioning CSDL. | Hiệu suất truy vấn. | Mô hình dữ liệu hỗ trợ sharding dựa trên tenant (khách thuê). | Đánh giá schema. | Cao | CSDL | BR-34 |
| SCAL-010 | Mở rộng Microservices | Khả năng mở rộng thành phần độc lập. | Hiệu quả tài nguyên. | Các module (Email, AI, Video) mở rộng độc lập. | Log K8s HPA. | Cao | Kiến trúc | BR-35 |

## 8. Yêu cầu về Độ tin cậy (Reliability Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| REL-001 | Tỷ lệ Lỗi | Số lỗi HTTP 5xx tối đa chấp nhận được. | Ổn định hệ thống. | Tổng tỷ lệ lỗi < 0.1% tổng số request. | APM Metrics. | Nghiêm trọng | API | BR-36 |
| REL-002 | Chiến lược Thử lại | Xử lý lỗi mạng thoáng qua. | Độ phục hồi. | Áp dụng "exponential backoff" cho tất cả các cuộc gọi API bên ngoài. | Đánh giá code. | Cao | Tích hợp | BR-37 |
| REL-003 | Suy giảm An toàn AI | Xử lý lỗi hệ thống con AI. | Luồng phỏng vấn cốt lõi. | Nếu AI lỗi, hệ thống tự động chuyển sang hàng đợi chấm điểm thủ công mà không làm gián đoạn buổi phỏng vấn. | Chaos testing. | Nghiêm trọng | AI Engine | BR-38 |
| REL-004 | Khả năng Chịu lỗi | Cách ly lỗi Microservice. | Ngăn chặn lỗi lan truyền. | "Circuit breakers" được triển khai trên tất cả các lệnh gọi giữa các service. | Đánh giá kiến trúc. | Cao | Microservices | BR-39 |
| REL-005 | Tự phục hồi Node | Tự thay thế các node chết. | Uptime. | Container/VM hỏng được tự động thay thế trong < 2 phút. | Số liệu K8s/ASG. | Nghiêm trọng | Hạ tầng | BR-40 |
| REL-006 | Tính Nhất quán Giao dịch | Tuân thủ ACID cho dữ liệu cốt lõi. | Tính toàn vẹn dữ liệu. | Điểm đánh giá và trạng thái sử dụng các giao dịch ACID nghiêm ngặt. | Đánh giá code. | Nghiêm trọng | CSDL | BR-41 |
| REL-007 | Giới hạn Nhất quán Sau cùng (Eventual Consistency) | Độ trễ tối đa cho dữ liệu async. | Cảm nhận của người dùng. | Độ trễ bản sao đọc (Read replicas) < 2 giây. | Giám sát DB. | Cao | CSDL | BR-42 |
| REL-008 | Kiểm tra Toàn vẹn Dữ liệu | Ngăn chặn hỏng dữ liệu ngầm. | Độ tin cậy. | Tự động xác thực checksum đối với việc tải lên/xuống tệp. | Kiểm thử tự động. | TB | Lưu trữ | BR-43 |
| REL-009 | Lưu trữ Hàng đợi Tin nhắn | Tránh mất tin nhắn. | Độ tin cậy. | Hàng đợi tin nhắn được sao lưu bằng bộ nhớ liên tục; không mất dữ liệu khi khởi động lại broker. | Đánh giá cấu hình queue. | Cao | Messaging | BR-44 |
| REL-010 | Tính Idempotency | An toàn của yêu cầu API. | Tránh thực hiện hành động trùng lặp. | Các endpoint POST/PUT cho thanh toán/đánh giá phải có tính Idempotent (gọi nhiều lần kết quả vẫn như gọi 1 lần). | Kiểm thử API. | Nghiêm trọng | API | BR-45 |
| REL-011 | Dead Letter Queues (DLQ) | Xử lý tin nhắn không thể xử lý. | Debugging. | Tin nhắn lỗi được chuyển vào DLQ sau 3 lần thử lại. | Cấu hình queue. | Cao | Messaging | BR-46 |
| REL-012 | Quản lý Trạng thái | Tầng ứng dụng không trạng thái (Stateless). | Khả năng mở rộng/Độ tin cậy. | Web/API nodes lưu trữ 0 trạng thái cục bộ của phiên. | Đánh giá code. | Cao | Kiến trúc | BR-47 |
| REL-013 | Connection Pooling CSDL | Quản lý kết nối DB hiệu quả. | Ngăn chặn cạn kiệt kết nối. | Connection pooling có khả năng xử lý lượng tải tối đa mà không bị timeout. | Kiểm thử tải. | Cao | CSDL | BR-48 |
| REL-014 | Đồng bộ Thời gian | Đảm bảo timestamp máy chủ chính xác. | Tính toàn vẹn của audit. | Toàn bộ server được đồng bộ theo giờ UTC thông qua NTP. | Cấu hình Server. | TB | Hạ tầng | BR-49 |
| REL-015 | Timeout API Bên thứ ba | Bảo vệ khỏi sự chậm chạp của hệ thống ngoài. | Phục hồi nhanh. | Các cuộc gọi API bên ngoài bị timeout nghiêm ngặt ở 3000ms. | Đánh giá code. | Cao | Tích hợp | BR-50 |

## 9. Yêu cầu về Bảo mật (Security Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| SEC-001 | Bắt buộc MFA | Xác thực Đa Yếu tố. | Ngăn chặn chiếm đoạt tài khoản. | Tất cả tài khoản quản trị và người dùng doanh nghiệp đều phải dùng MFA. | Kiểm toán Bảo mật. | Nghiêm trọng | IAM | BR-51 |
| SEC-002 | Độ phức tạp Mật khẩu | Các quy tắc mật khẩu nghiêm ngặt. | Ngừa tấn công Brute force. | Tối thiểu 12 ký tự, chữ hoa, chữ thường, số, ký tự đặc biệt. | Unit tests. | Cao | IAM | BR-52 |
| SEC-003 | Hashing Mật khẩu | Lưu trữ thông tin xác thực an toàn. | Ngừa vi phạm dữ liệu. | Mật khẩu được băm bằng Argon2id với các muối (salt) duy nhất. | Đánh giá code. | Nghiêm trọng | IAM | BR-53 |
| SEC-004 | Hết hạn Phiên làm việc (Session Timeout) | Ngắt phiên khi rảnh rỗi. | Ngăn chặn truy cập trái phép. | Phiên đăng nhập hết hạn sau 30 phút không hoạt động. | Kiểm thử thủ công. | Cao | IAM | BR-54 |
| SEC-005 | Hết hạn Phiên Tuyệt đối | Thời lượng phiên đăng nhập tối đa. | Giảm nhẹ rủi ro đánh cắp token. | Phiên bắt buộc hết hạn sau 12 giờ bất kể có hoạt động hay không. | Kiểm thử. | Cao | IAM | BR-55 |
| SEC-006 | Phiên Đồng thời | Giới hạn số lượng đăng nhập. | Ngăn chặn chia sẻ tài khoản. | Tối đa 3 phiên đăng nhập hoạt động cùng lúc cho mỗi tài khoản. | Kiểm thử. | TB | IAM | BR-56 |
| SEC-007 | Khóa khi Đăng nhập Sai | Bảo vệ chống Brute force. | Bảo mật tài khoản. | Khóa tài khoản trong 15 phút sau 5 lần đăng nhập thất bại. | Pen testing. | Cao | IAM | BR-57 |
| SEC-008 | Tích hợp SSO | Hỗ trợ SAML/OIDC. | Tuân thủ doanh nghiệp. | Hỗ trợ SAML 2.0 và OIDC cho khách hàng doanh nghiệp. | Kiểm thử tích hợp. | Cao | IAM | BR-58 |
| SEC-009 | Bảo mật JWT | Token bảo mật. | Ngăn chặn giả mạo token. | JWT được ký bằng RS256, vòng đời ngắn (<15m). | Đánh giá code. | Nghiêm trọng | API | BR-59 |
| SEC-010 | Luân chuyển Khóa API | Bảo mật Machine-to-machine. | Giảm thiểu rủi ro lộ khóa. | Các Khóa API có thể luân chuyển mà không gây downtime. | Kiểm thử. | Cao | API | BR-60 |
| SEC-011 | Triển khai RBAC | Kiểm soát Truy cập dựa trên Vai trò. | Đặc quyền tối thiểu. | Tất cả endpoint tuân thủ RBAC dựa trên vai trò của người dùng. | Pen testing. | Nghiêm trọng | IAM | BR-61 |
| SEC-012 | Nguyên tắc Đặc quyền Tối thiểu | Quyền hạn tối thiểu cần thiết. | Kiểm soát rủi ro. | Services/users chỉ có các quyền thực sự cần thiết. | Kiểm toán IAM. | Nghiêm trọng | Hạ tầng | BR-62 |
| SEC-013 | Ngăn chặn IDOR | Tham chiếu Đối tượng Trực tiếp Không an toàn. | Quyền riêng tư. | Các endpoint truy cập dữ liệu phải xác thực quyền sở hữu của người dùng. | DAST/SAST. | Nghiêm trọng | API | BR-63 |
| SEC-014 | Cách ly Khách thuê (Tenant Isolation) | Phân tách dữ liệu SaaS. | Rò rỉ dữ liệu giữa các khách. | CSDL áp dụng bảo mật cấp độ hàng (row-level security) theo ID của khách. | Đánh giá code. | Nghiêm trọng | CSDL | BR-64 |
| SEC-015 | Truy cập Nhận thức Ngữ cảnh | Hạn chế IP/Địa lý. | Truy cập có điều kiện. | Quản trị viên có thể giới hạn đăng nhập theo dải IP nhất định. | Kiểm thử. | TB | IAM | BR-65 |
| SEC-016 | Nâng cao Đặc quyền | Các hành động quản trị an toàn. | Rủi ro nội bộ (Insider threat). | Các hành động nhạy cảm yêu cầu xác thực lại (re-authentication). | Kiểm thử. | Cao | IAM | BR-66 |
| SEC-017 | Bắt buộc TLS 1.3 | Mã hóa đường truyền. | Ngăn chặn nghe lén. | Tất cả traffic mạng dùng TLS 1.2+ (ưu tiên 1.3); port 80 chuyển hướng sang 443. | Test SSL Labs. | Nghiêm trọng | Mạng | BR-67 |
| SEC-018 | Mã hóa tại Chỗ (DB) | Mã hóa CSDL. | Chống vi phạm vật lý. | Tất cả RDS/CSDL được mã hóa bằng AES-256. | Kiểm toán Cloud. | Nghiêm trọng | CSDL | BR-68 |
| SEC-019 | Mã hóa tại Chỗ (Lưu trữ) | Mã hóa file. | Ngăn chặn rò rỉ dữ liệu. | Tất cả S3 buckets được mã hóa qua KMS với AES-256. | Kiểm toán Cloud. | Nghiêm trọng | Lưu trữ | BR-69 |
| SEC-020 | Luân chuyển Khóa KMS | Vệ sinh Mật mã. | Tránh phân tích mật mã. | Các khóa KMS tự động xoay vòng sau mỗi 90 ngày. | Kiểm toán Cloud. | Cao | Hạ tầng | BR-70 |
| SEC-021 | Mã hóa Trường PII | Mã hóa ở cấp độ ứng dụng. | Quyền riêng tư (ngăn Admin DB). | Thông tin PII cực kỳ nhạy cảm (SSN, CCCD) được mã hóa ở tầng app. | Đánh giá code. | Nghiêm trọng | CSDL | BR-71 |
| SEC-022 | Triển khai HSTS | Strict Transport Security. | Ngăn chặn tấn công giáng cấp (Downgrade). | Kích hoạt header HSTS với max-age >= 1 năm. | Quét lỗ hổng. | Cao | Mạng | BR-72 |
| SEC-023 | Cookies Bảo mật | Cookie flags. | Ngừa XSS/Cướp phiên. | Tất cả cookies phải cài đặt HttpOnly, Secure, và SameSite=Strict. | DAST. | Cao | Web | BR-73 |
| SEC-024 | Quản lý Bí mật | Không hardcode bí mật. | Chống lộ mã nguồn. | Tất cả secret được tiêm thông qua Vault/AWS Secrets Manager khi chạy. | SAST. | Nghiêm trọng | DevSecOps | BR-74 |
| SEC-025 | Triển khai CSP | Content Security Policy. | Ngăn chặn XSS. | Header CSP nghiêm ngặt chặn các script nội tuyến (inline) và domain không rõ ràng. | DAST. | Cao | Web | BR-75 |
| SEC-026 | Ngăn chặn SQL Injection | Bảo mật truy vấn CSDL. | Ngừa thỏa hiệp CSDL. | 100% sử dụng truy vấn tham số hóa/ORM; không nối chuỗi (string concatenation). | SAST. | Nghiêm trọng | CSDL | BR-76 |
| SEC-027 | Bảo vệ CSRF | Cross-Site Request Forgery. | Hành động trái phép. | Token Anti-CSRF được triển khai cho tất cả endpoint có thay đổi trạng thái. | DAST. | Cao | Web | BR-77 |
| SEC-028 | Xác thực Đầu vào | Rà soát dữ liệu nghiêm ngặt. | Chống mã độc. | Tất cả đầu vào được kiểm tra dựa trên allowlist (loại, độ dài, định dạng). | Pen testing. | Cao | API | BR-78 |
| SEC-029 | Mã hóa Đầu ra | Làm sạch dữ liệu. | Ngăn chặn XSS. | Dữ liệu do người dùng nhập được mã hóa theo ngữ cảnh trước khi render. | Đánh giá code. | Cao | Web | BR-79 |
| SEC-030 | Giới hạn Tỷ lệ (Rate Limiting) | Ngừa lạm dụng API. | Chống DDoS/Scraping. | Áp dụng Rate limiting dựa trên IP và User ở API Gateway. | Kiểm thử tải. | Cao | API | BR-80 |
| SEC-031 | Giới hạn Kích thước Payload | Cạn kiệt tài nguyên. | Ngăn chặn DoS. | Payload giới hạn nghiêm ngặt (vd: 50MB cho video, 2MB cho JSON). | Kiểm thử API. | TB | API | BR-81 |
| SEC-032 | Quét Dependencies | Bảo mật chuỗi cung ứng. | Tránh thư viện có lỗ hổng. | Công cụ SCA chạy trên mọi pipeline CI (Dependabot/Snyk). | Kiểm tra CI/CD. | Nghiêm trọng | DevSecOps | BR-82 |
| SEC-033 | Bảo mật Container | Lỗ hổng hình ảnh. | Ngừa thoát khỏi container. | Docker images được quét lỗ hổng; chạy ở chế độ non-root. | Kiểm tra CI/CD. | Cao | DevSecOps | BR-83 |
| SEC-034 | Tích hợp SAST | Phân tích tĩnh. | Phát hiện lỗi sớm. | SAST chạy khi tạo PR; chặn merge nếu có lỗi Critical/High. | Kiểm tra CI/CD. | Cao | DevSecOps | BR-84 |
| SEC-035 | Tích hợp DAST | Phân tích động. | Phát hiện lỗ hổng thời gian chạy. | DAST tự động chạy trên môi trường staging hằng đêm. | Kiểm tra CI/CD. | TB | DevSecOps | BR-85 |
| SEC-036 | Triển khai WAF | Web Application Firewall. | Chặn các khai thác web phổ biến. | WAF được bật với các bộ quy tắc (rulesets) OWASP Top 10. | Kiểm toán Cloud. | Nghiêm trọng | Mạng | BR-86 |
| SEC-037 | Bảo vệ DDoS | Từ chối Dịch vụ Phân tán. | Đảm bảo tính sẵn sàng. | Giảm thiểu DDoS được bật ở layer CDN/Edge (vd: Cloudflare/Shield). | Kiểm toán Hạ tầng. | Cao | Mạng | BR-87 |
| SEC-038 | Nhật ký Kiểm toán Bất biến | Log chống làm giả. | Phục vụ điều tra (Forensics). | Log bảo mật được gửi đến bộ nhớ WORM (ghi một lần, đọc nhiều lần). | Đánh giá hạ tầng. | Nghiêm trọng | Ghi log | BR-88 |
| SEC-039 | Giám sát Bảo mật (SIEM) | Phân tích mối đe dọa tập trung. | Phản hồi sự cố. | Tất cả sự kiện bảo mật được chuyển tới SIEM theo thời gian thực. | Đánh giá hạ tầng. | Cao | Ghi log | BR-89 |
| SEC-040 | Phát hiện Bất thường | Cảnh báo hành vi. | Phát hiện mối đe dọa rủi ro cao/nội bộ. | Báo động khi xuất dữ liệu nhiều bất thường hoặc vị trí đăng nhập lạ. | Rules của SIEM. | TB | Ghi log | BR-90 |
| SEC-041 | Quét Tệp Tải lên | Phòng chống mã độc (Malware). | Bảo vệ nền tảng. | Toàn bộ CV/Video tải lên được quét bằng phần mềm anti-malware trước khi lưu. | Kiểm thử tích hợp. | Nghiêm trọng | Lưu trữ | BR-91 |
| SEC-042 | Các Loại Tệp Được phép | Hạn chế upload. | Thực thi mã độc. | Chỉ cho phép các MIME types cụ thể (PDF, DOCX, MP4); xác nhận bằng magic numbers. | Unit tests. | Cao | API | BR-92 |
| SEC-043 | Không Truy cập Cây thư mục | Bảo mật đường dẫn file. | Quyền truy cập hệ thống tệp. | File access APIs sẽ làm sạch inputs để tránh khai thác `../`. | SAST. | Nghiêm trọng | API | BR-93 |
| SEC-044 | Security Headers | Các bảo vệ HTTP. | Bảo mật trình duyệt. | Bắt buộc X-Content-Type-Options, X-Frame-Options. | Quét lỗ hổng. | Cao | Web | BR-94 |
| SEC-045 | Chính sách CORS | Cross-Origin Resource Sharing. | Lời gọi cross-origin trái phép. | Áp dụng CORS khắt khe chỉ cho phép các domain frontend đã duyệt. | Kiểm thử API. | Cao | API | BR-95 |
| SEC-046 | SLA Quản lý Lỗ hổng | Thời gian vá lỗi. | Giảm thiểu rủi ro. | Vá các lỗ hổng Critical trong < 48h; High trong < 7 ngày. | Kiểm toán Quy trình. | Nghiêm trọng | Ops | BR-96 |
| SEC-047 | Kế hoạch Phản hồi Sự cố | Sẵn sàng chống vi phạm. | Tuân thủ. | Kế hoạch IR được soạn thảo và diễn tập nội bộ (tabletop exercises) hàng năm. | Kiểm toán Tuân thủ. | Cao | Ops | BR-97 |
| SEC-048 | Penetration Testing (Pen Test) | Xác thực của bên thứ 3. | Tuân thủ/Bảo mật. | Thực hiện Pen Test thủ công hằng năm bởi một công ty bảo mật có chứng chỉ. | Báo cáo kiểm toán. | Cao | Bảo mật | BR-98 |
| SEC-049 | Kiến trúc Zero Trust | Bảo mật mạng nội bộ. | Ngăn ngừa di chuyển ngang (Lateral movement). | Không tin tưởng ngầm định giữa các microservices nội bộ; đều xác thực qua mTLS. | Đánh giá kiến trúc. | Cao | Mạng | BR-99 |
| SEC-050 | Quản lý Trạng thái Đám mây | Cấu hình sai hạ tầng. | Ngăn ngừa rò rỉ đám mây. | Công cụ CSPM liên tục giám sát tài khoản đám mây để đảm bảo tuân thủ. | Kiểm toán hạ tầng. | TB | Hạ tầng | BR-100 |

## 10. Yêu cầu về Quyền riêng tư (Privacy Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| PRIV-001 | Quản lý Sự đồng ý | Thu thập sự cho phép. | Tuân thủ GDPR. | Cần sự đồng ý rõ ràng trước khi thu thập PII của ứng viên. | Test luồng UI. | Nghiêm trọng | Web | BR-101 |
| PRIV-002 | Tối thiểu hóa Dữ liệu | Chỉ thu thập dữ liệu cần. | Quyền riêng tư mặc định (Privacy by design). | Hệ thống chỉ lưu trữ các dữ liệu bắt buộc thiết yếu cho việc đánh giá. | Đánh giá schema. | Cao | CSDL | BR-102 |
| PRIV-003 | Giới hạn Mục đích | Hạn chế dùng dữ liệu. | GDPR. | Không thể chia sẻ dữ liệu ứng viên giữa các NTD nếu không có sự đồng ý kép. | Đánh giá code. | Nghiêm trọng | IAM | BR-103 |
| PRIV-004 | Tự động Xóa | Vòng đời dữ liệu. | Giới hạn lưu trữ/Quyền riêng tư. | Tự động xóa hồ sơ sau 3 năm ngưng hoạt động trừ khi đã được tuyển. | Log Batch job. | Cao | Background | BR-104 |
| PRIV-005 | Quyền Truy cập | Xuất dữ liệu (DSAR). | Tuân thủ GDPR. | User có thể tải toàn bộ thông tin PII định dạng máy đọc được (JSON). | Test Chức năng. | Cao | API | BR-105 |
| PRIV-006 | Quyền Xóa (Erasure) | Quyền được lãng quên. | Tuân thủ GDPR. | User có thể yêu cầu xóa toàn bộ tài khoản; "hard delete" thực thi trong < 30 ngày. | Test Quy trình. | Nghiêm trọng | API | BR-106 |
| PRIV-007 | Phân loại Dữ liệu | Gắn thẻ độ nhạy cảm. | Kiểm soát bảo mật. | Các cột DB được gắn thẻ (Public, Internal, Confidential, Restricted). | Đánh giá schema. | TB | CSDL | BR-107 |
| PRIV-008 | Che giấu PII (UI) | Ẩn dữ liệu nhạy cảm. | Chống nhìn lén (Shoulder surfing). | SSN/CCCD bị che mặc định trên UI (***-**-1234). | UI test. | TB | Web | BR-108 |
| PRIV-009 | Che giấu PII (Logs) | Dọn dẹp log. | Tránh rò rỉ dữ liệu. | Passwords, Tokens, PII tự động được gỡ bỏ khỏi log ứng dụng. | Kiểm toán Log. | Nghiêm trọng | Ghi log | BR-109 |
| PRIV-010 | Quyền riêng tư Mặc định | Cài đặt mặc định. | Niềm tin người dùng. | Hồ sơ mặc định để chế độ Riêng tư (không tìm kiếm được) khi vừa tạo. | Kiểm tra UI. | Cao | Web | BR-110 |
| PRIV-011 | Kiểm toán Độ lệch AI | AI Đạo đức. | Công bằng/Pháp lý. | Các thuật toán AI phải được kiểm toán công bằng/thiên lệch mỗi quý. | Báo cáo kiểm toán. | Cao | AI Engine | BR-111 |
| PRIV-012 | Đồng ý Cookie | Sự cho phép theo dõi. | Chỉ thị ePrivacy. | Users phải xác nhận (opt-in) các cookie không thiết yếu qua biểu ngữ. | Kiểm tra UI. | Cao | Web | BR-112 |
| PRIV-013 | Xử lý Dữ liệu Bên thứ ba | Thỏa thuận vendor. | Quyền riêng tư chuỗi cung ứng. | Tüm sub-processors (bên xử lý phụ) phải được ghi chép và minh bạch với KH Doanh nghiệp. | Đánh giá tài liệu. | TB | Ops | BR-113 |
| PRIV-014 | Chủ quyền Dữ liệu | Giới hạn địa lý. | Luật pháp địa phương. | Dữ liệu của khách hàng EU phải được lưu trữ và xử lý tại trung tâm dữ liệu EU. | Kiểm toán hạ tầng. | Nghiêm trọng | Hạ tầng | BR-114 |
| PRIV-015 | Hiển thị Chính sách Bảo mật | Minh bạch pháp lý. | Tuân thủ. | Chính sách bảo mật được liên kết rõ ràng ở mọi form thu thập dữ liệu. | Kiểm tra UI. | TB | Web | BR-115 |

## 11. Yêu cầu Tuân thủ (Compliance Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| COMP-001 | SOC 2 Type II | Nguyên tắc tin cậy về Bảo mật & Sẵn sàng. | Bán hàng doanh nghiệp (B2B). | Kiến trúc và vận hành tuân thủ các kiểm soát của SOC 2 Type II. | Kiểm toán. | Nghiêm trọng | Nền tảng | BR-116 |
| COMP-002 | ISO 27001 | Quản lý An toàn Thông tin. | Tiêu chuẩn toàn cầu. | Các quy trình hỗ trợ yêu cầu chứng nhận ISO 27001. | Kiểm toán. | Cao | Nền tảng | BR-117 |
| COMP-003 | Sẵn sàng GDPR | Bảo vệ Dữ liệu EU. | Tiếp cận thị trường EU. | Tuân thủ đầy đủ các điều khoản GDPR (Consent, DSAR, DPA). | Kiểm toán Pháp lý. | Nghiêm trọng | Nền tảng | BR-118 |
| COMP-004 | Tuân thủ CCPA | Đạo luật Quyền riêng tư California. | Thị trường Mỹ. | Hỗ trợ từ chối (opt-out) bán dữ liệu và yêu cầu xóa dữ liệu. | Kiểm toán Pháp lý. | Cao | Nền tảng | BR-119 |
| COMP-005 | OWASP Top 10 | Tiêu chuẩn AppSec. | Bảo mật cơ sở. | Không có lỗ hổng đã biết nào từ OWASP Top 10 trên production. | Pen test. | Nghiêm trọng | App | BR-120 |
| COMP-006 | Tiêu chuẩn Tiếp cận | Tuân thủ WCAG. | Bao hàm/Pháp lý. | UI đạt chuẩn WCAG 2.2 AA. | Công cụ Accessibility. | Cao | UI | BR-121 |
| COMP-007 | Quản trị Doanh nghiệp | Chính sách nội bộ. | Khả năng kiểm toán. | Hệ thống thực thi các chính sách truy cập và mật khẩu nội bộ. | Kiểm toán. | TB | IAM | BR-122 |
| COMP-008 | Nhật ký Kiểm toán (Audit Trails) | Lịch sử hành động. | Theo dõi tuân thủ. | Tất cả thay đổi dữ liệu nhạy cảm đều duy trì dấu vết kiểm toán lịch sử. | Xem lại Log. | Cao | CSDL | BR-123 |
| COMP-009 | Sẵn sàng Đạo luật AI (AI Act) | Pháp luật AI của EU. | Tính hướng tới tương lai. | Các mô hình AI duy trì khả năng giải thích và cơ chế dự phòng có người (human-in-the-loop). | Kiểm toán Model. | Cao | AI Engine | BR-124 |
| COMP-010 | Thông báo Vi phạm Dữ liệu | Báo cáo pháp lý. | Tuân thủ. | Hệ thống hỗ trợ việc xác định user bị ảnh hưởng để báo cáo vi phạm trong 72 giờ. | Diễn tập IR. | Nghiêm trọng | Ops | BR-125 |

## 12. Yêu cầu về Khả năng tiếp cận (Accessibility Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| ACC-001 | WCAG 2.2 AA | Tiêu chuẩn cơ sở. | Pháp lý/Bao hàm. | Mọi màn hình ứng viên đều vượt qua WCAG 2.2 AA. | Axe/Lighthouse. | Nghiêm trọng | UI | BR-126 |
| ACC-002 | Điều hướng bằng Bàn phím | Không cần chuột. | Khuyết tật vận động. | 100% chức năng ứng dụng truy cập được chỉ bằng bàn phím. | Kiểm thử thủ công. | Cao | UI | BR-127 |
| ACC-003 | Hỗ trợ Trình đọc màn hình | HTML/ARIA ngữ nghĩa. | Khuyết tật thị giác. | Tương thích với JAWS, NVDA, và VoiceOver. | Kiểm thử thủ công. | Cao | UI | BR-128 |
| ACC-004 | Tỷ lệ Tương phản | Tương phản màu sắc. | Khuyết tật thị giác. | Tỷ lệ tương phản chữ và nền đạt ít nhất 4.5:1. | Công cụ UI. | Cao | UI | BR-129 |
| ACC-005 | Văn bản Thay thế | Mô tả hình ảnh. | Khuyết tật thị giác. | Mọi hình ảnh không mang tính trang trí đều có thuộc tính "alt" mô tả. | Lighthouse. | TB | UI | BR-130 |
| ACC-006 | Phụ đề (VOD) | Video có thể tiếp cận. | Khuyết tật thính giác. | Tất cả câu hỏi video ghi sẵn bao gồm phụ đề (closed captions). | Kiểm thử thủ công. | Cao | Media | BR-131 |
| ACC-007 | Chép lời Trực tiếp (Transcriptions) | Tiếp cận thời gian thực. | Khuyết tật thính giác. | Phỏng vấn video trực tiếp có chép lời thành văn bản theo thời gian thực. | Kiểm thử thủ công. | Cao | Media | BR-132 |
| ACC-008 | Chỉ báo Tiêu điểm (Focus) | Tiêu điểm bàn phím trực quan. | Usability/Accessibility. | Chỉ báo rõ ràng trên các phần tử tương tác (interactive elements). | Kiểm tra trực quan. | Cao | UI | BR-133 |
| ACC-009 | Nhận diện Lỗi | Báo lỗi form rõ ràng. | Nhận thức/Thị giác. | Lỗi biểu mẫu được mô tả rõ bằng text và gắn với input tương ứng. | UI test. | Cao | UI | BR-134 |
| ACC-010 | Phóng to Hiển thị | Mở rộng văn bản. | Khuyết tật thị giác. | UI vẫn dùng được khi zoom 200% mà không phải cuộn ngang. | Browser test. | TB | UI | BR-135 |
| ACC-011 | Không Phụ thuộc Màu sắc | Truyền tải thông tin. | Mù màu. | Thông tin không bao giờ được truyền tải chỉ bằng mỗi màu sắc. | Kiểm tra trực quan. | Cao | UI | BR-136 |
| ACC-012 | Biểu mẫu Tiếp cận | Form labels. | Trình đọc màn hình. | Tất cả inputs đều có phần tử `<label>` lập trình liên kết. | Đánh giá code. | Cao | UI | BR-137 |
| ACC-013 | Bỏ qua Điều hướng | Bỏ qua các khối (Bypass blocks). | Usability bàn phím. | Có link "Skip to Main Content" (Đến phần nội dung chính) ở đầu DOM. | Kiểm thử thủ công. | TB | UI | BR-138 |
| ACC-014 | Không có Nội dung Nhấp nháy | Ngăn ngừa co giật. | An toàn. | Không có nội dung nào nhấp nháy quá 3 lần/giây. | Kiểm tra trực quan. | Nghiêm trọng | UI | BR-139 |
| ACC-015 | Đủ Thời gian | Hết hạn phiên. | Vận động/Nhận thức. | Người dùng được cảnh báo trước khi hết phiên và có thể gia hạn. | UI test. | Cao | UI | BR-140 |

## 13. Yêu cầu về Tính dễ sử dụng (Usability Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| USAB-001 | Khả năng Học hỏi | Thiết kế trực quan. | Tốc độ làm quen (Onboarding). | User mới hoàn tất thiết lập hồ sơ trong < 5 phút không cần giúp. | Kiểm thử người dùng. | Cao | UI | BR-141 |
| USAB-002 | Tính Nhất quán | Hệ thống thiết kế (Design system). | Giảm tải nhận thức. | Các UI components và thuật ngữ nhất quán trên toàn bộ các module. | Đánh giá UX. | Cao | UI | BR-142 |
| USAB-003 | Ngăn ngừa Lỗi | Các hành động xóa/phá hủy. | Mất dữ liệu. | Mọi hành động phá hủy (Xóa, Nộp bài) cần xác nhận. | UI test. | Nghiêm trọng | UI | BR-143 |
| USAB-004 | Phản hồi Người dùng | Trạng thái hệ thống. | UX. | Hiển thị vòng xoay tải (spinners) / thanh tiến trình nếu tác vụ > 1s. | Kiểm tra trực quan. | Cao | UI | BR-144 |
| USAB-005 | Điều hướng Breadcrumbs | Định hướng. | Usability. | Các hệ thống phân cấp phức tạp có điều hướng breadcrumb. | UI test. | TB | UI | BR-145 |
| USAB-006 | Hệ thống Trợ giúp | Hỗ trợ trong ứng dụng. | Sự độc lập của user. | Tooltips theo ngữ cảnh và link tới cơ sở kiến thức tại các form khó. | UI test. | TB | UI | BR-146 |
| USAB-007 | Tải Nhận thức Tối thiểu | Thiết kế biểu mẫu. | Tỷ lệ hoàn thành. | Đánh giá dài được chia thành các bước (wizard), tối đa 5 câu hỏi/trang. | Đánh giá UX. | Cao | UI | BR-147 |
| USAB-008 | Quốc tế hóa (i18n) | Hỗ trợ nền tảng đa ngôn ngữ. | Mở rộng toàn cầu. | Mã nguồn dùng file dịch thuật; không có string hardcoded. | Đánh giá code. | Cao | App | BR-148 |
| USAB-009 | Bản địa hóa (l10n) | Ngôn ngữ hỗ trợ. | Phù hợp thị trường. | UI ban đầu có Tiếng Anh, Tây Ban Nha, Pháp, Đức. | Kiểm thử thủ công. | Cao | App | BR-149 |
| USAB-010 | Responsive trên Mobile | Không phụ thuộc thiết bị. | Lựa chọn của ứng viên. | 100% luồng ứng viên hoạt động hoàn hảo trên trình duyệt mobile. | Browser Stack. | Nghiêm trọng | UI | BR-150 |

## 14. Yêu cầu về Ghi Log & Kiểm toán (Logging & Audit Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| LOG-001 | Log Ứng dụng | Thông tin debug. | Khắc phục sự cố. | Tất cả dịch vụ xuất log định dạng JSON có cấu trúc ra standard out. | Xem lại Log. | Cao | App | BR-151 |
| LOG-002 | Log Bảo mật | Sự kiện xác thực (Auth). | Kiểm toán bảo mật. | Mọi log in, log out, và thay đổi quyền được ghi lại kèm IP & UserID. | Xem lại Log. | Nghiêm trọng | App | BR-152 |
| LOG-003 | Nhật ký Kiểm toán (Audit Trails) | Thay đổi dữ liệu. | Tuân thủ. | Hành động Tạo, Cập nhật, Xóa đánh giá/người dùng được lưu ở bảng audit. | Check DB. | Cao | CSDL | BR-153 |
| LOG-004 | Thời gian Lưu giữ (Logs) | Vòng đời log. | Tuân thủ. | Log bảo mật lưu 1 năm; log ứng dụng lưu 30 ngày. | Cấu hình Cloud. | Cao | Lưu trữ | BR-154 |
| LOG-005 | Lưu trữ Bất biến | Chống làm giả mạo. | Điều tra (Forensics). | Audit logs được lưu vào S3 có Object Lock (WORM). | Cấu hình Cloud. | Nghiêm trọng | Lưu trữ | BR-155 |
| LOG-006 | Truy xuất nguồn gốc | Distributed tracing. | Debug microservice. | Mọi request được gắn một Correlation ID truyền qua các services. | Kiểm tra Trace. | Cao | App | BR-156 |
| LOG-007 | Tính Toàn vẹn của Log | Ngăn chặn giả mạo. | Bảo mật. | Logs được ký mã hóa hoặc đẩy ngay sang hệ thống SIEM bên ngoài. | Đánh giá kiến trúc. | Cao | Hạ tầng | BR-157 |
| LOG-008 | Che giấu Dữ liệu Nhạy cảm | Tránh rò rỉ. | Quyền riêng tư. | Các aggregator chạy regex filter để loại bỏ SSN, thẻ tín dụng, tokens. | Kiểm tra cấu hình. | Nghiêm trọng | Ghi log | BR-158 |
| LOG-009 | Ghi Log Tập trung | Quản lý qua một màn hình (Single pane of glass). | Khả năng vận hành. | Toàn bộ log gom về một hệ thống chung (vd: ELK, Datadog, Splunk). | Ops review. | Cao | Hạ tầng | BR-159 |
| LOG-010 | Chuẩn hóa Thời gian | Thứ tự log theo thời gian. | Sự tương quan. | Timestamp của mọi log dùng múi giờ UTC, chuẩn ISO-8601. | Check log. | Cao | App | BR-160 |

## 15. Giám sát & Khả năng quan sát (Monitoring & Observability)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| MON-001 | Số liệu Hệ thống | Theo dõi tài nguyên. | Hoạch định công suất. | CPU, RAM, Disk, Network I/O được track mỗi phút. | Dashboard check. | Cao | Hạ tầng | BR-161 |
| MON-002 | Kiểm tra Sức khỏe (Health Checks) | Trạng thái dịch vụ. | Định tuyến (Routing)/Uptime. | Mọi microservice công khai một endpoint `/health` cho LB. | Đánh giá code. | Nghiêm trọng | App | BR-162 |
| MON-003 | Ngưỡng Cảnh báo | Chủ động phản hồi. | Uptime. | Cảnh báo đẩy qua PagerDuty khi tỷ lệ lỗi > 1% hoặc độ trễ > 2s. | Ops config. | Nghiêm trọng | Ops | BR-163 |
| MON-004 | Số liệu Nghiệp vụ (Business Metrics) | Theo dõi sử dụng. | Trí tuệ doanh nghiệp (BI). | Xuất các số liệu tùy chỉnh: 'số phỏng vấn hoàn tất' và 'lỗi AI'. | Dashboard check. | TB | App | BR-164 |
| MON-005 | Tích hợp APM | Giám sát hiệu suất ứng dụng. | Debugging. | APM agent cài đặt trên mọi server trace các lệnh DB & API. | Ops review. | Cao | App | BR-165 |
| MON-006 | Giám sát Tổng hợp | Chủ động test UI. | Xác thực Uptime. | Bot tự động login và load dashboard mỗi 5 phút toàn cầu. | Ops review. | Cao | Ops | BR-166 |
| MON-007 | Theo dõi Lỗi (Error Tracking) | Nhóm ngoại lệ. | Fix bugs. | Các exceptions được gom lại ở Sentry/Bugsnag kèm stack traces. | Ops review. | Cao | App | BR-167 |
| MON-008 | Dashboard Vận hành | Khả năng theo dõi Ops. | Phản hồi sự cố. | NOC dashboard có hiển thị trạng thái RAG (Đỏ/Vàng/Xanh) cho các modules. | Ops review. | TB | Ops | BR-168 |
| MON-009 | Giám sát CSDL | Hiệu năng DB. | Tránh nghẽn cổ chai. | Track slow queries, tỷ lệ deadlock, và mức sử dụng connection pool. | Dashboard check. | Cao | CSDL | BR-169 |
| MON-010 | Giám sát Độ tin cậy AI | Độ lệch model (Model drift). | Độ chính xác của AI. | Cảnh báo nếu điểm tin cậy trung bình của AI < 80% trong > 1 tiếng. | Dashboard check. | Cao | AI Engine | BR-170 |

## 16. Sao lưu & Khôi phục sau Thảm họa (Backup & Disaster Recovery)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| BKP-001 | Tần suất Sao lưu | Bảo vệ dữ liệu. | RPO. | Backup gia tăng hằng giờ; backup toàn phần (full) hằng ngày. | Config check. | Nghiêm trọng | CSDL | BR-171 |
| BKP-002 | Lưu giữ Sao lưu | Khả năng truy cập lịch sử. | Tuân thủ. | Daily backup giữ trong 30 ngày; Monthly giữ trong 1 năm. | Config check. | Cao | Lưu trữ | BR-172 |
| BKP-003 | Kiểm thử Khôi phục | Tính hợp lệ của backup. | Độ tin cậy. | Script tự động phục hồi DB tới môi trường staging hàng tuần để xác minh. | Ops logs. | Cao | Ops | BR-173 |
| BKP-004 | Kế hoạch DR | Quy trình khắc phục thảm họa. | Tính liên tục. | Documented DR runbook (Tài liệu hướng dẫn DR) có sẵn offline. | Kiểm toán. | Nghiêm trọng | Ops | BR-174 |
| BKP-005 | Sao lưu Liên Khu vực | Dự phòng địa lý. | Thảm họa quy mô lớn. | Backups được tự động nhân bản (replicate) qua region thứ hai. | Config check. | Nghiêm trọng | Hạ tầng | BR-175 |
| BKP-006 | Hạ tầng dưới dạng Code (IaC) | Rebuild nhanh chóng. | RTO. | 100% hạ tầng được cấu hình qua Terraform/CloudFormation. | Repo check. | Cao | DevSecOps | BR-176 |
| BKP-007 | Cold Standby | DR tiết kiệm chi phí. | Tính liên tục. | Region phụ chứa các bản sao DB và IaC sẵn sàng triển khai compute. | Đánh giá kiến trúc. | TB | Hạ tầng | BR-177 |
| BKP-008 | Mã hóa Dữ liệu (Backups) | Bảo vệ backup. | Rò rỉ dữ liệu. | Toàn bộ backup được mã hóa tĩnh (at rest) với khóa quản lý trên KMS. | Config check. | Nghiêm trọng | Lưu trữ | BR-178 |
| BKP-009 | Bảo vệ Ransomware | Tính bất biến (Immutability). | Bảo mật. | Backups giữ trong hầm chứa cách ly (air-gapped) hoặc Object Lock. | Đánh giá kiến trúc. | Cao | Lưu trữ | BR-179 |
| BKP-010 | Quy trình Failback | Trở lại bình thường. | Tính liên tục. | Có quy trình bằng văn bản hướng dẫn failback về region chính sau thảm họa. | Runbook check. | TB | Ops | BR-180 |

## 17. Yêu cầu về Tính tương thích (Compatibility Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| CMP-001 | Trình duyệt Hỗ trợ | Truy cập Web. | Phạm vi thị trường. | Hỗ trợ 2 phiên bản mới nhất của Chrome, Safari, Firefox, Edge. | BrowserStack test. | Cao | UI | BR-181 |
| CMP-002 | HĐH Di động | Truy cập App Mobile. | Phạm vi thị trường. | Hỗ trợ native (bản địa) iOS 15+ và Android 11+. | Device test. | Cao | Mobile | BR-182 |
| CMP-003 | Độ phân giải Màn hình | UI Responsive. | Usability. | UI tự co giãn từ 320px (mobile) lên tới 4K monitors. | UI test. | TB | UI | BR-183 |
| CMP-004 | Điều kiện Mạng | Hỗ trợ băng thông thấp. | Truy cập toàn cầu. | Text/UI hiển thị tốt ở mạng 3G (Giảm chất lượng video chứ không ngắt). | Throttling test. | Cao | UI | BR-184 |
| CMP-005 | Tích hợp ATS Bên thứ 3 | Khả năng tương tác. | Giá trị B2B. | APIs tương thích với định dạng dữ liệu của Workday, Greenhouse, Lever. | Kiểm thử tích hợp. | Cao | API | BR-185 |
| CMP-006 | Định dạng Tệp (CV) | Tính tương thích tải lên. | Usability. | Hệ thống chấp nhận và phân tích cú pháp file .pdf, .docx, .doc, .txt. | Unit test. | Cao | App | BR-186 |
| CMP-007 | Định dạng Tệp (Video) | Tính tương thích Media. | Usability. | Trình phát video hỗ trợ .mp4, .webm trên mọi trình duyệt hỗ trợ. | Unit test. | Cao | Media | BR-187 |
| CMP-008 | Múi giờ | Lập lịch toàn cầu. | Usability. | Tất cả thời gian hiển thị theo múi giờ người dùng; lưu trong hệ thống ở UTC. | UI test. | Nghiêm trọng | App | BR-188 |
| CMP-009 | Hỗ trợ WebRTC | Phỏng vấn Live. | Tính năng cốt lõi. | Tương thích chuẩn WebRTC trên các trình duyệt hiện đại. | Kiểm thử tích hợp. | Nghiêm trọng | Media | BR-189 |
| CMP-010 | Không dùng Plugin | Không tạo cản trở truy cập. | Trải nghiệm ứng viên. | Hệ thống KHÔNG YÊU CẦU cài đặt extensions (Flash, Java, plugins). | Đánh giá kiến trúc. | Cao | UI | BR-190 |

## 18. Yêu cầu về Khả năng bảo trì (Maintainability Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| MNT-001 | Chất lượng Code | Phân tích tĩnh. | Khả năng bảo trì. | Điểm SonarQube đạt hạng 'A' về nợ kỹ thuật (Technical debt). | Kiểm tra CI/CD. | Cao | Code | BR-191 |
| MNT-002 | Độ bao phủ Test | Tự động hóa kiểm thử. | Độ ổn định. | Tối thiểu 80% độ phủ unit test cho backend; 70% cho frontend. | Kiểm tra CI/CD. | Cao | Code | BR-192 |
| MNT-003 | Tính Mô-đun | Kiến trúc Microservices. | Tính linh hoạt (Agility). | Các thành phần được tách rời qua event/API để update độc lập. | Đánh giá kiến trúc. | Cao | Kiến trúc | BR-193 |
| MNT-004 | Tài liệu hóa | Onboard lập trình viên. | Truyền đạt kiến thức. | Tất cả API có document qua OpenAPI/Swagger; tự động update. | Repo check. | Cao | API | BR-194 |
| MNT-005 | Đánh phiên bản (Versioning) | Tương thích ngược API. | Tính ổn định tích hợp. | API dùng quy chuẩn Semantic Versioning khắt khe (vd: /v1/...). | Đánh giá code. | Nghiêm trọng | API | BR-195 |
| MNT-006 | Tự động Triển khai | CI/CD pipeline. | Tốc độ release. | Triển khai "Zero-touch" (Không chạm) lên staging và production. | Ops review. | Cao | DevSecOps | BR-196 |
| MNT-007 | Quản lý Cấu hình | Tính đồng nhất của Môi trường. | Độ ổn định. | Tách rời cấu hình khỏi code, dùng biến môi trường (env)/Vault. | Đánh giá code. | Cao | App | BR-197 |
| MNT-008 | Migration CSDL | Tiến hóa schema. | Deploy an toàn. | Mọi thay đổi schema tự động qua migration scripts (vd: Flyway/Liquibase). | Đánh giá code. | Cao | CSDL | BR-198 |
| MNT-009 | Feature Toggles | Release an toàn. | Sự linh hoạt (Agility). | Tính năng lớn mới được bọc qua LaunchDarkly/cờ tính năng tùy chỉnh (feature flags). | Đánh giá code. | TB | App | BR-199 |
| MNT-010 | Định dạng Code | Tính Nhất quán. | Dễ đọc (Readability). | Prettier/ESLint/Black bị ép buộc thực thi qua pre-commit hooks. | Repo config. | TB | Code | BR-200 |

## 19. Yêu cầu Vận hành (Operational Requirements)
| ID | Tên | Mô tả | Lý do Nghiệp vụ | Tiêu chí Chấp nhận | Phương pháp Đo lường | Ưu tiên | Module | BR liên quan |
|---|---|---|---|---|---|---|---|---|
| OPS-001 | Giờ Hỗ trợ | Helpdesk. | Dịch vụ khách hàng. | Hỗ trợ Tier 1 khả dụng 24/7/365 cho khách hàng doanh nghiệp. | Hợp đồng SLA. | Cao | Ops | BR-201 |
| OPS-002 | Quản lý Sự cố | Ticketing. | Theo dõi xử lý. | Tất cả sự cố được track ở Jira/ServiceNow với đồng hồ SLA. | Ops process. | Cao | Ops | BR-202 |
| OPS-003 | Quản lý Thay đổi | Phê duyệt CAB. | Độ ổn định. | Mọi thay đổi production phải qua test tự động + 1 lượt duyệt manual. | Kiểm toán quy trình. | Cao | Ops | BR-203 |
| OPS-004 | Runbooks | Tài liệu thủ tục. | Giảm MTTR. | Có Executable runbooks (tài liệu thực thi) cho 10 alerts phổ biến nhất. | Doc review. | Cao | Ops | BR-204 |
| OPS-005 | Cơ sở Kiến thức | Tự phục vụ. | Giảm số lượng ticket. | Tài liệu tự học/hỗ trợ bao quát 90% quy trình tiêu chuẩn. | Doc review. | TB | Ops | BR-205 |
| OPS-006 | Mức độ Sẵn sàng Vận hành | Checklist trước launch. | An toàn release. | Release lên production phải qua đánh giá ORA. | Kiểm toán quy trình. | Cao | Ops | BR-206 |
| OPS-007 | Quản lý Năng lực (Capacity) | Dự báo. | Ngăn chặn quá tải. | Xem xét năng lực tài nguyên và dự báo tăng trưởng hàng quý. | Kiểm toán quy trình. | TB | Ops | BR-207 |
| OPS-008 | Phân tích Sự cố Không đổ lỗi | Cải tiến liên tục. | Văn hóa cty. | Mọi sự cố Sev-1/Sev-2 phải có tài liệu RCA (Root Cause Analysis) không đổ lỗi. | Kiểm toán quy trình. | TB | Ops | BR-208 |
| OPS-009 | Chaos Engineering | Thử nghiệm độ bền bỉ. | Độ ổn định. | GameDays hàng tháng để giả lập lỗi AZ hoặc suy thoái DB. | Ops logs. | Thấp | Ops | BR-209 |
| OPS-010 | Tối ưu Chi phí | FinOps. | Ngân sách. | Môi trường staging không dùng sẽ tự động tắt sau giờ làm việc. | Hóa đơn Cloud. | TB | Hạ tầng | BR-210 |

## 20. Ràng buộc Phi chức năng (Non-Functional Constraints)
*   **Hạ tầng Đám mây:** Hệ thống phải được triển khai trên AWS hoặc Azure sử dụng các dịch vụ cloud-native có quản lý.
*   **Giới hạn Lưu trữ:** Kích thước tệp tối đa khi tải lên video bị giới hạn ở mức 500MB mỗi tệp.
*   **Hỗ trợ Trình duyệt:** Internet Explorer 11 và các trình duyệt cũ sẽ KHÔNG được hỗ trợ rõ ràng.
*   **Chi phí Xử lý AI:** Chi phí suy luận (Inference cost) cho mỗi đánh giá ứng viên không được vượt quá $0.50 USD.
*   **Ràng buộc Quy định:** Mọi quá trình xử lý dữ liệu của công dân EU phải được thực hiện tại các data centers vật lý nằm trong khối EU.
*   **Mã nguồn Mở:** Các thư viện mã nguồn mở có giấy phép GPL bị cấm nghiêm ngặt không được có trong codebase độc quyền.

## 21. Rủi ro Phi chức năng (Non-Functional Risks)
| ID Rủi ro | Thuộc tính Chất lượng | Rủi ro | Tác động | Khả năng | Biện pháp giảm thiểu |
|---|---|---|---|---|---|
| RSK-01 | Khả năng Mở rộng | Các node AI nghẽn cổ chai trong các đợt tuyển dụng đột biến | Cao | TB | Implement auto-scaling tích cực và xử lý async qua hàng đợi (queue) |
| RSK-02 | Bảo mật | Lộ dữ liệu PII qua thư viện bên thứ 3 bị thỏa hiệp | Nghiêm trọng | Thấp | Quét SCA nghiêm ngặt, ghim phiên bản dependency và dùng WAF |
| RSK-03 | Hiệu suất | Lỗi timeout khi tải lên video do mạng di động kém | TB | Cao | Áp dụng upload phân mảnh (chunked uploads) và retries từ phía client |
| RSK-04 | Độ tin cậy | Vùng lưu trữ cơ sở dữ liệu chính bị rớt mạng | Nghiêm trọng | Thấp | Triển khai multi-region active-passive có auto-failover |
| RSK-05 | Tuân thủ | Model AI bị coi là thiên vị các nhóm thiểu số | Cao | TB | Thường xuyên kiểm toán tính công bằng từ bên thứ 3 và các chỉ số AI Explainable |
| RSK-06 | Tính sẵn sàng | Tấn công DDoS vào các endpoint API | Cao | TB | Dùng Cloudflare/AWS Shield advanced protection và rate limiting |
| RSK-07 | Khả năng Bảo trì | Microservices phình to gây khó khăn cho việc deploy | TB | TB | Chuẩn hóa CI/CD khắt khe và tích hợp Service mesh |

## 22. Số liệu Chất lượng & KPIs (Quality Metrics & KPIs)
Hơn 40 chỉ số hiệu suất chính (KPI) sau sẽ được theo dõi để đảm bảo chất lượng liên tục:

### Hiệu suất & Khả năng Mở rộng (Performance & Scalability)
1. **Thời gian Phản hồi Trang (Trung bình):** < 1.5 giây
2. **Độ trễ API p95:** < 200 ms
3. **Độ trễ API p99:** < 500 ms
4. **Thời gian Xử lý AI (Văn bản):** < 3 giây
5. **Thời gian Xử lý AI (Video):** < 30 giây cho mỗi đoạn video dài 5 phút
6. **Số lượng Người dùng Đồng thời Tối đa Hỗ trợ:** 10,000+
7. **Số Phiên Phỏng vấn Video Đồng thời Tối đa:** 2,000+
8. **Độ trễ Truy vấn DB p95:** < 50 ms
9. **Lưu lượng Mạng Đỉnh (Network Throughput Peak):** Đo theo Gbps so với công suất cung cấp
10. **Mức độ Sử dụng Tài nguyên:** CPU/Memory utilization < 75% ở thời gian cao điểm

### Tính sẵn sàng & Độ tin cậy (Availability & Reliability)
11. **Thời gian hoạt động (Uptime) của Hệ thống:** 99.99% (Yêu cầu SLA)
12. **Thời gian Trung bình Giữa các Sự cố (MTBF):** > 720 giờ (30 ngày)
13. **Tỷ lệ Lỗi (HTTP 5xx):** < 0.1% của tổng số request
14. **Mục tiêu Thời gian Phục hồi (RTO):** < 4 giờ
15. **Mục tiêu Điểm Khôi phục (RPO):** < 15 phút
16. **Tỷ lệ Thành công khi Backup:** 100% (Không có backup bị lỗi)
17. **Tỷ lệ Chuyển đổi Dự phòng (Failover) Thành công:** 100% trong các đợt diễn tập DR
18. **Tỷ lệ Mất Tin nhắn Hàng đợi (Message Queue Drop Rate):** 0% (Không mất tin nhắn)
19. **Tỷ lệ CDN Cache Hit Ratio:** > 90%
20. **Tỷ lệ Phiên App Mobile Không bị Crash (Crash-Free):** > 99.5%

### Bảo mật & Tuân thủ (Security & Compliance)
21. **Thời gian Trung bình để Phát hiện Sự cố Bảo mật (MTTD):** < 15 phút
22. **Thời gian Trung bình Khắc phục Lỗi Bảo mật Nghiêm trọng (MTTR):** < 48 giờ
23. **Số lượng Lỗ hổng Mức độ High/Critical trên Production:** 0
24. **Số lượng Sự cố Bảo mật:** Được track hàng tháng
25. **Tỷ lệ Đăng nhập Thất bại:** Track để phát hiện bất thường (anomaly detection)
26. **Tỷ lệ Chặn của WAF:** % số yêu cầu độc hại bị chặn
27. **Phát hiện qua Kiểm toán Tuân thủ:** 0 phát hiện nghiêm trọng
28. **Điểm Kiểm thử Xâm nhập (Pen Test) của Bên thứ ba:** Đạt (Không có rủi ro cao chưa được xử lý)
29. **Tỷ lệ Áp dụng MFA:** 100% cho Enterprise/Admins
30. **Tuân thủ Chính sách Giữ lại Dữ liệu:** 100% (Tự động xóa thành công)

### Tính dễ sử dụng & Khả năng Tiếp cận (Usability & Accessibility)
31. **Điểm Khả năng Tiếp cận (Lighthouse/Axe):** 100% (Đạt WCAG 2.2 AA)
32. **Điểm Thang đo SUS (System Usability Scale):** > 80
33. **Thời gian Hoàn tất Nhiệm vụ (Thiết lập Đánh giá):** < 5 phút
34. **Tỷ lệ Hoàn thành Nhiệm vụ Thành công:** > 95% hoàn tất mà không cần trợ giúp
35. **Tỷ lệ Lỗi của Người dùng (User Error Rate):** < 2% khi submit form bị báo lỗi validation

### Khả năng Bảo trì & Vận hành (Maintainability & Operability)
36. **Tần suất Triển khai (Deployment Frequency):** Nhiều lần mỗi tuần (CI/CD)
37. **Lead Time (Thời gian từ Commit tới Prod):** < 24 giờ
38. **Tỷ lệ Đổi mới Thất bại (Change Failure Rate):** < 5% số lần deploy gây ra sự cố
39. **Độ bao phủ Mã (Code Coverage):** > 80% độ phủ unit test
40. **Thời gian Phục hồi Dịch vụ (MTTRS):** < 30 phút
41. **Tỷ lệ Nợ Kỹ thuật (Technical Debt Ratio - SonarQube):** < 5%
42. **Tỷ lệ Cảnh báo Giả (False Positives Alert Noise Ratio):** < 10%

## 23. Ma trận Truy xuất Nguồn gốc NFR (NFR Traceability Matrix)
Để đảm bảo tính liên kết chặt chẽ, các NFR được truy xuất ngược từ Yêu cầu Nghiệp vụ (BR) xuống tới Test Cases.

| Yêu cầu Nghiệp vụ (BR) | Yêu cầu Chức năng (FR) | Yêu cầu Phi chức năng (NFR) | Tiêu chí Chấp nhận | ID Test Case |
|---|---|---|---|---|
| BR-04: Đánh giá AI | FR-AI-01: Chấm điểm Video | PERF-004: Độ trễ AI | Video chấm điểm xong trong < 30s | TC-PERF-012 |
| BR-51: Xác thực Enterprise | FR-IAM-02: Login | SEC-001: Bắt buộc MFA | Đăng nhập Admin đòi hỏi OTP | TC-SEC-005 |
| BR-118: Hỗ trợ GDPR | FR-DSAR-01: Xuất liệu | PRIV-005: Quyền truy cập | User tải file JSON thành công | TC-PRIV-002 |
| BR-126: Tính Bao hàm | FR-UI-05: Biểu mẫu | ACC-001: WCAG 2.2 AA | Axe báo cáo 0 vi phạm | TC-ACC-001 |
| BR-26: Quy mô Đám mây | FR-SYS-01: Triển khai | SCAL-001: Auto-scaling | Các node add trong < 60s | TC-SCA-004 |

## 24. Cải tiến Chất lượng Tương lai (Future Quality Improvements)
Các NFR nâng cao sau được quy hoạch cho Phase 2/3:
*   **Triển khai Multi-Region:** Chuyển đổi từ mô hình active-passive sang active-active toàn cầu.
*   **Điện toán Biên với Global CDN:** Đẩy các xác thực AI nhẹ ra edge nodes (vd: Cloudflare Workers) để giảm độ trễ.
*   **Khả năng Quan sát Nâng cao (eBPF):** Triển khai tracing ở cấp kernel cho việc theo dõi hiệu suất ít tiêu tốn tài nguyên nhất.
*   **Chương trình Chaos Engineering:** Bơm lỗi liên tục, tự động vào môi trường production bằng Gremlin.
*   **Giám sát AI Dự đoán:** Dùng machine learning để dự đoán điểm nghẽn dung lượng 48 tiếng trước khi nó diễn ra.
*   **SSO Self-Service cho Enterprise:** Cho phép khách thuê tự thiết lập các tích hợp SAML thông qua Dashboard của họ.

## 25. Tóm tắt (Summary)
Tài liệu Đặc tả Yêu cầu Phi chức năng này đảm bảo rằng Hệ thống Phỏng vấn & Đánh giá Kỹ năng tích hợp AI được xây dựng trên một nền tảng vận hành xuất sắc. Bằng cách tuân thủ chặt chẽ **210 yêu cầu có thể đo lường** và **42 KPIs** được vạch ra trong tài liệu này, nền tảng sẽ đạt được **bảo mật** cấp độ doanh nghiệp, **tính sẵn sàng cao (99.99%)**, **khả năng mở rộng liền mạch**, và hoàn toàn **tuân thủ quy định (GDPR, SOC 2, ISO 27001)**. Việc kiểm thử tự động liên tục, khả năng quan sát mạnh mẽ cùng các tiêu chuẩn DevSecOps nghiêm ngặt sẽ đảm bảo khả năng bảo trì và duy trì hiệu suất dài hạn khi hệ thống mở rộng phục vụ hàng triệu ứng viên trên toàn cầu.