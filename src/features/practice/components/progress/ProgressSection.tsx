import type { ReactNode } from 'react';

export function ProgressSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <h2 className="heading-secondary text-lg text-foreground sm:text-xl">{title}</h2>
      <div>{children}</div>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </section>
  );
}
