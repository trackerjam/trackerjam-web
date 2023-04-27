import {Skeleton} from 'baseui/skeleton';
import {useStyletron} from 'baseui';

export function DashboardSkeleton() {
  const [css] = useStyletron();

  const wrapperStyle = css({
    width: '70%',
    minWidth: '600px',
    maxWidth: '1200px',
  });

  return (
    <div className={wrapperStyle}>
      <Skeleton
        animation={true}
        rows={3}
        width="100%"
        overrides={{
          Root: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              gap: '15px',
              marginBottom: '30px',
            },
          },
          Row: {
            style: {
              height: '160px',
              flexGrow: 1,
            },
          },
        }}
      />

      <Skeleton
        animation={true}
        rows={3}
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
    </div>
  );
}
