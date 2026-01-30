import { useState } from 'react'
import Button from '../common/Button'
import FormInput from './FormInput'

export default function KeyValueArrayManager({
  items = [],
  onUpdate,
  keyLabel = 'Key',
  valueLabel = 'Value',
  keyPlaceholder = 'key',
  valuePlaceholder = 'value',
  addButtonText = 'Add Item',
  emptyMessage = 'No items added yet.'
}) {
  const handleAdd = () => {
    const newItems = [...items, { name: '', value: '' }]
    onUpdate(newItems)
  }

  const handleRemove = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    onUpdate(newItems)
  }

  const handleUpdate = (index, field, value) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    onUpdate(newItems)
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                <FormInput
                  name={`key-${index}`}
                  label={keyLabel}
                  value={item.name || ''}
                  onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                  placeholder={keyPlaceholder}
                />
              </div>
              <div className="flex-1">
                <FormInput
                  name={`value-${index}`}
                  label={valueLabel}
                  value={item.value || ''}
                  onChange={(e) => handleUpdate(index, 'value', e.target.value)}
                  placeholder={valuePlaceholder}
                />
              </div>
              <div className="pt-7">
                <Button
                  variant="danger"
                  onClick={() => handleRemove(index)}
                  className="text-xs px-2 py-1"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Button
        variant="outline"
        onClick={handleAdd}
        className="w-full text-sm"
      >
        {addButtonText}
      </Button>
    </div>
  )
}
