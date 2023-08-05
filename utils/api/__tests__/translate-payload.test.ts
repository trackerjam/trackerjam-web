import {TAB_TYPE} from '@prisma/client';
import {
  CreateDomainActivityInput,
  CreateSessionActivityInput,
  CreateActivityInputInternal,
} from '../../../types/api';
import {translatePayloadToInternalStructure} from '../translate-payload';

describe('translatePayloadToInternalStructure', () => {
  it('should correctly translate an activity to internal structure', () => {
    const input: CreateDomainActivityInput = {
      token: 'sample-token',
      sessions: [
        {
          url: 'https://www.google.com/search?q=test',
          title: 'Google Test',
          startTime: 1690976523695,
          endTime: 1690976524693,
        },
        {
          url: 'https://news.ycombinator.com/',
          title: 'Hacker News',
          startTime: 1690976523700,
          endTime: 1690976524800,
        },
      ],
    };

    const expected: CreateActivityInputInternal[] = [
      {
        date: '2023-08-02', // Based on the above timestamp and assuming it's UTC
        domain: 'google.com',
        type: TAB_TYPE.WEBSITE,
        sessions: [
          {
            url: 'https://www.google.com/search?q=test',
            title: 'Google Test',
            startTime: 1690976523695,
            endTime: 1690976524693,
          },
        ],
      },
      {
        date: '2023-08-02',
        domain: 'ycombinator.com',
        type: TAB_TYPE.WEBSITE,
        sessions: [
          {
            url: 'https://news.ycombinator.com/',
            title: 'Hacker News',
            startTime: 1690976523700,
            endTime: 1690976524800,
          },
        ],
      },
    ];

    const result = translatePayloadToInternalStructure(input);

    expect(result.token).toEqual(input.token);
    expect(result.activities).toEqual(expected);
  });

  it('should throw an error if no domain is extracted', () => {
    const input: CreateDomainActivityInput = {
      token: 'sample-token',
      sessions: [
        {
          url: 'invalid-url',
          title: 'Invalid URL',
          startTime: 1690976523695,
          endTime: 1690976524693,
        },
      ],
    };

    expect(() => translatePayloadToInternalStructure(input)).toThrow('no domain extracted');
  });

  it('should group sessions by domain and date', () => {
    const input: CreateDomainActivityInput = {
      token: 'sample-token',
      sessions: [
        {
          url: 'https://www.google.com/search?q=test',
          title: 'Google Test 1',
          startTime: 1690976523695,
          endTime: 1690976524693,
        },
        {
          url: 'https://www.google.com/search?q=test2',
          title: 'Google Test 2',
          startTime: 1690976523700,
          endTime: 1690976524800,
        },
      ],
    };

    const expectedSession1: CreateSessionActivityInput = {
      url: 'https://www.google.com/search?q=test',
      title: 'Google Test 1',
      startTime: 1690976523695,
      endTime: 1690976524693,
    };

    const expectedSession2: CreateSessionActivityInput = {
      url: 'https://www.google.com/search?q=test2',
      title: 'Google Test 2',
      startTime: 1690976523700,
      endTime: 1690976524800,
    };

    const result = translatePayloadToInternalStructure(input);

    expect(result.activities[0].sessions).toContainEqual(expectedSession1);
    expect(result.activities[0].sessions).toContainEqual(expectedSession2);
  });

  it('should split sessions that span multiple days', () => {
    const inputPayload = {
      token: 'test-token',
      sessions: [
        {
          url: 'https://example.com',
          startTime: Date.UTC(2023, 0, 1, 23, 30, 0), // Jan 1st 23:30 UTC
          endTime: Date.UTC(2023, 0, 2, 0, 30, 0), // Jan 2nd 00:30 UTC
        },
      ],
    };

    const result = translatePayloadToInternalStructure(inputPayload);

    // Expect that there are sessions for two different dates.
    expect(result.activities.length).toBe(2);

    // Validate the first session (Jan 1st)
    const firstActivity = result.activities.find((activity) => activity.date === '2023-01-01');
    expect(firstActivity).toBeDefined();
    expect(firstActivity?.sessions[0].startTime).toBe(Date.UTC(2023, 0, 1, 23, 30, 0));
    expect(firstActivity?.sessions[0].endTime).toBe(Date.UTC(2023, 0, 1, 23, 59, 59, 999));

    // Validate the second session (Jan 2nd)
    const secondActivity = result.activities.find((activity) => activity.date === '2023-01-02');
    expect(secondActivity).toBeDefined();
    expect(secondActivity?.sessions[0].startTime).toBe(Date.UTC(2023, 0, 2, 0, 0, 0));
    expect(secondActivity?.sessions[0].endTime).toBe(Date.UTC(2023, 0, 2, 0, 30, 0));
  });

  it('should handle multiple sessions for the same domain on different days', () => {
    const inputPayload = {
      token: 'sampleToken',
      sessions: [
        {
          url: 'http://example.com/page1',
          title: 'Page 1',
          startTime: new Date('2023-01-01T12:00:00Z').getTime(),
          endTime: new Date('2023-01-01T13:00:00Z').getTime(),
        },
        {
          url: 'http://example.com/page2',
          title: 'Page 2',
          startTime: new Date('2023-01-02T14:00:00Z').getTime(),
          endTime: new Date('2023-01-02T15:00:00Z').getTime(),
        },
      ],
    };

    const result = translatePayloadToInternalStructure(inputPayload);
    const expectedOutput = {
      token: 'sampleToken',
      activities: [
        {
          date: '2023-01-01',
          domain: 'example.com',
          type: TAB_TYPE.WEBSITE,
          sessions: [
            {
              url: 'http://example.com/page1',
              title: 'Page 1',
              startTime: new Date('2023-01-01T12:00:00Z').getTime(),
              endTime: new Date('2023-01-01T13:00:00Z').getTime(),
            },
          ],
        },
        {
          date: '2023-01-02',
          domain: 'example.com',
          type: TAB_TYPE.WEBSITE,
          sessions: [
            {
              url: 'http://example.com/page2',
              title: 'Page 2',
              startTime: new Date('2023-01-02T14:00:00Z').getTime(),
              endTime: new Date('2023-01-02T15:00:00Z').getTime(),
            },
          ],
        },
      ],
    };

    expect(result).toEqual(expectedOutput);
  });

  it('should handle a session that spans multiple days', () => {
    const inputPayload = {
      token: 'sampleToken',
      sessions: [
        {
          url: 'http://example.com/page1',
          title: 'Page 1',
          startTime: new Date('2023-01-01T22:00:00Z').getTime(),
          endTime: new Date('2023-01-02T02:00:00Z').getTime(),
        },
      ],
    };

    const result = translatePayloadToInternalStructure(inputPayload);
    const expectedOutput = {
      token: 'sampleToken',
      activities: [
        {
          date: '2023-01-01',
          domain: 'example.com',
          type: TAB_TYPE.WEBSITE,
          sessions: [
            {
              url: 'http://example.com/page1',
              title: 'Page 1',
              startTime: new Date('2023-01-01T22:00:00Z').getTime(),
              endTime: new Date('2023-01-02T00:00:00Z').getTime() - 1,
            },
          ],
        },
        {
          date: '2023-01-02',
          domain: 'example.com',
          type: TAB_TYPE.WEBSITE,
          sessions: [
            {
              url: 'http://example.com/page1',
              title: 'Page 1',
              startTime: new Date('2023-01-02T00:00:00Z').getTime(),
              endTime: new Date('2023-01-02T02:00:00Z').getTime(),
            },
          ],
        },
      ],
    };

    expect(result).toEqual(expectedOutput);
  });

  it('should handle multiple sessions spanning different domains and dates', () => {
    const inputPayload = {
      token: 'sampleToken',
      sessions: [
        {
          url: 'http://example.com/page1',
          title: 'Example Page 1',
          startTime: new Date('2023-01-01T10:00:00Z').getTime(),
          endTime: new Date('2023-01-01T11:00:00Z').getTime(),
        },
        {
          url: 'http://example.com/page2',
          title: 'Example Page 2',
          startTime: new Date('2023-01-02T10:00:00Z').getTime(),
          endTime: new Date('2023-01-02T11:00:00Z').getTime(),
        },
        {
          url: 'http://anotherdomain.com/pageA',
          title: 'Another Domain Page A',
          startTime: new Date('2023-01-01T12:00:00Z').getTime(),
          endTime: new Date('2023-01-02T13:00:00Z').getTime(),
        },
      ],
    };

    const result = translatePayloadToInternalStructure(inputPayload);
    const expectedOutput = {
      token: 'sampleToken',
      activities: [
        {
          date: '2023-01-01',
          domain: 'example.com',
          type: TAB_TYPE.WEBSITE,
          sessions: [
            {
              url: 'http://example.com/page1',
              title: 'Example Page 1',
              startTime: new Date('2023-01-01T10:00:00Z').getTime(),
              endTime: new Date('2023-01-01T11:00:00Z').getTime(),
            },
          ],
        },
        {
          date: '2023-01-02',
          domain: 'example.com',
          type: TAB_TYPE.WEBSITE,
          sessions: [
            {
              url: 'http://example.com/page2',
              title: 'Example Page 2',
              startTime: new Date('2023-01-02T10:00:00Z').getTime(),
              endTime: new Date('2023-01-02T11:00:00Z').getTime(),
            },
          ],
        },
        {
          date: '2023-01-01',
          domain: 'anotherdomain.com',
          type: TAB_TYPE.WEBSITE,
          sessions: [
            {
              url: 'http://anotherdomain.com/pageA',
              title: 'Another Domain Page A',
              startTime: new Date('2023-01-01T12:00:00Z').getTime(),
              endTime: new Date('2023-01-02T00:00:00Z').getTime() - 1, // End of the day time for '2023-01-01'
            },
          ],
        },
        {
          date: '2023-01-02',
          domain: 'anotherdomain.com',
          type: TAB_TYPE.WEBSITE,
          sessions: [
            {
              url: 'http://anotherdomain.com/pageA',
              title: 'Another Domain Page A',
              startTime: new Date('2023-01-02T00:00:00Z').getTime(),
              endTime: new Date('2023-01-02T13:00:00Z').getTime(),
            },
          ],
        },
      ],
    };

    expect(result).toEqual(expectedOutput);
  });

  it('should correctly group multiple sessions for the same domain on the same day', () => {
    const inputPayload = {
      token: 'sampleToken',
      sessions: [
        {
          url: 'http://example.com/page1',
          title: 'Example Page 1',
          startTime: new Date('2023-01-01T10:00:00Z').getTime(),
          endTime: new Date('2023-01-01T11:00:00Z').getTime(),
        },
        {
          url: 'http://example.com/page2',
          title: 'Example Page 2',
          startTime: new Date('2023-01-01T12:00:00Z').getTime(),
          endTime: new Date('2023-01-01T13:00:00Z').getTime(),
        },
        {
          url: 'http://example.com/page3',
          title: 'Example Page 3',
          startTime: new Date('2023-01-01T14:00:00Z').getTime(),
          endTime: new Date('2023-01-01T15:00:00Z').getTime(),
        },
      ],
    };

    const result = translatePayloadToInternalStructure(inputPayload);

    const expectedOutput = {
      token: 'sampleToken',
      activities: [
        {
          date: '2023-01-01',
          domain: 'example.com',
          type: TAB_TYPE.WEBSITE,
          sessions: [
            {
              url: 'http://example.com/page1',
              title: 'Example Page 1',
              startTime: new Date('2023-01-01T10:00:00Z').getTime(),
              endTime: new Date('2023-01-01T11:00:00Z').getTime(),
            },
            {
              url: 'http://example.com/page2',
              title: 'Example Page 2',
              startTime: new Date('2023-01-01T12:00:00Z').getTime(),
              endTime: new Date('2023-01-01T13:00:00Z').getTime(),
            },
            {
              url: 'http://example.com/page3',
              title: 'Example Page 3',
              startTime: new Date('2023-01-01T14:00:00Z').getTime(),
              endTime: new Date('2023-01-01T15:00:00Z').getTime(),
            },
          ],
        },
      ],
    };

    expect(result).toEqual(expectedOutput);
  });
});
