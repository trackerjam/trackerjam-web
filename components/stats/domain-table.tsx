import {DIVIDER, TableBuilder, TableBuilderColumn} from 'baseui/table-semantic';
import {formatDistanceToNow} from 'date-fns';
import {useStyletron} from 'baseui';
import {formatTimeDuration} from '../../utils/format-time-duration';
import {AggregatedDataType} from './types';
import brandColors from './brand-colors.json';

function getColorByDomain(domain: string): string {
  const domainNoTld = domain.split('.')[0];
  const colors = (brandColors as {[domain: string]: Array<string>})[domainNoTld];
  return colors?.length ? '#' + colors[0] : 'transparent';
}

interface DomainTableProps {
  data: AggregatedDataType[];
  height?: string;
}

export function DomainTable({data, height = 'auto'}: DomainTableProps) {
  const [css, theme] = useStyletron();

  const domainLabelStyle = css({
    display: 'flex',
    gap: theme.sizing.scale400,
  });

  const domainColorTagStyle = css({
    width: theme.sizing.scale600,
    height: theme.sizing.scale600,
    borderRadius: '50%',
    ...theme.borders.border200,
  });
  return (
    <TableBuilder
      data={data}
      divider={DIVIDER.grid}
      overrides={{
        Root: {
          style: {
            height,
            maxHeight: height,
          },
        },
      }}
    >
      <TableBuilderColumn header="Domain">
        {(row: AggregatedDataType) => (
          <div className={domainLabelStyle}>
            <span
              className={domainColorTagStyle}
              style={{backgroundColor: getColorByDomain(row.label)}}
            />
            <span>{row.label}</span>
          </div>
        )}
      </TableBuilderColumn>
      <TableBuilderColumn header="Activity Time">
        {(row: AggregatedDataType) => formatTimeDuration(row.value)}
      </TableBuilderColumn>
      <TableBuilderColumn header="Sessions Count">
        {(row: AggregatedDataType) => row.sessionCount}
      </TableBuilderColumn>
      <TableBuilderColumn header="Last Session">
        {(row: AggregatedDataType) =>
          row.lastSession ? formatDistanceToNow(new Date(row.lastSession)) : '-'
        }
      </TableBuilderColumn>
    </TableBuilder>
  );
}
