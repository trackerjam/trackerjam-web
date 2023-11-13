import {normalize} from 'duration-fns';

type FormatDurationOptions = {
  skipSeconds?: boolean;
  longUnits?: boolean;
};

export function formatTimeDuration(durationMs: number, options?: FormatDurationOptions): string {
  // Adjust durationMs if skipSeconds is true and there are 30 or more seconds
  if (options?.skipSeconds) {
    const seconds = Math.floor((durationMs / 1000) % 60);
    if (seconds >= 30) {
      durationMs += (60 - seconds) * 1000; // Add the remaining seconds to reach the next minute
    }
  }

  const longUnits = options?.longUnits ?? false;
  const UNITS = {
    week: longUnits ? ' week' : 'w',
    day: longUnits ? ' day' : 'd',
    hour: longUnits ? ' hour' : 'h',
    minute: longUnits ? ' min' : 'm',
    second: longUnits ? ' sec' : 's',
  };

  // Normalize after potentially adjusting for seconds
  const normalized = normalize({milliseconds: durationMs});

  // Construct the result array in one go, filtering out any zero values
  const res = [
    normalized.weeks
      ? `${normalized.weeks}${UNITS.week}${normalized.weeks > 1 && longUnits ? 's' : ''}`
      : '',
    normalized.days
      ? `${normalized.days}${UNITS.day}${normalized.days > 1 && longUnits ? 's' : ''}`
      : '',
    normalized.hours
      ? `${normalized.hours}${UNITS.hour}${normalized.hours > 1 && longUnits ? 's' : ''}`
      : '',
    normalized.minutes
      ? `${normalized.minutes}${UNITS.minute}${normalized.minutes > 1 && longUnits ? 's' : ''}`
      : '',
    // Add seconds string only if skipSeconds is not true
    !options?.skipSeconds && normalized.seconds
      ? `${normalized.seconds}${UNITS.second}${normalized.seconds > 1 && longUnits ? 's' : ''}`
      : '',
  ].filter((str) => str); // Remove any empty strings

  return res.join(' ').trim();
}
