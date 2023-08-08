export function extractDomain(url: string): string | null {
  try {
    const urlObject = new URL(url);
    const domain = urlObject.hostname;

    if (urlObject.protocol === 'file:') {
      return 'Local File';
    }

    return domain.replace(/^www\./, '').toLocaleLowerCase();
  } catch (error) {
    return null;
  }
}
