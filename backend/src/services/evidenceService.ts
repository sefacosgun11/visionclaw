import { nanoid } from 'nanoid';
import { PrismaClient } from '@prisma/client';
import { getAnalysisProvider } from './providers/providerFactory';

const prisma = new PrismaClient();

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
  const evidence = await prisma.evidence.create({
    data: {
      type: input.type,
      taskId: input.taskId,
      procedureId: input.procedureId,
      stepNumber: input.stepNumber,
      capturedBy: input.capturedBy,
      url: input.url,
      localPath: input.localPath,
      metadata: input.metadata || {},
      tags: input.tags || [],
      description: input.description
    },
    include: { analysis: true }
  });
  return evidence;
}

export async function getAllEvidence() {
  return await prisma.evidence.findMany({
    include: { analysis: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getEvidenceById(id: string) {
  return await prisma.evidence.findUnique({
    where: { id },
    include: { analysis: true }
  });
}

export async function triggerAnalysis(evidenceId: string, options: any = {}) {
  const evidence = await prisma.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence) throw new Error('Evidence not found');

  const existingAnalysis = await prisma.analysis.findUnique({ where: { evidenceId } });
  if (existingAnalysis && existingAnalysis.status === 'analyzing') {
    throw new Error('Analysis already in progress');
  }

  // Determine image URL (localPath or url)
  let imageUrl: string | undefined;
  if (evidence.localPath) {
    const baseUrl = process.env.PUBLIC_URL || 'http://localhost:3001';
    imageUrl = `${baseUrl}${evidence.localPath}`;
  } else {
    imageUrl = evidence.url || undefined;
  }

  const analysisId = `ana-${nanoid(24)}`;
  const providerType = process.env.ANALYSIS_PROVIDER || 'mock';

  await prisma.analysis.create({
    data: {
      id: analysisId,
      evidenceId: evidenceId,
      status: 'analyzing',
      metadata: { provider: providerType, requestId: `req-${nanoid(16)}` },
      findings: []
    }
  });

  performAnalysis(analysisId, evidenceId, imageUrl, options).catch(console.error);

  return { analysisId, status: 'analyzing', estimatedCompletionSeconds: 5 };
}

async function performAnalysis(analysisId: string, evidenceId: string, imageUrl: string | undefined, options: any) {
  try {
    const provider = getAnalysisProvider();
    const result = await provider.analyzeImage(evidenceId, imageUrl, options);
    
    const { id, evidenceItemId, ...updateData } = result as any;
    
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        ...updateData,
        analyzedAt: updateData.analyzedAt ? new Date(updateData.analyzedAt) : new Date()
      }
    });
  } catch (err) {
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: 'failed',
        analyzedAt: new Date(),
        metadata: { error: err instanceof Error ? err.message : 'Unknown error' }
      }
    });
  }
}

export async function getAnalysisResult(evidenceId: string) {
  const analysis = await prisma.analysis.findUnique({ where: { evidenceId } });
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
    reviewedAt: new Date(),
    reviewNotes: review.reviewNotes
  };

  if (review.action === 'modify' && review.modifiedFindings) {
    updates.findings = review.modifiedFindings;
  }

  return await prisma.analysis.update({
    where: { evidenceId },
    data: updates
  });
}
