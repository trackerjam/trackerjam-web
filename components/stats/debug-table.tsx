import React, {useMemo} from 'react';
import {Button} from 'baseui/button';
import {ChevronDown, ChevronRight} from 'baseui/icon';
import {withStyle, useStyletron} from 'baseui';
import {StyledTable, StyledHeadCell, StyledBodyCell} from 'baseui/table-grid';
import {MemberStatisticActivityType} from '../../types/api';

function Tasks(props: {tasks: any[]}) {
  const [css] = useStyletron();
  return (
    <div
      className={css({
        gridColumn: 'span 4',
        padding: '32px 24px',
      })}
    >
      <StyledTable role="grid" $gridTemplateColumns="auto auto auto auto auto">
        <div role="row" className={css({display: 'contents'})}>
          <StyledHeadCell $sticky={false}>Title</StyledHeadCell>
          <StyledHeadCell $sticky={false}>URL</StyledHeadCell>
          <StyledHeadCell $sticky={false}>Start Time</StyledHeadCell>
          <StyledHeadCell $sticky={false}>End Time</StyledHeadCell>
          <StyledHeadCell $sticky={false}>Length</StyledHeadCell>
        </div>
        {props.tasks.map((task, idx) => {
          const lengthSec = (new Date(task[3]).getTime() - new Date(task[2]).getTime()) / 1000;
          return (
            <div role="row" className={css({display: 'contents'})} key={idx}>
              <StyledBodyCell>{task[0]}</StyledBodyCell>
              <StyledBodyCell>{task[1]}</StyledBodyCell>
              <StyledBodyCell>{task[2]}</StyledBodyCell>
              <StyledBodyCell>{task[3]}</StyledBodyCell>
              <StyledBodyCell>
                {lengthSec} sec ({(lengthSec / 60).toFixed(3)} min)
              </StyledBodyCell>
            </div>
          );
        })}
      </StyledTable>
    </div>
  );
}
const CenteredBodyCell = withStyle(StyledBodyCell, {
  display: 'flex',
  alignItems: 'center',
});
function Row({striped, row}: any) {
  const [css] = useStyletron();
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div role="row" className={css({display: 'contents'})}>
      <CenteredBodyCell $striped={striped}>
        <Button
          size="compact"
          kind="tertiary"
          onClick={() => setExpanded(!expanded)}
          shape="square"
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </Button>
        {row[0]}
      </CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{row[1]}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{row[2]}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{row[3]}</CenteredBodyCell>
      {expanded && <Tasks tasks={row[4]} />}
    </div>
  );
}
export default function DebugTable({
  data,
}: {
  data: MemberStatisticActivityType[] | undefined | null;
}) {
  const [css, theme] = useStyletron();

  const tableData = useMemo(() => {
    if (data) {
      return data.map(({domainName, timeSpent, activitiesCount, sessionActivities}) => {
        return [
          domainName,
          timeSpent,
          activitiesCount,
          sessionActivities[sessionActivities.length - 1]?.endDatetime,
          sessionActivities?.map(({title, url, startDatetime, endDatetime}) => {
            return [title, url, startDatetime, endDatetime];
          }),
        ];
      });
    }
    return [];
  }, [data]);

  return (
    <div className={css({marginTop: theme.sizing.scale800})}>
      <h3 className={css({color: theme.colors.contentPrimary})}>Debug table</h3>

      <StyledTable
        role="grid"
        $gridTemplateColumns="max-content minmax(200px,min-content) minmax(200px,min-content) auto"
      >
        <div role="row" className={css({display: 'contents'})}>
          <StyledHeadCell>Domain</StyledHeadCell>
          <StyledHeadCell>Total Activity Time</StyledHeadCell>
          <StyledHeadCell>Session Count</StyledHeadCell>
          <StyledHeadCell>Last reported session</StyledHeadCell>
        </div>
        {tableData.map((row, index) => {
          const striped = index % 2 === 0;
          return <Row row={row} striped={striped} key={row[0]} />;
        })}
      </StyledTable>
    </div>
  );
}
