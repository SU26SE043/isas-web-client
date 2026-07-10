const MAX_CV_BYTES = 10 * 1024 * 1024;
const ALLOWED_CV_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_CV_EXTENSIONS = /\.(pdf|docx?)$/i;

export function validateCvFile(file: File): 'ok' | 'invalidType' | 'invalidSize' {
  const hasValidType = ALLOWED_CV_TYPES.has(file.type) || ALLOWED_CV_EXTENSIONS.test(file.name);
  if (!hasValidType) return 'invalidType';
  if (file.size > MAX_CV_BYTES) return 'invalidSize';
  return 'ok';
}
