import {getBestTag} from '../best-tag';
import {TAG_PRODUCTIVITY_SCORE} from './score';

export function getProductivityScore(domainTags: {[tag: string]: number}) {
  const mainTag = getBestTag(domainTags);
  return TAG_PRODUCTIVITY_SCORE[mainTag] ?? 0.5;
}
