import { afterEach, describe, expect, it, vi } from 'vitest';
import { usesMockData } from './config';

describe('usesMockData', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps practice on live APIs outside automated browsers', () => {
    vi.stubGlobal('navigator', { webdriver: false });
    expect(usesMockData('practice')).toBe(false);
    expect(usesMockData('cv-analysis')).toBe(false);
    expect(usesMockData('payment')).toBe(true);
  });

  it('forces practice mocks under Playwright webdriver without changing other live domains', () => {
    vi.stubGlobal('navigator', { webdriver: true });
    expect(usesMockData('practice')).toBe(true);
    expect(usesMockData('cv-analysis')).toBe(false);
  });
});
