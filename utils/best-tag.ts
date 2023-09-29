import {DomainTags} from '../types/api';
import {TAG} from './classification/tags';

export function getBestTag(tags: DomainTags): string {
  if (!tags) return TAG.Other;

  const sortedTags = Object.entries(tags).sort((a, b) => b[1] - a[1]);
  return sortedTags?.[0]?.[0] || TAG.Other;
}
