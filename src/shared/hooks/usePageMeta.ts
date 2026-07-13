import { useEffect } from 'react';

export interface PageMeta {
  title: string;
  description?: string;
  image?: string;
}

const DEFAULT_OG_IMAGE = '/logo-pi-favicon.png';

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => {
      if (key !== 'content') {
        element?.setAttribute(key, value);
      }
    });
    document.head.appendChild(element);
  }

  if (attributes.content) {
    element.setAttribute('content', attributes.content);
  }
}

function setMeta(name: string, content: string | undefined, attribute: 'name' | 'property' = 'name') {
  if (!content) {
    return;
  }

  upsertMeta(`meta[${attribute}="${name}"]`, { [attribute]: name, content });
}

export function usePageMeta({ title, description, image }: PageMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:image', image ?? DEFAULT_OG_IMAGE, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, image]);
}
