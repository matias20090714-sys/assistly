import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Probar consulta simple a la base de datos
    await prisma.user.count();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      openai_key_present: !!process.env.OPENAI_API_KEY,
      gemini_key_present: !!process.env.GEMINI_API_KEY,
      gemini_key_length: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      database: 'error',
      message: 'Database connection failed',
    }, { status: 500 });
  }
}
