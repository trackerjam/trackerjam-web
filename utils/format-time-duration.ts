import {normalize} from 'duration-fns';

export function formatTimeDuration(durationMs: number): string {
  const normalized = normalize({milliseconds: durationMs});
  const res = [];

  if (normalized.weeks) {
    res.push(`${normalized.weeks}w`);
  }

  if (normalized.days) {
    res.push(`${normalized.days}d`);
  }

  if (normalized.hours) {
    res.push(`${normalized.hours}h`);
  }

  if (normalized.minutes) {
    res.push(`${normalized.minutes}m`);
  }

  if (normalized.seconds) {
    res.push(`${normalized.seconds}s`);
  }

  return res.join(' ').trim();
}
