import { Router } from 'express';
import * as equipmentService from '../services/equipmentService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const items = await equipmentService.getAllEquipment();
    res.json(items);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await equipmentService.createEquipment(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(400).json({ error: 'Failed to create equipment' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await equipmentService.getEquipmentById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching equipment by id:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await equipmentService.updateEquipment(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(400).json({ error: 'Failed to update equipment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await equipmentService.deleteEquipment(req.params.id);
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});

export default router;
