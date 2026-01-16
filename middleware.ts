import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simplified middleware - Let client-side handle auth
export async function middleware(req: NextRequest) {
  // Just allow all requests, auth will be handled client-side
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
