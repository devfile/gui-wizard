import { ENDPOINT_EXPOSURES, ENDPOINT_PROTOCOLS } from '../../utils/constants'
import { createEndpoint } from '../../utils/factories'
import AttributesEditor from '../forms/AttributesEditor'
import CollapsibleSection from '../forms/CollapsibleSection'
import FormCheckbox from '../forms/FormCheckbox'
import FormInput from '../forms/FormInput'
import FormSelect from '../forms/FormSelect'
import MapFieldManager from '../forms/MapFieldManager'
import ArrayFieldManager from '../forms/ArrayFieldManager'

/** Editor for the `endpoints` list of container, kubernetes and openshift components. */
export default function EndpointsEditor({ name, endpoints = [], onChange }) {
  const renderEndpoint = (endpoint, index, update) => (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          name={`${name}-name-${index}`}
          label="Endpoint Name"
          value={endpoint.name}
          onChange={(event) => update({ ...endpoint, name: event.target.value })}
          required
          maxLength={15}
          placeholder="http-8080"
          helpText="Unique across all components, max 15 characters"
        />

        <FormInput
          name={`${name}-targetPort-${index}`}
          label="Target Port"
          type="number"
          min={1}
          max={65535}
          value={endpoint.targetPort}
          onChange={(event) => update({ ...endpoint, targetPort: event.target.value })}
          required
          placeholder="8080"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormSelect
          name={`${name}-protocol-${index}`}
          label="Protocol"
          value={endpoint.protocol}
          onChange={(event) => update({ ...endpoint, protocol: event.target.value })}
          options={ENDPOINT_PROTOCOLS}
          placeholder="Default (http)"
        />

        <FormSelect
          name={`${name}-exposure-${index}`}
          label="Exposure"
          value={endpoint.exposure}
          onChange={(event) => update({ ...endpoint, exposure: event.target.value })}
          options={ENDPOINT_EXPOSURES}
          placeholder="Default (public)"
        />
      </div>

      <FormInput
        name={`${name}-path-${index}`}
        label="Path"
        value={endpoint.path}
        onChange={(event) => update({ ...endpoint, path: event.target.value })}
        placeholder="/api"
        helpText="Path of the endpoint URL"
      />

      <FormCheckbox
        name={`${name}-secure-${index}`}
        label="Secure endpoint"
        checked={endpoint.secure === true}
        onChange={(event) => update({ ...endpoint, secure: event.target.checked })}
        helpText="Put the endpoint behind a JWT proxy that requires authentication"
      />

      <CollapsibleSection title="Endpoint annotations & attributes">
        <MapFieldManager
          name={`${name}-annotation-${index}`}
          label="Annotations"
          items={endpoint.annotation || []}
          onChange={(items) => update({ ...endpoint, annotation: items })}
          emptyMessage="No annotations added to the generated ingress or route."
          addButtonText="Add Annotation"
        />

        <AttributesEditor
          name={`${name}-attributes-${index}`}
          value={endpoint.attributes || ''}
          onChange={(text) => update({ ...endpoint, attributes: text })}
          rows={3}
        />
      </CollapsibleSection>
    </div>
  )

  return (
    <ArrayFieldManager
      items={endpoints}
      onAdd={() => onChange([...endpoints, createEndpoint()])}
      onRemove={(index) => onChange(endpoints.filter((_, position) => position !== index))}
      onChangeItem={(index, value) =>
        onChange(endpoints.map((item, position) => (position === index ? value : item)))
      }
      renderItem={renderEndpoint}
      itemLabel={(endpoint, index) => endpoint.name || `Endpoint ${index + 1}`}
      addButtonText="Add Endpoint"
      emptyMessage="No endpoints exposed by this component."
    />
  )
}
