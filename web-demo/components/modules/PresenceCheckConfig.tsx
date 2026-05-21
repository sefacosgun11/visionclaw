'use client';

import { useState } from 'react';

interface PresenceCheckConfigProps {
  initialConfig?: {
    requiredItems: string[];
  };
  onChange: (config: { requiredItems: string[] }) => void;
}

export default function PresenceCheckConfig({ 
  initialConfig, 
  onChange 
}: PresenceCheckConfigProps) {
  const [items, setItems] = useState<string[]>(initialConfig?.requiredItems || []);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      const updated = [...items, newItem.trim()];
      setItems(updated);
      setNewItem('');
      onChange({ requiredItems: updated });
    }
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange({ requiredItems: updated });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Required Items to Check
        </label>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder="e.g., Hard hat, Safety vest..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add
          </button>
        </div>
      </div>
      
      {items.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Items ({items.length}):
          </p>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <span className="text-sm text-gray-900">
                  {index + 1}. {item}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {items.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No items added yet. Add items to check for in the image.
        </p>
      )}
    </div>
  );
}
