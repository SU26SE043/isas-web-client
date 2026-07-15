export const DEFAULT_MOCK_DELAY_MS = 400;

export function mockDelay(ms = DEFAULT_MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
