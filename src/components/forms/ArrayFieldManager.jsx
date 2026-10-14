import Button from '../common/Button'

/**
 * Generic repeater for the devfile's list sections.
 *
 * `renderItem` receives the item together with a setter that replaces the
 * whole item, which keeps editors free of field-path plumbing.
 */
export default function ArrayFieldManager({
  items = [],
  onAdd,
  onRemove,
  onChangeItem,
  onMove,
  renderItem,
  itemLabel,
  addButtonText = 'Add Item',
  emptyMessage = 'No items added yet.',
  testId
}) {
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              data-testid={testId ? `${testId}-${index}` : undefined}
              className="relative border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-gray-500">
                  {itemLabel ? itemLabel(item, index) : `Item ${index + 1}`}
                </span>
                <div className="flex gap-2">
                  {onMove && items.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => onMove(index, -1)}
                        disabled={index === 0}
                        className="text-xs px-2 py-1"
                        title="Move up"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onMove(index, 1)}
                        disabled={index === items.length - 1}
                        className="text-xs px-2 py-1"
                        title="Move down"
                      >
                        ↓
                      </Button>
                    </>
                  )}
                  <Button variant="danger" onClick={() => onRemove(index)} className="text-xs px-2 py-1">
                    Remove
                  </Button>
                </div>
              </div>
              {renderItem(item, index, (value) => onChangeItem(index, value))}
            </div>
          ))}
        </div>
      )}
      <Button variant="outline" onClick={onAdd} className="w-full">
        {addButtonText}
      </Button>
    </div>
  )
}
