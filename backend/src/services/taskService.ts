import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createTask(data: any) {
  return prisma.task.create({
    data,
  });
}

export async function getAllTasks() {
  return prisma.task.findMany({
    include: {
      equipment: true,
      procedure: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      equipment: true,
      procedure: true,
    },
  });
}

export async function updateTask(id: string, data: any) {
  return prisma.task.update({
    where: { id },
    data,
  });
}

export async function deleteTask(id: string) {
  return prisma.task.delete({
    where: { id },
  });
}

export async function getTasksByStatus(status: string) {
  return prisma.task.findMany({
    where: { status },
    include: {
      equipment: true,
      procedure: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
