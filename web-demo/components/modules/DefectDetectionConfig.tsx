'use client';

import { useState } from 'react';

interface DefectDetectionConfigProps {
  initialConfig?: {
    defectTypes: string[];
    sensitivity?: number;
  };
  onChange: (config: { defectTypes: string[]; sensitivity: number }) => void;
}

export default function DefectDetectionConfig({ 
  initialConfig, 
  onChange 
}: DefectDetectionConfigProps) {
  const [defectTypes, setDefectTypes] = useState<string[]>(initialConfig?.defectTypes || []);
  const [sensitivity, setSensitivity] = useState(initialConfig?.sensitivity || 0.7);
  const [newDefect, setNewDefect] = useState('');

  const addDefect = () => {
    if (newDefect.trim()) {
      const updated = [...defectTypes, newDefect.trim()];
      setDefectTypes(updated);
      setNewDefect('');
      onChange({ defectTypes: updated, sensitivity });
    }
  };

  const removeDefect = (index: number) => {
    const updated = defectTypes.filter((_, i) => i !== index);
    setDefectTypes(updated);
    onChange({ defectTypes: updated, sensitivity });
  };

  const updateSensitivity = (value: number) => {
    setSensitivity(value);
    onChange({ defectTypes, sensitivity: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Defect Types to Detect
        </label>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newDefect}
            onChange={(e) => setNewDefect(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addDefect()}
            placeholder="e.g., Crack, Rust, Scratch..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="button"
            onClick={addDefect}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            + Add
          </button>
        </div>
      </div>
      
      {defectTypes.length > 0 && (
        <div className="space-y-2">
          <ul className="space-y-2">
            {defectTypes.map((defect, index) => (
              <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span>{index + 1}. {defect}</span>
                <button
                  onClick={() => removeDefect(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detection Sensitivity: {(sensitivity * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={sensitivity}
          onChange={(e) => updateSensitivity(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Lenient (0%)</span>
          <span>Strict (100%)</span>
        </div>
      </div>
    </div>
  );
}
