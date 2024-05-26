import {writeFileSync} from 'fs';
import {resolve} from 'path';
import domainTagsJson from '../utils/classification/domain-tags.json';
import newClassifiedDomains from './classified.json';

console.info('Loaded already classified:', Object.keys(domainTagsJson).length);
console.info('Loaded new classified domains:', Object.keys(newClassifiedDomains).length);

const combinedDomains = {
  ...domainTagsJson,
  ...newClassifiedDomains,
};

console.info('Combined domains:', Object.keys(combinedDomains).length);
console.info('\tAdded:', Object.keys(combinedDomains).length - Object.keys(domainTagsJson).length);

writeFileSync(
  resolve(__dirname, '../utils/classification/domain-tags.json'),
  JSON.stringify(combinedDomains, null, 2),
  'utf8'
);
