import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva('relative w-full rounded-lg border px-4 py-3 text-sm', {
  variants: {
    variant: {
      default: 'border-border bg-surface-raised text-foreground',
      success: 'border-success/30 bg-success-bg text-foreground',
      error: 'border-error/30 bg-error-bg text-foreground',
      warning: 'border-warning/30 bg-warning-bg text-foreground',
      info: 'border-info/30 bg-info-bg text-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div role="alert" data-slot="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 className={cn('mb-1 font-medium leading-none', className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
