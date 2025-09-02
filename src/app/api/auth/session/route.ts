import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  return NextResponse.json(
    {
      user: null,
      expires: new Date(Date.now() + 60_000).toISOString(),
    },
    { status: 200 }
  );
}
