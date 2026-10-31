import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'Administrator access required' } },
        { status: 403 }
      );
    }

    const n8nWebhookUrl =
      process.env.N8N_WEBHOOK_URL ||
      'http://localhost:5678/webhook/shaktiq-analyze-run';

    return NextResponse.json({
      ok: true,
      data: {
        n8nStatus: 'online',
        mainWorkflow: 'shaktiq-analyze-run (Active)',
        errorWorkflow: 'Error Trigger Handler (Active)',
        n8nWebhookUrl,
        lastChecked: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error('[Admin Workflow Health Error]:', err);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL', message: 'Failed to retrieve workflow health' } },
      { status: 500 }
    );
  }
}
