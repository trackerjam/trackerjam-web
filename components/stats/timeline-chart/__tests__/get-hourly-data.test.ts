import {getHourlyData} from '../get-hourly-data';
import {MemberStatisticActivityType} from '../../../../types/api';

// Example test data
const sessions: MemberStatisticActivityType[] = [
  {
    id: 'test-id1',
    type: 'WEBSITE',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    date: '2023-07-27T00:00:00.000Z',
    domainId: 'test-domain-id1',
    memberToken: 'test-member-token1',
    timeSpent: 120000,
    activitiesCount: 2,
    sessionActivities: [
      {
        id: 'test-activity-id1',
        domainActivityId: 'test-domain-activity-id1',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        startDatetime: '2023-07-27T00:00:00.000Z',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        endDatetime: '2023-07-27T00:01:00.000Z',
        url: 'https://www.google.com/',
        title: 'Google',
        docTitle: '',
        isHTTPS: true,
      },
      {
        id: 'test-activity-id2',
        domainActivityId: 'test-domain-activity-id2',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        startDatetime: '2023-07-27T00:01:00.000Z',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        endDatetime: '2023-07-27T00:02:00.000Z',
        url: 'https://www.google.com/',
        title: 'Google',
        docTitle: '',
        isHTTPS: true,
      },
    ],
    domainName: 'google.com',
  },
  {
    id: 'test-id2',
    type: 'WEBSITE',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    date: '2023-07-27T00:00:00.000Z',
    domainId: 'test-domain-id2',
    memberToken: 'test-member-token2',
    timeSpent: 120000,
    activitiesCount: 1,
    sessionActivities: [
      {
        id: 'test-activity-id3',
        domainActivityId: 'test-domain-activity-id3',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        startDatetime: '2023-07-27T01:00:00.000Z',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        endDatetime: '2023-07-27T01:02:00.000Z',
        url: 'https://www.bing.com/',
        title: 'Bing',
        docTitle: '',
        isHTTPS: true,
      },
    ],
    domainName: 'bing.com',
  },
];

describe('getHourlyData', () => {
  it('should calculate hourly data correctly', () => {
    const result = getHourlyData(sessions);

    // google.com has 2 minutes activity in the 00 hour
    expect(result[0]['google.com']).toBe(2);
    // bing.com has no activity in the 00 hour
    expect(result[0]['bing.com']).toBeUndefined();

    // google.com has no activity in the 01 hour
    expect(result[1]['google.com']).toBeUndefined();
    // bing.com has 2 minutes activity in the 01 hour
    expect(result[1]['bing.com']).toBe(2);
  });
});
