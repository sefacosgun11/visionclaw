import { nanoid } from 'nanoid';

interface AnalysisOptions {
  proceduralContext?: any;
}

export async function analyzeImage(evidenceId: string, imageUrl: string | undefined, options: AnalysisOptions = {}): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

  const rand = Math.random();
  if (rand < 0.6) return generatePassScenario(evidenceId, options);
  if (rand < 0.9) return generateNeedsReviewScenario(evidenceId, options);
  return generateFailedScenario(evidenceId, options);
}

function generatePassScenario(evidenceId: string, options: AnalysisOptions) {
  const confidence = 0.85 + Math.random() * 0.15;
  return {
    id: `ana-${nanoid(24)}`,
    evidenceItemId: evidenceId,
    status: 'completed',
    analyzedAt: new Date().toISOString(),
    processingTimeMs: Math.floor(2000 + Math.random() * 3000),
    confidence,
    findings: [
      {
        id: `fnd-${nanoid(24)}`,
        category: 'compliance-check',
        severity: 'informational',
        description: options.proceduralContext?.expectedObservation 
          ? `Visual confirmation: ${options.proceduralContext.expectedObservation}`
          : 'Equipment appears to be in normal operating condition',
        confidence: confidence + Math.random() * 0.05,
        suggestedAction: 'No action required'
      }
    ],
    proceduralContext: options.proceduralContext,
    qualityAssessment: { overallQuality: 'good', issues: [], suggestions: [] },
    metadata: { modelVersion: 'mock-v1.0', provider: 'mock-provider', requestId: `req-${nanoid(16)}` }
  };
}

function generateNeedsReviewScenario(evidenceId: string, options: AnalysisOptions) {
  const confidence = 0.55 + Math.random() * 0.2;
  return {
    id: `ana-${nanoid(24)}`,
    evidenceItemId: evidenceId,
    status: 'needs-review',
    analyzedAt: new Date().toISOString(),
    processingTimeMs: Math.floor(3000 + Math.random() * 3000),
    confidence,
    findings: [
      {
        id: `fnd-${nanoid(24)}`,
        category: 'condition-assessment',
        severity: 'major',
        description: 'Possible wear detected - requires verification',
        confidence: confidence + 0.05,
        suggestedAction: 'Human inspection recommended'
      }
    ],
    proceduralContext: options.proceduralContext,
    qualityAssessment: {
      overallQuality: 'acceptable',
      issues: [{ type: 'lighting', severity: 'minor', description: 'Slight shadow' }],
      suggestions: ['Use additional lighting']
    },
    metadata: { modelVersion: 'mock-v1.0', provider: 'mock-provider', requestId: `req-${nanoid(16)}` }
  };
}

function generateFailedScenario(evidenceId: string, options: AnalysisOptions) {
  return {
    id: `ana-${nanoid(24)}`,
    evidenceItemId: evidenceId,
    status: 'failed',
    analyzedAt: new Date().toISOString(),
    processingTimeMs: Math.floor(1500 + Math.random() * 1500),
    confidence: 0.25,
    findings: [],
    proceduralContext: options.proceduralContext,
    qualityAssessment: {
      overallQuality: 'unusable',
      issues: [
        { type: 'blur', severity: 'major', description: 'Severe motion blur' },
        { type: 'lighting', severity: 'major', description: 'Insufficient lighting' }
      ],
      suggestions: ['Hold camera steady', 'Ensure adequate lighting']
    },
    metadata: { modelVersion: 'mock-v1.0', provider: 'mock-provider', requestId: `req-${nanoid(16)}` }
  };
}
