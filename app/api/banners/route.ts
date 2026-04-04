import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const BANNERS_FILE = path.join(DATA_DIR, 'banners.json');

export async function GET() {
  try {
    const data = await fs.readFile(BANNERS_FILE, 'utf-8');
    const banners = JSON.parse(data);
    return NextResponse.json(banners.filter((b: any) => b.active !== false));
  } catch {
    return NextResponse.json([]);
  }
}
