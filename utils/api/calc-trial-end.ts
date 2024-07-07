import {addDays} from 'date-fns';
import {TRIAL_DAYS} from '../../const/payment';

export function calcTrialEnd(createdAt: Date): Date {
  return addDays(new Date(createdAt), TRIAL_DAYS);
}

export function calcTrialOffset(extraOffset: number = 0): Date {
  return addDays(new Date(), -(TRIAL_DAYS + extraOffset));
}
