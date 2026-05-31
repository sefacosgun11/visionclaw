import { PrismaClient } from '@prisma/client';
import { moduleRegistry } from '../services/moduleRegistry';
import { PresenceCheckModule } from './presenceCheck';
import { defaultPresenceCheckTemplates } from './presenceCheck.templates';
import { DefectDetectionModule } from './defectDetection';
import { defaultDefectDetectionTemplates } from './defectDetection.templates';
import { WeldQualityControlModule } from './weldQualityControl';
import { defaultWeldQualityTemplates } from './weldQualityControl.templates';

const prisma = new PrismaClient();

export async function seedDefaultTemplates() {
  console.log('🌱 Seeding default templates...');
  
  const allTemplates = [
    ...defaultPresenceCheckTemplates,
    ...defaultDefectDetectionTemplates,
    ...defaultWeldQualityTemplates
  ];

  for (const template of allTemplates) {
    try {
      // Check if template already exists
      const existing = await prisma.moduleTemplate.findFirst({
        where: {
          moduleId: template.moduleId,
          name: template.name
        }
      });
      
      if (!existing) {
        await prisma.moduleTemplate.create({
          data: template
        });
        console.log(`  ✅ Created template: ${template.name}`);
      } else {
        console.log(`  ⏭️  Template already exists: ${template.name}`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to create template: ${template.name}`, error);
    }
  }
  
  console.log('✅ Template seeding complete');
}

// Register all modules
export function registerAllModules() {
  console.log('📦 Registering modules...');
  
  moduleRegistry.register(PresenceCheckModule);
  moduleRegistry.register(DefectDetectionModule);
  moduleRegistry.register(WeldQualityControlModule);
  
  console.log(`✅ ${moduleRegistry.getAllModules().length} module(s) registered`);
}
