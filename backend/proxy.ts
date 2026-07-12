import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// Adjust this URL to your Keycloak server. If running in Docker desktop on Windows, 
// localhost usually works, but inside a container you might need host.docker.internal
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8081';
const REALM = process.env.KEYCLOAK_REALM || 'geo-task-realm';

const JWKS_URI = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`;

// Cache the JWKS using jose's built-in remote JWK set
const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URI));

export async function middleware(request: NextRequest) {
  // Define routes that do NOT require authentication
  const publicRoutes = ['/api/login', '/api/register'];
  
  // If it's a public route or an OPTIONS request (CORS), allow it
  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route)) || request.method === 'OPTIONS') {
    return NextResponse.next();
  }

  // Only protect API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify the JWT token
      const { payload } = await jose.jwtVerify(token, JWKS, {
        issuer: `${KEYCLOAK_URL}/realms/${REALM}`,
      });

      // Optional: You can attach claims to headers if backend routes need them
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub || '');
      requestHeaders.set('x-user-email', (payload.email as string) || '');
      
      const roles = payload.realm_access ? (payload.realm_access as any).roles : [];
      requestHeaders.set('x-user-roles', JSON.stringify(roles));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('JWT Verification failed:', error);
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run on API routes
export const config = {
  matcher: ['/api/:path*'],
};
