import cx from 'classnames';
import {SCORE_LEVEL} from '../../const/productivity';

export function ScoreTag({score}: {score: number}) {
  let textColor = '';
  let bgColor = '';
  let title = '';

  if (score > SCORE_LEVEL.GOOD) {
    title = 'High';
    textColor = 'text-green-700';
    bgColor = 'bg-green-200';
  } else if (score >= SCORE_LEVEL.NEUTRAL) {
    title = 'Neutral';
    textColor = 'text-orange-700';
    bgColor = 'bg-orange-200';
  } else {
    title = 'Low';
    textColor = 'text-red-700';
    bgColor = 'bg-red-200';
  }

  const classes = cx(textColor, bgColor, [
    'ml-4',
    'text-10',
    'inline-flex',
    'items-center',
    'font-bold',
    'leading-sm',
    'uppercase',
    'px-2',
    'py-1',
    'rounded-full',
  ]);

  return (
    <div className={classes} title={`Score: ${score}`}>
      {title}
    </div>
  );
}
