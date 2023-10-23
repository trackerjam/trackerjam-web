import {MemberStatisticActivityType} from '../../../types/api';
import {SCORE_LEVEL} from '../../../const/productivity';
import {ProductivityScoreType} from './types';

export function calcProductivityPercentages(
  data: MemberStatisticActivityType[]
): ProductivityScoreType {
  let weightedTotal = 0;
  let productiveWeightedValue = 0;
  let neutralWeightedValue = 0;
  let lowWeightedValue = 0;

  for (const item of data) {
    if (typeof item.productivityScore === 'undefined') {
      continue;
    }

    const weightedValue = item.timeSpent * item.productivityScore;
    weightedTotal += weightedValue;

    if (item.productivityScore > SCORE_LEVEL.GOOD) {
      productiveWeightedValue += weightedValue;
    } else if (item.productivityScore >= SCORE_LEVEL.NEUTRAL) {
      neutralWeightedValue += weightedValue;
    } else {
      lowWeightedValue += weightedValue;
    }
  }

  // Convert to percentage
  const high = (productiveWeightedValue / weightedTotal) * 100;
  const neutral = (neutralWeightedValue / weightedTotal) * 100;
  const low = (lowWeightedValue / weightedTotal) * 100;

  return {
    high,
    neutral,
    low,
  };
}
