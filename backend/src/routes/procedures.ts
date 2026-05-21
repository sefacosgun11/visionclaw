import { Router } from 'express';
import * as procedureService from '../services/procedureService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const items = await procedureService.getAllProcedures();
    res.json(items);
  } catch (error) {
    console.error('Error fetching procedures:', error);
    res.status(500).json({ error: 'Failed to fetch procedures' });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await procedureService.createProcedure(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating procedure:', error);
    res.status(400).json({ error: 'Failed to create procedure' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await procedureService.getProcedureById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Procedure not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching procedure by id:', error);
    res.status(500).json({ error: 'Failed to fetch procedure' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await procedureService.updateProcedure(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating procedure:', error);
    res.status(400).json({ error: 'Failed to update procedure' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await procedureService.deleteProcedure(req.params.id);
    res.json({ message: 'Procedure deleted successfully' });
  } catch (error) {
    console.error('Error deleting procedure:', error);
    res.status(500).json({ error: 'Failed to delete procedure' });
  }
});

export default router;
