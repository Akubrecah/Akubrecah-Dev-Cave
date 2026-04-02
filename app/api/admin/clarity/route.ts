import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';

const CLARITY_PROJECT_ID = process.env.CLARITY_PROJECT_ID || 'w4r5iil0md';
const CLARITY_EXPORT_TOKEN = process.env.CLARITY_EXPORT_TOKEN;
const CLARITY_ENDPOINT = "https://www.clarity.ms/export-data/api/v1/project-live-insights";

export async function GET() {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    if (!CLARITY_EXPORT_TOKEN) {
      throw new Error("Clarity export token not configured");
    }
    const res = await fetch(`${CLARITY_ENDPOINT}?projectId=${CLARITY_PROJECT_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLARITY_EXPORT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 } // Cache for 5 mins
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Clarity API Error]', res.status, errorText);
      throw new Error(`Clarity API responded with ${res.status}`);
    }

    const data = await res.json();
    
    // Normalize data for our UI
    return NextResponse.json({
      sessions: data?.sessions || 0,
      activeUsers: data?.activeUsers || 0,
      bounceRate: data?.bounceRate || 0,
      avgDuration: data?.avgDuration || "0m 0s",
      rageClicks: data?.rageClicks || 0,
      deadClicks: data?.deadClicks || 0,
      frictionIndex: data?.frictionIndex || 0,
      timestamp: new Date().toISOString(),
      raw: data // Keep raw for advanced charts if needed
    });
  } catch (error: any) {
    console.error('[Clarity Route Error]', error);
    return NextResponse.json({ 
      error: 'Failed to fetch Clarity insights',
      details: error.message 
    }, { status: 500 });
  }
}
