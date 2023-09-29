import {normalize} from 'duration-fns';

type FormatDurationOptions = {
  skipSeconds?: boolean;
};
export function formatTimeDuration(durationMs: number, options?: FormatDurationOptions): string {
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

  if (normalized.seconds && !options?.skipSeconds) {
    res.push(`${normalized.seconds}s`);
  }

  return res.join(' ').trim();
}
