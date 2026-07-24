import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// Adjust this URL to your Keycloak server. If running in Docker desktop on Windows, 
// localhost usually works, but inside a container you might need host.docker.internal
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const REALM = process.env.KEYCLOAK_REALM || 'geo-task-realm';

const JWKS_URI = `http://127.0.0.1:8080/realms/${REALM}/protocol/openid-connect/certs`;

// Cache the JWKS using jose's built-in remote JWK set
const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URI));

export async function middleware(request: NextRequest) {
  console.log(`[PROXY IN] ${request.method} ${request.nextUrl.pathname}`);
  // Define routes that do NOT require authentication
  const publicRoutes = ['/api/login', '/api/register'];

  const allowedOrigins = [
    'http://localhost:4200',
    'https://facility-management-binarytypists-projects.vercel.app',
    'https://facility-management.vercel.app'
  ];

  const origin = request.headers.get('origin');
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : 'http://localhost:4200';

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-name',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  // If it's a public route, allow it
  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }

  // Only protect API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response = NextResponse.json(
        { success: false, message: 'Unauthorized - Missing or invalid Authorization header' },
        { status: 401 }
      );
      Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify the JWT token
      const { payload } = await jose.jwtVerify(token, JWKS, {
        issuer: `${KEYCLOAK_URL}/realms/${REALM}`,
      });

      // Pass the user info to the API routes via headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub as string);
      
      // If there are roles or preferred_username, you can pass them as well
      if (payload.preferred_username) {
        requestHeaders.set('x-user-name', payload.preferred_username as string);
      }

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;

    } catch (error) {
      console.error('JWT verification failed:', error);
      const response = NextResponse.json(
        { success: false, message: 'Unauthorized - Invalid or expired token' },
        { status: 401 }
      );
      Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }
  }

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

// Configure the middleware to run on API routes
export const config = {
  matcher: ['/api/:path*'],
};
