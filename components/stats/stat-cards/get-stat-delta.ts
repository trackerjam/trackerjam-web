import {DELTA_INCLINE} from './stat-cards';

interface GetStatDeltaProps {
  value?: number;
  prevValue?: number;
  formatFn?: (value: string) => string;
  type?: 'value' | 'percentage';
}

export function getStatDelta({value, prevValue, formatFn, type = 'value'}: GetStatDeltaProps) {
  if (typeof value !== 'number' || typeof prevValue !== 'number') {
    return {};
  }

  const delta = type === 'value' ? value - prevValue : ((value - prevValue) / prevValue) * 100;
  let deltaIncline = DELTA_INCLINE.SAME;
  let deltaValue = delta.toFixed(0);

  if (delta > 0) {
    deltaIncline = DELTA_INCLINE.POSITIVE;
    deltaValue = `+${delta.toFixed(0)}`;
  } else if (delta < 0) {
    deltaIncline = DELTA_INCLINE.NEGATIVE;
    deltaValue = `${delta.toFixed(0)}`;
  }

  if (type === 'percentage') {
    deltaValue += '%';
  }

  return {
    deltaIncline,
    deltaValue: typeof formatFn === 'function' ? formatFn(deltaValue) : deltaValue,
  };
}
