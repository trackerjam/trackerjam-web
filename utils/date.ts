import {format} from 'date-fns';

export const formatDateTime = (date: string | Date | null) => {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  return format(d, 'dd MMM yyyy @ HH:mm');
};

export const formatDate = (date: string | Date | null) => {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  return format(d, 'dd MMM yyyy');
};
