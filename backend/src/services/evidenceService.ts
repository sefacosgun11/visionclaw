import { nanoid } from 'nanoid';
import * as storage from '../storage/jsonStore';
import { getAnalysisProvider } from './providers/providerFactory';

interface CreateEvidenceInput {
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

export async function createEvidence(input: CreateEvidenceInput) {
  const id = `evd-${nanoid(24)}`;
  const evidence = {
    id,
    type: input.type,
    taskId: input.taskId,
    procedureId: input.procedureId,
    stepNumber: input.stepNumber,
    timestamp: new Date().toISOString(),
    capturedBy: input.capturedBy,
    url: input.url,
    localPath: input.localPath,
    metadata: input.metadata || {},
    tags: input.tags || [],
    description: input.description,
    analysis: null
  };
  await storage.saveEvidence(id, evidence);
  return evidence;
}

export async function getEvidenceById(id: string) {
  return await storage.getEvidence(id);
}

export async function triggerAnalysis(evidenceId: string, options: any = {}) {
  const evidence = await storage.getEvidence(evidenceId);
  if (!evidence) throw new Error('Evidence not found');

  const existingAnalysis = await storage.getAnalysisByEvidenceId(evidenceId);
  if (existingAnalysis && existingAnalysis.status === 'analyzing') {
    throw new Error('Analysis already in progress');
  }

  // Determine image URL (localPath or url)
  let imageUrl: string | undefined;
  if (evidence.localPath) {
    const baseUrl = process.env.PUBLIC_URL || 'http://localhost:3001';
    imageUrl = `${baseUrl}${evidence.localPath}`;
  } else {
    imageUrl = evidence.url;
  }

  const analysisId = `ana-${nanoid(24)}`;
  const providerType = process.env.ANALYSIS_PROVIDER || 'mock';

  await storage.saveAnalysis(analysisId, {
    id: analysisId,
    evidenceItemId: evidenceId,
    status: 'analyzing',
    metadata: { provider: providerType, requestId: `req-${nanoid(16)}` }
  });

  performAnalysis(analysisId, evidenceId, imageUrl, options).catch(console.error);

  return { analysisId, status: 'analyzing', estimatedCompletionSeconds: 5 };
}

async function performAnalysis(analysisId: string, evidenceId: string, imageUrl: string | undefined, options: any) {
  try {
    const provider = getAnalysisProvider();
    const result = await provider.analyzeImage(evidenceId, imageUrl, options);
    await storage.updateAnalysis(analysisId, result);
  } catch (err) {
    await storage.updateAnalysis(analysisId, {
      status: 'failed',
      analyzedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}

export async function getAnalysisResult(evidenceId: string) {
  const analysis = await storage.getAnalysisByEvidenceId(evidenceId);
  if (!analysis) return { analysis: null, availableActions: ['retry'] };

  const availableActions = [];
  if (analysis.status === 'completed') availableActions.push('accept', 'request-review');
  else if (analysis.status === 'needs-review') availableActions.push('accept', 'reject', 'retry');
  else if (analysis.status === 'failed') availableActions.push('retry');

  return { analysis, availableActions };
}

export async function reviewAnalysis(evidenceId: string, review: any) {
  const updates: any = {
    status: 'reviewed',
    reviewedBy: review.reviewedBy,
    reviewedAt: new Date().toISOString(),
    reviewNotes: review.reviewNotes
  };

  if (review.action === 'modify' && review.modifiedFindings) {
    updates.findings = review.modifiedFindings;
  }

  return await storage.updateAnalysisByEvidenceId(evidenceId, updates);
}
