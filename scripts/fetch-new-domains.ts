import {writeFileSync, readFileSync} from 'fs';
import {join} from 'path';
import {PrismaClient} from '@prisma/client';
import {DOMAIN_TAGS} from '../utils/classification/domains-tags';
import {isIp} from '../utils/is-ip';

const classifiedDomains = Object.keys(DOMAIN_TAGS);
const excludedDomains = ['googleusercontent.com', 'amazonaws.com', '.vercel.app', '.specha.co'];
const globalTopDomainsCsv = readFileSync(join(__dirname, './top-1m-domains.csv'), 'utf8');
const globalTopDomains = globalTopDomainsCsv.split('\n').map((line) => line.split(',')[0]);

const prismadb = new PrismaClient();

async function fetchNewDomains() {
  const domainRecords = await prismadb.domain.findMany({});
  const domains = domainRecords.map((record: any) => record.domain);

  const unClassifiedDomains = Array.from(
    new Set(
      domains
        .filter((domain) => !isIp(domain))
        .map((domain) => {
          const tld = domain.toLowerCase();
          if (tld.split('.').length > 2) {
            return tld.split('.').slice(-2).join('.');
          }
          return tld;
        })
    )
  ).filter((domain: string) => {
    return !classifiedDomains.includes(domain) && !excludedDomains.some((d) => domain.endsWith(d));
  });

  const unClassifiedDomainsToClassify = unClassifiedDomains.filter((domain) =>
    globalTopDomains.includes(domain)
  );
  const unknownDomains = Object.entries(DOMAIN_TAGS)
    .reduce((acc, [domain, tags]) => {
      if (tags.Unknown === 1 || tags.Other === 1) {
        acc.push(domain);
      }
      return acc;
    }, [] as string[])
    .filter((domain) => !excludedDomains.some((d) => domain.endsWith(d)));

  unClassifiedDomains.sort();

  console.log('Classified domains:', classifiedDomains.length);
  console.log('Total domains in DB:', domains.length);
  console.log('Found not yet classified domains:', unClassifiedDomains.length);
  console.log('\t Out of which to classify:', unClassifiedDomainsToClassify.length);
  console.log('Found classified but unknown domains:', unknownDomains.length);

  writeFileSync(
    join(__dirname, '/domains-to-classify.txt'),
    unClassifiedDomainsToClassify.join('\n'),
    'utf8'
  );

  // If you want to save unknown domains to a file, uncomment the following line
  // writeFileSync(join(__dirname, '/unknown-domains.txt'), unknownDomains.join('\n'), 'utf8');
}

fetchNewDomains();
