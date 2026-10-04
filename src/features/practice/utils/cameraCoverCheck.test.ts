import { describe, expect, it } from 'vitest';
import { isCoveredCameraSample, measureCameraFrame } from './cameraCoverCheck';

const W = 192;
const H = 144;
const BLOCK = 4;

/** PRNG có seed — nhiễu cảm biến giả lập phải lặp lại được giữa các lần chạy. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Dựng khung RGBA 192×144 (đo trên lưới 48×36 như thật) từ (x, y) → độ sáng [r, g, b], cộng nhiễu ±noise/2. */
function frame(pixel: (x: number, y: number) => [number, number, number], noise = 0) {
  const random = seeded(42);
  const data = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const n = (random() - 0.5) * noise;
      const [r, g, b] = pixel(x, y);
      data.set([r + n, g + n, b + n, 255], (y * W + x) * 4);
    }
  }
  return measureCameraFrame(data, W, H, BLOCK);
}

/** Vệt sáng lọt qua ngón tay: hồng/đỏ, sáng dần từ một góc, biến thiên êm — không có cạnh nào. */
const finger = (x: number, y: number): [number, number, number] => {
  const glow = Math.exp(-((x - 170) ** 2 + (y - 15) ** 2) / 16000);
  return [60 + 160 * glow, 18 + 70 * glow, 22 + 60 * glow];
};

/** Phòng: tường, khung cửa, mặt bàn; `face` thêm mặt (ellipse) + tóc + mắt/miệng. Thu nhỏ ra đủ cạnh như webcam. */
function room(brightness: number, face: boolean) {
  return (x: number, y: number): [number, number, number] => {
    let v = 150;
    if (x > 138 && x < 178 && y < 120) v = 90;
    if (y > 114) v = 70;
    if (face) {
      const inFace = ((x - 87) / 32) ** 2 + ((y - 60) / 44) ** 2 <= 1;
      if (inFace) v = 190;
      if (y < 26 && ((x - 87) / 35) ** 2 + ((y - 26) / 18) ** 2 <= 1) v = 25;
      if (inFace && y >= 44 && y <= 48 && ((x >= 72 && x <= 80) || (x >= 94 && x <= 102))) v = 30;
      if (inFace && y >= 79 && y <= 82 && x >= 78 && x <= 96) v = 60;
    }
    const scaled = v * brightness;
    return [scaled, scaled, scaled];
  };
}

describe('measureCameraFrame / isCoveredCameraSample', () => {
  it('đen kịt → che (giữ quy tắc cũ, cùng ngưỡng isUsableCameraFrame của B2B)', () => {
    const sample = frame(() => [0, 0, 0]);
    expect(sample.meanLuma).toBe(0);
    expect(sample.nearBlackRatio).toBe(1);
    expect(isCoveredCameraSample(sample)).toBe(true);
  });

  it('ngón tay che ống kính: khung hồng SÁNG (không tối) nhưng không có nét → vẫn là che, kể cả nhiễu nặng', () => {
    // Đúng ca user báo 2026-10-04: che bằng tay ⇒ khung không đen ⇒ bản cũ gửi AI ⇒ ghi "Không thấy mặt".
    for (const noise of [0, 24, 48]) {
      const sample = frame(finger, noise);
      expect(sample.meanLuma).toBeGreaterThan(12);
      expect(isCoveredCameraSample(sample)).toBe(true);
    }
  });

  it('dán giấy / khung một màu đều → che', () => {
    expect(isCoveredCameraSample(frame(() => [200, 200, 190]))).toBe(true);
    expect(isCoveredCameraSample(frame(() => [200, 200, 190], 24))).toBe(true);
  });

  it('ngồi trước camera → KHÔNG che, kể cả phòng tối và nhiễu', () => {
    expect(isCoveredCameraSample(frame(room(1, true), 24))).toBe(false);
    const dim = frame(room(0.3, true), 24);         // độ sáng TB ~40: tối nhưng còn đường nét
    expect(dim.meanLuma).toBeGreaterThan(12);
    expect(isCoveredCameraSample(dim)).toBe(false);
  });

  it('rời ghế (chỉ còn phòng) → KHÔNG che — để AI ghi "Không thấy mặt" như cũ', () => {
    expect(isCoveredCameraSample(frame(room(1, false), 24))).toBe(false);
  });
});
