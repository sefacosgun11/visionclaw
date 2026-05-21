// Core module interface
export interface IInspectionModule {
  // Metadata
  id: string;
  name: string;
  description: string;
  category: 'vision' | 'measurement' | 'analysis' | 'safety' | 'other';
  version: string;
  author?: string;
  
  // Status
  status: 'active' | 'deprecated' | 'beta';
  isPublic: boolean;
  isPremium: boolean;
  
  // Configuration schema (JSON Schema format)
  configSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  
  // UI
  icon?: string;
  color?: string;
  tags?: string[];
  
  // Main execution function
  execute(input: ModuleExecutionInput): Promise<ModuleExecutionResult>;
}

// Input for module execution
export interface ModuleExecutionInput {
  imageUrl: string;
  config: Record<string, any>; // Module-specific config
  evidenceId: string;
  context?: {
    equipmentId?: string;
    procedureId?: string;
    taskId?: string;
  };
}

// Output from module execution
export interface ModuleExecutionResult {
  status: 'success' | 'failed' | 'needs-review' | 'error';
  confidence?: number;
  findings: any[]; // Module-specific findings format
  summary: string;
  metadata?: Record<string, any>;
}

// Template type
export interface ModuleTemplateData {
  id?: string;
  moduleId: string;
  name: string;
  description?: string;
  category?: string;
  config: Record<string, any>;
  referenceImageUrl?: string;
  referenceEvidenceId?: string;
  isPublic?: boolean;
  createdBy: string;
  organizationId?: string;
}
