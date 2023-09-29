import {MemberStatisticActivityType} from '../../../types/api';
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

    if (item.productivityScore > 0.7) {
      productiveWeightedValue += weightedValue;
    } else if (item.productivityScore >= 0.5) {
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
