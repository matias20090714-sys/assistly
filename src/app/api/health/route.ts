import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Probar consulta simple a la base de datos
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      database: 'error',
      message: error.message || 'Unknown database error',
      stack: error.stack || null,
    }, { status: 500 });
  }
}
