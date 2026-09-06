import { NextResponse } from 'next/server';
import { runFullSystemAudit } from '@/lib/agents/system-audit-agent';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = runFullSystemAudit();
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json(
      { status: 'ERROR', message: error?.message || 'Audit execution failed' },
      { status: 500 }
    );
  }
}