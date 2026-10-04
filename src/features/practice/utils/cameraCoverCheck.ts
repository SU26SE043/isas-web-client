import { isVideoFrameReady } from '@/features/campaigns/utils/captureJpegFile';

/**
 * B2C coaching — "camera có đang bị che không", đo NGAY TRÊN TRÌNH DUYỆT trước khi gửi ảnh cho AI đếm mặt.
 *
 * Trước 2026-10-04 chỉ khung ĐEN KỊT mới tính là che (cùng ngưỡng `isUsableCameraFrame` của B2B). Che bằng ngón
 * tay / bàn tay vẫn lọt sáng ⇒ khung hồng mờ, không đen ⇒ ảnh được gửi cho AI ⇒ ghi `no_face` ("Không thấy mặt")
 * thay vì "Che camera". Nay thêm quy tắc KHÔNG CÓ ĐƯỜNG NÉT: vật áp sát ống kính nằm ngoài tầm lấy nét nên khung
 * chỉ còn vệt sáng êm + nhiễu cảm biến, còn mặt người / căn phòng / ghế trống luôn có cạnh nổi hẳn lên trên nhiễu.
 *
 * Đo bằng |Laplacian| (≈ 0 trên vệt sáng êm, lớn ở cạnh): `structure` = phân vị 98 (các cạnh mạnh nhất),
 * `noise` = trung vị (phần lớn khung là vùng phẳng ⇒ trung vị ≈ mức nhiễu). Khung chỉ có nhiễu thì p98/trung vị
 * ≈ 3,5 BẤT KỂ nhiễu mạnh hay yếu — nên so TỈ SỐ, không so một ngưỡng tuyệt đối (đo giả lập 2026-10-04: ngón tay
 * nhiễu nặng có độ lệch chuẩn Laplacian 5,3 ≈ phòng rất tối có người 6,8 ⇒ ngưỡng tuyệt đối không tách được;
 * tỉ số thì ngón tay/bàn tay 3,4–3,7 · phòng rất tối 4,5 · phòng tối 16 · ghế trống 20 · phòng sáng 49).
 *
 * Cố ý KHÔNG sửa `isUsableCameraFrame`: hàm đó dùng chung với B2B (ảnh mốc + kiểm mặt chống gian lận), ở đó
 * "che cam" là vi phạm CHẶN bài — đổi ngưỡng là đổi luật chấm thật.
 */

/**
 * Lưới đo 48×36 (4:3 như webcam) — đủ giữ đường nét mặt/phòng. Vẽ ở 192×144 rồi TỰ trung bình khối 4×4 bằng số
 * thực: vẽ thẳng 48×36 thì canvas làm tròn mọi điểm về số nguyên 8-bit ⇒ trung vị |Laplacian| của khung phẳng
 * nhảy bậc 0/1/2 — mức nhiễu ước lượng không ổn định.
 */
const BLOCK = 4;
const GRID_WIDTH = 48;
const GRID_HEIGHT = 36;

/** Khung TỐI — cùng ngưỡng `isUsableCameraFrame` để "đen = che" không đổi so với trước. */
const DARK_MEAN_LUMA = 12;
const NEAR_BLACK_LUMA = 8;
const NEAR_BLACK_RATIO = 0.98;
/** Cạnh mạnh nhất phải vượt mức này (thang sáng 0–255) — khung phẳng gần như không nhiễu (ảnh nén, giấy dán). */
export const COVERED_STRUCTURE_MIN = 8;
/** …và vượt ngần này lần mức nhiễu — khung chỉ có nhiễu cho ≈ 3,5. */
export const COVERED_NOISE_RATIO = 4;

export interface CameraFrameSample {
  /** Độ sáng trung bình 0–255. */
  meanLuma: number;
  /** Tỉ lệ điểm gần như đen (< 8). */
  nearBlackRatio: number;
  /** Phân vị 98 của |Laplacian| — độ mạnh các cạnh rõ nhất trong khung. */
  structure: number;
  /** Trung vị của |Laplacian| — mức nhiễu nền. */
  noise: number;
}

function percentile(sorted: Float32Array, ratio: number): number {
  return sorted.length > 0 ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))] : 0;
}

/**
 * Đo trên mảng RGBA (như `ImageData.data`) — thuần, không đụng DOM, để test bằng khung tự dựng. `block` > 1 ⇒
 * trung bình từng khối `block×block` (số thực) trước khi đo; `sourceWidth`/`sourceHeight` là kích thước MẢNG VÀO.
 */
export function measureCameraFrame(rgba: ArrayLike<number>, sourceWidth: number, sourceHeight: number, block = 1): CameraFrameSample {
  const width = Math.floor(sourceWidth / block);
  const height = Math.floor(sourceHeight / block);
  const luma = new Float32Array(width * height);
  const area = block * block;
  for (let y = 0; y < height * block; y += 1) {
    for (let x = 0; x < width * block; x += 1) {
      const offset = (y * sourceWidth + x) * 4;
      const value = rgba[offset] * 0.2126 + rgba[offset + 1] * 0.7152 + rgba[offset + 2] * 0.0722;
      luma[Math.floor(y / block) * width + Math.floor(x / block)] += value / area;
    }
  }
  let lumaTotal = 0;
  let nearBlack = 0;
  for (const value of luma) {
    lumaTotal += value;
    if (value < NEAR_BLACK_LUMA) nearBlack += 1;
  }

  const laplacians = new Float32Array(Math.max(0, (width - 2) * (height - 2)));
  let cursor = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      laplacians[cursor] = Math.abs(luma[index - 1] + luma[index + 1] + luma[index - width] + luma[index + width] - 4 * luma[index]);
      cursor += 1;
    }
  }
  laplacians.sort();

  return {
    meanLuma: luma.length > 0 ? lumaTotal / luma.length : 0,
    nearBlackRatio: luma.length > 0 ? nearBlack / luma.length : 1,
    structure: percentile(laplacians, 0.98),
    noise: percentile(laplacians, 0.5),
  };
}

export function isCoveredCameraSample(sample: CameraFrameSample): boolean {
  if (sample.meanLuma < DARK_MEAN_LUMA || sample.nearBlackRatio > NEAR_BLACK_RATIO) return true;
  return sample.structure < Math.max(COVERED_STRUCTURE_MIN, COVERED_NOISE_RATIO * sample.noise);
}

/** Thu nhỏ khung hiện tại rồi đo trên lưới 48×36; `null` khi camera chưa có frame hoặc không vẽ được. */
export function sampleCameraFrame(video: HTMLVideoElement): CameraFrameSample | null {
  if (!isVideoFrameReady(video)) return null;
  const canvas = document.createElement('canvas');
  canvas.width = GRID_WIDTH * BLOCK;
  canvas.height = GRID_HEIGHT * BLOCK;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  context.imageSmoothingQuality = 'high';
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  return measureCameraFrame(data, canvas.width, canvas.height, BLOCK);
}

/** Camera đang bị che: khung tối kịt HOẶC không có đường nét nào nổi lên trên nhiễu. Chưa có frame ⇒ `false`. */
export function isCameraCovered(video: HTMLVideoElement): boolean {
  const sample = sampleCameraFrame(video);
  return sample != null && isCoveredCameraSample(sample);
}
