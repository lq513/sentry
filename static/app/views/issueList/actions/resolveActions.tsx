import ResolveActions from 'sentry/components/actions/resolve';
import {Organization} from 'sentry/types';

import {ConfirmAction} from './utils';

type Props = {
  anySelected: boolean;
  onShouldConfirm: (action: ConfirmAction) => boolean;
  onUpdate: (data?: any) => void;
  orgSlug: Organization['slug'];
  params: any;
};

function ResolveActionsContainer({
  params,
  orgSlug,
  anySelected,
  onShouldConfirm,
  onUpdate,
}: Props) {
  const {
    hasReleases,
    latestRelease,
    projectId,
    confirm,
    label,
    loadingProjects,
    projectFetchError,
  } = params;

  // resolve requires a single project to be active in an org context
  // projectId is null when 0 or >1 projects are selected.
  const resolveDisabled = Boolean(!anySelected || projectFetchError);
  const resolveDropdownDisabled = Boolean(
    !anySelected || !projectId || loadingProjects || projectFetchError
  );

  return (
    <ResolveActions
      hasRelease={hasReleases}
      latestRelease={latestRelease}
      orgSlug={orgSlug}
      projectSlug={projectId}
      onUpdate={onUpdate}
      shouldConfirm={onShouldConfirm(ConfirmAction.RESOLVE)}
      confirmMessage={confirm('resolve', true)}
      confirmLabel={label('resolve')}
      disabled={resolveDisabled}
      disableDropdown={resolveDropdownDisabled}
      projectFetchError={projectFetchError}
    />
  );
}

export default ResolveActionsContainer;
