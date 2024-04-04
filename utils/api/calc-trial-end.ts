import {addDays} from 'date-fns';
import {TRIAL_DAYS} from '../../const/payment';

export function calcTrialEnd(createdAt: Date): Date {
  return addDays(new Date(createdAt), TRIAL_DAYS);
}
