import {type Border} from 'baseui/themes';

export function getBorder(border: Border): string {
  return `${border.borderWidth} ${border.borderStyle} ${border.borderColor}`;
}
