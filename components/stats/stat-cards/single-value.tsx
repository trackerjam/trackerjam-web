import {BiCaretDown, BiCaretUp, BiCaretLeft} from 'react-icons/bi';
import cx from 'classnames';
import {DELTA_INCLINE} from './stat-cards';
import {CardElement} from './card';

interface SingleCards {
  stat: StatDelta | undefined;
  title: string;
}

export type StatDelta = {
  value: string | number | null | undefined;
  deltaValue?: string | number;
  deltaIncline?: DELTA_INCLINE;
};

export function SingleValue({title, stat}: SingleCards) {
  const {value, deltaValue, deltaIncline} = stat || {};
  let finalValue = value;
  if (
    (typeof finalValue === 'number' && isNaN(finalValue as number)) ||
    finalValue === null ||
    finalValue === undefined ||
    finalValue === ''
  ) {
    finalValue = '...';
  }

  const hasDelta = Boolean(deltaValue);
  const deltaColor =
    deltaIncline === DELTA_INCLINE.SAME
      ? 'text-gray-500'
      : deltaIncline === DELTA_INCLINE.POSITIVE
      ? 'text-green-500'
      : 'text-red-500';

  const DeltaIcon =
    deltaIncline === DELTA_INCLINE.SAME
      ? BiCaretLeft
      : deltaIncline === DELTA_INCLINE.POSITIVE
      ? BiCaretUp
      : BiCaretDown;

  return (
    <CardElement>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="flex items-center gap-3">
        <span className="text-gray-600 text-22 font-bold">{finalValue}</span>
        {hasDelta && (
          <span className={cx('flex gap-0 items-center text-12 -mr-2', deltaColor)}>
            {deltaValue} <DeltaIcon />
          </span>
        )}
      </div>
    </CardElement>
  );
}
