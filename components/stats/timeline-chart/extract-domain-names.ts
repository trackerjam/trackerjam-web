import {MemberStatisticActivityType} from '../../../types/api';

export function extractDomainNames(sessions: MemberStatisticActivityType[]): string[] {
  const domainNames = sessions.map((session) => session.domainName);
  return Array.from(new Set(domainNames));
}
