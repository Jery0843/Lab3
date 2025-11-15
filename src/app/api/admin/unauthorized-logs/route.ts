import { NextResponse, NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getClientIP, getSecurityHeaders } from '@/lib/security';

// POST - Log unauthorized access from client side
export async function POST(request: NextRequest) {
  try {
    const { path, reason } = await request.json();
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503, headers: getSecurityHeaders() }
      );
    }

    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || null;
    
    // Get location data from IP (using Cloudflare headers if available)
    const country = request.headers.get('cf-ipcountry') || 'unknown';
    const region = request.headers.get('cf-region') || 'unknown';
    const city = request.headers.get('cf-ipcity') || 'unknown';
    
    const logStmt = await db.prepare(`
      INSERT INTO admin_unauthorized (ip_address, user_agent, path, reason, country, region, city, referer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await logStmt.bind(
      clientIP,
      userAgent,
      path || '/admin/unauthorized',
      reason || 'page_view',
      country,
      region,
      city,
      referer
    ).run();

    return NextResponse.json(
      { success: true },
      { headers: getSecurityHeaders() }
    );

  } catch (error) {
    console.error('Error logging unauthorized access:', error);
    return NextResponse.json(
      { error: 'Failed to log access' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// GET - Retrieve unauthorized access logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503, headers: getSecurityHeaders() }
      );
    }

    const logsStmt = await db.prepare(`
      SELECT * FROM admin_unauthorized 
      ORDER BY timestamp DESC 
      LIMIT 100
    `);
    
    const result = await logsStmt.all();
    console.log('Unauthorized logs query result:', result);
    
    // The console shows result is an array directly, not nested in .results
    const logs = Array.isArray(result) ? result : (result.results || []);
    console.log('Processed logs:', logs);

    return NextResponse.json(
      logs,
      { headers: getSecurityHeaders() }
    );

  } catch (error) {
    console.error('Error fetching unauthorized logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}