import {STATUS} from '.prisma/client';
import {Tag, KIND} from 'baseui/tag';

interface StatusTagProps {
  status: STATUS;
}

const STATUS_COLOR_KIND = {
  [STATUS.ACTIVE]: KIND.green,
  [STATUS.NEW]: KIND.blue,
  [STATUS.PAUSED]: KIND.yellow,
  [STATUS.DISABLED]: KIND.black,
  [STATUS.INVALID]: KIND.red,
};

function capitalize(text: string): string {
  return text[0] + text.slice(1).toLowerCase();
}

export function StatusTag({status}: StatusTagProps) {
  const kind = STATUS_COLOR_KIND[status] || KIND.brown;
  const statusText = capitalize(status);

  return (
    <Tag
      kind={kind}
      closeable={false}
      overrides={{
        Root: {
          style: {
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
            fontSize: '11px',
          },
        },
      }}
    >
      {statusText}
    </Tag>
  );
}
