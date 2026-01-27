import Button from '../common/Button'

export default function ArrayFieldManager({
  items = [],
  onAdd,
  onRemove,
  onUpdate,
  renderItem,
  addButtonText = 'Add Item',
  emptyMessage = 'No items added yet.'
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
            <div key={index} className="relative border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-gray-500">Item {index + 1}</span>
                <Button
                  variant="danger"
                  onClick={() => onRemove(index)}
                  className="text-xs px-2 py-1"
                >
                  Remove
                </Button>
              </div>
              {renderItem(item, index, (field, value) => onUpdate(index, field, value))}
            </div>
          ))}
        </div>
      )}
      <Button
        variant="outline"
        onClick={onAdd}
        className="w-full"
      >
        {addButtonText}
      </Button>
    </div>
  )
}
