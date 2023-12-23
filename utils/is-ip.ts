export function isIp(address: string): boolean {
  const ipv4Pattern: RegExp = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern: RegExp = /^([\dA-Fa-f]{1,4}:){7}[\dA-Fa-f]{1,4}$/;

  return ipv4Pattern.test(address) || ipv6Pattern.test(address);
}
