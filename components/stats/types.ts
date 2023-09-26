import {DomainTags} from '../../types/api';

export type AggregatedDataType = {
  id: string;
  label: string;
  value: number;
  sessionCount: number;
  lastSession?: number | null;
  children?: AggregatedDataType[];
  domainsTags: DomainTags;
  _domainName?: string; // Appears inside children to show correct domain favicon
};
