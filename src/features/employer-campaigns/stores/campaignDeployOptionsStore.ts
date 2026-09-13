import { create } from 'zustand';

/**
 * Lựa chọn "Mở ngay khi triển khai" (T13 R2) — kênh nối giữa bước Review (nơi HR tick và nơi
 * biết campaign có ca hay không) và `useCampaignWizard.handleFinalSubmit` (nơi gọi deploy).
 *
 * Vì sao là store chứ không phải prop: bước Review được mount ở `CampaignWizardStepContent`
 * (file thuộc FE-A) và không có prop nào mang setter xuống; đi vòng qua đó là chạm vùng
 * người khác. Store nhỏ, scope theo `key` (`startNowChoiceKey`) nên lựa chọn của lượt wizard
 * này không rò sang campaign khác.
 */
interface CampaignDeployOptionsStore {
  key: string | null;
  /** HR tick tường minh; `null` = chưa đụng ⇒ mặc định D-6 (`defaultStartNow`). */
  choice: boolean | null;
  /** Bước Review thấy blocker (có ca / đã tới giờ) ⇒ deploy KHÔNG gửi start-now. */
  blocked: boolean;
  setChoice: (key: string, choice: boolean) => void;
  setBlocked: (key: string, blocked: boolean) => void;
  reset: () => void;
}

const initial = { key: null, choice: null, blocked: false } as const;

export const useCampaignDeployOptionsStore = create<CampaignDeployOptionsStore>((set) => ({
  ...initial,
  setChoice: (key, choice) =>
    set((state) => ({ key, choice, blocked: state.key === key ? state.blocked : false })),
  setBlocked: (key, blocked) =>
    set((state) => ({ key, blocked, choice: state.key === key ? state.choice : null })),
  reset: () => set({ ...initial }),
}));

/** Đọc ngoài React (trong callback deploy) — chỉ trả dữ liệu của ĐÚNG key, khác key coi như chưa đụng. */
export function readCampaignDeployOptions(key: string): { choice: boolean | null; blocked: boolean } {
  const state = useCampaignDeployOptionsStore.getState();
  if (state.key !== key) return { choice: null, blocked: false };
  return { choice: state.choice, blocked: state.blocked };
}
