import {eachDayOfInterval, parseISO, formatISO, add} from 'date-fns';

type OptionsType = {
  addExtraDays?: number;
};
export function generateDateRangeKeys(keys: string[], opts?: OptionsType): string[] {
  if (keys.length === 0) {
    return [];
  }

  const addExtraDays = opts?.addExtraDays ?? 0;

  keys.sort();

  const minDate = parseISO(keys[0]);
  let maxDate = parseISO(keys[keys.length - 1]);

  // Check if there's only one key, and if so, extend the maxDate by a couple of days.
  if (keys.length === 1 && addExtraDays > 0) {
    maxDate = add(maxDate, {days: addExtraDays}); // adds 2 days to the maxDate
  }

  // Generate array of dates between min and max, inclusive.
  const dateRange = eachDayOfInterval({start: minDate, end: maxDate});

  // Format dates back to the original format, i.e., 'yyyy-MM-dd'
  return dateRange.map((date) => formatISO(date, {representation: 'date'}));
}
