import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { profileService } from '../services/profile.service';
import type { CvAnalysisResult } from '@/features/cv-analysis/types/cvAnalysis.types';

interface CvProfileMappingPanelProps {
  result: CvAnalysisResult;
}

export const CvProfileMappingPanel: React.FC<CvProfileMappingPanelProps> = ({ result }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await profileService.applyCvMapping({
        careerGoal: {
          targetRole: result.jobTitle,
          targetIndustry: 'Technology',
          summary: `Imported from CV analysis (${result.id})`,
        },
        skills: result.skills.map((skill, index) => ({
          id: `cv-skill-${index}`,
          name: skill.name,
          level: 'intermediate',
        })),
        experiences: result.experiences.map((exp, index) => ({
          id: `cv-exp-${index}`,
          company: exp.company,
          title: exp.title,
          startDate: exp.period.split(' - ')[0] ?? exp.period,
          endDate: exp.period.split(' - ')[1],
          isCurrent: exp.period.toLowerCase().includes('present'),
          description: exp.description,
        })),
        education: [{
          id: 'cv-edu-1',
          school: result.education.school,
          degree: result.education.degree,
          fieldOfStudy: result.education.degree,
          startDate: result.education.period.split(' - ')[0] ?? result.education.period,
          endDate: result.education.period.split(' - ')[1],
          isCurrent: false,
        }],
        portfolio: result.projects.map((project, index) => ({
          id: `cv-proj-${index}`,
          title: project.title,
          description: project.description,
          techStack: project.techStack,
        })),
      });
      toast.success(t('profile.mapping.applied'));
      navigate('/candidate/profile');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('profile.mapping.title')}</h2>
      <p className="body-text mt-2">{t('profile.mapping.subtitle')}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>{t('profile.mapping.skills')}: {result.skills.length}</li>
        <li>{t('profile.mapping.experience')}: {result.experiences.length}</li>
        <li>{t('profile.mapping.education')}: 1</li>
        <li>{t('profile.mapping.projects')}: {result.projects.length}</li>
      </ul>
      <button type="button" className="btn-primary mt-4" onClick={() => void handleApply()} disabled={isApplying}>
        {isApplying ? t('profile.common.saving') : t('profile.mapping.apply')}
      </button>
    </section>
  );
};
