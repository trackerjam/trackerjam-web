import {DomainTags} from '../../types/api';
import domainTagsJson from './domain-tags.json';

type DomainTagsStruct = {
  [domain: string]: DomainTags;
};

export const DOMAIN_TAGS: DomainTagsStruct = {
  ...domainTagsJson,
};
