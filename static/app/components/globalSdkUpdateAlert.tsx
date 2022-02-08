import * as React from 'react';
import styled from '@emotion/styled';

import {promptsCheck, promptsUpdate} from 'sentry/actionCreators/prompts';
import SidebarPanelActions from 'sentry/actions/sidebarPanelActions';
import Alert, {AlertProps} from 'sentry/components/alert';
import {ALL_ACCESS_PROJECTS} from 'sentry/constants/pageFilters';
import {IconUpgrade} from 'sentry/icons';
import {t} from 'sentry/locale';
import space from 'sentry/styles/space';
import {PageFilters, ProjectSdkUpdates, SDKUpdatesSuggestion} from 'sentry/types';
import trackAdvancedAnalyticsEvent from 'sentry/utils/analytics/trackAdvancedAnalyticsEvent';
import {promptIsDismissed} from 'sentry/utils/promptIsDismissed';
import useApi from 'sentry/utils/useApi';
import useOrganization from 'sentry/utils/useOrganization';
import withPageFilters from 'sentry/utils/withPageFilters';
import withSdkUpdates from 'sentry/utils/withSdkUpdates';

import {SidebarPanelKey} from './sidebar/types';
import Button from './button';

const flattenSuggestions = (list: ProjectSdkUpdates[]): SDKUpdatesSuggestion[] =>
  list.reduce<SDKUpdatesSuggestion[]>(
    (suggestions, sdk) => suggestions.concat(sdk.suggestions),
    []
  );
interface InnerGlobalSdkSuggestionsProps extends AlertProps {
  sdkUpdates?: ProjectSdkUpdates[] | null;
  selection?: PageFilters;
}

function InnerGlobalSdkUpdateAlert(
  props: InnerGlobalSdkSuggestionsProps
): React.ReactElement | null {
  const api = useApi();
  const organization = useOrganization();

  const [showUpdateAlert, setShowUpdateAlert] = React.useState<boolean>(false);

  const checkIfComponentShouldPrompt = React.useCallback(() => {
    promptsCheck(api, {
      organizationId: organization.id,
      feature: 'sdk_updates',
    }).then(prompt => {
      setShowUpdateAlert(!promptIsDismissed(prompt));
    });
  }, [api, organization]);

  const handleSnoozePrompt = React.useCallback(() => {
    promptsUpdate(api, {
      organizationId: organization.id,
      feature: 'sdk_updates',
      status: 'snoozed',
    });

    trackAdvancedAnalyticsEvent('sdk_updates.snoozed', {organization});
    setShowUpdateAlert(false);
  }, [api, organization]);

  const handleReviewUpdatesClick = React.useCallback(() => {
    SidebarPanelActions.activatePanel(SidebarPanelKey.Broadcasts);
    trackAdvancedAnalyticsEvent('sdk_updates.clicked', {organization});
  }, []);

  React.useEffect(() => {
    trackAdvancedAnalyticsEvent('sdk_updates.seen', {organization});
    checkIfComponentShouldPrompt();
  }, []);

  if (!showUpdateAlert || !props.sdkUpdates?.length) {
    return null;
  }

  // withSdkUpdates explicitly only queries My Projects. This means that when
  // looking at any projects outside of My Projects (like All Projects), this
  // will only show the updates relevant to the to user.
  const projectSpecificUpdates =
    props.selection?.projects?.length === 0 ||
    props.selection?.projects[0] === ALL_ACCESS_PROJECTS
      ? props.sdkUpdates
      : props.sdkUpdates.filter(update =>
          props.selection?.projects?.includes(parseInt(update.projectId, 10))
        );

  // Are there any updates?
  if (flattenSuggestions(projectSpecificUpdates).length === 0) {
    return null;
  }

  return (
    <Alert type="info" icon={<IconUpgrade />}>
      <Content>
        {t(
          `You have outdated SDKs in your projects. Update them for important fixes and features.`
        )}
        <Actions>
          <Button
            priority="link"
            size="zero"
            title={t('Dismiss for the next two weeks')}
            onClick={handleSnoozePrompt}
          >
            {t('Remind me later')}
          </Button>
          |
          <Button priority="link" size="zero" onClick={handleReviewUpdatesClick}>
            {t('Review updates')}
          </Button>
        </Actions>
      </Content>
    </Alert>
  );
}

const Content = styled('div')`
  display: flex;
  flex-wrap: wrap;

  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    justify-content: space-between;
  }
`;

const Actions = styled('div')`
  display: grid;
  grid-template-columns: repeat(3, max-content);
  gap: ${space(1)};
`;

const WithSdkUpdatesGlobalSdkUpdateAlert = withSdkUpdates(
  withPageFilters(InnerGlobalSdkUpdateAlert)
);

export {
  WithSdkUpdatesGlobalSdkUpdateAlert as GlobalSdkUpdateAlert,
  InnerGlobalSdkUpdateAlert,
};
