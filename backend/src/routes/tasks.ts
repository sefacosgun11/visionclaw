import { Router } from 'express';
import * as taskService from '../services/taskService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const items = await taskService.getAllTasks();
    res.json(items);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/status/:status', async (req, res) => {
  try {
    const items = await taskService.getTasksByStatus(req.params.status);
    res.json(items);
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await taskService.createTask(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ error: 'Failed to create task' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await taskService.getTaskById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching task by id:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await taskService.updateTask(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
