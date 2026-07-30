export async function dataUrlToJpegFile(dataUrl: string, fileName: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: 'image/jpeg' });
}

export function captureVideoFrameAsJpegFile(
  video: HTMLVideoElement,
  fileName: string,
  quality = 0.85,
): Promise<File | null> {
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    return Promise.resolve(null);
  }

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
