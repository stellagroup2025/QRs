import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching to always get the live server version

export async function GET() {
    return NextResponse.json({
        version: process.env.NEXT_PUBLIC_APP_VERSION || 'dev'
    });
}
