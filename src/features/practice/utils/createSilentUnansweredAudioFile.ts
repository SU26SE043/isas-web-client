/** Minimal valid mono PCM WAV (silence) for timeout / unanswered registration. */
export function createSilentUnansweredAudioFile(durationSec = 0.1): File {
  const sampleRate = 8000;
  const numSamples = Math.max(1, Math.floor(sampleRate * Math.max(0.01, durationSec)));
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  // PCM samples remain 0 (silence)

  return new File([buffer], `unanswered-${Date.now()}.wav`, { type: 'audio/wav' });
}
