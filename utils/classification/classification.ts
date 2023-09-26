import {DOMAIN_TAGS} from './domains-tags';
import {TAG} from './tags';
export function classifyDomain(domain: string) {
  // Try the dull domain first
  if (DOMAIN_TAGS[domain]) {
    return DOMAIN_TAGS[domain];
  }
  // Try the domain without the subdomain if it is looks like a subdomain
  if (domain.split('.').length > 2) {
    const domainWithoutSubdomain = domain.split('.').slice(-2).join('.');
    if (DOMAIN_TAGS[domainWithoutSubdomain]) {
      return DOMAIN_TAGS[domainWithoutSubdomain];
    }
  }
  return {
    [TAG.Other]: 1,
  };
}
