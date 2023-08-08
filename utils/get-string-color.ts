import stc from 'string-to-color';
import {IDLE_TIME_STR} from '../const/string';

const PREDEFINED_COLORS: {[domain: string]: string} = {
  localhost: 'silver',
  [IDLE_TIME_STR]: '#eee',
};

export function getStringColor(str: string): string {
  if (PREDEFINED_COLORS[str]) {
    return PREDEFINED_COLORS[str];
  }

  return stc(str);
}
