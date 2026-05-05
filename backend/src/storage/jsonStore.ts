import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const EVIDENCE_FILE = path.join(DATA_DIR, 'evidence.json');
const ANALYSIS_FILE = path.join(DATA_DIR, 'analysis.json');

interface StorageData<T> {
  [id: string]: T;
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Directory exists
  }
}

async function readFile<T>(filepath: string): Promise<StorageData<T>> {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return {};
  }
}

async function writeFile<T>(filepath: string, data: StorageData<T>): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function saveEvidence(id: string, evidence: any): Promise<void> {
  const data = await readFile(EVIDENCE_FILE);
  data[id] = evidence;
  await writeFile(EVIDENCE_FILE, data);
}

export async function getEvidence(id: string): Promise<any | null> {
  const data = await readFile(EVIDENCE_FILE);
  return data[id] || null;
}

export async function getAllEvidence(): Promise<any[]> {
  const data = await readFile(EVIDENCE_FILE);
  return Object.values(data);
}

export async function saveAnalysis(id: string, analysis: any): Promise<void> {
  const data = await readFile(ANALYSIS_FILE);
  data[id] = analysis;
  await writeFile(ANALYSIS_FILE, data);
}

export async function getAnalysis(id: string): Promise<any | null> {
  const data = await readFile(ANALYSIS_FILE);
  return data[id] || null;
}

export async function getAnalysisByEvidenceId(evidenceId: string): Promise<any | null> {
  const data = await readFile(ANALYSIS_FILE);
  const analysis = Object.values(data).find((a: any) => a.evidenceItemId === evidenceId);
  return analysis || null;
}

export async function updateAnalysis(id: string, updates: Partial<any>): Promise<any | null> {
  const data = await readFile(ANALYSIS_FILE);
  if (!data[id]) return null;
  
  data[id] = { ...data[id], ...updates };
  await writeFile(ANALYSIS_FILE, data);
  return data[id];
}

export async function updateAnalysisByEvidenceId(evidenceId: string, updates: Partial<any>): Promise<any | null> {
  const data = await readFile<any>(ANALYSIS_FILE);
  const entry = Object.entries(data).find(([_, a]: [string, any]) => a.evidenceItemId === evidenceId);
  
  if (!entry) return null;
  
  const [id, analysis] = entry as [string, any];
  data[id] = { ...(analysis as object), ...updates };
  await writeFile(ANALYSIS_FILE, data);
  return data[id];
}
