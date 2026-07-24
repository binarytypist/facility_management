import { headers } from 'next/headers';

export function corsHeaders() {
  const allowedOrigins = [
    'http://localhost:4200',
    'https://facility-management-binarytypists-projects.vercel.app',
    'https://facility-management.vercel.app'
  ];

  let origin = 'http://localhost:4200';
  
  try {
    const headersList = headers();
    const requestOrigin = headersList.get('origin');
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      origin = requestOrigin;
    }
  } catch (e) {
    // headers() might throw outside of request context in some Next.js edge cases
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-name',
    'Access-Control-Allow-Credentials': 'true',
  };
}
