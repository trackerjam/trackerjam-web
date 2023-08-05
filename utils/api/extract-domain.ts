export function extractTopLevelDomain(url: string): string | null {
  // TODO Handle file protocol
  try {
    const domain = new URL(url).hostname;

    // Remove 'www.' if present.
    const withoutWWW = domain.replace(/^www\./, '');

    // Split by dots and take the last two parts to get the top-level domain.
    const parts = withoutWWW.split('.');
    if (parts.length >= 2) {
      return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    }
    return withoutWWW; // It's a case like 'localhost' or custom top-level domain.
  } catch (error) {
    return null;
  }
}
