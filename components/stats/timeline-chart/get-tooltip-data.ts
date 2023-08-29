import {OTHER_BUCKET_STR} from '../../../const/string';
import {TimeLineTooltipProps} from './tooltip';

export function getTooltipData({data, domains}: TimeLineTooltipProps) {
  return [...Object.entries(data)]
    .filter(([key]) => domains.includes(key)) // Filter by domains
    .map(([key, value]) => ({
      id: key,
      label: key,
      value: value as number,
    }))
    .sort((a, b) => {
      if (a.id === OTHER_BUCKET_STR) return -1;
      if (b.id === OTHER_BUCKET_STR) return 1;

      return a.value - b.value;
    });
}
