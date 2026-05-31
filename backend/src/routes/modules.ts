import express from 'express';
import { moduleRegistry } from '../services/moduleRegistry';
import { PrismaClient } from '@prisma/client';
import { getEvidenceById } from '../services/evidenceService';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/modules - List all modules
router.get('/', async (req, res) => {
  try {
    const modules = moduleRegistry.getAllModules().map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      category: m.category,
      version: m.version,
      author: m.author,
      status: m.status,
      isPublic: m.isPublic,
      isPremium: m.isPremium,
      icon: m.icon,
      color: m.color,
      tags: m.tags,
      configSchema: m.configSchema
    }));

    res.json(modules);
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: 'Failed to get modules' });
  }
});

// GET all module executions
router.get('/executions', async (req, res) => {
  try {
    const executions = await prisma.moduleExecution.findMany({
      where: { deletedAt: null },
      include: { module: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(executions);
  } catch (error) {
    console.error('Error fetching executions:', error);
    res.status(500).json({ error: 'Failed to fetch executions' });
  }
});

// DELETE single execution
router.delete('/executions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.moduleExecution.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// DELETE bulk executions
router.post('/executions/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  try {
    await prisma.moduleExecution.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() }
    });
    res.json({ success: true, count: ids.length });
  } catch (error) {
    res.status(500).json({ error: 'Bulk delete failed' });
  }
});

// GET /api/modules/:id - Get module details
router.get('/:id', async (req, res) => {
  try {
    const module = moduleRegistry.getModule(req.params.id);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const stats = await prisma.inspectionModule.findUnique({
      where: { id: req.params.id },
      select: { usageCount: true, lastUsedAt: true }
    });

    res.json({
      ...module,
      stats
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ error: 'Failed to get module' });
  }
});

// POST /api/modules/execute - Execute a module
router.post('/execute', async (req, res) => {
  try {
    const { moduleId, evidenceId, config, templateId, executedBy } = req.body;

    if (!moduleId || !evidenceId) {
      return res.status(400).json({ 
        error: 'moduleId and evidenceId are required' 
      });
    }

    // Get evidence with image URL
    const evidence = await getEvidenceById(evidenceId);
    if (!evidence || !evidence.url) {
      return res.status(404).json({ 
        error: 'Evidence not found or no image URL' 
      });
    }

    // Execute module
    const { execution, result } = await moduleRegistry.execute(
      moduleId,
      {
        imageUrl: evidence.url,
        config: config || {},
        evidenceId: evidenceId,
        context: {
          equipmentId: (evidence.metadata as any)?.equipmentId,
          procedureId: (evidence.metadata as any)?.procedureId
        }
      },
      {
        templateId,
        executedBy: executedBy || 'system'
      }
    );

    res.status(201).json({
      execution,
      result
    });
  } catch (error) {
    console.error('Module execution error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Module execution failed' 
    });
  }
});

// GET /api/modules/executions/:id - Get execution details
router.get('/executions/:id', async (req, res) => {
  try {
    const execution = await prisma.moduleExecution.findUnique({
      where: { id: req.params.id },
      include: {
        module: true,
        template: true
      }
    });

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(execution);
  } catch (error) {
    console.error('Get execution error:', error);
    res.status(500).json({ error: 'Failed to get execution' });
  }
});

export default router;
