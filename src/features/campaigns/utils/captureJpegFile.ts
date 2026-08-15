export async function dataUrlToJpegFile(dataUrl: string, fileName: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: 'image/jpeg' });
}

/**
 * Guards against enrolling/checking an unexposed frame. Video dimensions can be
 * ready before the camera has produced a usable image, especially right after
 * play(), which yields an all-black JPEG the backend cannot match a face in.
 */
export function isUsableCameraFrame(video: HTMLVideoElement): boolean {
  if (video.videoWidth === 0 || video.videoHeight === 0) return false;
  if (video.readyState < 2 /* HAVE_CURRENT_DATA */) return false;

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 32;
  sampleCanvas.height = 32;
  const sampleContext = sampleCanvas.getContext('2d');
  if (!sampleContext) return false;
  sampleContext.drawImage(video, 0, 0, sampleCanvas.width, sampleCanvas.height);
  const sample = sampleContext
    .getImageData(0, 0, sampleCanvas.width, sampleCanvas.height)
    .data;
  let luminanceTotal = 0;
  let nearBlackPixels = 0;
  const pixelCount = sample.length / 4;
  for (let index = 0; index < sample.length; index += 4) {
    const luminance = sample[index] * 0.2126
      + sample[index + 1] * 0.7152
      + sample[index + 2] * 0.0722;
    luminanceTotal += luminance;
    if (luminance < 8) nearBlackPixels += 1;
  }
  return luminanceTotal / pixelCount >= 12 && nearBlackPixels / pixelCount <= 0.98;
}

export function captureVideoFrameAsJpegFile(
  video: HTMLVideoElement,
  fileName: string,
  quality = 0.85,
): Promise<File | null> {
  if (!isUsableCameraFrame(video)) return Promise.resolve(null);

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  if (!context) return Promise.resolve(null);
  context.drawImage(video, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(new File([blob], fileName, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      quality,
    );
  });
}
