import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import prisma from '@/lib/prisma';

const DEFAULT_LINKS = [
  // Main
  { href: '/', label: 'Home' },
  { href: '/kra-solutions', label: 'KRA Solutions' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tsc', label: 'TSC Resources' },
  { href: '/pdf-tools', label: 'PDF Suite' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
  { href: '/about', label: 'About' },
  
  // Compliance / Resources
  { href: '/kra-solutions/itax-verification', label: 'iTax Verification' },
  { href: '/kra-solutions/itax-checker', label: 'iTax Checker' },
  { href: '/kra-solutions/customs-agent', label: 'Customs Agent' },
];

async function ensureDefaultLinks() {
  try {
    for (const link of DEFAULT_LINKS) {
      await prisma.navigationSetting.upsert({
        where: { href: link.href },
        update: { label: link.label }, // Keep labels in sync if they change in code
        create: {
          href: link.href,
          label: link.label,
        },
      });
    }
  } catch (err) {
    console.error('[NAV_API] Error ensuring default links:', err);
  }
}

export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  await ensureDefaultLinks();
  const settings = await prisma.navigationSetting.findMany({
    orderBy: { label: 'asc' },
  });

  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  try {
    const { id, isHidden, isDisabled } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const updated = await prisma.navigationSetting.update({
      where: { id },
      data: { 
        ...(isHidden !== undefined && { isHidden }),
        ...(isDisabled !== undefined && { isDisabled }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[NAV_API] Patch Error:', error);
    return NextResponse.json({ error: 'Failed to update navigation setting' }, { status: 500 });
  }
}
