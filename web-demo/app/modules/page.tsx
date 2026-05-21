'use client';

import { useState, useEffect } from 'react';
import { InspectionModule, ModuleTemplate, ModuleExecution } from '@/types/module.types';
import { getAllModules, getAllTemplates, executeModule, getEvidence } from '@/lib/api';
import ModuleSelector from '@/components/modules/ModuleSelector';
import TemplateSelector from '@/components/modules/TemplateSelector';
import PresenceCheckConfig from '@/components/modules/PresenceCheckConfig';
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
      setEvidenceList(data);
    } catch (error) {
      console.error('Failed to load evidence:', error);
    }
  };

  const handleExecute = async () => {
    if (!selectedModule || !selectedEvidenceId) {
      toast.error('Please select a module and evidence');
      return;
    }

    if (selectedModule.id === 'presence-check' && (!config.requiredItems || config.requiredItems.length === 0)) {
      toast.error('Please add at least one item to check');
      return;
    }

    try {
      setExecuting(true);
      const data = await executeModule({
        moduleId: selectedModule.id,
        evidenceId: selectedEvidenceId,
        config: config,
        templateId: selectedTemplate?.id,
        executedBy: 'tech-user'
      });

      setResult(data);
      toast.success('Module executed successfully!');
    } catch (error) {
      console.error('Execution failed:', error);
      toast.error('Execution failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Configuration */}
          <div className="space-y-6">
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

                {/* Evidence Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Evidence Image
                  </label>
                  <select
                    value={selectedEvidenceId}
                    onChange={(e) => setSelectedEvidenceId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an image...</option>
                    {evidenceList.map(evidence => (
                      <option key={evidence.id} value={evidence.id}>
                        {evidence.id.substring(0, 8)}... - {new Date(evidence.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Config Form */}
                {selectedModule?.id === 'presence-check' && (
                  <PresenceCheckConfig
                    initialConfig={config}
                    onChange={setConfig}
                  />
                )}
              </div>

              <button
                onClick={handleExecute}
                disabled={executing || !selectedModule || !selectedEvidenceId}
                className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <div>
            {result ? (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Results</h2>
                <ModuleExecutionResult execution={result.execution} />
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
