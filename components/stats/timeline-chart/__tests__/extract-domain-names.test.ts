import {MemberStatisticActivityType} from '../../../../types/api';
import {extractDomainNames} from '../extract-domain-names';

describe('extractDomainNames', () => {
  test('should return unique domain names from the input array', () => {
    const sessions = [
      {id: '1', domainName: 'google.com'},
      {id: '2', domainName: 'facebook.com'},
      {id: '3', domainName: 'google.com'},
      {id: '4', domainName: 'openai.com'},
      {id: '5', domainName: 'facebook.com'},
    ] as MemberStatisticActivityType[];
    const result = extractDomainNames(sessions);
    expect(result).toEqual(['google.com', 'facebook.com', 'openai.com']);
  });

  test('should return empty array when input array is empty', () => {
    const sessions: MemberStatisticActivityType[] = [];
    const result = extractDomainNames(sessions);
    expect(result).toEqual([]);
  });

  test('should return array with one domain name when input array has one session', () => {
    const sessions: MemberStatisticActivityType[] = [
      {id: '1', domainName: 'google.com'},
    ] as MemberStatisticActivityType[];
    const result = extractDomainNames(sessions);
    expect(result).toEqual(['google.com']);
  });
});
