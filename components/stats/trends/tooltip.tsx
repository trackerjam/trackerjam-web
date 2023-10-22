import {format} from 'date-fns';
import {formatTimeDuration} from '../../../utils/format-time-duration';

interface TooltipProps {
  indexValue: string | number;
  value: number;
}
export function Tooltip({indexValue, value}: TooltipProps) {
  return (
    <div className="p-4 bg-white rounded-md shadow-md border-solid border-2 gray">
      <div className="text-14 font-bold">{format(new Date(indexValue), 'd MMM yyyy')}</div>
      <div className="text-14">{formatTimeDuration(value, {skipSeconds: true})}</div>
    </div>
  );
}
