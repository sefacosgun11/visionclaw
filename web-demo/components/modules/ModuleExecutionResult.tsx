'use client';

import { ModuleExecution } from '@/types/module.types';

interface ModuleExecutionResultProps {
  execution: ModuleExecution;
}

export default function ModuleExecutionResult({ execution }: ModuleExecutionResultProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'needs-review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✓';
      case 'failed': return '✗';
      case 'needs-review': return '⚠';
      default: return '?';
    }
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'missing': return 'bg-red-100 text-red-800';
      case 'uncertain': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className={`p-4 rounded-lg border-2 ${getStatusColor(execution.result.status)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">{getStatusIcon(execution.result.status)}</span>
              {execution.result.status.toUpperCase().replace('-', ' ')}
            </p>
            <p className="text-sm mt-1">{execution.result.summary}</p>
          </div>
          {execution.result.confidence && (
            <div className="text-right">
              <p className="text-2xl font-bold">
                {(execution.result.confidence * 100).toFixed(0)}%
              </p>
              <p className="text-xs">Confidence</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Metadata */}
      {execution.result.metadata && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-md text-center">
            <p className="text-2xl font-bold text-blue-600">
              {execution.result.metadata.totalItems || 0}
            </p>
            <p className="text-xs text-gray-600">Total Items</p>
          </div>
          <div className="p-3 bg-green-50 rounded-md text-center">
            <p className="text-2xl font-bold text-green-600">
              {execution.result.metadata.presentCount || 0}
            </p>
            <p className="text-xs text-gray-600">Present</p>
          </div>
          <div className="p-3 bg-red-50 rounded-md text-center">
            <p className="text-2xl font-bold text-red-600">
              {execution.result.metadata.missingCount || 0}
            </p>
            <p className="text-xs text-gray-600">Missing</p>
          </div>
        </div>
      )}
      
      {/* Findings List */}
      {execution.result.findings && execution.result.findings.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Item Details:</p>
          <div className="space-y-2">
            {execution.result.findings.map((finding: any, index: number) => (
              <div
                key={finding.id || index}
                className="p-3 bg-white border border-gray-200 rounded-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{finding.item}</p>
                    <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getItemStatusColor(finding.status)}`}>
                      {finding.status === 'present' && '✓ Present'}
                      {finding.status === 'missing' && '✗ Missing'}
                      {finding.status === 'uncertain' && '? Uncertain'}
                    </span>
                    {finding.confidence !== undefined && (
                      <span className="text-xs text-gray-500">
                        {(finding.confidence * 100).toFixed(0)}% confidence
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Execution Info */}
      <div className="text-xs text-gray-500 pt-2 border-t">
        <p>Executed by: {execution.executedBy}</p>
        <p>Time: {new Date(execution.createdAt).toLocaleString()}</p>
        {execution.processingTimeMs && (
          <p>Processing: {execution.processingTimeMs}ms</p>
        )}
      </div>
    </div>
  );
}
