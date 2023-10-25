import cx from 'classnames';
import {SCORE_LEVEL} from '../../const/productivity';

export function ScoreTag({score}: {score: number}) {
  let textColor = '';
  let bgColor = '';
  let borderColor = '';
  let title = '';

  if (score > SCORE_LEVEL.GOOD) {
    title = 'High';
    textColor = 'text-green-700';
    bgColor = 'bg-green-50';
    borderColor = 'border-green-500';
  } else if (score >= SCORE_LEVEL.NEUTRAL) {
    title = 'Neutral';
    textColor = 'text-violet-500';
    bgColor = 'bg-violet-50';
    borderColor = 'border-violet-300';
  } else {
    title = 'Low';
    textColor = 'text-red-700';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-500';
  }

  const classes = cx(textColor, bgColor, borderColor, [
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
    'border',
    'border-solid',
  ]);

  return (
    <div className={classes} title={`Score: ${score}`}>
      {title}
    </div>
  );
}
