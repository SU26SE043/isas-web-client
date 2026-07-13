import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { statusMessageVariants } from './authModal.animations';

interface AuthFormStatusProps {
  message: string;
  variant: 'error' | 'success' | 'neutral';
  reducedMotion: boolean | null;
}

export const AuthFormStatus: React.FC<AuthFormStatusProps> = ({
  message,
  variant,
  reducedMotion,
}) => {
  if (!message) {
    return <div className="min-h-5" aria-live="polite" />;
  }

  return (
    <motion.p
      role="alert"
      aria-live="polite"
      className={cn(
        'min-h-5 text-center text-xs font-medium',
        variant === 'error' && 'text-error',
        variant === 'success' && 'text-foreground',
        variant === 'neutral' && 'text-muted-foreground',
      )}
      variants={statusMessageVariants(reducedMotion)}
      initial="hidden"
      animate="visible"
    >
      {message}
    </motion.p>
  );
};
