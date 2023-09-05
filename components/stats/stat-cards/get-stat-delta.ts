import {DELTA_INCLINE} from './stat-cards';

export function getStatDelta(value?: number, prevValue?: number) {
  if (typeof value !== 'number' || typeof prevValue !== 'number') {
    return {};
  }

  const delta = value - prevValue;
  let deltaIncline = DELTA_INCLINE.SAME;
  let deltaValue = '+0';

  if (delta > 0) {
    deltaIncline = DELTA_INCLINE.POSITIVE;
    deltaValue = `+${delta}`;
  } else if (delta < 0) {
    deltaIncline = DELTA_INCLINE.NEGATIVE;
    deltaValue = `${delta}`;
  }

  return {
    deltaIncline,
    deltaValue,
  };
}
