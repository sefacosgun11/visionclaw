import { IInspectionModule, ModuleExecutionInput, ModuleExecutionResult } from '../types/module.types';
import { detectDefects } from '../services/aiService';

export const DefectDetectionModule: IInspectionModule = {
  id: 'defect-detection',
  name: 'Surface Defect Detection',
  description: 'Detect cracks, scratches, dents, rust, and other surface defects. Useful for quality control, equipment inspection, and safety assessment.',
  category: 'vision',
  version: '1.0.0',
  author: 'VisionClaw',
  
  status: 'active',
  isPublic: true,
  isPremium: false,
  
  configSchema: {
    type: 'object',
    properties: {
      defectTypes: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        description: 'Types of defects to detect (e.g., crack, scratch, rust)'
      },
      sensitivity: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        default: 0.7,
        description: 'Detection sensitivity (0.0 = lenient, 1.0 = strict)'
      }
    },
    required: ['defectTypes']
  },
  
  icon: '🔍',
  color: '#EF4444', // red-500
  tags: ['vision', 'quality-control', 'defect', 'inspection'],
  
  async execute(input: ModuleExecutionInput): Promise<ModuleExecutionResult> {
    const { imageUrl, config } = input;
    const { defectTypes, sensitivity = 0.7 } = config;
    
    if (!defectTypes || !Array.isArray(defectTypes) || defectTypes.length === 0) {
      throw new Error('defectTypes array is required and must not be empty');
    }
    
    try {
      const aiResult = await detectDefects(imageUrl, defectTypes, sensitivity);
      
      const calculateConfidence = (defects: any[]) => {
        if (defects.length === 0) return 1.0;
        const sum = defects.reduce((acc, d) => acc + d.confidence, 0);
        return sum / defects.length;
      };

      return {
        status: aiResult.overall_status === 'passed' ? 'success' : 
                aiResult.overall_status === 'failed' ? 'failed' : 'needs-review',
        confidence: calculateConfidence(aiResult.defects),
        findings: aiResult.defects.map((defect, index) => ({
          id: `defect-${index}`,
          type: 'defect',
          severity: defect.severity,
          defectType: defect.type,
          location: defect.location,
          confidence: defect.confidence,
          description: defect.description
        })),
        summary: aiResult.summary,
        metadata: {
          totalDefects: aiResult.defects.length,
          criticalCount: aiResult.defects.filter(d => d.severity === 'critical').length,
          warningCount: aiResult.defects.filter(d => d.severity === 'warning').length,
          infoCount: aiResult.defects.filter(d => d.severity === 'info').length,
          sensitivity: sensitivity
        }
      };
    } catch (error) {
      throw new Error(`Defect detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
