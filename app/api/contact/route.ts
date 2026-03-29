import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const { userId: clerkId } = getAuth(req as any);

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, subject, message } = await req.json();

    if (!message || message.length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters long' }, { status: 400 });
    }

    // Find the internal database user ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Save the message to DB
    const contactMessage = await prisma.contactMessage.create({
      data: {
        userId: dbUser.id,
        name,
        email,
        subject,
        message,
        status: 'pending'
      }
    });

    console.log(`[CONTACT FORM] New submission saved [ID: ${contactMessage.id}]:
      From: ${name} (${email})
      User ID: ${clerkId}
      Subject: ${subject}
    `);

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully. Our team will contact you soon.',
      id: contactMessage.id
    });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
