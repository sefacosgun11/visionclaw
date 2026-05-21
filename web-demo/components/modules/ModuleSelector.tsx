'use client';

import { useState, useEffect } from 'react';
import { InspectionModule } from '@/types/module.types';
import { getAllModules } from '@/lib/api';

interface ModuleSelectorProps {
  selectedModuleId?: string;
  onSelect: (module: InspectionModule) => void;
}

export default function ModuleSelector({ selectedModuleId, onSelect }: ModuleSelectorProps) {
  const [modules, setModules] = useState<InspectionModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const data = await getAllModules();
      setModules(data);
    } catch (error) {
      console.error('Failed to load modules:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select Inspection Module
      </label>
      <select
        value={selectedModuleId || ''}
        onChange={(e) => {
          const module = modules.find(m => m.id === e.target.value);
          if (module) onSelect(module);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Choose a module...</option>
        {modules.map(module => (
          <option key={module.id} value={module.id}>
            {module.icon} {module.name} - {module.description.substring(0, 50)}...
          </option>
        ))}
      </select>
      
      {selectedModuleId && (
        <div className="mt-2 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Category:</span> {modules.find(m => m.id === selectedModuleId)?.category}
          </p>
          <div className="flex gap-2 mt-1">
            {modules.find(m => m.id === selectedModuleId)?.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
