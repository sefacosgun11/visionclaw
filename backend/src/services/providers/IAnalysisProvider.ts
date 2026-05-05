export interface AnalysisOptions {
  priority?: string;
  includeQualityCheck?: boolean;
  proceduralContext?: any;
}

export interface AnalysisResult {
  id: string;
  evidenceItemId: string;
  status: string;
  analyzedAt: string;
  processingTimeMs: number;
  confidence: number;
  findings: any[];
  qualityAssessment: any;
  metadata: {
    modelVersion: string;
    provider: string;
    requestId: string;
  };
}

export interface IAnalysisProvider {
  analyzeImage(
    evidenceId: string,
    imageUrl: string | undefined,
    options: AnalysisOptions
  ): Promise<AnalysisResult>;
}
