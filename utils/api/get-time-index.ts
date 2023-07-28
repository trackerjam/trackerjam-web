export function getHourBasedDate(dateStr: string | Date): Date {
  const date = new Date(dateStr);
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);

  return date;
}
