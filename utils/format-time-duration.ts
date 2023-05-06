import {normalize} from 'duration-fns';

export function formatTimeDuration(durationMs: number): string {
  const normalized = normalize({milliseconds: durationMs});
  let res = '';

  if (normalized.weeks) {
    res += `${normalized.weeks}w`;
  }

  if (normalized.days) {
    res += ` ${normalized.days}d`;
  }

  if (normalized.hours) {
    res += ` ${normalized.hours}h`;
  }

  if (normalized.minutes) {
    res += ` ${normalized.minutes}m`;
  }

  return res;
}
