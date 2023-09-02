export function anonymizeIp(ip: string) {
  if (isIPv4(ip)) {
    return anonymizeIPv4(ip);
  } else if (isIPv6(ip)) {
    return anonymizeIPv6(ip);
  }
  return ip;
}

function isIPv4(ip: string) {
  const parts = ip.split('.');
  return (
    parts.length === 4 &&
    parts.every((segment) => {
      const num = parseInt(segment, 10);
      return num >= 0 && num <= 255;
    })
  );
}

function anonymizeIPv4(ip: string) {
  const parts = ip.split('.');
  parts[2] = 'xxx';
  parts[3] = 'xxx';
  return parts.join('.');
}

function isIPv6(ip: string) {
  const parts = ip.split(':');
  return parts.length <= 8 && parts.every((segment) => /^[0-9a-fA-F]{0,4}$/.test(segment));
}

function anonymizeIPv6(ip: string) {
  const parts = ip.split(':');
  const len = parts.length;
  for (let i = Math.floor(len / 2); i < len; i++) {
    parts[i] = '****';
  }
  return parts.join(':');
}
