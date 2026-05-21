import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/module-templates - List templates
router.get('/', async (req, res) => {
  try {
    const { moduleId, category, isPublic } = req.query;

    const templates = await prisma.moduleTemplate.findMany({
      where: {
        ...(moduleId && { moduleId: moduleId as string }),
        ...(category && { category: category as string }),
        ...(isPublic !== undefined && { isPublic: isPublic === 'true' })
      },
      include: {
        module: {
          select: { name: true, icon: true, color: true }
        }
      },
      orderBy: { usageCount: 'desc' }
    });

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// POST /api/module-templates - Create template
router.post('/', async (req, res) => {
  try {
    const {
      moduleId,
      name,
      description,
      category,
      config,
      referenceImageUrl,
      referenceEvidenceId,
      isPublic,
      createdBy,
      organizationId
    } = req.body;

    if (!moduleId || !name || !config) {
      return res.status(400).json({ 
        error: 'moduleId, name, and config are required' 
      });
    }

    const template = await prisma.moduleTemplate.create({
      data: {
        moduleId,
        name,
        description,
        category,
        config,
        referenceImageUrl,
        referenceEvidenceId,
        isPublic: isPublic !== undefined ? isPublic : true,
        createdBy: createdBy || 'system',
        organizationId
      }
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create template' 
    });
  }
});

// GET /api/module-templates/:id - Get template
router.get('/:id', async (req, res) => {
  try {
    const template = await prisma.moduleTemplate.findUnique({
      where: { id: req.params.id },
      include: {
        module: true
      }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
});

// PUT /api/module-templates/:id - Update template
router.put('/:id', async (req, res) => {
  try {
    const template = await prisma.moduleTemplate.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(template);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// DELETE /api/module-templates/:id - Delete template
router.delete('/:id', async (req, res) => {
  try {
    await prisma.moduleTemplate.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;
