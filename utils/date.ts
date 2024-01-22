import {format} from 'date-fns';

export const formatDateFull = (date: string | Date | null) => {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  return format(d, 'dd MMM yyyy @ HH:mm');
};
