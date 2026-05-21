import { Router } from 'express';
import * as inspectionService from '../services/inspectionService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const items = await inspectionService.getAllInspections();
    res.json(items);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await inspectionService.createInspection(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating inspection:', error);
    res.status(400).json({ error: 'Failed to create inspection' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await inspectionService.getInspectionById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching inspection by id:', error);
    res.status(500).json({ error: 'Failed to fetch inspection' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await inspectionService.updateInspection(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating inspection:', error);
    res.status(400).json({ error: 'Failed to update inspection' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await inspectionService.deleteInspection(req.params.id);
    res.json({ message: 'Inspection deleted successfully' });
  } catch (error) {
    console.error('Error deleting inspection:', error);
    res.status(500).json({ error: 'Failed to delete inspection' });
  }
});

export default router;
