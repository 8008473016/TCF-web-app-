import fs from 'fs/promises';
import path from 'path';
import { dataPaths } from './dataPaths';

async function readLocalFile(filePath: string): Promise<any[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    if (!data.trim()) {
      await fs.writeFile(filePath, JSON.stringify([]));
      return [];
    }
    return JSON.parse(data);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // MIGRATION LOGIC: If missing in public/uploads/data, copy from src/data
      const filename = path.basename(filePath);
      const seedFilePath = path.resolve(process.cwd(), 'src/data', filename);
      try {
        const seedData = await fs.readFile(seedFilePath, 'utf-8');
        await fs.writeFile(filePath, seedData);
        return JSON.parse(seedData);
      } catch (seedErr) {
        await fs.writeFile(filePath, JSON.stringify([]));
        return [];
      }
    }
    throw err;
  }
}

async function writeLocalFile(filePath: string, data: any[]): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export const dbLocal = {
  read: async (tableName: string): Promise<any[]> => {
    const filePath = (dataPaths as any)[tableName];
    if (!filePath) throw new Error(`Unknown table: ${tableName}`);
    return await readLocalFile(filePath);
  },

  insert: async (tableName: string, data: any): Promise<boolean> => {
    const filePath = (dataPaths as any)[tableName];
    if (!filePath) throw new Error(`Unknown table: ${tableName}`);

    const existingData = await readLocalFile(filePath);
    existingData.push(data);
    await writeLocalFile(filePath, existingData);
    return true;
  },

  update: async (
    tableName: string, 
    keyField: string, 
    keyValue: any, 
    data: any
  ): Promise<boolean> => {
    const filePath = (dataPaths as any)[tableName];
    if (!filePath) throw new Error(`Unknown table: ${tableName}`);

    const existingData = await readLocalFile(filePath);
    const index = existingData.findIndex(item => item[keyField] === keyValue);
    
    if (index !== -1) {
      existingData[index] = { ...existingData[index], ...data };
      await writeLocalFile(filePath, existingData);
      return true;
    }
    return false;
  },

  delete: async (
    tableName: string, 
    keyField: string, 
    keyValue: any
  ): Promise<boolean> => {
    const filePath = (dataPaths as any)[tableName];
    if (!filePath) throw new Error(`Unknown table: ${tableName}`);

    const existingData = await readLocalFile(filePath);
    const index = existingData.findIndex(item => item[keyField] === keyValue);
    
    if (index !== -1) {
      existingData.splice(index, 1);
      await writeLocalFile(filePath, existingData);
      return true;
    }
    return false;
  }
};
