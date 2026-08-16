import {
  ACESFilmicToneMapping,
  Bone,
  Box3,
  Clock,
  Color,
  DirectionalLight,
  HemisphereLight,
  Object3D,
  PMREMGenerator,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { applyRestPose } from './interviewerPose';
import { createInterviewerRig } from './interviewerRig';

/**
 * Cảnh 3D cho avatar người phỏng vấn: dựng renderer, nạp model, khung hình
 * chân dung quanh đầu, rồi chạy vòng render nhép miệng.
 *
 * Model là avatar toàn thân và **không kèm animation clip** (`animations: []`), nên nó render đúng
 * bind pose = T-pose. `applyRestPose` hạ hai tay xuống một lần lúc nạp; camera vẫn đóng khung chân
 * dung quanh đầu, nhưng nay việc tay có lọt vào khung hay không không còn là thứ giữ cho ảnh đúng.
 */

const TARGET_FPS = 36;
const FRAME_INTERVAL = 1 / TARGET_FPS;

export interface InterviewerSceneOptions {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  /** Biên độ giọng 0..1 ở frame hiện tại, do component React cung cấp. */
  getAmplitude: () => number;
  onReady?: () => void;
}

export interface InterviewerSceneHandle {
  dispose(): void;
}

function findHeadBone(root: Object3D): Bone | null {
  let head: Bone | null = null;
  root.traverse((object) => {
    if (head) return;
    if ((object as Bone).isBone && object.name === 'Head') head = object as Bone;
  });
  return head;
}

/** Khung hình chân dung: lấy vị trí đầu và hướng mặt của model làm gốc. */
function framePortrait(camera: PerspectiveCamera, model: Object3D, head: Bone | null) {
  const focus = new Vector3();
  if (head) {
    head.getWorldPosition(focus);
  } else {
    new Box3().setFromObject(model).getCenter(focus);
  }
  const forward = new Vector3(0, 0, 1).applyQuaternion(model.getWorldQuaternion(new Quaternion()));
  forward.y = 0;
  if (forward.lengthSq() < 1e-6) forward.set(0, 0, 1);
  forward.normalize();

  const target = focus.clone().add(new Vector3(0, -0.06, 0));
  camera.position.copy(target).addScaledVector(forward, 0.72).add(new Vector3(0, 0.02, 0));
  camera.lookAt(target);
}

export async function createInterviewerScene(
  options: InterviewerSceneOptions,
): Promise<InterviewerSceneHandle> {
  const { canvas, modelUrl, getAmplitude, onReady } = options;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  const camera = new PerspectiveCamera(26, 1, 0.05, 20);

  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  room.dispose();

  const hemisphere = new HemisphereLight(new Color('#dfe6f2'), new Color('#161616'), 1.6);
  scene.add(hemisphere);
  const keyLight = new DirectionalLight(0xffffff, 2.1);
  keyLight.position.set(0.6, 1.9, 1.4);
  scene.add(keyLight);
  const rimLight = new DirectionalLight(new Color('#9fb2cc'), 1.1);
  rimLight.position.set(-1.2, 1.6, -1.1);
  scene.add(rimLight);

  const resize = () => {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  const gltf = await new GLTFLoader().loadAsync(modelUrl);
  const model = gltf.scene;
  model.updateWorldMatrix(true, true);
  // Hạ tay TRƯỚC khi lấy khung hình: nhánh dự phòng của framePortrait (không thấy xương `Head`)
  // đóng khung theo bounding box, mà T-pose làm box rộng gấp đôi người thật.
  applyRestPose(model);
  scene.add(model);

  const head = findHeadBone(model);
  framePortrait(camera, model, head);
  const rig = createInterviewerRig(model, head);

  const clock = new Clock();
  let frameId = 0;
  let accumulator = 0;
  let disposed = false;
  let ready = false;

  const renderFrame = () => {
    frameId = requestAnimationFrame(renderFrame);
    const delta = Math.min(clock.getDelta(), 0.1);
    accumulator += delta;
    if (accumulator < FRAME_INTERVAL) return;
    if (document.hidden) {
      accumulator = 0;
      return;
    }
    rig.update(accumulator, clock.elapsedTime, getAmplitude());
    renderer.render(scene, camera);
    accumulator = 0;
    if (!ready) {
      ready = true;
      onReady?.();
    }
  };
  frameId = requestAnimationFrame(renderFrame);

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        const mesh = object as Object3D & {
          geometry?: { dispose(): void };
          material?: { dispose(): void } | { dispose(): void }[];
        };
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
        else material?.dispose();
      });
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
