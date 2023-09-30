import {SessionActivity} from '@prisma/client';
import {aggregateByDomain, aggregateSessionsByTitle} from '../hooks/use-aggregated-data';
import {AggregatedDataType} from '../types';
import {DateActivityData} from '../../../types/api';

describe('aggregateSessionsByTitle', () => {
  it('should aggregate session activities by title and sort by total length', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const sessionActivities = [
      {
        startDatetime: '2023-08-26T10:00:00.000Z',
        endDatetime: '2023-08-26T12:00:00.000Z',
        title: 'Activity 1',
      },
      {
        startDatetime: '2023-08-26T13:00:00.000Z',
        endDatetime: '2023-08-26T14:00:00.000Z',
        title: 'Activity 1',
      },
      {
        startDatetime: '2023-08-26T14:00:00.000Z',
        endDatetime: '2023-08-26T16:00:00.000Z',
        title: 'Activity 2',
      },
      {
        startDatetime: '2023-08-26T16:00:00.000Z',
        endDatetime: '2023-08-26T17:00:00.000Z',
      },
    ] as SessionActivity[];

    const result = aggregateSessionsByTitle({
      sessionActivities,
      domainName: 'example.com',
    });

    const expected: AggregatedDataType[] = [
      {
        id: 'Activity 1',
        label: 'Activity 1',
        value: 3 * 60 * 60 * 1000, // 3 hours in ms
        sessionCount: 2,
        domainName: 'example.com',
      },
      {
        id: 'Activity 2',
        label: 'Activity 2',
        value: 2 * 60 * 60 * 1000, // 2 hours in ms
        sessionCount: 1,
        domainName: 'example.com',
      },
      {
        id: '<Unknown>',
        label: '<Unknown>',
        value: 1 * 60 * 60 * 1000, // 1 hour in ms
        sessionCount: 1,
        domainName: 'example.com',
      },
    ];

    expect(result).toEqual(expected);
  });

  it('should handle no sessions', () => {
    const result = aggregateSessionsByTitle({
      sessionActivities: [],
      domainName: 'example.com',
    });

    expect(result).toEqual([]);
  });

  it('should aggregate all sessions without titles under <Unknown>', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const sessionActivities = [
      {
        startDatetime: '2023-08-26T10:00:00.000Z',
        endDatetime: '2023-08-26T11:00:00.000Z',
      },
      {
        startDatetime: '2023-08-26T12:00:00.000Z',
        endDatetime: '2023-08-26T13:00:00.000Z',
      },
    ] as SessionActivity[];

    const result = aggregateSessionsByTitle({
      sessionActivities,
      domainName: 'example.com',
    });

    const expected: AggregatedDataType[] = [
      {
        id: '<Unknown>',
        label: '<Unknown>',
        value: 2 * 60 * 60 * 1000, // 2 hours in ms
        sessionCount: 2,
        domainName: 'example.com',
      },
    ];

    expect(result).toEqual(expected);
  });

  it('should sort sessions correctly when all have the same duration', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const sessionActivities: SessionActivity[] = [
      {
        startDatetime: '2023-08-26T10:00:00.000Z',
        endDatetime: '2023-08-26T11:00:00.000Z',
        title: 'A',
      },
      {
        startDatetime: '2023-08-26T12:00:00.000Z',
        endDatetime: '2023-08-26T13:00:00.000Z',
        title: 'B',
      },
    ] as SessionActivity[];

    const result = aggregateSessionsByTitle({
      sessionActivities,
      domainName: 'example.com',
    });

    // As both have the same duration, we should expect it to retain the original order (i.e., A before B).
    const expected: AggregatedDataType[] = [
      {
        id: 'A',
        label: 'A',
        value: 1 * 60 * 60 * 1000, // 1 hour in ms
        sessionCount: 1,
        domainName: 'example.com',
      },
      {
        id: 'B',
        label: 'B',
        value: 1 * 60 * 60 * 1000, // 1 hour in ms
        sessionCount: 1,
        domainName: 'example.com',
      },
    ];

    expect(result).toEqual(expected);
  });

  it('should treat sessions with null titles as <Unknown>', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const sessionActivities = [
      {
        startDatetime: '2023-08-26T10:00:00.000Z',
        endDatetime: '2023-08-26T11:00:00.000Z',
        title: null,
      },
      {
        startDatetime: '2023-08-26T12:00:00.000Z',
        endDatetime: '2023-08-26T14:00:00.000Z',
        title: 'B',
      },
    ] as SessionActivity[];

    const result = aggregateSessionsByTitle({
      sessionActivities,
      domainName: 'example.com',
    });

    const expected: AggregatedDataType[] = [
      {
        id: 'B',
        label: 'B',
        value: 2 * 60 * 60 * 1000, // 1 hour in ms
        sessionCount: 1,
        domainName: 'example.com',
      },
      {
        id: '<Unknown>',
        label: '<Unknown>',
        value: 1 * 60 * 60 * 1000, // 1 hour in ms
        sessionCount: 1,
        domainName: 'example.com',
      },
    ];

    expect(result).toEqual(expected);
  });
});

describe('aggregateByDomain', () => {
  it('should aggregate data for a single domain', () => {
    const data: DateActivityData = {
      activities: [
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        {
          timeSpent: 1200000,
          domainName: 'example.com',
          id: '00000000-0000-0000-0000-000000000000',
          sessionActivities: [
            {
              startDatetime: new Date('2023-08-26T10:00:00Z'),
              endDatetime: new Date('2023-08-26T10:20:00Z'),
              title: 'Page A',
            } as SessionActivity,
          ],
        },
      ],
      totalActivityTime: 1200000,
      idleTime: 0,
    };

    const result = aggregateByDomain(data);

    expect(result).toEqual({
      'example.com': {
        id: '00000000-0000-0000-0000-000000000000',
        label: 'example.com',
        value: 1200000,
        sessionCount: 1,
        lastSession: new Date('2023-08-26T10:20:00Z').getTime(),
        domainName: 'example.com',
        children: [
          {
            id: 'Page A',
            label: 'Page A',
            value: 1200000,
            sessionCount: 1,
            domainName: 'example.com',
          },
        ],
      },
    });
  });

  it('should aggregate data across multiple domains with multiple session activities', () => {
    const data: DateActivityData = {
      activities: [
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        {
          timeSpent: 1800000,
          domainName: 'example.com',
          id: '00000000-0000-0000-0000-000000000000',
          sessionActivities: [
            {
              startDatetime: new Date('2023-08-26T10:00:00Z'),
              endDatetime: new Date('2023-08-26T10:20:00Z'),
              title: 'Page A on example.com',
            } as SessionActivity,
            {
              startDatetime: new Date('2023-08-26T10:30:00Z'),
              endDatetime: new Date('2023-08-26T10:50:00Z'),
              title: 'Page A on example.com',
            } as SessionActivity,
          ],
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        {
          timeSpent: 3000000,
          domainName: 'another.com',
          id: '00000000-0000-0000-0000-000000000001',
          sessionActivities: [
            {
              startDatetime: new Date('2023-08-26T11:00:00Z'),
              endDatetime: new Date('2023-08-26T11:40:00Z'),
              title: 'Page B on another.com',
            } as SessionActivity,
            {
              startDatetime: new Date('2023-08-26T12:00:00Z'),
              endDatetime: new Date('2023-08-26T12:10:00Z'),
              title: 'Page C on another.com',
            } as SessionActivity,
          ],
        },
      ],
      totalActivityTime: 4800000,
      idleTime: 0,
    };

    const result = aggregateByDomain(data);

    expect(result).toEqual({
      'example.com': {
        id: '00000000-0000-0000-0000-000000000000',
        label: 'example.com',
        domainName: 'example.com',
        value: 1800000,
        sessionCount: 2,
        lastSession: new Date('2023-08-26T10:50:00Z').getTime(),
        children: [
          {
            id: 'Page A on example.com',
            label: 'Page A on example.com',
            value: 2400000, // 20 minutes + 20 minutes
            sessionCount: 2,
            domainName: 'example.com',
          },
        ],
      },
      'another.com': {
        id: '00000000-0000-0000-0000-000000000001',
        label: 'another.com',
        domainName: 'another.com',
        value: 3000000,
        sessionCount: 2,
        lastSession: new Date('2023-08-26T12:10:00Z').getTime(),
        children: [
          {
            id: 'Page B on another.com',
            label: 'Page B on another.com',
            value: 2400000, // 40 minutes
            sessionCount: 1,
            domainName: 'another.com',
          },
          {
            id: 'Page C on another.com',
            label: 'Page C on another.com',
            value: 600000, // 10 minutes
            sessionCount: 1,
            domainName: 'another.com',
          },
        ],
      },
    });
  });

  it('should handle no activities', () => {
    const data: DateActivityData = {
      activities: [],
      totalActivityTime: 0,
      idleTime: 0,
    };

    const result = aggregateByDomain(data);

    expect(result).toEqual({});
  });
});
