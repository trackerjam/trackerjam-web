import {Skeleton} from 'baseui/skeleton';
import {GRID_TEMPLATE} from './list';

export function ListSkeleton() {
  return (
    <Skeleton
      animation={true}
      rows={6}
      overrides={{
        Root: {
          style: ({$theme}) => ({
            display: 'grid',
            gridTemplateColumns: GRID_TEMPLATE,
            gap: $theme.sizing.scale500,
          }),
        },
        Row: {
          style: {
            height: '145px',
            marginBottom: 0,
          },
        },
      }}
    />
  );
}
