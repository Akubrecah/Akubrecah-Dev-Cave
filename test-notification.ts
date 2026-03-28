import prisma from './lib/prisma';

async function test() {
  try {
    console.log('Testing prisma.notification...');
    const count = await prisma.notification.count();
    console.log('Success! Notification count:', count);
  } catch (error) {
    console.error('Failed to access prisma.notification:', error);
  }
}

test();
