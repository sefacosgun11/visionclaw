import { IInspectionModule, ModuleExecutionInput, ModuleExecutionResult } from '../types/module.types';
import { checkItemPresence } from '../services/aiService';

export const PresenceCheckModule: IInspectionModule & { calculateOverallConfidence: (items: any[]) => number } = {
  // Metadata
  id: 'presence-check',
  name: 'Item Presence Check',
  description: 'Detects presence or absence of required items, components, or PPE.',
  category: 'vision',
  version: '1.0.0',
  author: 'VisionClaw',
  
  // Status
  status: 'active',
  isPublic: true,
  isPremium: false,
  
  // Configuration Schema (JSON Schema format)
  configSchema: {
    type: 'object',
    properties: {
      requiredItems: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        description: 'List of items to check for presence'
      },
      templateId: {
        type: 'string',
        description: 'Optional: Use a predefined template'
      }
    },
    required: ['requiredItems']
  },
  
  // UI
  icon: 'visibility',
  color: '#3B82F6', // blue-500
  tags: ['vision', 'checklist', 'safety', 'quality-control'],
  
  // Main execution function
  async execute(input: ModuleExecutionInput): Promise<ModuleExecutionResult> {
    const { imageUrl, config } = input;
    const { requiredItems } = config;
    
    if (!requiredItems || !Array.isArray(requiredItems) || requiredItems.length === 0) {
      throw new Error('requiredItems array is required and must not be empty');
    }
    
    try {
      // Call AI service
      const aiResult = await checkItemPresence(imageUrl, requiredItems);
      
      // Map to standard module result format
      return {
        status: aiResult.overall_status === 'passed' ? 'success' : 
                aiResult.overall_status === 'failed' ? 'failed' : 'needs-review',
        confidence: this.calculateOverallConfidence(aiResult.items_checked),
        findings: aiResult.items_checked.map((item, index) => ({
          id: `item-${index}`,
          type: 'item-check',
          severity: item.status === 'missing' ? 'critical' : 
                   item.status === 'uncertain' ? 'warning' : 'info',
          item: item.item,
          status: item.status,
          confidence: item.confidence,
          description: item.reason
        })),
        summary: aiResult.summary,
        metadata: {
          totalItems: requiredItems.length,
          presentCount: aiResult.items_checked.filter(i => i.status === 'present').length,
          missingCount: aiResult.items_checked.filter(i => i.status === 'missing').length,
          uncertainCount: aiResult.items_checked.filter(i => i.status === 'uncertain').length
        }
      };
    } catch (error) {
      throw new Error(`Presence check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  // Helper: Calculate overall confidence
  calculateOverallConfidence(items: Array<{ confidence: number }>): number {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + item.confidence, 0);
    return sum / items.length;
  }
};
