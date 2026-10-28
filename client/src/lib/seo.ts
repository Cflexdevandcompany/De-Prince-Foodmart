export function setPageMetadata(title: string, description: string, image = 'https://deprincefoodmart.com/og-image.svg') {
  document.title = title;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute('content', description);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute('content', description);

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.setAttribute('content', image);
}

export function setStructuredData(data: Record<string, unknown>) {
  let script = document.querySelector('script[data-structured-data="true"]') as HTMLScriptElement | null;

  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'true');
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}
