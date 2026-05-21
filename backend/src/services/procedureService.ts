import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createProcedure(data: any) {
  return prisma.procedure.create({
    data,
  });
}

export async function getAllProcedures() {
  return prisma.procedure.findMany({
    include: {
      tasks: true,
      inspections: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProcedureById(id: string) {
  return prisma.procedure.findUnique({
    where: { id },
    include: {
      tasks: true,
      inspections: true,
    },
  });
}

export async function updateProcedure(id: string, data: any) {
  return prisma.procedure.update({
    where: { id },
    data,
  });
}

export async function deleteProcedure(id: string) {
  return prisma.procedure.delete({
    where: { id },
  });
}
