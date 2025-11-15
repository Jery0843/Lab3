import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from './src/lib/db';

// Log unauthorized access attempt
async function logUnauthorizedAccess(request: NextRequest, reason: string) {
  try {
    const db = getDatabase();
    if (!db) return;
    
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('x-vercel-forwarded-for') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || null;
    
    // Get location data from IP using external API (same as OTP verification)
    let country = 'unknown', region = 'unknown', city = 'unknown';
    try {
      if (clientIP !== 'unknown' && clientIP !== 'localhost' && clientIP !== '127.0.0.1') {
        const response = await fetch(`http://ip-api.com/json/${clientIP}`);
        const data = await response.json();
        if (data.status === 'success') {
          country = data.country || 'unknown';
          region = data.regionName || 'unknown';
          city = data.city || 'unknown';
        }
      }
    } catch (error) {
      console.error('Error getting location from IP:', error);
    }
    
    const logStmt = await db.prepare(`
      INSERT INTO admin_unauthorized (ip_address, user_agent, path, reason, country, region, city, referer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await logStmt.bind(
      clientIP,
      userAgent,
      request.nextUrl.pathname,
      reason,
      country,
      region,
      city,
      referer
    ).run();
  } catch (error) {
    console.error('Failed to log unauthorized access:', error);
  }
}

// Validate admin session token
async function validateAdminSession(sessionToken: string): Promise<boolean> {
  if (!sessionToken || sessionToken.length !== 64) {
    return false;
  }
  
  try {
    const db = getDatabase();
    if (!db) return false;
    
    // Check if session exists and is valid
    const stmt = await db.prepare('SELECT * FROM admin_sessions WHERE token = ? AND expires_at > datetime("now") AND is_active = 1');
    const session = await stmt.bind(sessionToken).first();
    
    return !!session;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes (except unauthorized page)
  if (pathname.startsWith('/admin') && !pathname.includes('/admin/unauthorized')) {
    const sessionToken = request.cookies.get('admin_session')?.value;
    
    if (!sessionToken) {
      await logUnauthorizedAccess(request, 'no_session_token');
      return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
    }
    
    const isValid = await validateAdminSession(sessionToken);
    if (!isValid) {
      await logUnauthorizedAccess(request, 'invalid_session_token');
      const response = NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }
  
  // Protect admin API routes (except auth and setup)
  if (pathname.startsWith('/api/admin/') && 
      !pathname.includes('/api/admin/auth') && 
      !pathname.includes('/api/admin/setup')) {
    
    const sessionToken = request.cookies.get('admin_session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const isValid = await validateAdminSession(sessionToken);
    if (!isValid) {
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('admin_session');
      return response;
    }
  }
  
  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-password');
    
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
