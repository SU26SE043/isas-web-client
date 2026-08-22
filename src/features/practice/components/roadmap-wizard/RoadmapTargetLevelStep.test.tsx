// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoadmapTargetLevelStep } from './RoadmapTargetLevelStep';
import { ROADMAP_TARGET_LEVELS } from '../../mocks/practiceSetup.fixtures';
import { resolveApiRoadmapLevel } from '../../services/learning.service';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

afterEach(cleanup);

function renderStep() {
  return render(
    <RoadmapTargetLevelStep
      selectedLevel=""
      onSelect={vi.fn()}
      onBack={vi.fn()}
      onNext={vi.fn()}
    />,
  );
}

describe('RoadmapTargetLevelStep', () => {
  // Backend chỉ có `RoadmapLevel { Fresher, Junior, Middle, Senior }`. Bất kỳ lựa chọn nào ngoài
  // bốn cái đó sẽ bị `resolveApiRoadmapLevel` nén xuống TRONG IM LẶNG — người dùng chọn "Thực tập"
  // và nhận lộ trình dán nhãn "Mới tốt nghiệp", khác độ khó câu hỏi lẫn độ sâu bài giảng, không
  // một cảnh báo nào. Đã xảy ra thật trên deploy. Test này khoá lại để nó không quay về.
  it('chỉ chào bán đúng những cấp độ backend thật sự có', () => {
    expect([...ROADMAP_TARGET_LEVELS]).toEqual(['fresher', 'junior', 'middle', 'senior']);
  });

  it('không lựa chọn nào bị ánh xạ sang một cấp độ KHÁC chính nó', () => {
    for (const level of ROADMAP_TARGET_LEVELS) {
      // resolveApiRoadmapLevel trả 'Fresher' | 'Junior' | ... — so không phân biệt hoa thường.
      expect(resolveApiRoadmapLevel(level).toLowerCase()).toBe(level);
    }
  });

  it('mỗi ô nói rõ cấp độ đó nghĩa là gì, không chỉ có tên trơ', () => {
    renderStep();
    for (const level of ROADMAP_TARGET_LEVELS) {
      expect(screen.getByText(`practice.roadmapWizard.level.${level}`)).toBeInTheDocument();
      expect(screen.getByText(`practice.roadmapWizard.level.${level}.desc`)).toBeInTheDocument();
    }
  });
});
