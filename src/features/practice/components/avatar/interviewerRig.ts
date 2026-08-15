import type { Bone, Object3D, SkinnedMesh } from 'three';

/**
 * Điều khiển morph target của avatar: nhép miệng theo biên độ giọng, chớp mắt
 * ngẫu nhiên và lắc đầu nhẹ cho đỡ "tượng sáp".
 *
 * Không có phân tích phoneme thật (đường TTS chỉ trả về audio, không trả
 * timing). Ta lấy biên độ theo frame rồi xoay vòng qua vài viseme nguyên âm —
 * đủ để miệng khớp nhịp nói, đây cũng là cách các avatar realtime hay dùng.
 */

const SPEECH_VISEMES = ['viseme_aa', 'viseme_E', 'viseme_O', 'viseme_I', 'viseme_U'] as const;
const VISEME_HOLD_SEC = 0.11;
const BLINK_DURATION_SEC = 0.14;
const BLINK_MIN_GAP_SEC = 2.4;
const BLINK_MAX_GAP_SEC = 6;

interface MorphTarget {
  mesh: SkinnedMesh;
  index: number;
}

type MorphMap = Map<string, MorphTarget[]>;

function isSkinnedMesh(object: Object3D): object is SkinnedMesh {
  return (object as SkinnedMesh).isSkinnedMesh === true;
}

function collectMorphTargets(root: Object3D): MorphMap {
  const map: MorphMap = new Map();
  root.traverse((object) => {
    if (!isSkinnedMesh(object)) return;
    const dictionary = object.morphTargetDictionary;
    if (!dictionary || !object.morphTargetInfluences) return;
    for (const [name, index] of Object.entries(dictionary)) {
      const entries = map.get(name) ?? [];
      entries.push({ mesh: object, index });
      map.set(name, entries);
    }
  });
  return map;
}

function randomBlinkGap(): number {
  return BLINK_MIN_GAP_SEC + Math.random() * (BLINK_MAX_GAP_SEC - BLINK_MIN_GAP_SEC);
}

export interface InterviewerRig {
  /** @param amplitude 0..1 — độ to của giọng ở frame hiện tại. */
  update(deltaSec: number, elapsedSec: number, amplitude: number): void;
  hasVisemes: boolean;
}

export function createInterviewerRig(root: Object3D, headBone: Bone | null): InterviewerRig {
  const morphs = collectMorphTargets(root);
  const baseHeadRotation = headBone
    ? { x: headBone.rotation.x, y: headBone.rotation.y, z: headBone.rotation.z }
    : null;

  let blinkTimer = randomBlinkGap();
  let blinkElapsed = -1;
  let mouth = 0;

  const setMorph = (name: string, value: number) => {
    const targets = morphs.get(name);
    if (!targets) return;
    for (const { mesh, index } of targets) {
      const influences = mesh.morphTargetInfluences;
      if (influences) influences[index] = value;
    }
  };

  const updateBlink = (deltaSec: number) => {
    if (blinkElapsed >= 0) {
      blinkElapsed += deltaSec;
      const progress = blinkElapsed / BLINK_DURATION_SEC;
      if (progress >= 1) {
        blinkElapsed = -1;
        blinkTimer = randomBlinkGap();
        setMorph('eyeBlinkLeft', 0);
        setMorph('eyeBlinkRight', 0);
        return;
      }
      // Tam giác: nhắm rồi mở, đỉnh ở giữa.
      const closed = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      setMorph('eyeBlinkLeft', closed);
      setMorph('eyeBlinkRight', closed);
      return;
    }
    blinkTimer -= deltaSec;
    if (blinkTimer <= 0) blinkElapsed = 0;
  };

  const updateMouth = (deltaSec: number, elapsedSec: number, amplitude: number) => {
    // Làm mượt: đi lên nhanh, đi xuống chậm hơn để miệng không giật.
    const target = Math.max(0, Math.min(1, amplitude));
    const rate = target > mouth ? 18 : 9;
    mouth += (target - mouth) * Math.min(1, deltaSec * rate);

    const activeIndex = Math.floor(elapsedSec / VISEME_HOLD_SEC) % SPEECH_VISEMES.length;
    SPEECH_VISEMES.forEach((viseme, index) => {
      setMorph(viseme, index === activeIndex ? mouth * 0.85 : 0);
    });
    setMorph('viseme_sil', 1 - mouth);
    setMorph('jawOpen', mouth * 0.45);
  };

  const updateHead = (elapsedSec: number, amplitude: number) => {
    if (!headBone || !baseHeadRotation) return;
    const speechLift = amplitude * 0.05;
    headBone.rotation.x = baseHeadRotation.x + Math.sin(elapsedSec * 0.7) * 0.02 - speechLift * 0.4;
    headBone.rotation.y = baseHeadRotation.y + Math.sin(elapsedSec * 0.45) * 0.05;
    headBone.rotation.z = baseHeadRotation.z + Math.sin(elapsedSec * 0.33) * 0.015;
  };

  return {
    hasVisemes: morphs.has('viseme_aa') && morphs.has('jawOpen'),
    update(deltaSec, elapsedSec, amplitude) {
      updateMouth(deltaSec, elapsedSec, amplitude);
      updateBlink(deltaSec);
      updateHead(elapsedSec, amplitude);
    },
  };
}
