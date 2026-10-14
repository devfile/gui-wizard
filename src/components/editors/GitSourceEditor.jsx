import FormInput from '../forms/FormInput'
import FormSelect from '../forms/FormSelect'
import MapFieldManager from '../forms/MapFieldManager'

/**
 * Editor for the devfile `git` source shared by projects, starter projects,
 * dependent projects and image component dockerfiles.
 */
export default function GitSourceEditor({
  name,
  value,
  onChange,
  singleRemote = false,
  withFileLocation = false
}) {
  const git = value || {}
  const remotes = git.remotes || []
  const checkoutFrom = git.checkoutFrom || {}

  const remoteOptions = remotes
    .map((remote) => remote.key.trim())
    .filter(Boolean)
    .filter((remote, index, keys) => keys.indexOf(remote) === index)
    .map((remote) => ({ value: remote, label: remote }))

  const update = (patch) => onChange({ ...git, ...patch })

  return (
    <div>
      <MapFieldManager
        name={`${name}-remotes`}
        label={singleRemote ? 'Git Remote' : 'Git Remotes'}
        items={remotes}
        onChange={(items) => update({ remotes: items })}
        keyLabel="Remote name"
        valueLabel="Remote URL"
        keyPlaceholder="origin"
        valuePlaceholder="https://github.com/org/repo.git"
        addButtonText="Add Remote"
        emptyMessage="No remotes configured. At least one remote is required."
        helpText={
          singleRemote
            ? 'Only one remote may be configured for this source.'
            : 'When more than one remote is configured, a checkout remote is mandatory.'
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormSelect
          name={`${name}-checkoutFrom-remote`}
          label="Checkout From Remote"
          value={checkoutFrom.remote || ''}
          onChange={(event) => update({ checkoutFrom: { ...checkoutFrom, remote: event.target.value } })}
          options={remoteOptions}
          placeholder="Default (the only remote)"
        />

        <FormInput
          name={`${name}-checkoutFrom-revision`}
          label="Checkout From Revision"
          value={checkoutFrom.revision || ''}
          onChange={(event) => update({ checkoutFrom: { ...checkoutFrom, revision: event.target.value } })}
          placeholder="main"
          helpText="Branch, tag or commit id. Defaults to the remote's default branch."
        />
      </div>

      {withFileLocation && (
        <FormInput
          name={`${name}-fileLocation`}
          label="Dockerfile Location"
          value={git.fileLocation || ''}
          onChange={(event) => update({ fileLocation: event.target.value })}
          placeholder="docker/Dockerfile"
          helpText="Location of the Dockerfile in the git repository, relative to its root."
        />
      )}
    </div>
  )
}
