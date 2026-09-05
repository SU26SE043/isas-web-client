import { describe, expect, it } from 'vitest';

const sourceFiles = import.meta.glob('/src/**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const read = (path: string) => sourceFiles[`/${path}`];
describe('UX2 F3 state surfaces', () => {
  it('distinguishes AI and HR question badges', () => {
    const source = read('src/features/employer-campaigns/components/wizard/questions/CampaignQuestionCard.tsx');
    expect(source).toContain("bg-foreground text-background");
    expect(source).toContain("bg-surface-base text-muted-foreground");
    expect(source).not.toMatch(/bg-white\/\[[0-9.]+\]/);
  });
  it('uses visible light state surfaces for selected tabs and drag states', () => {
    expect(read('src/features/employer-campaigns/components/wizard/jd/JobDescriptionMethodTabs.tsx')).toContain('bg-foreground text-background');
    expect(read('src/features/employer-campaigns/components/wizard/jd/CampaignFilePanel.tsx')).toContain('bg-surface-overlay');
    expect(read('src/features/profile/components/profile-view/ProfileFileUploadCard.tsx')).toContain('bg-surface-overlay');
  });
});
