import fs from 'fs/promises';
import { JWT } from 'google-auth-library';
import { sheets as googleSheets } from '@googleapis/sheets';
import { config as appConfig, isGoogleConfigured } from './config';
import { dataPaths } from './dataPaths';

const config = {
  ...appConfig,
  dataPaths
};

let authClient: JWT | null = null;
let sheetsApi: any = null;

if (isGoogleConfigured) {
  try {
    authClient = new JWT({
      email: config.google.serviceAccountEmail,
      key: config.google.privateKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ],
    });
    sheetsApi = googleSheets({ version: 'v4', auth: authClient });
    console.log('Google Sheets API successfully authenticated.');
  } catch (error) {
    console.error('Failed to authenticate Google Sheets API, falling back to local files:', error);
  }
} else {
  console.log('Google Sheets credentials missing. Using local JSON files as database.');
}

const mapSheetName = (tableName: string): string => {
  switch (tableName) {
    case 'products': return 'Products';
    case 'categories': return 'Categories';
    case 'orders': return 'Orders';
    case 'leads': return 'Leads';
    case 'blogs': return 'Blogs';
    case 'settings': return 'Settings';
    case 'reviews': return 'Reviews';
    case 'media': return 'Media';
    default: return tableName;
  }
};

async function readLocalFile(path: string): Promise<any[]> {
  try {
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(path, JSON.stringify([]));
      return [];
    }
    throw err;
  }
}

async function writeLocalFile(path: string, data: any[]): Promise<void> {
  await fs.writeFile(path, JSON.stringify(data, null, 2));
}

async function getSheetId(sheetName: string): Promise<number> {
  if (!sheetsApi) throw new Error('Google Sheets client not initialized');
  const metadata = await sheetsApi.spreadsheets.get({
    spreadsheetId: config.google.sheetId,
  });
  const sheet = metadata.data.sheets?.find(
    (s: any) => s.properties?.title?.toLowerCase() === sheetName.toLowerCase()
  );
  if (!sheet || sheet.properties?.sheetId === undefined) {
    throw new Error(`Sheet with name "${sheetName}" not found.`);
  }
  return sheet.properties.sheetId;
}

export const db = {
  read: async (tableName: string): Promise<any[]> => {
    if (sheetsApi) {
      try {
        const sheetName = mapSheetName(tableName);
        const response = await sheetsApi.spreadsheets.values.get({
          spreadsheetId: config.google.sheetId,
          range: `${sheetName}!A1:Z5000`,
        });
        const rows = response.data.values;
        if (!rows || rows.length === 0) return [];
        
        const headers = rows[0];
        const dataRows = rows.slice(1);
        
        return dataRows.map((row: any) => {
          const obj: any = {};
          headers.forEach((header: string, index: number) => {
            let val = row[index] !== undefined ? row[index] : '';
            // Try parsing stringified arrays/objects
            if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
              try {
                val = JSON.parse(val);
              } catch {
                // Keep as string
              }
            }
            obj[header] = val;
          });
          return obj;
        });
      } catch (error) {
        console.error(`Google Sheets Read failed for ${tableName}, falling back to local:`, error);
        return readLocalFile((config.dataPaths as any)[tableName]);
      }
    } else {
      return readLocalFile((config.dataPaths as any)[tableName]);
    }
  },

  insert: async (tableName: string, data: any): Promise<any> => {
    if (sheetsApi) {
      try {
        const sheetName = mapSheetName(tableName);
        const response = await sheetsApi.spreadsheets.values.get({
          spreadsheetId: config.google.sheetId,
          range: `${sheetName}!A1:Z1`,
        });
        
        let headers = response.data.values?.[0] || [];
        
        if (headers.length === 0) {
          headers = Object.keys(data);
          await sheetsApi.spreadsheets.values.update({
            spreadsheetId: config.google.sheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [headers] },
          });
        }
        
        const newRow = headers.map((header: string) => {
          const val = data[header];
          return val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : String(val)) : '';
        });
        
        await sheetsApi.spreadsheets.values.append({
          spreadsheetId: config.google.sheetId,
          range: `${sheetName}!A2`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [newRow] },
        });
        
        return data;
      } catch (error) {
        console.error(`Google Sheets Insert failed for ${tableName}, falling back to local:`, error);
        const localData = await readLocalFile((config.dataPaths as any)[tableName]);
        localData.push(data);
        await writeLocalFile((config.dataPaths as any)[tableName], localData);
        return data;
      }
    } else {
      const localData = await readLocalFile((config.dataPaths as any)[tableName]);
      localData.push(data);
      await writeLocalFile((config.dataPaths as any)[tableName], localData);
      return data;
    }
  },

  update: async (tableName: string, keyField: string, keyValue: string, updateData: any): Promise<any> => {
    if (sheetsApi) {
      try {
        const sheetName = mapSheetName(tableName);
        const response = await sheetsApi.spreadsheets.values.get({
          spreadsheetId: config.google.sheetId,
          range: `${sheetName}!A1:Z5000`,
        });
        
        const rows = response.data.values || [];
        if (rows.length === 0) throw new Error('Sheet is empty');
        
        const headers = rows[0];
        const keyIndex = headers.indexOf(keyField);
        if (keyIndex === -1) throw new Error(`Key field "${keyField}" not found in sheet headers.`);
        
        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][keyIndex] === keyValue) {
            rowIndex = i + 1;
            break;
          }
        }
        
        if (rowIndex === -1) throw new Error(`Record with ${keyField} = "${keyValue}" not found.`);
        
        const existingRow = rows[rowIndex - 1];
        const updatedRow = headers.map((header: string, index: number) => {
          if (updateData[header] !== undefined) {
            const val = updateData[header];
            return typeof val === 'object' ? JSON.stringify(val) : String(val);
          }
          return existingRow[index] !== undefined ? existingRow[index] : '';
        });
        
        await sheetsApi.spreadsheets.values.update({
          spreadsheetId: config.google.sheetId,
          range: `${sheetName}!A${rowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [updatedRow] },
        });
        
        return { ...updateData, [keyField]: keyValue };
      } catch (error) {
        console.error(`Google Sheets Update failed for ${tableName}, falling back to local:`, error);
        const localData = await readLocalFile((config.dataPaths as any)[tableName]);
        const itemIndex = localData.findIndex((item: any) => String(item[keyField]) === String(keyValue));
        if (itemIndex !== -1) {
          localData[itemIndex] = { ...localData[itemIndex], ...updateData };
          await writeLocalFile((config.dataPaths as any)[tableName], localData);
          return localData[itemIndex];
        }
        throw error;
      }
    } else {
      const localData = await readLocalFile((config.dataPaths as any)[tableName]);
      const itemIndex = localData.findIndex((item: any) => String(item[keyField]) === String(keyValue));
      if (itemIndex !== -1) {
        localData[itemIndex] = { ...localData[itemIndex], ...updateData };
        await writeLocalFile((config.dataPaths as any)[tableName], localData);
        return localData[itemIndex];
      }
      throw new Error(`Record with ${keyField} = "${keyValue}" not found.`);
    }
  },

  delete: async (tableName: string, keyField: string, keyValue: string): Promise<boolean> => {
    if (sheetsApi) {
      try {
        const sheetName = mapSheetName(tableName);
        const response = await sheetsApi.spreadsheets.values.get({
          spreadsheetId: config.google.sheetId,
          range: `${sheetName}!A1:Z5000`,
        });
        
        const rows = response.data.values || [];
        if (rows.length === 0) return false;
        
        const headers = rows[0];
        const keyIndex = headers.indexOf(keyField);
        if (keyIndex === -1) return false;
        
        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][keyIndex] === keyValue) {
            rowIndex = i + 1;
            break;
          }
        }
        
        if (rowIndex === -1) return false;
        
        const sheetId = await getSheetId(sheetName);
        
        await sheetsApi.spreadsheets.batchUpdate({
          spreadsheetId: config.google.sheetId,
          requestBody: {
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: sheetId,
                    dimension: 'ROWS',
                    startIndex: rowIndex - 1,
                    endIndex: rowIndex,
                  },
                },
              },
            ],
          },
        });
        
        return true;
      } catch (error) {
        console.error(`Google Sheets Delete failed for ${tableName}, falling back to local:`, error);
        const localData = await readLocalFile((config.dataPaths as any)[tableName]);
        const filtered = localData.filter((item: any) => String(item[keyField]) !== String(keyValue));
        if (localData.length !== filtered.length) {
          await writeLocalFile((config.dataPaths as any)[tableName], filtered);
          return true;
        }
        return false;
      }
    } else {
      const localData = await readLocalFile((config.dataPaths as any)[tableName]);
      const filtered = localData.filter((item: any) => String(item[keyField]) !== String(keyValue));
      if (localData.length !== filtered.length) {
        await writeLocalFile((config.dataPaths as any)[tableName], filtered);
        return true;
      }
      return false;
    }
  }
};
