import path from 'path';
import { readFile } from 'fs/promises';

export const RAW_FRANCHISE_PATH = path.resolve(__dirname, '../data/raw/franchises.json');
export const RAW_TEAM_PATH = path.resolve(__dirname, '../data/raw/teams.json');
export const FRANCHISE_PATH = path.resolve(__dirname, '../data/franchises.json');

export async function readJSON<T> (p: string): Promise<T> {
  const res = await readFile(p, 'utf8');
  return JSON.parse(res) as T;
}
