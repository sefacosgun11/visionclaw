import { IInspectionModule, ModuleExecutionInput, ModuleExecutionResult } from '../types/module.types';
import { detectWeldQuality } from '../services/aiService';

export const WeldQualityControlModule: IInspectionModule = {
  id: 'weld-quality-control',
  name: 'Professional Weld Quality Control',
  description: 'Analyze weld quality according to AWS D1.1 standards. Detect defects and assess compliance.',
  category: 'vision',
  version: '1.0.0',
  author: 'VisionClaw',
  
  status: 'active',
  isPublic: true,
  isPremium: false,
  
  icon: '🔥',
  color: '#F97316',
  tags: ['welding', 'quality-control', 'inspection', 'standards', 'aws'],
  
  configSchema: {
    type: 'object',
    properties: {
      standard: {
        type: 'string',
        enum: ['AWS D1.1', 'ISO 5817', 'EN ISO 13919-1'],
        default: 'AWS D1.1',
        description: 'Welding standard to use'
      },
      weldType: {
        type: 'string',
        enum: ['GMAW', 'SMAW', 'TIG', 'SAW', 'FCAW', 'Manual', 'Robot'],
        default: 'GMAW',
        description: 'Type of welding process'
      },
      baseMaterial: {
        type: 'string',
        enum: ['Carbon Steel', 'Stainless Steel', 'Aluminum', 'Other'],
        default: 'Carbon Steel',
        description: 'Base material type'
      }
    },
    required: ['standard']
  },

  async execute(input: ModuleExecutionInput): Promise<ModuleExecutionResult> {
    const { imageUrl, config } = input;

    try {
      const analysisResult = await detectWeldQuality(imageUrl, config);

      return {
        status: analysisResult.weldStatus === 'acceptable' ? 'success' : 'failed',
        confidence: analysisResult.overallQualityScore / 100,
        findings: [
          {
            id: 'quality-score',
            type: 'quality_assessment',
            label: 'Quality Score',
            value: `${analysisResult.overallQualityScore}/100`,
            status: analysisResult.weldStatus,
            confidence: analysisResult.overallQualityScore / 100
          },
          {
            id: 'standard-compliance',
            type: 'compliance',
            label: `${config.standard || 'AWS D1.1'} Compliance`,
            value: analysisResult.standardCompliance,
            status: analysisResult.standardCompliance === 'passed' ? 'success' : 'failed',
            confidence: 0.95
          },
          ...analysisResult.defects.map((defect: any, i: number) => ({
            id: `defect-${i}`,
            type: defect.type,
            label: `${defect.type.replace(/_/g, ' ').toUpperCase()} - ${defect.severity}`,
            location: defect.location,
            description: defect.description,
            status: defect.severity === 'critical' ? 'failed' : 'warning',
            confidence: defect.confidence
          }))
        ],
        summary: analysisResult.summary,
        metadata: {
          weldCharacteristics: analysisResult.weldCharacteristics,
          recommendations: analysisResult.recommendations,
          standard: config.standard || 'AWS D1.1',
          weldType: config.weldType || 'GMAW'
        }
      };
    } catch (error: any) {
      throw new Error(`Weld quality analysis failed: ${error.message}`);
    }
  }
};
