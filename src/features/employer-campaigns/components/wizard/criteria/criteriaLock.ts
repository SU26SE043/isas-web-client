/**
 * Vì sao bảng tiêu chí bị khoá. `disabled` một mình KHÔNG đủ để giải thích: ở
 * `CampaignCriteriaStepV2` nó là `!customized || isSaving` — hai nguyên nhân khác hẳn
 * nhau, cách gỡ cũng khác. Không truyền prop này thì chỉ nói "đang khoá" chứ không
 * đoán bừa; chỉ sai nguyên nhân còn tệ hơn không nói gì.
 *
 * Sống ở thư mục `criteria/` chứ không ở `CampaignCriteriaManualList` vì popup chi tiết
 * cũng cần nó — để nguyên chỗ cũ thì list → card → modal → list thành vòng import.
 */
export type CriteriaLockReason = 'standard' | 'saving';

export function criteriaLockCopyKey(reason?: CriteriaLockReason): string {
  if (reason === 'saving') return 'employer.campaigns.wizard.rubric.lockedSaving';
  if (reason === 'standard') return 'employer.campaigns.wizard.rubric.lockedStandard';
  return 'employer.campaigns.wizard.rubric.lockedGeneric';
}
