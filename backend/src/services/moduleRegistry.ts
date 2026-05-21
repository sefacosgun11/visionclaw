import { IInspectionModule, ModuleExecutionInput, ModuleExecutionResult } from '../types/module.types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ModuleRegistry {
  private modules: Map<string, IInspectionModule> = new Map();

  /**
   * Register a module
   */
  register(module: IInspectionModule): void {
    console.log(`Registering module: ${module.id}`);
    this.modules.set(module.id, module);
  }

  /**
   * Get module by ID
   */
  getModule(moduleId: string): IInspectionModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Get all registered modules
   */
  getAllModules(): IInspectionModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category: string): IInspectionModule[] {
    return this.getAllModules().filter(m => m.category === category);
  }

  /**
   * Execute a module
   */
  async execute(
    moduleId: string,
    input: ModuleExecutionInput,
    options?: {
      templateId?: string;
      executedBy?: string;
    }
  ): Promise<{
    execution: any;
    result: ModuleExecutionResult;
  }> {
    const module = this.getModule(moduleId);
    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    const startTime = Date.now();

    try {
      // Execute module
      const result = await module.execute(input);
      const processingTime = Date.now() - startTime;

      // Save execution to database
      const execution = await prisma.moduleExecution.create({
        data: {
          moduleId: moduleId,
          templateId: options?.templateId,
          evidenceId: input.evidenceId,
          config: input.config,
          status: result.status,
          result: result as any,
          confidence: result.confidence,
          processingTimeMs: processingTime,
          executedBy: options?.executedBy || 'system'
        }
      });

      // Update module usage stats
      await prisma.inspectionModule.update({
        where: { id: moduleId },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      });

      // Update template usage stats if used
      if (options?.templateId) {
        await prisma.moduleTemplate.update({
          where: { id: options.templateId },
          data: {
            usageCount: { increment: 1 },
            lastUsedAt: new Date()
          }
        });
      }

      return { execution, result };
    } catch (error) {
      // Save error execution
      const execution = await prisma.moduleExecution.create({
        data: {
          moduleId: moduleId,
          templateId: options?.templateId,
          evidenceId: input.evidenceId,
          config: input.config,
          status: 'error',
          result: {
            status: 'error',
            findings: [],
            summary: error instanceof Error ? error.message : 'Unknown error'
          },
          processingTimeMs: Date.now() - startTime,
          executedBy: options?.executedBy || 'system'
        }
      });

      throw error;
    }
  }

  /**
   * Sync registered modules to database
   */
  async syncToDatabase(): Promise<void> {
    for (const module of this.getAllModules()) {
      await prisma.inspectionModule.upsert({
        where: { id: module.id },
        update: {
          name: module.name,
          description: module.description,
          category: module.category,
          version: module.version,
          author: module.author,
          status: module.status,
          isPublic: module.isPublic,
          isPremium: module.isPremium,
          configSchema: module.configSchema as any,
          icon: module.icon,
          color: module.color,
          tags: module.tags || []
        },
        create: {
          id: module.id,
          name: module.name,
          description: module.description,
          category: module.category,
          version: module.version,
          author: module.author,
          status: module.status,
          isPublic: module.isPublic,
          isPremium: module.isPremium,
          configSchema: module.configSchema as any,
          icon: module.icon,
          color: module.color,
          tags: module.tags || []
        }
      });
    }
  }
}

// Global singleton instance
export const moduleRegistry = new ModuleRegistry();
