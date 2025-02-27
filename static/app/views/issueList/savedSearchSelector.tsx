import styled from '@emotion/styled';

import DropdownButton from 'sentry/components/dropdownButton';
import DropdownControl from 'sentry/components/dropdownControl';
import {t} from 'sentry/locale';
import overflowEllipsis from 'sentry/styles/overflowEllipsis';
import {Organization, SavedSearch} from 'sentry/types';

import SavedSearchMenu from './savedSearchMenu';

type Props = {
  onSavedSearchDelete: (savedSearch: SavedSearch) => void;
  onSavedSearchSelect: (savedSearch: SavedSearch) => void;
  organization: Organization;
  savedSearchList: SavedSearch[];
  sort: string;
  query?: string;
};

function SavedSearchSelector({
  savedSearchList,
  onSavedSearchDelete,
  onSavedSearchSelect,
  organization,
  query,
  sort,
}: Props) {
  function getTitle() {
    const savedSearch = savedSearchList.find(
      search => search.query === query && search.sort === sort
    );
    return savedSearch ? savedSearch.name : t('Custom Search');
  }

  return (
    <DropdownControl
      menuWidth="35vw"
      blendWithActor
      button={({isOpen, getActorProps}) => (
        <StyledDropdownButton {...getActorProps()} isOpen={isOpen}>
          <ButtonTitle>{getTitle()}</ButtonTitle>
        </StyledDropdownButton>
      )}
    >
      <SavedSearchMenu
        organization={organization}
        savedSearchList={savedSearchList}
        onSavedSearchSelect={onSavedSearchSelect}
        onSavedSearchDelete={onSavedSearchDelete}
        query={query}
        sort={sort}
      />
    </DropdownControl>
  );
}

export default SavedSearchSelector;

const StyledDropdownButton = styled(DropdownButton)`
  color: ${p => p.theme.textColor};
  background-color: ${p => p.theme.background};
  border-right: 0;
  border-color: ${p => p.theme.border};
  z-index: ${p => p.theme.zIndex.dropdownAutocomplete.actor};
  border-radius: ${p =>
    p.isOpen
      ? `${p.theme.borderRadius} 0 0 0`
      : `${p.theme.borderRadius} 0 0 ${p.theme.borderRadius}`};
  white-space: nowrap;
  max-width: 200px;
  margin-right: 0;

  &:hover,
  &:focus,
  &:active {
    border-color: ${p => p.theme.border};
    border-right: 0;
  }
`;

const ButtonTitle = styled('span')`
  ${overflowEllipsis}
`;
