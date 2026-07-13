import type { Transition, Variants } from 'framer-motion';

const EASE = [0.4, 0, 0.2, 1] as const;
const SLIDE_OFFSET = 56;

export function modalTransition(reducedMotion: boolean | null): Transition {
  return { duration: reducedMotion ? 0.01 : 0.45, ease: EASE };
}

export function panelTransition(reducedMotion: boolean | null): Transition {
  return { duration: reducedMotion ? 0.01 : 0.7, ease: EASE };
}

export function formTransition(reducedMotion: boolean | null): Transition {
  return { duration: reducedMotion ? 0.01 : 0.7, ease: EASE };
}

export function backdropVariants(reducedMotion: boolean | null): Variants {
  return {
    hidden: {
      opacity: 0,
      backdropFilter: reducedMotion ? 'blur(0px)' : 'blur(0px)',
    },
    visible: {
      opacity: 1,
      backdropFilter: reducedMotion ? 'blur(0px)' : 'blur(12px)',
    },
  };
}

export function modalShellVariants(reducedMotion: boolean | null): Variants {
  return {
    hidden: {
      opacity: 0,
      scale: reducedMotion ? 1 : 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
    },
  };
}

export function signInFormVariants(reducedMotion: boolean | null): Variants {
  const offset = reducedMotion ? 0 : SLIDE_OFFSET;
  return {
    active: {
      x: 0,
      opacity: 1,
      pointerEvents: 'auto',
      transition: formTransition(reducedMotion),
    },
    hiddenLeft: {
      x: -offset,
      opacity: 0,
      pointerEvents: 'none',
      transition: formTransition(reducedMotion),
    },
  };
}

export function signUpFormVariants(reducedMotion: boolean | null): Variants {
  const offset = reducedMotion ? 0 : SLIDE_OFFSET;
  return {
    active: {
      x: 0,
      opacity: 1,
      pointerEvents: 'auto',
      transition: formTransition(reducedMotion),
    },
    hiddenRight: {
      x: offset,
      opacity: 0,
      pointerEvents: 'none',
      transition: formTransition(reducedMotion),
    },
  };
}

export function forgotPasswordFormVariants(reducedMotion: boolean | null): Variants {
  const offset = reducedMotion ? 0 : SLIDE_OFFSET;
  return {
    active: {
      x: 0,
      opacity: 1,
      pointerEvents: 'auto',
      transition: formTransition(reducedMotion),
    },
    hiddenRight: {
      x: offset,
      opacity: 0,
      pointerEvents: 'none',
      transition: formTransition(reducedMotion),
    },
  };
}

export function overlayPanelVariants(reducedMotion: boolean | null): Variants {
  return {
    active: {
      opacity: 1,
      x: 0,
      pointerEvents: 'auto',
      transition: formTransition(reducedMotion),
    },
    inactive: (direction: number) => ({
      opacity: 0,
      x: reducedMotion ? 0 : direction * 20,
      pointerEvents: 'none',
      transition: formTransition(reducedMotion),
    }),
  };
}
