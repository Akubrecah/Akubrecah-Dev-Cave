import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';

const CLARITY_EXPORT_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ4M0FCMDhFNUYwRDMxNjdEOTRFMTQ3M0FEQTk2RTcyRDkwRUYwRkYiLCJ0eXAiOiJKV1QifQ.eyJqdGkiOiI5YzY1MzIyNC05ZmM5LTQ5OWUtOTMzMi00ZGI0ZWVjOGZkNDEiLCJzdWIiOiIzMjYzMzMwODg4OTY2MjQ1Iiwic2NvcGUiOiJEYXRhLkV4cG9ydCIsIm5iZiI6MTc3NTEyNDEyNywiZXhwIjo0OTI4NzI0MTI3LCJpYXQiOjE3NzUxMjQxMjcsImlzcyI6ImNsYXJpdHkiLCJhdWQiOiJjbGFyaXR5LmRhdGEtZXhwb3J0ZXIifQ.W_gRIZFOkZe2h7Whh9U-V-r6DorHUDesWe8bwkvWozCRwPrGgF4Bo1ElGZhNNKhtR8oMWGzsbxoTInfdupn6rV_hNVpsZ1mcaK470c40wEfXIci2hso_RCQYnNyHpJJiHiv-fsYTPTOms9zZtlUKsXFfYq3ipgBNwDf8by1QmGHx7v7S8CvYA0BZDRTXTxhqXpTNzm9Xyo5NQNEfIPUdIwWu-cQCivFxAqFnSrliSlKBO7-FOsnRkdyGsKvzDZBplPNpJcF9clFWFXoPTV7-kBwj1im38nWsUwjY-9ieblzl3WczzH5h8uqU7sxkDkchiIsIgKJrl8ylQecpNkbU2A";
const CLARITY_ENDPOINT = "https://www.clarity.ms/export-data/api/v1/project-live-insights";

export async function GET() {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const res = await fetch(`${CLARITY_ENDPOINT}?projectId=w4r5iil0md`, {
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
