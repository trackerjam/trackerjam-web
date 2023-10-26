import {humanizeDates} from '../humanize-dates'; // adjust the import statement to where your actual file is located

describe('humanizeDates function', () => {
  it('should correctly transform startTime and endTime to ISO strings', () => {
    const session = {
      startTime: 1635196800000,
      endTime: 1635283200000,
    };

    const humanizedSession = humanizeDates(session);

    // Check if the transformed dates are strings
    expect(typeof humanizedSession.startTime).toBe('string');
    expect(typeof humanizedSession.endTime).toBe('string');

    // Check if the transformed dates are in the expected ISO format
    expect(humanizedSession.startTime).toBe('2021-10-25T21:20:00.000Z');
    expect(humanizedSession.endTime).toBe('2021-10-26T21:20:00.000Z');
  });

  it('should not alter other properties on the session object', () => {
    const sessionWithExtraData = {
      startTime: 1635196800000,
      endTime: 1635283200000,
      otherData: 'testData',
    };

    const humanizedSession = humanizeDates(sessionWithExtraData);

    expect(humanizedSession.otherData).toBe('testData');
  });

  it('should handle invalid date inputs gracefully', () => {
    const sessionWithInvalidDates = {
      startTime: null, // or other invalid date representations
      endTime: null,
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const humanizedSession = humanizeDates(sessionWithInvalidDates);
    expect(humanizedSession.startTime).toBeNull();
    expect(humanizedSession.endTime).toBeNull();
  });
});
