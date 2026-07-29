const PRACTICE_SESSION_GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidPracticeSessionId(value: string | null | undefined): value is string {
  return Boolean(value && PRACTICE_SESSION_GUID_PATTERN.test(value));
}
