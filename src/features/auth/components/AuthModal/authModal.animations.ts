import type { Transition, Variants } from 'framer-motion';

export const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_OFFSET = 48;

export function modalOpenTransition(reducedMotion: boolean | null): Transition {
  return {
    duration: reducedMotion ? 0.01 : 0.25,
    ease: PREMIUM_EASE,
  };
}

export function modalCloseTransition(reducedMotion: boolean | null): Transition {
  return {
    duration: reducedMotion ? 0.01 : 0.2,
    ease: PREMIUM_EASE,
  };
}

export function contentSwitchTransition(reducedMotion: boolean | null): Transition {
  return {
    duration: reducedMotion ? 0.01 : 0.42,
    ease: PREMIUM_EASE,
  };
}

export function heightTransition(reducedMotion: boolean | null): Transition {
  return {
    duration: reducedMotion ? 0.01 : 0.42,
    ease: PREMIUM_EASE,
  };
}

export function backdropVariants(reducedMotion: boolean | null): Variants {
  return {
    hidden: {
      opacity: 0,
      backdropFilter: reducedMotion ? 'blur(0px)' : 'blur(0px)',
    },
    visible: {
      opacity: 1,
      backdropFilter: reducedMotion ? 'blur(0px)' : 'blur(16px)',
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
    exit: {
      opacity: 0,
      scale: reducedMotion ? 1 : 0.97,
      transition: modalCloseTransition(reducedMotion),
    },
  };
}

export function contentSlideVariants(reducedMotion: boolean | null): Variants {
  const offset = reducedMotion ? 0 : SLIDE_OFFSET;
  return {
    enter: (direction: number) => ({
      x: direction * offset,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: contentSwitchTransition(reducedMotion),
    },
    exit: (direction: number) => ({
      x: direction * -offset,
      opacity: 0,
      transition: contentSwitchTransition(reducedMotion),
    }),
  };
}

export function statusMessageVariants(reducedMotion: boolean | null): Variants {
  return {
    hidden: { opacity: 0, y: -4 },
    visible: {
      opacity: 1,
      y: 0,
      x: reducedMotion ? 0 : [0, -3, 3, -2, 2, 0],
      transition: { duration: reducedMotion ? 0.01 : 0.35 },
    },
  };
}
