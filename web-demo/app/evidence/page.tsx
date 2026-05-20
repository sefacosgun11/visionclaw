'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { api, Evidence, ImageAnalysisResult, CreateEvidenceInput } from '@/lib/api';

type EvidenceWithAnalysis = Evidence & {
  analysisResult?: any;
  isReviewing?: boolean;
};

export default function EvidencePage() {
  const [evidenceList, setEvidenceList] = useState<EvidenceWithAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const pollingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const [formData, setFormData] = useState<CreateEvidenceInput>({
    type: 'photo',
    capturedBy: 'tech-user',
    description: '',
    url: '',
  });

  // Test API connection on component mount
  useEffect(() => {
    async function testAPIConnection() {
      try {
        console.log('🧪 Testing API connection...');
        const health = await api.apiHealthCheck();
        console.log('✅ API Health Check:', health);
        
        if (!health.openai) {
          console.warn('⚠️ OpenAI API key not configured on backend!');
        }
      } catch (error) {
        console.error('❌ API Health Check Failed:', error);
        console.error('Make sure backend is running and CORS is configured correctly');
      }
    }
    
    testAPIConnection();
  }, []);

  // Fetch evidence list on mount
  useEffect(() => {
    async function loadEvidence() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evidence`);
        if (response.ok) {
          const data = await response.json();
          setEvidenceList(data);
        }
      } catch (error) {
        console.error('Failed to load evidence:', error);
      }
    }
    
    loadEvidence();
  }, []);

  const createEvidence = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.capturedBy?.trim()) {
      setError('Captured By is required');
      return;
    }

    if (!selectedFile && !formData.url?.trim()) {
      setError('Please either upload an image file or provide an image URL');
      return;
    }

    setLoading(true);
    setUploading(true);
    setError(null);

    try {
      let evidence;

      if (selectedFile) {
        evidence = await api.uploadEvidence(selectedFile, {
          capturedBy: formData.capturedBy,
          description: formData.description,
          type: formData.type
        });
      } else {
        evidence = await api.createEvidence(formData);
      }

      setEvidenceList([evidence, ...evidenceList]);

      setFormData({
        type: 'photo',
        capturedBy: 'tech-user',
        description: '',
        url: '',
      });
      setSelectedFile(null);
      setUploading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create evidence');
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async (evidenceId: string) => {
    setError(null);

    try {
      await api.triggerAnalysis(evidenceId, {
        priority: 'normal',
        includeQualityCheck: true,
      });

      setEvidenceList(prev => prev.map(ev =>
        ev.id === evidenceId
          ? { ...ev, analysisResult: { status: 'analyzing' } }
          : ev
      ));

      pollAnalysisResult(evidenceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger analysis');
    }
  };

  const pollAnalysisResult = async (evidenceId: string) => {
    const maxAttempts = 15;
    let attempts = 0;

    const poll = async () => {
      try {
        const result = await api.getAnalysisResult(evidenceId);

        setEvidenceList(prev => prev.map(ev =>
          ev.id === evidenceId
            ? { ...ev, analysisResult: result }
            : ev
        ));

        if (result.analysis &&
          result.analysis.status !== 'analyzing' &&
          result.analysis.status !== 'pending') {
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    poll();
  };

  const submitReview = async (evidenceId: string, action: 'accept' | 'reject') => {
    setError(null);

    setEvidenceList(prev => prev.map(ev =>
      ev.id === evidenceId ? { ...ev, isReviewing: true } : ev
    ));

    try {
      const result = await api.reviewAnalysis(evidenceId, {
        action,
        reviewedBy: 'supervisor-user',
        reviewNotes: action === 'accept' ? 'Verified and approved' : 'Rejected - needs retake',
      });

      setEvidenceList(prev => prev.map(ev =>
        ev.id === evidenceId
          ? { ...ev, analysisResult: { analysis: result.analysis, availableActions: [] }, isReviewing: false }
          : ev
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      setEvidenceList(prev => prev.map(ev =>
        ev.id === evidenceId ? { ...ev, isReviewing: false } : ev
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Evidence Workspace</h1>
          <p className="mt-2 text-gray-600">Create evidence items and analyze photos with AI</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 ml-3"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Evidence</h2>

          <form onSubmit={createEvidence} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                  <option value="measurement">Measurement</option>
                  <option value="document">Document</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Captured By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.capturedBy}
                  onChange={(e) => setFormData({ ...formData, capturedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tech-username"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image File
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setSelectedFile(file || null);
                  if (file) {
                    setFormData({ ...formData, url: '' });
                  }
                }}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
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
                Image URL
              </label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => {
                  setFormData({ ...formData, url: e.target.value });
                  if (e.target.value && selectedFile) {
                    setSelectedFile(null);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/photo.jpg"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the evidence..."
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || uploading || !formData.capturedBy.trim()}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {uploading ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Uploading...
                </>
              ) : loading ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Create Evidence
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Evidence Items</h2>

          {evidenceList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No evidence yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first evidence item.</p>
            </div>
          ) : (
            evidenceList.map((evidence) => (
              <div key={evidence.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{evidence.id}</h3>
                    <p className="text-sm text-gray-500">
                      {evidence.type} • Captured by {evidence.capturedBy} • {new Date(evidence.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {evidence.url && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                    <img src={evidence.url} alt="evidence" className="w-full max-h-96 object-contain bg-gray-50" />
                  </div>
                )}

                {evidence.description && (
                  <p className="text-sm text-gray-700 mb-4">{evidence.description}</p>
                )}

                {evidence.analysis ? (
                  <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Analysis Results</h4>
                    <p className="text-sm text-blue-800"><span className="font-medium">Status:</span> {evidence.analysis.status}</p>
                    {evidence.analysis.confidence != null && (
                      <p className="text-sm text-blue-800"><span className="font-medium">Confidence:</span> {(evidence.analysis.confidence * 100).toFixed(1)}%</p>
                    )}
                    {evidence.analysis.findings && evidence.analysis.findings.length > 0 && (
                      <div className="mt-2 text-sm text-blue-800">
                        <span className="font-medium">Finding:</span> {evidence.analysis.findings[0]?.description}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 p-4 text-yellow-600 bg-yellow-50 rounded-md border border-yellow-100 flex items-center">
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    <span>Analyzing...</span>
                  </div>
                )}

                {!evidence.analysisResult && !evidence.analysis ? (
                  <button
                    onClick={() => triggerAnalysis(evidence.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Trigger Analysis
                  </button>
                ) : evidence.analysisResult ? (
                  <div className="mt-4 border-t pt-4">
                    <AnalysisStatus
                      analysis={evidence.analysisResult?.analysis}
                      onReview={(action) => submitReview(evidence.id, action)}
                      availableActions={evidence.analysisResult?.availableActions || []}
                      isReviewing={evidence.isReviewing}
                    />
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisStatus({
  analysis,
  onReview,
  availableActions,
  isReviewing
}: {
  analysis: ImageAnalysisResult | null;
  onReview: (action: 'accept' | 'reject') => void;
  availableActions: string[];
  isReviewing?: boolean;
}) {
  if (!analysis) {
    return (
      <div className="flex items-center text-gray-500">
        <Clock className="h-5 w-5 mr-2" />
        <span>No analysis available</span>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (analysis.status) {
      case 'analyzing':
        return (
          <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            <RefreshCw className="animate-spin h-4 w-4 mr-2" />
            Analyzing...
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </div>
        );
      case 'needs-review':
        return (
          <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
            <AlertCircle className="h-4 w-4 mr-2" />
            Needs Review
          </div>
        );
      case 'reviewed':
        return (
          <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Reviewed
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full">
            <XCircle className="h-4 w-4 mr-2" />
            Failed
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4 mr-2" />
            {analysis.status}
          </div>
        );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {getStatusBadge()}
        {analysis.confidence && (
          <span className="text-sm text-gray-600">
            Confidence: {(analysis.confidence * 100).toFixed(1)}%
          </span>
        )}
      </div>

      {analysis.findings && analysis.findings.length > 0 && (
        <div className="mt-4 space-y-3">
          {analysis.findings.map((finding) => (
            <div key={finding.id} className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">{finding.category}</span>
                    {finding.severity && (
                      <span className={`text-xs px-2 py-1 rounded ${finding.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        finding.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                          finding.severity === 'minor' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {finding.severity}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{(finding.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-sm text-gray-700">{finding.description}</p>
                  {finding.suggestedAction && (
                    <p className="text-xs text-gray-600 mt-2">→ {finding.suggestedAction}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {analysis.qualityAssessment && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Photo Quality</h4>
          <p className="text-sm text-gray-600 capitalize">{analysis.qualityAssessment.overallQuality}</p>
        </div>
      )}

      {analysis.reviewedBy && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-900">
            <strong>Reviewed by:</strong> {analysis.reviewedBy}
          </p>
          {analysis.reviewNotes && (
            <p className="text-sm text-blue-800 mt-1">
              <strong>Notes:</strong> {analysis.reviewNotes}
            </p>
          )}
        </div>
      )}

      {availableActions.length > 0 && (availableActions.includes('accept') || availableActions.includes('reject')) && (
        <div className="mt-4 flex gap-3">
          {availableActions.includes('accept') && (
            <button
              onClick={() => onReview('accept')}
              disabled={isReviewing}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Accept
            </button>
          )}
          {availableActions.includes('reject') && (
            <button
              onClick={() => onReview('reject')}
              disabled={isReviewing}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
}
