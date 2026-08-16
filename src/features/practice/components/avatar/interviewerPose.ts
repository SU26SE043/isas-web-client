import type { Bone, Object3D } from 'three';

/**
 * Hạ hai tay của avatar từ T-pose xuống tư thế đứng nghỉ.
 *
 * Model `interviewer.glb` **không kèm animation clip nào** (đã kiểm: `animations: []`), nên nó
 * render đúng bind pose — tức T-pose, hai tay dang ngang. Trước đây cách xử lý là cắt camera thật
 * sát đầu để giấu tay, nhưng khung avatar là khung NGANG: mép dưới khung rơi đúng tầm vai, nên hai
 * cánh tay vẫn chạy ngang qua đáy khung. Giấu bằng khung hình không giải được — chỉ cần đổi tỉ lệ
 * khung, đổi kích thước panel, hay model khác một chút là nó lộ lại.
 *
 * Đây là chỉnh XƯƠNG một lần lúc nạp, không phải animation: rẻ, không cần thêm asset, và không có
 * clip nào chạy để ghi đè lại. `interviewerRig` sau đó chỉ đụng morph target khuôn mặt + xương
 * `Head`, nên tư thế tay đặt ở đây đứng yên suốt buổi.
 *
 * ⚠ Đo trên chính file model chứ không đoán theo quy ước rig: xương tay có trục dọc là **local +Y**,
 * và `LeftArm.localX → world −Z`, `RightArm.localX → world +Z`. Với cả hai bên, xoay quanh
 * **local X một góc dương** đều đưa đầu xương từ phương ngang (±X) xuống dưới (−Y) — xem
 * `docs`/commit để biết cách tính. Model thay thế có rig khác (README `public/avatar/`) thì các tên
 * xương dưới đây không khớp và hàm này **im lặng không làm gì**, đúng bằng hành vi cũ.
 */

/** ~74°: tay xuôi tự nhiên, vẫn hơi tách khỏi thân — 90° cho ra dáng "nghiêm" cứng đơ. */
const UPPER_ARM_DROP = 1.29;
/** Khuỷu tay hơi gập cho đỡ thẳng đơ như ma-nơ-canh. */
const FOREARM_BEND = 0.16;
/** Vai hạ nhẹ theo, nếu không phần cơ delta bị kéo căng thấy rõ ở khung cận vai. */
const SHOULDER_DROP = 0.12;

interface PosedBones {
  leftArm: Bone | null;
  rightArm: Bone | null;
  leftForeArm: Bone | null;
  rightForeArm: Bone | null;
  leftShoulder: Bone | null;
  rightShoulder: Bone | null;
}

function isBone(object: Object3D): object is Bone {
  return (object as Bone).isBone === true;
}

function collectArmBones(root: Object3D): PosedBones {
  const found: Record<string, Bone> = {};
  root.traverse((object) => {
    if (isBone(object) && object.name in TARGETS) found[object.name] = object;
  });
  return {
    leftArm: found.LeftArm ?? null,
    rightArm: found.RightArm ?? null,
    leftForeArm: found.LeftForeArm ?? null,
    rightForeArm: found.RightForeArm ?? null,
    leftShoulder: found.LeftShoulder ?? null,
    rightShoulder: found.RightShoulder ?? null,
  };
}

const TARGETS: Record<string, true> = {
  LeftArm: true,
  RightArm: true,
  LeftForeArm: true,
  RightForeArm: true,
  LeftShoulder: true,
  RightShoulder: true,
};

export interface RestPoseResult {
  /** `false` = không tìm thấy xương tay (model rig khác) → giữ nguyên bind pose. */
  applied: boolean;
}

export function applyRestPose(root: Object3D): RestPoseResult {
  const bones = collectArmBones(root);
  if (!bones.leftArm || !bones.rightArm) return { applied: false };

  bones.leftArm.rotateX(UPPER_ARM_DROP);
  bones.rightArm.rotateX(UPPER_ARM_DROP);
  bones.leftForeArm?.rotateX(FOREARM_BEND);
  bones.rightForeArm?.rotateX(FOREARM_BEND);
  bones.leftShoulder?.rotateZ(SHOULDER_DROP);
  bones.rightShoulder?.rotateZ(SHOULDER_DROP);

  root.updateWorldMatrix(true, true);
  return { applied: true };
}
