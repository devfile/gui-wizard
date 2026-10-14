import {
  COMPONENT_TYPES,
  DOCKERFILE_SOURCE_TYPES,
  IMAGE_OVERRIDE_TYPES,
  K8S_SOURCE_TYPES
} from '../../utils/constants'
import {
  applyComponentType,
  applyDockerfileSourceType,
  applyImageOverrideType,
  applyK8sSourceType,
  createVolumeMount,
  getComponentType,
  getDockerfileSourceType,
  getImageOverrideType,
  getK8sSourceType
} from '../../utils/factories'
import AttributesEditor from '../forms/AttributesEditor'
import CollapsibleSection from '../forms/CollapsibleSection'
import FormCheckbox from '../forms/FormCheckbox'
import FormInput from '../forms/FormInput'
import FormSelect from '../forms/FormSelect'
import FormTextarea from '../forms/FormTextarea'
import EnvVarManager from '../forms/EnvVarManager'
import MapFieldManager from '../forms/MapFieldManager'
import StringListManager from '../forms/StringListManager'
import TriStateSelect from '../forms/TriStateSelect'
import Button from '../common/Button'
import EndpointsEditor from './EndpointsEditor'
import GitSourceEditor from './GitSourceEditor'

/** Checkbox for top-level components, tri-state inside parent overrides. */
function BoolField({ partial, name, label, value, onChange, helpText }) {
  if (partial) {
    return <TriStateSelect name={name} label={label} value={value} onChange={onChange} helpText={helpText} />
  }

  return (
    <FormCheckbox
      name={name}
      label={label}
      checked={value === true}
      onChange={(event) => onChange(event.target.checked)}
      helpText={helpText}
    />
  )
}

function VolumeMountsEditor({ name, mounts = [], onChange, volumeNames }) {
  const update = (index, patch) =>
    onChange(mounts.map((mount, position) => (position === index ? { ...mount, ...patch } : mount)))

  return (
    <div className="mb-4">
      <span className="block text-sm font-medium text-gray-700 mb-1">Volume Mounts</span>
      {mounts.length === 0 ? (
        <p className="text-sm text-gray-500 italic py-2">
          No volumes mounted. Mounted volumes must have a matching volume component.
        </p>
      ) : (
        <div className="space-y-2">
          {mounts.map((mount, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                name={`${name}-name-${index}`}
                aria-label={`Volume name ${index + 1}`}
                list={`${name}-volumes`}
                value={mount.name}
                onChange={(event) => update(index, { name: event.target.value })}
                placeholder="volume component name"
                className="flex-1 rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                name={`${name}-path-${index}`}
                aria-label={`Volume path ${index + 1}`}
                value={mount.path}
                onChange={(event) => update(index, { path: event.target.value })}
                placeholder="/home/user/.m2 (defaults to /<name>)"
                className="flex-[2] rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                variant="danger"
                onClick={() => onChange(mounts.filter((_, position) => position !== index))}
                className="text-xs px-2 py-1"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      <datalist id={`${name}-volumes`}>
        {volumeNames.map((volume) => (
          <option key={volume} value={volume} />
        ))}
      </datalist>
      <Button variant="outline" onClick={() => onChange([...mounts, createVolumeMount()])} className="w-full text-sm mt-2">
        Add Volume Mount
      </Button>
    </div>
  )
}

function ContainerEditor({ prefix, index, container, onChange, partial, volumeNames }) {
  const update = (patch) => onChange({ ...container, ...patch })
  const annotation = container.annotation || { deployment: [], service: [] }

  return (
    <div>
      <FormInput
        name={`${prefix}-image-${index}`}
        label="Container Image"
        value={container.image}
        onChange={(event) => update({ image: event.target.value })}
        placeholder="quay.io/devfile/base-developer-image:ubi10-latest"
        required={!partial}
        helpText="Full container image reference"
      />

      <BoolField
        partial={partial}
        name={`${prefix}-mountSources-${index}`}
        label="Mount project sources"
        value={container.mountSources}
        onChange={(value) => update({ mountSources: value })}
        helpText="Mount the project sources into the container"
      />

      <FormInput
        name={`${prefix}-sourceMapping-${index}`}
        label="Source Mapping"
        value={container.sourceMapping}
        onChange={(event) => update({ sourceMapping: event.target.value })}
        placeholder="/projects"
        helpText="Path in the container where the project sources are mounted. Defaults to /projects."
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name={`${prefix}-memoryRequest-${index}`}
          label="Memory Request"
          value={container.memoryRequest}
          onChange={(event) => update({ memoryRequest: event.target.value })}
          placeholder="512Mi"
        />
        <FormInput
          name={`${prefix}-memoryLimit-${index}`}
          label="Memory Limit"
          value={container.memoryLimit}
          onChange={(event) => update({ memoryLimit: event.target.value })}
          placeholder="1Gi"
        />
        <FormInput
          name={`${prefix}-cpuRequest-${index}`}
          label="CPU Request"
          value={container.cpuRequest}
          onChange={(event) => update({ cpuRequest: event.target.value })}
          placeholder="100m"
        />
        <FormInput
          name={`${prefix}-cpuLimit-${index}`}
          label="CPU Limit"
          value={container.cpuLimit}
          onChange={(event) => update({ cpuLimit: event.target.value })}
          placeholder="1000m"
        />
      </div>

      <CollapsibleSection
        title="Environment variables"
        badge={container.env?.length || undefined}
        description="Variables injected into the container"
      >
        <EnvVarManager
          name={`${prefix}-env-${index}`}
          label={null}
          items={container.env || []}
          onChange={(items) => update({ env: items })}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Endpoints"
        badge={container.endpoints?.length || undefined}
        description="Ports exposed by the container"
      >
        <EndpointsEditor
          name={`${prefix}-endpoint-${index}`}
          endpoints={container.endpoints || []}
          onChange={(items) => update({ endpoints: items })}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Volume mounts"
        badge={container.volumeMounts?.length || undefined}
        description="Volume components mounted into the container"
      >
        <VolumeMountsEditor
          name={`${prefix}-volumeMount-${index}`}
          mounts={container.volumeMounts || []}
          onChange={(items) => update({ volumeMounts: items })}
          volumeNames={volumeNames}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Command, args and pod settings">
        <StringListManager
          name={`${prefix}-command-${index}`}
          label="Command"
          items={container.command || []}
          onChange={(items) => update({ command: items })}
          placeholder="sleep"
          addButtonText="Add Command Entry"
          emptyMessage="Using the image entrypoint."
          helpText="Overrides the image entrypoint. Non-UDI images usually need ['sleep', 'infinity']."
        />

        <StringListManager
          name={`${prefix}-args-${index}`}
          label="Args"
          items={container.args || []}
          onChange={(items) => update({ args: items })}
          placeholder="infinity"
          addButtonText="Add Arg"
          emptyMessage="Using the image default arguments."
        />

        <BoolField
          partial={partial}
          name={`${prefix}-dedicatedPod-${index}`}
          label="Run in a dedicated pod"
          value={container.dedicatedPod}
          onChange={(value) => update({ dedicatedPod: value })}
          helpText="Run the container in its own pod instead of the shared workspace pod"
        />

        <MapFieldManager
          name={`${prefix}-annotation-deployment-${index}`}
          label="Deployment Annotations"
          items={annotation.deployment || []}
          onChange={(items) => update({ annotation: { ...annotation, deployment: items } })}
          emptyMessage="No deployment annotations."
          addButtonText="Add Deployment Annotation"
        />

        <MapFieldManager
          name={`${prefix}-annotation-service-${index}`}
          label="Service Annotations"
          items={annotation.service || []}
          onChange={(items) => update({ annotation: { ...annotation, service: items } })}
          emptyMessage="No service annotations."
          addButtonText="Add Service Annotation"
        />
      </CollapsibleSection>
    </div>
  )
}

function VolumeEditor({ prefix, index, volume, onChange, partial }) {
  return (
    <div>
      <FormInput
        name={`${prefix}-size-${index}`}
        label="Volume Size"
        value={volume.size}
        onChange={(event) => onChange({ ...volume, size: event.target.value })}
        placeholder="2Gi"
        helpText="Storage size, for example 1Gi or 512Mi"
      />

      <BoolField
        partial={partial}
        name={`${prefix}-ephemeral-${index}`}
        label="Ephemeral volume"
        value={volume.ephemeral}
        onChange={(value) => onChange({ ...volume, ephemeral: value })}
        helpText="Back the volume with emptyDir instead of a persistent volume claim"
      />
    </div>
  )
}

function K8sEditor({ prefix, index, type, k8s, onChange }) {
  const sourceType = getK8sSourceType(k8s)

  return (
    <div>
      <FormSelect
        name={`${prefix}-${type}-source-${index}`}
        label="Manifest Source"
        value={sourceType}
        onChange={(event) => onChange(applyK8sSourceType(k8s, event.target.value))}
        options={K8S_SOURCE_TYPES}
      />

      {sourceType === 'uri' ? (
        <FormInput
          name={`${prefix}-${type}-uri-${index}`}
          label="Manifest URI"
          value={k8s.uri || ''}
          onChange={(event) => onChange({ ...k8s, uri: event.target.value })}
          placeholder="manifests/deployment.yaml"
          required
          helpText="Relative path inside the repository or an absolute URL"
        />
      ) : (
        <FormTextarea
          name={`${prefix}-${type}-inlined-${index}`}
          label="Inlined Manifest"
          value={k8s.inlined || ''}
          onChange={(event) => onChange({ ...k8s, inlined: event.target.value })}
          rows={8}
          monospace
          required
          placeholder={'apiVersion: v1\nkind: Service\nmetadata:\n  name: my-service'}
        />
      )}

      <TriStateSelect
        name={`${prefix}-${type}-deployByDefault-${index}`}
        label="Deploy by default"
        value={k8s.deployByDefault}
        onChange={(value) => onChange({ ...k8s, deployByDefault: value })}
        helpText="When unset, the resource is deployed only if no apply command references it."
      />

      <CollapsibleSection title="Endpoints" badge={k8s.endpoints?.length || undefined}>
        <EndpointsEditor
          name={`${prefix}-${type}-endpoint-${index}`}
          endpoints={k8s.endpoints || []}
          onChange={(items) => onChange({ ...k8s, endpoints: items })}
        />
      </CollapsibleSection>
    </div>
  )
}

function ImageEditor({ prefix, index, image, onChange, partial }) {
  const dockerfile = image.dockerfile || {}
  const sourceType = getDockerfileSourceType(dockerfile)
  const overrideType = getImageOverrideType(image)
  const showDockerfile = !partial || overrideType === 'dockerfile'
  const updateDockerfile = (patch) => onChange({ ...image, dockerfile: { ...dockerfile, ...patch } })

  return (
    <div>
      <FormInput
        name={`${prefix}-imageName-${index}`}
        label="Image Name"
        value={image.imageName}
        onChange={(event) => onChange({ ...image, imageName: event.target.value })}
        placeholder="quay.io/my-org/my-app:latest"
        required={!partial}
        helpText="Name of the image the build produces"
      />

      {partial && (
        <FormSelect
          name={`${prefix}-override-${index}`}
          label="Override"
          value={overrideType}
          onChange={(event) => onChange(applyImageOverrideType(image, event.target.value))}
          options={IMAGE_OVERRIDE_TYPES}
          helpText="An image override either redefines the build or only changes autoBuild, never both."
        />
      )}

      {!showDockerfile && (
        <TriStateSelect
          name={`${prefix}-autoBuild-${index}`}
          label="Build automatically"
          value={image.autoBuild}
          onChange={(value) => onChange({ ...image, autoBuild: value })}
          helpText="Whether the inherited image is built automatically. Required by this override."
        />
      )}

      {!partial && (
        <TriStateSelect
          name={`${prefix}-autoBuild-${index}`}
          label="Build automatically"
          value={image.autoBuild}
          onChange={(value) => onChange({ ...image, autoBuild: value })}
          helpText="When unset, the image is built only if an apply command references it."
        />
      )}

      {showDockerfile && (
        <>
          <FormSelect
            name={`${prefix}-dockerfile-source-${index}`}
            label="Dockerfile Source"
            value={sourceType}
            onChange={(event) => onChange({ ...image, dockerfile: applyDockerfileSourceType(dockerfile, event.target.value) })}
            options={DOCKERFILE_SOURCE_TYPES}
          />

          {sourceType === 'uri' && (
            <FormInput
              name={`${prefix}-dockerfile-uri-${index}`}
              label="Dockerfile URI"
              value={dockerfile.uri || ''}
              onChange={(event) => updateDockerfile({ uri: event.target.value })}
              placeholder="docker/Dockerfile"
              required
            />
          )}

          {sourceType === 'devfileRegistry' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                name={`${prefix}-dockerfile-registry-id-${index}`}
                label="Registry Dockerfile Id"
                value={dockerfile.devfileRegistry?.id || ''}
                onChange={(event) =>
                  updateDockerfile({ devfileRegistry: { ...dockerfile.devfileRegistry, id: event.target.value } })
                }
                placeholder="nodejs"
                required
              />
              <FormInput
                name={`${prefix}-dockerfile-registry-url-${index}`}
                label="Registry URL"
                value={dockerfile.devfileRegistry?.registryUrl || ''}
                onChange={(event) =>
                  updateDockerfile({ devfileRegistry: { ...dockerfile.devfileRegistry, registryUrl: event.target.value } })
                }
                placeholder="https://registry.devfile.io"
                helpText="Defaults to the registry the parent devfile came from"
              />
            </div>
          )}

          {sourceType === 'git' && (
            <GitSourceEditor
              name={`${prefix}-dockerfile-git-${index}`}
              value={dockerfile.git}
              onChange={(git) => updateDockerfile({ git })}
              singleRemote
              withFileLocation
            />
          )}

          <FormInput
            name={`${prefix}-dockerfile-buildContext-${index}`}
            label="Build Context"
            value={dockerfile.buildContext || ''}
            onChange={(event) => updateDockerfile({ buildContext: event.target.value })}
            placeholder="."
            helpText="Path of the build context relative to the project root"
          />

          <BoolField
            partial={partial}
            name={`${prefix}-dockerfile-rootRequired-${index}`}
            label="Build requires root privileges"
            value={dockerfile.rootRequired}
            onChange={(value) => updateDockerfile({ rootRequired: value })}
          />

          <StringListManager
            name={`${prefix}-dockerfile-args-${index}`}
            label="Build Arguments"
            items={dockerfile.args || []}
            onChange={(items) => updateDockerfile({ args: items })}
            placeholder="--build-arg=VERSION=1.0"
            addButtonText="Add Build Argument"
            emptyMessage="No extra arguments passed to the build."
          />
        </>
      )}
    </div>
  )
}

/**
 * Editor for a single devfile component.
 *
 * `partial` is used for `parent.components` overrides where no field is
 * required and booleans must keep a distinct "not set" state.
 */
export default function ComponentEditor({
  index,
  value,
  onChange,
  partial = false,
  prefix = 'component',
  volumeNames = []
}) {
  const type = getComponentType(value)

  return (
    <div className="space-y-2">
      <FormInput
        name={`${prefix}-name-${index}`}
        label="Component Name"
        value={value.name}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
        required
        maxLength={63}
        placeholder="dev-container"
        helpText="Lowercase alphanumeric with dashes, unique across components"
      />

      <FormSelect
        name={`${prefix}-type-${index}`}
        label="Component Type"
        value={type}
        onChange={(event) => onChange(applyComponentType(value, event.target.value, partial))}
        options={COMPONENT_TYPES}
      />

      {type === 'container' && (
        <ContainerEditor
          prefix={prefix}
          index={index}
          container={value.container}
          onChange={(container) => onChange({ ...value, container })}
          partial={partial}
          volumeNames={volumeNames}
        />
      )}

      {type === 'volume' && (
        <VolumeEditor
          prefix={prefix}
          index={index}
          volume={value.volume}
          onChange={(volume) => onChange({ ...value, volume })}
          partial={partial}
        />
      )}

      {(type === 'kubernetes' || type === 'openshift') && (
        <K8sEditor
          prefix={prefix}
          index={index}
          type={type}
          k8s={value[type]}
          onChange={(k8s) => onChange({ ...value, [type]: k8s })}
        />
      )}

      {type === 'image' && (
        <ImageEditor
          prefix={prefix}
          index={index}
          image={value.image}
          onChange={(image) => onChange({ ...value, image })}
          partial={partial}
        />
      )}

      <CollapsibleSection title="Component attributes">
        <AttributesEditor
          name={`${prefix}-attributes-${index}`}
          value={value.attributes || ''}
          onChange={(text) => onChange({ ...value, attributes: text })}
          helpText="Free-form YAML map, for example container-overrides or pod-overrides."
        />
      </CollapsibleSection>
    </div>
  )
}
