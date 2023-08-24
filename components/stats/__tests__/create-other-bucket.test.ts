import {createOtherBucket, KEEP_TOP_ITEMS} from '../utils/create-other-bucket';
import {OTHER_BUCKET_STR} from '../../../const/string';
import {type AggregatedDataType} from '../types';

describe('createOtherBucket', () => {
  // Sample data for testing
  const generateSampleData = (num: number): AggregatedDataType[] => {
    return Array.from({length: num}).map((_, idx) => ({
      id: `item-${idx}`,
      label: `item-label-${idx}`,
      value: idx * 10,
      sessionCount: idx,
      lastSession: idx === 5 ? null : Date.now() - idx * 1000, // making the 6th item null for variation
    }));
  };

  it('should return the same array if length is less than KEEP_TOP_ITEMS', () => {
    const items = generateSampleData(KEEP_TOP_ITEMS - 1);

    const result = createOtherBucket(items);
    expect(result).toEqual(items);
  });

  it('should return the same array if length is exactly KEEP_TOP_ITEMS', () => {
    const items = generateSampleData(KEEP_TOP_ITEMS);

    const result = createOtherBucket(items);
    expect(result).toEqual(items);
  });

  it('should aggregate items beyond KEEP_TOP_ITEMS into "Other" bucket', () => {
    const items = generateSampleData(KEEP_TOP_ITEMS + 5);

    const result = createOtherBucket(items);

    // Check that the result contains only KEEP_TOP_ITEMS + 1 items
    expect(result.length).toBe(KEEP_TOP_ITEMS + 1);

    // Check that the last item is the "Other" bucket
    const otherBucket = result[KEEP_TOP_ITEMS];
    expect(otherBucket.id).toBe(OTHER_BUCKET_STR);
    expect(otherBucket.label).toBe(OTHER_BUCKET_STR);

    // Check aggregated values
    const aggregatedValue = items.slice(KEEP_TOP_ITEMS).reduce((acc, item) => acc + item.value, 0);
    expect(otherBucket.value).toBe(aggregatedValue);
  });

  it('should correctly handle null lastSession values', () => {
    const items = generateSampleData(KEEP_TOP_ITEMS + 5);

    const result = createOtherBucket(items);

    const otherBucket = result[KEEP_TOP_ITEMS];
    const aggregatedLastSession = items
      .slice(KEEP_TOP_ITEMS)
      .reduce((max, item) => Math.max(max, item.lastSession || 0), 0);

    expect(otherBucket.lastSession).toBe(aggregatedLastSession);
  });
});
