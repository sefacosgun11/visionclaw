// API Client for VisionClaw Backend
// Connects to localhost:3001

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Debug: Log API URL on client load
if (typeof window !== 'undefined') {
  console.log('🔗 VisionClaw API URL:', API_BASE_URL);
}

export interface Evidence {
  id: string;
  type: 'photo' | 'video' | 'measurement' | 'document';
  taskId?: string;
  procedureId?: string;
  stepNumber?: number;
  timestamp: string;
  capturedBy: string;
  url?: string;
  localPath?: string;
  metadata?: any;
  tags?: string[];
  description?: string;
  analysis?: ImageAnalysisResult;
}

export interface ImageAnalysisResult {
  id: string;
  evidenceItemId: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed' | 'needs-review' | 'reviewed';
  analyzedAt?: string;
  processingTimeMs?: number;
  confidence?: number;
  findings: AnalysisFinding[];
  proceduralContext?: any;
  qualityAssessment?: ImageQualityAssessment;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  metadata?: any;
}

export interface AnalysisFinding {
  id: string;
  category: string;
  severity?: 'critical' | 'major' | 'minor' | 'informational';
  description: string;
  confidence: number;
  location?: any;
  suggestedAction?: string;
  relatedCheckpoint?: string;
}

export interface ImageQualityAssessment {
  overallQuality: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unusable';
  issues?: Array<{
    type: string;
    severity: 'minor' | 'major';
    description: string;
  }>;
  suggestions?: string[];
}

export interface CreateEvidenceInput {
  type: 'photo' | 'video' | 'measurement' | 'document';
  taskId?: string;
  procedureId?: string;
  stepNumber?: number;
  capturedBy: string;
  url?: string;
  localPath?: string;
  metadata?: any;
  description?: string;
  tags?: string[];
}

export interface AnalysisResponse {
  analysis: ImageAnalysisResult | null;
  availableActions: string[];
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createEvidence(input: CreateEvidenceInput): Promise<Evidence> {
    return this.request<Evidence>('/api/evidence', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async uploadEvidence(file: File, data: {
    capturedBy: string;
    description?: string;
    type?: string;
  }): Promise<Evidence> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('capturedBy', data.capturedBy);
    if (data.description) formData.append('description', data.description);
    if (data.type) formData.append('type', data.type);

    const response = await fetch(`${this.baseURL}/api/evidence/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getEvidence(id: string): Promise<Evidence> {
    return this.request<Evidence>(`/api/evidence/${id}`);
  }

  async triggerAnalysis(
    evidenceId: string,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      includeQualityCheck?: boolean;
      proceduralContext?: any;
    }
  ): Promise<{ analysisId: string; status: string; estimatedCompletionSeconds?: number }> {
    return this.request(`/api/evidence/${evidenceId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ options }),
    });
  }

  async getAnalysisResult(evidenceId: string): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>(`/api/evidence/${evidenceId}/analysis`);
  }

  async reviewAnalysis(
    evidenceId: string,
    review: {
      action: 'accept' | 'reject' | 'modify';
      reviewedBy: string;
      reviewNotes?: string;
      modifiedFindings?: any[];
    }
  ): Promise<{ analysis: ImageAnalysisResult; message: string }> {
    return this.request(`/api/evidence/${evidenceId}/analysis/review`, {
      method: 'PUT',
      body: JSON.stringify(review),
    });
  }

  // Health check endpoints
  async healthCheck(): Promise<{ status: string; timestamp: string; env: string }> {
    return this.request('/health');
  }

  async apiHealthCheck(): Promise<{ 
    status: string; 
    timestamp: string; 
    openai: boolean;
    provider: string;
  }> {
    return this.request('/api/health');
  }

  // Equipment
  async createEquipment(data: any): Promise<any> { return this.request('/api/equipment', { method: 'POST', body: JSON.stringify(data) }); }
  async getEquipment(): Promise<any[]> { return this.request('/api/equipment'); }
  async deleteEquipment(id: string): Promise<any> { return this.request(`/api/equipment/${id}`, { method: 'DELETE' }); }

  // Procedures
  async createProcedure(data: any): Promise<any> { return this.request('/api/procedures', { method: 'POST', body: JSON.stringify(data) }); }
  async getProcedures(): Promise<any[]> { return this.request('/api/procedures'); }

  // Tasks
  async createTask(data: any): Promise<any> { return this.request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }); }
  async getTasks(): Promise<any[]> { return this.request('/api/tasks'); }
  async getTasksByStatus(status: string): Promise<any[]> { return this.request(`/api/tasks/status/${status}`); }
  async updateTask(id: string, data: any): Promise<any> { return this.request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }

  // Inspections
  async createInspection(data: any): Promise<any> { return this.request('/api/inspections', { method: 'POST', body: JSON.stringify(data) }); }
  async getInspections(): Promise<any[]> { return this.request('/api/inspections'); }
}

export const api = new APIClient();

// Standalone functions for direct imports
export async function getAllModules(): Promise<any[]> {
  return api['request']<any[]>('/api/modules');
}

export async function getAllTemplates(params?: { moduleId?: string; category?: string; isPublic?: boolean }): Promise<any[]> {
  const query = new URLSearchParams();
  if (params?.moduleId) query.append('moduleId', params.moduleId);
  if (params?.category) query.append('category', params.category);
  if (params?.isPublic !== undefined) query.append('isPublic', String(params.isPublic));
  
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return api['request']<any[]>(`/api/module-templates${queryString}`);
}

export async function executeModule(data: {
  moduleId: string;
  evidenceId: string;
  config: any;
  templateId?: string;
  executedBy: string;
}): Promise<any> {
  return api['request']<any>('/api/modules/execute', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function createTemplate(data: any): Promise<any> {
  return api['request']<any>('/api/module-templates', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getEvidence(): Promise<Evidence[]> {
  // Overload getEvidence as a standalone function returning a list
  return api['request']<Evidence[]>('/api/evidence');
}
