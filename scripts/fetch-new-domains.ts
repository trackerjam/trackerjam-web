import {writeFileSync} from 'fs';
import {join} from 'path';
import {PrismaClient} from '@prisma/client';
import {DOMAIN_TAGS} from '../utils/classification/domains-tags';

const classifiedDomains = Object.keys(DOMAIN_TAGS);

const prismadb = new PrismaClient();
async function fetchNewDomains() {
  const domainRecords = await prismadb.domain.findMany({});
  const domains = domainRecords.map((record: any) => record.domain);

  const unClassifiedDomains = domains.filter(
    (domain: string) => !classifiedDomains.includes(domain)
  );
  unClassifiedDomains.sort();

  console.log('Classified domains:', classifiedDomains.length);
  console.log('Total domains in DB:', domains.length);
  console.log('Found unclassified domains:', unClassifiedDomains.length);

  writeFileSync(
    join(__dirname, '/unclassified-domains.txt'),
    unClassifiedDomains.join('\n'),
    'utf8'
  );
}

fetchNewDomains();
