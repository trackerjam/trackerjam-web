export function shortenUUID(uuid: string): string {
  return uuid.substring(0, 5) + '...' + uuid.substring(uuid.length - 5, uuid.length);
}
