'use client';

import { useState, useEffect } from 'react';
import { Eye, AlertCircle, ShieldCheck, BarChart3, ChevronDown } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
}

export default function ModuleSelector({ 
  selectedModule, 
  onSelect 
}: { 
  selectedModule: any | null;
  onSelect: (module: any) => void;
}) {
  const [modules, setModules] = useState<Module[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/modules`);
      const data = await res.json();
      setModules(data || []);
    } catch (error) {
      console.error('Failed to load modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: any = {
      'visibility': <Eye size={20} />,
      'alert-circle': <AlertCircle size={20} />,
      'shield-check': <ShieldCheck size={20} />
    };
    return iconMap[iconName] || <BarChart3 size={20} />;
  };

  return (
    <div className="space-y-2 relative z-50">
      <label className="block text-sm font-semibold text-gray-700">
        Inspection Module
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedModule ? (
                <>
                  <div className="flex items-center justify-center" style={{ color: selectedModule.color }}>
                    {getIconComponent(selectedModule.icon)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedModule.name}</p>
                    <p className="text-xs text-gray-500">{selectedModule.category}</p>
                  </div>
                </>
              ) : (
                <span className="text-gray-500">Select a module...</span>
              )}
            </div>
            <ChevronDown 
              size={20} 
              className={`text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden z-50">
            <div className="py-2 max-h-80 overflow-y-auto">
              {modules.map(module => (
                <button
                  key={module.id}
                  onClick={() => {
                    onSelect(module);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${module.color}15`, color: module.color }}
                    >
                      {getIconComponent(module.icon)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{module.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
