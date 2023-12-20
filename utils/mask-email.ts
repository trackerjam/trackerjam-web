export function maskEmailAddress(email: string): string {
  const [localPart, domainPart] = email.split('@');

  // Check if the email structure is valid
  if (!localPart || !domainPart) {
    return 'Invalid email';
  }

  // Handle short local part
  let maskedLocalPart = localPart;
  if (localPart.length >= 4) {
    maskedLocalPart = localPart.substring(0, 3) + '***' + localPart.substring(localPart.length - 1);
  } else {
    maskedLocalPart = localPart.substring(0, 1) + '***';
  }

  // Handle short domain part
  const domainSections = domainPart.split('.');
  let maskedDomain = domainSections[0];
  if (maskedDomain.length > 1) {
    maskedDomain = maskedDomain[0] + '***';
  } else {
    maskedDomain += '***';
  }

  // Reconstruct the email
  return maskedLocalPart + '@' + maskedDomain + '.' + domainSections.slice(1).join('.');
}
