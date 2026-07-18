import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    const dbUrlLength = dbUrl ? dbUrl.length : 0;
    const dbUrlPrefix = dbUrl ? dbUrl.substring(0, 15) : 'undefined';

    // 1. Probar consulta simple a la base de datos
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      userCount,
      dbUrlLength,
      dbUrlPrefix,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    const dbUrl = process.env.DATABASE_URL;
    const dbUrlLength = dbUrl ? dbUrl.length : 0;
    const dbUrlPrefix = dbUrl ? dbUrl.substring(0, 15) : 'undefined';
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'error',
      message: error.message || 'Unknown database error',
      dbUrlLength,
      dbUrlPrefix,
    }, { status: 500 });
  }
}
