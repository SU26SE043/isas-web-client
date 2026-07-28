export type FlowWizardAccent = 'indigo' | 'blue' | 'emerald';

export const FLOW_WIZARD_ACCENT = {
  indigo: {
    markerActive: 'border-chart-cat-1 bg-chart-cat-1/15 text-chart-cat-1 shadow-[0_0_0_1px_rgb(129_140_248/0.35)]',
    labelActive: 'text-chart-cat-1',
    connectorComplete: 'bg-chart-cat-1/45',
    ringSelected: 'ring-chart-cat-1/50',
  },
  blue: {
    markerActive: 'border-info bg-info-bg text-info shadow-[0_0_0_1px_rgb(59_130_246/0.35)]',
    labelActive: 'text-info',
    connectorComplete: 'bg-info/45',
    ringSelected: 'ring-info/50',
  },
  emerald: {
    markerActive: 'border-success bg-success-bg text-success shadow-[0_0_0_1px_rgb(34_197_94/0.35)]',
    labelActive: 'text-success',
    connectorComplete: 'bg-success/45',
    ringSelected: 'ring-success/50',
  },
} as const satisfies Record<
  FlowWizardAccent,
  {
    markerActive: string;
    labelActive: string;
    connectorComplete: string;
    ringSelected: string;
  }
>;
