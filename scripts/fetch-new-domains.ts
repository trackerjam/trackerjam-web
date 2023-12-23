import {writeFileSync} from 'fs';
import {join} from 'path';
import {PrismaClient} from '@prisma/client';
import {DOMAIN_TAGS} from '../utils/classification/domains-tags';
import {isIp} from '../utils/is-ip';

const classifiedDomains = Object.keys(DOMAIN_TAGS);

const excludedDomains = ['googleusercontent.com', 'amazonaws.com'];

const prismadb = new PrismaClient();
async function fetchNewDomains() {
  const domainRecords = await prismadb.domain.findMany({});
  const domains = domainRecords.map((record: any) => record.domain);

  const newDomains = domains.filter((domain: string) => {
    return !classifiedDomains.includes(domain) && !excludedDomains.some((d) => domain.endsWith(d));
  });
  const unClassifiedDomains = Array.from(new Set(newDomains.filter((domain) => !isIp(domain))));

  newDomains.sort();

  console.log('Classified domains:', classifiedDomains.length);
  console.log('Total domains in DB:', domains.length);
  console.log('Excluded IP addresses:', newDomains.length - unClassifiedDomains.length);
  console.log('Found unclassified domains:', unClassifiedDomains.length);

  writeFileSync(
    join(__dirname, '/unclassified-domains.txt'),
    unClassifiedDomains.join('\n'),
    'utf8'
  );
}

fetchNewDomains();
