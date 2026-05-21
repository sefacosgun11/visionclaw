import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createEquipment(data: any) {
  return prisma.equipment.create({
    data,
  });
}

export async function getAllEquipment() {
  return prisma.equipment.findMany({
    include: {
      tasks: true,
      inspections: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEquipmentById(id: string) {
  return prisma.equipment.findUnique({
    where: { id },
    include: {
      tasks: true,
      inspections: true,
    },
  });
}

export async function updateEquipment(id: string, data: any) {
  return prisma.equipment.update({
    where: { id },
    data,
  });
}

export async function deleteEquipment(id: string) {
  return prisma.equipment.delete({
    where: { id },
  });
}
