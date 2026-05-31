'use client';

import { useState, useEffect } from 'react';
import { InspectionModule, ModuleTemplate, ModuleExecution } from '@/types/module.types';
import { getAllModules, getAllTemplates, executeModule, getEvidence, api } from '@/lib/api';
import ModuleSelector from '@/components/modules/ModuleSelector';
import TemplateSelector from '@/components/modules/TemplateSelector';
import PresenceCheckConfig from '@/components/modules/PresenceCheckConfig';
import DefectDetectionConfig from '@/components/modules/DefectDetectionConfig';
import ModuleExecutionResult from '@/components/modules/ModuleExecutionResult';
import toast from 'react-hot-toast';

export default function ModulesPage() {
  const [selectedModule, setSelectedModule] = useState<InspectionModule | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ModuleTemplate | null>(null);
  const [config, setConfig] = useState<any>({});
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<{ execution: ModuleExecution; result: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvidence();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setConfig(selectedTemplate.config);
    }
  }, [selectedTemplate]);

  const loadEvidence = async () => {
    try {
      const data = await getEvidence();
      if (!data || data.length === 0) {
        toast('No evidence images found. Please upload one first in Evidence tab.');
      }
      setEvidenceList(data || []);
    } catch (error) {
      console.error('Failed to load evidence:', error);
      setEvidenceList([]);
    }
  };

  const handleExecute = async () => {
    try {
      if (!selectedModule) {
        toast.error('Please select a module');
        return;
      }
      
      if (!selectedEvidenceId) {
        toast.error('Please select an evidence image');
        return;
      }
      
      if (selectedModule.id === 'presence-check') {
        if (!config.requiredItems || config.requiredItems.length === 0) {
          toast.error('Add at least 1 item to check');
          return;
        }
      }
      
      if (selectedModule.id === 'defect-detection') {
        if (!config.defectTypes || config.defectTypes.length === 0) {
          toast.error('Add at least 1 defect type');
          return;
        }
      }

      setExecuting(true);
      setError(null);
      
      const data = await executeModule({
        moduleId: selectedModule.id,
        evidenceId: selectedEvidenceId,
        config: config,
        templateId: selectedTemplate?.id,
        executedBy: 'tech-user'
      });

      if (data) {
        setResult(data);
        setSelectedTemplate(null);
      }
      toast.success('✓ Module executed successfully!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMsg.includes('404')) {
        toast.error('Module or evidence not found');
      } else if (errorMsg.includes('JSON')) {
        toast.error('AI response format error - please retry');
      } else if (errorMsg.includes('Network')) {
        toast.error('Network error - check your connection');
      } else {
        toast.error(`Error: ${errorMsg}`);
      }
      
      setError(errorMsg);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Inspection Modules</h1>
          <p className="mt-2 text-gray-600">
            Run AI-powered inspection modules on your evidence images
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Configuration */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
              
              <div className="space-y-4">
                {/* Module Selector */}
                <ModuleSelector
                  selectedModuleId={selectedModule?.id}
                  onSelect={(module) => {
                    setSelectedModule(module);
                    setSelectedTemplate(null);
                    setConfig({});
                    setResult(null);
                  }}
                />

                {/* Template Selector */}
                {selectedModule && (
                  <TemplateSelector
                    moduleId={selectedModule.id}
                    selectedTemplateId={selectedTemplate?.id}
                    onSelect={setSelectedTemplate}
                  />
                )}

                {/* Evidence Selector & Capture */}
                <div className="space-y-4 pt-2 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload or Capture New Evidence
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            const toastId = toast.loading('Uploading evidence...');
                            const newEvidence = await api.uploadEvidence(file, {
                              capturedBy: 'tech-user',
                              description: 'Uploaded directly from Modules page',
                              type: 'photo'
                            });
                            
                            setEvidenceList(prev => [newEvidence, ...prev]);
                            setSelectedEvidenceId(newEvidence.id);
                            toast.success('Evidence uploaded!', { id: toastId });
                          } catch (err) {
                            toast.error('Failed to upload evidence');
                            console.error(err);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Existing Evidence
                    </label>
                    <select
                      value={selectedEvidenceId}
                      onChange={(e) => setSelectedEvidenceId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose an image...</option>
                      {evidenceList.map(evidence => (
                        <option key={evidence.id} value={evidence.id}>
                          {evidence.id.substring(0, 8)}... - {new Date(evidence.timestamp || evidence.createdAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic Config Form */}
                {selectedModule?.id === 'presence-check' && (
                  <PresenceCheckConfig
                    initialConfig={config}
                    onChange={setConfig}
                  />
                )}
                {selectedModule?.id === 'defect-detection' && (
                  <DefectDetectionConfig
                    initialConfig={config}
                    onChange={setConfig}
                  />
                )}
              </div>

              <button
                onClick={handleExecute}
                disabled={executing || !selectedModule || !selectedEvidenceId}
                className="w-full mt-6 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {executing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Executing...
                  </>
                ) : (
                  <>
                    🔍 Run Inspection
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium">⚠ Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            
            {executing ? (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Results</h2>
                <div className="space-y-4 animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : result ? (
              <div className="animate-in fade-in duration-300 bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Results</h2>
                <ModuleExecutionResult execution={result.execution} />
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                      toast.success('Copied to clipboard!');
                    }}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    📋 Copy JSON
                  </button>
                  
                  <button
                    onClick={() => {
                      const element = document.createElement('a');
                      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + 
                        encodeURIComponent(JSON.stringify(result, null, 2)));
                      element.setAttribute('download', `inspection-${new Date().toISOString()}.json`);
                      element.style.display = 'none';
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                      toast.success('Downloaded!');
                    }}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <div className="py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure and run a module to see results here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
