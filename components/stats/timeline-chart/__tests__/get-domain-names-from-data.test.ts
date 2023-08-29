import {getDomainNamesFromData} from '../get-domain-names-from-data';
import {HourlyData} from '../get-hourly-data';
import {OTHER_BUCKET_STR} from '../../../../const/string';

describe('getDomainNamesFromData', () => {
  it('should exclude "id" and "total" from the result', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const testData = [
      {
        id: 1,
        total: 10,
        example1: 5,
        example2: 3,
      },
      {
        id: 2,
        total: 8,
        example1: 3,
        example3: 2,
      },
    ] as HourlyData[];

    const result = getDomainNamesFromData(testData);
    expect(result).not.toContain('id');
    expect(result).not.toContain('total');
  });

  it('should extract unique domain names from the data', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const testData = [
      {
        id: 1,
        total: 10,
        example1: 5,
        example2: 3,
      },
      {
        id: 2,
        total: 8,
        example1: 3,
        example3: 2,
      },
    ] as HourlyData[];

    const result = getDomainNamesFromData(testData);
    expect(result).toEqual(expect.arrayContaining(['example1', 'example2', 'example3']));
    expect(result.length).toBe(3);
  });

  it('should always have OTHER_BUCKET_STR as the first element when present', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const testData = [
      {
        id: 1,
        [OTHER_BUCKET_STR]: 7,
        example1: 5,
        example2: 3,
      },
      {
        id: 2,
        [OTHER_BUCKET_STR]: 6,
        example1: 3,
        example3: 2,
      },
    ] as HourlyData[];

    const result = getDomainNamesFromData(testData);
    expect(result[0]).toBe(OTHER_BUCKET_STR);
  });

  it('should sort other domain names based on their overall totals', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const testData = [
      {
        id: 1,
        example1: 5,
        example2: 8,
        example3: 3,
      },
      {
        id: 2,
        example1: 4,
        example2: 2,
        example3: 6,
      },
    ] as HourlyData[];

    const result = getDomainNamesFromData(testData);
    expect(result).toEqual(['example1', 'example3', 'example2']); // example1 has total 9, example3 has total 9, example2 has total 10
  });
});
