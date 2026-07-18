'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { SourceType } from '@prisma/client';
import { processDocumentChunks } from '@/services/ai';

export async function addDocument(
  botId: string,
  type: SourceType,
  name: string,
  content?: string,
  fileUrl?: string
) {
  if (!botId) throw new Error('El ID del bot es requerido.');
  if (!name.trim()) throw new Error('El nombre de la fuente es requerido.');

  const doc = await prisma.document.create({
    data: {
      botId,
      type,
      name,
      content: content || null,
      fileUrl: fileUrl || null,
      status: 'PENDING',
    },
  });

  // Procesar fragmentos y embeddings en segundo plano o de forma secuencial en el action
  try {
    await processDocumentChunks(doc.id);
  } catch (err) {
    console.error('Fallo al procesar fragmentos vectoriales:', err);
    // Forzar completado para asegurar fallback textual si no hay API Key o pgvector
    await prisma.document.update({
      where: { id: doc.id },
      data: { status: 'COMPLETED' },
    });
  }

  revalidatePath('/training');
  return { success: true };
}

export async function updateDocument(
  documentId: string,
  name: string,
  content?: string
) {
  if (!documentId) throw new Error('El ID de la fuente es requerido.');
  if (!name.trim()) throw new Error('El nombre de la fuente es requerido.');

  await prisma.document.update({
    where: { id: documentId },
    data: {
      name,
      content: content || null,
      status: 'PENDING', // Poner en pendiente para volver a procesar
    },
  });

  try {
    await processDocumentChunks(documentId);
  } catch (err) {
    console.error('Error al actualizar fragmentos vectoriales:', err);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'COMPLETED' },
    });
  }

  revalidatePath('/training');
  return { success: true };
}

export async function deleteDocument(documentId: string) {
  if (!documentId) throw new Error('El ID de la fuente es requerido.');

  await prisma.document.delete({
    where: { id: documentId },
  });

  revalidatePath('/training');
  return { success: true };
}

export async function reprocessDocument(documentId: string) {
  if (!documentId) throw new Error('El ID de la fuente es requerido.');

  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: 'PROCESSING',
    },
  });

  try {
    await processDocumentChunks(documentId);
  } catch (err) {
    console.error('Error al reprocesar fragmentos vectoriales:', err);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'COMPLETED' },
    });
  }

  revalidatePath('/training');
  return { success: true };
}
