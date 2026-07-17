import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { formatJobCategoryDisplay } from '@/shared/domain/jobDomains';
import { profileService } from '../services/profile.service';
import type { CvAnalysisResult } from '@/features/cv-analysis/types/cvAnalysis.types';
import type { CandidateProfile } from '../types/profile.types';

interface CvProfileMappingPanelProps {
  result: CvAnalysisResult;
}

type MappingSection = keyof Pick<CandidateProfile, 'careerGoal' | 'skills'>;

const DEFAULT_SECTIONS: Record<MappingSection, boolean> = {
  careerGoal: true,
  skills: true,
};

export const CvProfileMappingPanel: React.FC<CvProfileMappingPanelProps> = ({ result }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [isApplying, setIsApplying] = useState(false);

  const mappingPreview = useMemo(() => {
    const payload: Partial<CandidateProfile> = {};
    if (sections.careerGoal) {
      payload.careerGoal = {
        targetRole: formatJobCategoryDisplay(result.jobCategory, 'en'),
        targetIndustry: t('profile.mapping.defaultIndustry'),
        summary: result.summary || t('profile.mapping.importSummary').replace('{id}', result.id),
      };
    }
    if (sections.skills) {
      payload.skills = result.strengths.map((name, index) => ({
        id: `cv-skill-${index}`,
        name,
        level: 'intermediate',
      }));
    }
    return payload;
  }, [result, sections, t]);

  const selectedCount = Object.values(sections).filter(Boolean).length;

  const toggleSection = (key: MappingSection) => {
    setSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleApply = async () => {
    if (selectedCount === 0) {
      toast.error(t('profile.mapping.nothingSelected'));
      return;
    }

    setIsApplying(true);
    try {
      await profileService.applyCvMapping(mappingPreview, { merge: true });
      toast.success(t('profile.mapping.applied'));
      navigate('/candidate/profile');
    } finally {
      setIsApplying(false);
    }
  };

  const sectionRows: Array<{ key: MappingSection; count: number; label: string }> = [
    { key: 'careerGoal', count: sections.careerGoal ? 1 : 0, label: t('profile.mapping.careerGoal') },
    {
      key: 'skills',
      count: sections.skills ? result.strengths.length : 0,
      label: t('profile.mapping.skills'),
    },
  ];

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('profile.mapping.title')}</h2>
      <p className="body-text mt-2">{t('profile.mapping.subtitle')}</p>

      <ul className="mt-4 space-y-3">
        {sectionRows.map((row) => (
          <li key={row.key}>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-default"
                checked={sections[row.key]}
                onChange={() => toggleSection(row.key)}
              />
              <span>
                <span className="font-medium text-foreground">{row.label}</span>
                <span className="text-muted-foreground"> · {row.count}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <p className="text-caption mt-4 text-muted-foreground">{t('profile.mapping.mergeHint')}</p>

      <button
        type="button"
        className="btn-primary mt-4"
        onClick={() => void handleApply()}
        disabled={isApplying || selectedCount === 0}
      >
        {isApplying ? t('profile.common.saving') : t('profile.mapping.apply')}
      </button>
    </section>
  );
};
