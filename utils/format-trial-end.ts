import {formatDistanceToNowStrict} from 'date-fns';
import {formatDate} from './date';

export function formatTrialEnd(trialEndsAt: Date | string): string {
  if (new Date(trialEndsAt) < new Date()) {
    return 'Ended ' + formatDate(trialEndsAt);
  }
  return formatDistanceToNowStrict(new Date(trialEndsAt));
}
