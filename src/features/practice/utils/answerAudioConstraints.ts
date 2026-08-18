/**
 * Ràng buộc mic dùng cho MỌI đường thu câu trả lời (stream phỏng vấn trực tiếp
 * lẫn stream dự phòng của recorder). Để chung một chỗ vì hai đường cùng tạo ra
 * một file đem đi chấm — lệch nhau là hai ứng viên được đo bằng hai thước.
 *
 * `echoCancellation` khai tường minh vì đây là lớp chắn cuối cho tiếng đọc đề
 * lọt vào bài ghi: narration đã bị cắt ngay lúc mở recorder, nhưng người dùng
 * bật loa ngoài vẫn có thể vọng lại. Chrome mặc định đã bật, nên khai ra không
 * đổi hành vi ở trình duyệt chính — nó chỉ bịt những trình duyệt/cấu hình có
 * mặc định khác.
 *
 * CỐ Ý không khai `noiseSuppression`/`autoGainControl`: hai thứ đó biến đổi
 * chính tín hiệu mà backend dùng để đo ngập ngừng (khoảng lặng, tốc độ nói),
 * nên bật chúng là đổi đầu vào của thang điểm — việc riêng, phải đo trước.
 */
export const ANSWER_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
};
