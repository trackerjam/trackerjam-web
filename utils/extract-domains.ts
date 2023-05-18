export function extractDomains(text: string) {
  return text
    .split(/[\s,\n]+/)
    .map((domain) => domain.trim())
    .filter((domain) => domain !== '');
}
