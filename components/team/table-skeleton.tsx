import {Skeleton} from 'baseui/skeleton';

export function TableSkeleton() {
  return (
    <Skeleton
      animation={true}
      rows={8}
      width="100%"
      overrides={{
        Row: {
          style: {
            height: '45px',
            marginBottom: '15px',
          },
        },
      }}
    />
  );
}
