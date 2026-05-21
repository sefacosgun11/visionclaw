import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createInspection(data: any) {
  return prisma.inspection.create({
    data,
  });
}

export async function getAllInspections() {
  return prisma.inspection.findMany({
    include: {
      equipment: true,
      procedure: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getInspectionById(id: string) {
  return prisma.inspection.findUnique({
    where: { id },
    include: {
      equipment: true,
      procedure: true,
    },
  });
}

export async function updateInspection(id: string, data: any) {
  return prisma.inspection.update({
    where: { id },
    data,
  });
}

export async function deleteInspection(id: string) {
  return prisma.inspection.delete({
    where: { id },
  });
}
