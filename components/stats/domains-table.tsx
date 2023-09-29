import {formatDistanceToNow} from 'date-fns';
import {useStyletron} from 'baseui';
import {BsEyeFill, BsBackspace} from 'react-icons/bs';
import {formatTimeDuration} from '../../utils/format-time-duration';
import {getBestTag} from '../../utils/best-tag';
import {AggregatedDataType} from './types';
import {Favicon} from './favicon';

interface DomainTableProps {
  data: AggregatedDataType[];
  height?: string;
  onHover: (domainId: string | null) => void;
  hoveredId?: null | string;
  onDomainFocus: (domainId: string | null) => void;
  focusedDomainId?: null | string;
}

const TABLE_HEADER = [
  'Domain',
  'Category',
  'Productivity',
  'Pages',
  'Activity Time',
  'Sessions Count',
  'Last Session',
];

function getTimeShare({
  totalActivityTime,
  value,
}: {
  totalActivityTime: undefined | number;
  value: number;
}) {
  let timeShare = 0;
  let sharePercentage = '';
  let shareWidth = '';
  if (totalActivityTime) {
    timeShare = (value / totalActivityTime) * 100;
    sharePercentage = timeShare.toFixed(1) + '%';
    shareWidth = Math.min(timeShare, 100).toFixed(1) + '%';
  }

  return {timeShare, sharePercentage, shareWidth};
}

export function DomainsTable({
  data,
  onHover,
  height = 'auto',
  hoveredId,
  onDomainFocus,
  focusedDomainId,
}: DomainTableProps) {
  const [css, theme] = useStyletron();

  const totalTime = data.reduce((acc, {value}) => acc + value, 0);

  const tableWrapperStyle = css({
    width: '100%',
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
    justifyContent: 'space-between',
    gap: theme.sizing.scale300,
  });

  const domainShareBarStyle = css({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '5px',
    backgroundColor: 'rgba(0,200,50,0.80)',
  });

  return (
    <div className={tableWrapperStyle}>
      <table className={tableStyle}>
        <thead>
          <tr>
            {TABLE_HEADER.map((tableHeader, idx) => {
              return (
                <th className={tableHeadCellStyle} key={idx}>
                  {tableHeader}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {Boolean(focusedDomainId) && (
            <>
              <tr>
                <td colSpan={5}>
                  <button
                    className="px-2 py-1 bg-blue-400 text-white m-2 rounded flex items-center gap-2"
                    onClick={() => onDomainFocus(null)}
                  >
                    <BsBackspace title="" />
                    Back to all domains
                  </button>
                </td>
              </tr>
            </>
          )}
          {data.map(
            ({
              label,
              value,
              id,
              lastSession,
              sessionCount,
              children,
              domainsTags = {},
              productivityScore,
              _domainName,
            }) => {
              const {shareWidth, sharePercentage} = getTimeShare({
                totalActivityTime: totalTime,
                value,
              });
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
                      <div className="flex flex-row items-center gap-2">
                        <Favicon domain={_domainName || label} />
                        <span>{label}</span>
                      </div>
                      {Boolean(children?.length) && (
                        <div>
                          <button
                            onClick={() => onDomainFocus(id)}
                            className="flex items-center gap-2 border-2 border-gray-100 rounded px-1 text-12 text-gray-700 hover:bg-blue-200 transition-colors duration-150"
                          >
                            Focus
                            <BsEyeFill
                              title="Focus on domain"
                              size={18}
                              className="text-gray-600"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={tableCellStyle}>{getBestTag(domainsTags)}</td>
                  <td className={tableCellStyle}>{productivityScore ?? '-'}</td>
                  <td className={tableCellStyle}>{children?.length ?? '-'}</td>
                  <td className={tableCellStyle}>
                    <div className={domainShareBarStyle} style={{width: shareWidth}} />
                    {formatTimeDuration(value)} ({sharePercentage})
                  </td>
                  <td className={tableCellStyle}>{sessionCount}</td>
                  <td className={tableCellStyle}>
                    {lastSession ? formatDistanceToNow(new Date(lastSession)) : '-'}
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}
