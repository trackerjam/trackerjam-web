import {formatDistanceToNow} from 'date-fns';
import {useStyletron} from 'baseui';
import {formatTimeDuration} from '../../utils/format-time-duration';
import {getStringColor} from '../../utils/get-string-color';
import {AggregatedDataType} from './types';

interface DomainTableProps {
  data: AggregatedDataType[];
  height?: string;
  totalActivityTime: number | undefined;
  onHover: (domainId: string | null) => void;
  hoveredId?: null | string;
}

const TABLE_HEADER = ['Domain', 'Activity Time', 'Sessions Count', 'Last Session'];

export function DomainsTable({
  data,
  onHover,
  height = 'auto',
  totalActivityTime,
  hoveredId,
}: DomainTableProps) {
  const [css, theme] = useStyletron();

  const tableWrapperStyle = css({
    maxHeight: height,
    overflow: 'scroll',
    borderRadius: theme.borders.radius200,
    ...theme.borders.border200,
  });

  const tableStyle = css({
    width: '100%',
  });

  const tableHeadCellStyle = css({
    padding: theme.sizing.scale400,
    top: 0,
    zIndex: 2,
    position: 'sticky',
    backgroundColor: theme.colors.backgroundPrimary,
    ...theme.borders.border200,
  });

  const tableCellStyle = css({
    padding: theme.sizing.scale400,
    position: 'relative',
    ...theme.borders.border200,
  });

  const tableRowStyle = css({});

  const domainLabelStyle = css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.sizing.scale300,
  });

  const domainColorTagStyle = css({
    width: theme.sizing.scale550,
    height: theme.sizing.scale550,
    ...theme.borders.border200,
    marginRight: theme.sizing.scale600,
  });

  const faviconStyle = css({
    width: theme.sizing.scale700,
    height: theme.sizing.scale700,
    borderRadius: '50%',
    ...theme.borders.border200,
  });

  const domainShareBarStyle = css({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'rgba(0,200,50,0.10)',
  });

  return (
    <div className={tableWrapperStyle}>
      <table className={tableStyle}>
        <thead>
          <tr>
            {TABLE_HEADER.map((label, idx) => {
              return (
                <th className={tableHeadCellStyle} key={idx}>
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map(({label, value, id, lastSession, sessionCount}) => {
            let domainTimeShare = 0;
            let domainSharePercentage = '';
            if (totalActivityTime) {
              domainTimeShare = (value / totalActivityTime) * 100;
              domainSharePercentage = Math.min(domainTimeShare, 100).toFixed(1) + '%';
            }

            return (
              <tr
                key={id}
                className={tableRowStyle}
                onMouseEnter={() => onHover(id)}
                onMouseLeave={() => onHover(null)}
                style={{
                  backgroundColor:
                    hoveredId === id ? theme.colors.backgroundSecondary : 'transparent',
                }}
              >
                <td className={tableCellStyle}>
                  <div className={domainLabelStyle}>
                    <span
                      className={domainColorTagStyle}
                      style={{backgroundColor: getStringColor(label)}}
                    />
                    <img
                      className={faviconStyle}
                      src={`https://www.google.com/s2/favicons?domain=${label}&sz=64`}
                      alt={`${label} favicon`}
                    />
                    <span>{label}</span>
                  </div>
                </td>
                <td className={tableCellStyle}>
                  <div className={domainShareBarStyle} style={{width: domainSharePercentage}} />
                  {formatTimeDuration(value)} ({domainSharePercentage})
                </td>
                <td className={tableCellStyle}>{sessionCount}</td>
                <td className={tableCellStyle}>
                  {lastSession ? formatDistanceToNow(new Date(lastSession)) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
