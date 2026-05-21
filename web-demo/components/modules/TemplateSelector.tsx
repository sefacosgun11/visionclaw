'use client';

import { useState, useEffect } from 'react';
import { ModuleTemplate } from '@/types/module.types';
import { getAllTemplates } from '@/lib/api';

interface TemplateSelectorProps {
  moduleId: string;
  selectedTemplateId?: string;
  onSelect: (template: ModuleTemplate | null) => void;
}

export default function TemplateSelector({ 
  moduleId, 
  selectedTemplateId, 
  onSelect 
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<ModuleTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (moduleId) {
      loadTemplates();
    }
  }, [moduleId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getAllTemplates({ moduleId, isPublic: true });
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!moduleId) return null;

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Use Template (Optional)
      </label>
      <select
        value={selectedTemplateId || ''}
        onChange={(e) => {
          const template = templates.find(t => t.id === e.target.value);
          onSelect(template || null);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Custom configuration...</option>
        {templates.map(template => (
          <option key={template.id} value={template.id}>
            {template.name} ({template.category})
          </option>
        ))}
      </select>
      
      {selectedTemplateId && (
        <div className="mt-2 p-3 bg-green-50 rounded-md">
          <p className="text-sm font-medium text-gray-900">
            {templates.find(t => t.id === selectedTemplateId)?.name}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {templates.find(t => t.id === selectedTemplateId)?.description}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Used {templates.find(t => t.id === selectedTemplateId)?.usageCount || 0} times
          </p>
        </div>
      )}
    </div>
  );
}
