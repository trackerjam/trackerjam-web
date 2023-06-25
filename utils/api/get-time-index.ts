export function getHourBasedDate(dateStr: string | Date): Date {
  const date = new Date(dateStr);
  date.setSeconds(0);
  date.setMinutes(0);
  date.setMilliseconds(0);

  return date;
}

export function getDayBasedDate(dateStr: string | Date): Date {
  const date = new Date(dateStr);

  date.setHours(0);
  date.setSeconds(0);
  date.setMinutes(0);
  date.setMilliseconds(0);

  return date;
}
