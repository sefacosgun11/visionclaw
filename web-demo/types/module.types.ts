export interface InspectionModule {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author?: string;
  status: string;
  isPublic: boolean;
  isPremium: boolean;
  configSchema: any;
  icon?: string;
  color?: string;
  tags?: string[];
}

export interface ModuleTemplate {
  id: string;
  moduleId: string;
  name: string;
  description?: string;
  category: string;
  config: any;
  referenceImageUrl?: string;
  referenceEvidenceId?: string;
  isPublic: boolean;
  createdBy: string;
  organizationId?: string;
  usageCount: number;
}

export interface ModuleExecution {
  id: string;
  moduleId: string;
  templateId?: string;
  evidenceId: string;
  status: string;
  config: any;
  result: any;
  confidence?: number;
  processingTimeMs?: number;
  executedBy: string;
  createdAt: string;
}
