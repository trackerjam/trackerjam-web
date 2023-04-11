import {Skeleton} from 'baseui/skeleton';

export function TableSkeleton() {
  return (
    <Skeleton
      animation={true}
      rows={10}
      width="100%"
      overrides={{
        Row: {
          style: {
            height: '30px',
            marginBottom: '15px',
          },
        },
      }}
    />
  );
}
