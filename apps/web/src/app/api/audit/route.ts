import { NextRequest, NextResponse } from 'next/server';
import { runFullSystemAudit } from '@/lib/agents/system-audit-agent';
import { getSelfHealingTimeline } from '@/lib/agents/self-healing-engine';
import { verifyAdminAuth } from '@/lib/utils/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access key required" },
      { status: 401 }
    );
  }

  try {
    const summary = runFullSystemAudit();
    const selfHealingTimeline = getSelfHealingTimeline();
    return NextResponse.json({
      ...summary,
      selfHealingTimeline
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'ERROR', message: error?.message || 'Audit execution failed' },
      { status: 500 }
    );
  }
}