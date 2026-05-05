import { nanoid } from 'nanoid';

export class MockAnalysisProvider {
  async analyzeImage(evidenceId: string, imageUrl: any, options: any) {
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));
    
    const rand = Math.random();
    const confidence = rand < 0.6 ? 0.85 + Math.random() * 0.15 : 0.55 + Math.random() * 0.2;
    const status = rand < 0.6 ? 'completed' : rand < 0.9 ? 'needs-review' : 'failed';
    
    return {
      id: 'ana-' + nanoid(24),
      evidenceItemId: evidenceId,
      status,
      analyzedAt: new Date().toISOString(),
      processingTimeMs: 3000,
      confidence,
      findings: status !== 'failed' ? [{
        id: 'fnd-' + nanoid(24),
        category: 'compliance-check',
        severity: 'informational',
        description: 'Equipment appears normal',
        confidence,
        suggestedAction: 'No action required'
      }] : [],
      qualityAssessment: {
        overallQuality: status === 'failed' ? 'unusable' : 'good',
        issues: status === 'failed' ? [{ type: 'blur', severity: 'major', description: 'Motion blur' }] : [],
        suggestions: []
      },
      metadata: { provider: 'mock', modelVersion: 'mock-v1.0', requestId: 'req-' + nanoid(16) }
    };
  }
}
