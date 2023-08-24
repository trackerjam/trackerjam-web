import {type AggregatedDataType} from '../types';
import {OTHER_BUCKET_STR} from '../../../const/string';

export const KEEP_TOP_ITEMS = 10;

export function createOtherBucket(items: AggregatedDataType[]): AggregatedDataType[] {
  // If there are KEEP_TOP_ITEMS or fewer items, simply return the items
  if (items.length <= KEEP_TOP_ITEMS) return items;

  // Split into top and the rest
  const top = items.slice(0, KEEP_TOP_ITEMS);
  const rest = items.slice(KEEP_TOP_ITEMS);

  // Create "Other" bucket from the rest
  const otherBucket = rest.reduce(
    (acc, item) => {
      acc.value += item.value;
      acc.sessionCount = (acc.sessionCount || 0) + (item.sessionCount || 0);
      acc.lastSession = Math.max(acc.lastSession || 0, item.lastSession || 0);
      return acc;
    },
    {
      id: OTHER_BUCKET_STR,
      label: OTHER_BUCKET_STR,
      value: 0,
      sessionCount: 0,
      lastSession: 0,
    } as AggregatedDataType
  );

  return [...top, otherBucket];
}
