import {Skeleton} from 'baseui/skeleton';
import {GRID_TEMPLATE} from './list';

export function ListSkeleton() {
  return (
    <Skeleton
      animation={true}
      rows={3}
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
            height: '350px',
            marginBottom: 0,
          },
        },
      }}
    />
  );
}
