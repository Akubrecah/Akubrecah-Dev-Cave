import prisma from './lib/prisma'

async function main() {
  try {
    console.log('Testing Prisma connection...')
    const userCount = await prisma.user.count()
    console.log(`Connection successful! Total users: ${userCount}`)
    
    // Testing the specific findUnique query from the status route
    const testUser = await prisma.user.findFirst({
        select: {
            id: true,
            clerkId: true,
        }
    })
    
    if (testUser) {
        console.log(`Found a test user: ${testUser.clerkId}`)
        const check = await prisma.user.findUnique({
            where: { clerkId: testUser.clerkId },
            select: { id: true }
        })
        console.log('findUnique successful:', !!check)
    } else {
        console.log('No users found in database to test findUnique.')
    }

  } catch (error) {
    console.error('Prisma test failed:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
