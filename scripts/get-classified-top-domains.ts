import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import {DOMAIN_TAGS} from '../utils/classification/domains-tags';

const classifiedDomains = Object.keys(DOMAIN_TAGS);
const excludedDomains = ['googleusercontent.com', 'amazonaws.com', '.vercel.app', '.specha.co'];
const globalTopDomainsCsv = readFileSync(join(__dirname, './top-1m-domains.csv'), 'utf8');
const globalTopDomains = globalTopDomainsCsv.split('\n').map((line) => line.split(',')[0]);

const classifiedTopDomains = globalTopDomains.filter((domain) => {
  if (excludedDomains.some((excluded) => domain.includes(excluded))) {
    return false;
  }
  return classifiedDomains.includes(domain);
});

console.log('Classified top domains:', classifiedTopDomains.length);

// Save JSON
const classifiedTopDomainsPath = join(__dirname, './classified-top-domains.json');
writeFileSync(classifiedTopDomainsPath, JSON.stringify(classifiedTopDomains, null, 2));
