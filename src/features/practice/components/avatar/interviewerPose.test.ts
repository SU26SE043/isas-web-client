import { describe, expect, it } from 'vitest';
import { Bone, Matrix4, Object3D, Quaternion, Vector3 } from 'three';
import { applyRestPose } from './interviewerPose';

/**
 * Dựng lại ĐÚNG hệ trục của rig thật trong `public/avatar/interviewer.glb` (đo từ chính file đó):
 * xương chạy dọc theo local **+Y**, và với `LeftArm` thì `localX → world −Z`, `localZ → world −Y`.
 * Dựng sai hệ trục thì bài test vẫn xanh nhưng chẳng chứng minh gì về model thật — mà đây đúng là
 * chỗ dễ tự lừa mình nhất khi test rig.
 */
function addArm(root: Object3D, side: 'Left' | 'Right'): Bone {
  const armDirection = new Vector3(side === 'Left' ? 1 : -1, 0, 0);
  const shoulder = new Bone();
  shoulder.name = `${side}Shoulder`;

  const yAxis = armDirection.clone().normalize(); // dọc xương
  const xAxis = new Vector3(0, 0, side === 'Left' ? -1 : 1); // khớp đo thật ở 2 bên
  const zAxis = new Vector3().crossVectors(xAxis, yAxis).normalize();
  shoulder.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(xAxis, yAxis, zAxis));

  const arm = new Bone();
  arm.name = `${side}Arm`;
  arm.position.set(0, 0.122, 0);
  shoulder.add(arm);
  root.add(shoulder);
  return arm;
}

/**
 * `applyRestPose` là all-or-nothing (thiếu một bên thì không đụng gì), nên rig thử nghiệm phải có
 * ĐỦ hai tay — dựng thiếu thì test xanh/đỏ vì lý do hoàn toàn khác thứ đang muốn đo.
 */
function makeRig(): { root: Object3D; left: Bone; right: Bone } {
  const root = new Object3D();
  const left = addArm(root, 'Left');
  const right = addArm(root, 'Right');
  root.updateWorldMatrix(true, true);
  return { root, left, right };
}

/** Hướng world mà xương đang chỉ tới (local +Y của nó). */
function boneDirection(bone: Bone): Vector3 {
  const q = new Quaternion();
  bone.getWorldQuaternion(q);
  return new Vector3(0, 1, 0).applyQuaternion(q);
}

describe('applyRestPose — hạ tay khỏi T-pose', () => {
  it('tay trái đang chỉ ngang (+X) thì sau khi hạ phải chỉ XUỐNG', () => {
    const { root, left } = makeRig();
    expect(boneDirection(left).y).toBeCloseTo(0, 5); // T-pose: nằm ngang

    const result = applyRestPose(root);

    expect(result.applied).toBe(true);
    expect(boneDirection(left).y).toBeLessThan(-0.9); // xuôi xuống gần thẳng đứng
  });

  it('tay phải (−X) cũng phải xuống — KHÔNG được hất lên vì sai dấu một bên', () => {
    const { root, right } = makeRig();

    applyRestPose(root);

    expect(boneDirection(right).y).toBeLessThan(-0.9);
  });

  it('tay không được vắt qua thân: thành phần ngang phải teo lại chứ không đổi dấu quá tay', () => {
    const { root, left } = makeRig();

    applyRestPose(root);

    const dir = boneDirection(left);
    expect(dir.x).toBeGreaterThanOrEqual(0); // vẫn nghiêng về phía trái người, không chéo sang phải
    expect(dir.x).toBeLessThan(0.4);
  });

  it('model rig khác (không có xương tên LeftArm/RightArm) → không làm gì, giữ nguyên bind pose', () => {
    const root = new Object3D();
    const bone = new Bone();
    bone.name = 'mixamorigLeftArm';
    root.add(bone);
    const before = bone.quaternion.clone();

    const result = applyRestPose(root);

    expect(result.applied).toBe(false);
    expect(bone.quaternion.equals(before)).toBe(true);
  });

  it('Object3D trùng tên nhưng KHÔNG phải xương thì bỏ qua — tránh xoay nhầm mesh', () => {
    // Phải dựng ĐỦ CẢ HAI bên: chỉ đặt một bên thì hàm thoát sớm vì thiếu tay kia, và bài test sẽ
    // xanh vì lý do hoàn toàn khác thứ đang muốn khoá (đúng lỗ mutation M4 đã lộ ra).
    const root = new Object3D();
    for (const name of ['LeftArm', 'RightArm']) {
      const fake = new Object3D();
      fake.name = name;
      root.add(fake);
    }

    expect(applyRestPose(root).applied).toBe(false);
  });
});
