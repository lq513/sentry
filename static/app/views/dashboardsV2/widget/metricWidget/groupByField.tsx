import * as React from 'react';
import styled from '@emotion/styled';

import CheckboxFancy from 'sentry/components/checkboxFancy/checkboxFancy';
import DropdownAutoComplete from 'sentry/components/dropdownAutoComplete';
import Highlight from 'sentry/components/highlight';
import TextOverflow from 'sentry/components/textOverflow';
import {IconChevron, IconClose} from 'sentry/icons';
import {t} from 'sentry/locale';
import {inputStyles} from 'sentry/styles/input';
import space from 'sentry/styles/space';
import {MetricQuery, MetricTag} from 'sentry/types';

type Props = {
  metricTags: MetricTag[];
  onChange: (groupBy: MetricQuery['groupBy']) => void;
  groupBy?: MetricQuery['groupBy'];
};

function GroupByField({metricTags, groupBy = [], onChange}: Props) {
  const hasSelected = !!groupBy.length;

  function handleClick(tag: string) {
    if (groupBy.includes(tag)) {
      const filteredGroupBy = groupBy.filter(groupByOption => groupByOption !== tag);
      onChange(filteredGroupBy);
      return;
    }
    onChange([...new Set([...groupBy, tag])]);
  }

  function handleUnselectAll(event: React.MouseEvent) {
    event.stopPropagation();
    onChange([]);
  }

  return (
    <DropdownAutoComplete
      searchPlaceholder={t('Search tag')}
      items={metricTags.map(({key: metricTag}) => ({
        value: metricTag,
        searchKey: metricTag,
        label: ({inputValue}) => (
          <Item onClick={() => handleClick(metricTag)}>
            <div>
              <Highlight text={inputValue}>{metricTag}</Highlight>
            </div>
            <CheckboxFancy isChecked={groupBy.includes(metricTag)} />
          </Item>
        ),
      }))}
      style={{
        width: '100%',
        borderRadius: 0,
      }}
      maxHeight={110}
    >
      {({isOpen, getActorProps}) => (
        <Field {...getActorProps()} hasSelected={hasSelected} isOpen={isOpen}>
          {!hasSelected ? (
            <Placeholder>{t('Group by')}</Placeholder>
          ) : (
            <React.Fragment>
              <StyledTextOverflow>
                {groupBy.map(groupByOption => groupByOption).join(',')}
              </StyledTextOverflow>
              <StyledClose
                color={hasSelected ? 'textColor' : 'gray300'}
                onClick={handleUnselectAll}
              />
            </React.Fragment>
          )}
          <ChevronWrapper>
            <IconChevron
              direction={isOpen ? 'up' : 'down'}
              size="sm"
              color={isOpen ? 'textColor' : 'gray300'}
            />
          </ChevronWrapper>
        </Field>
      )}
    </DropdownAutoComplete>
  );
}

export default GroupByField;

const Field = styled('div')<{hasSelected: boolean; isOpen: boolean}>`
  ${p => inputStyles(p)};
  padding: 0 10px;
  min-width: 250px;
  display: grid;
  grid-template-columns: ${p =>
    p.hasSelected ? '1fr max-content max-content' : '1fr  max-content'};
  resize: none;
  overflow: hidden;
  align-items: center;
  ${p =>
    p.isOpen &&
    `
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `}
`;

const Item = styled('div')`
  display: grid;
  grid-template-columns: 1fr max-content;
  gap: ${space(1.5)};
  word-break: break-all;
`;

const ChevronWrapper = styled('div')`
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: ${space(1)};
`;

const StyledClose = styled(IconClose)`
  height: 100%;
  width: 10px;
  padding: ${space(1)} 0;
  stroke-width: 1.5;
  margin-left: ${space(1)};
  box-sizing: content-box;
`;

const Placeholder = styled('div')`
  flex: 1;
  color: ${p => p.theme.gray200};
  padding: 0 ${space(0.25)};
`;

const StyledTextOverflow = styled(TextOverflow)`
  flex: 1;
`;
