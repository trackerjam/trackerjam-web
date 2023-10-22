import {normalize} from 'duration-fns';

type FormatDurationOptions = {
  skipSeconds?: boolean;
};

export function formatTimeDuration(durationMs: number, options?: FormatDurationOptions): string {
  // Adjust durationMs if skipSeconds is true and there are 30 or more seconds
  if (options?.skipSeconds) {
    const seconds = Math.floor((durationMs / 1000) % 60);
    if (seconds >= 30) {
      durationMs += (60 - seconds) * 1000; // Add the remaining seconds to reach the next minute
    }
  }

  // Normalize after potentially adjusting for seconds
  const normalized = normalize({milliseconds: durationMs});

  // Construct the result array in one go, filtering out any zero values
  const res = [
    normalized.weeks ? `${normalized.weeks}w` : '',
    normalized.days ? `${normalized.days}d` : '',
    normalized.hours ? `${normalized.hours}h` : '',
    normalized.minutes ? `${normalized.minutes}m` : '',
    // Add seconds string only if skipSeconds is not true
    !options?.skipSeconds && normalized.seconds ? `${normalized.seconds}s` : '',
  ].filter((str) => str); // Remove any empty strings

  return res.join(' ').trim();
}
