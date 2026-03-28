
import * as dotenv from 'dotenv';
dotenv.config();

import prisma from './lib/prisma';

async function main() {
    console.log("--- Checking Admin Users ---");
    try {
        const admins = await prisma.user.findMany({
            where: {
                role: 'admin'
            }
        });
        
        if (admins.length === 0) {
            console.log("No admins found in DB.");
        } else {
            admins.forEach(u => {
                console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
            });
        }

        console.log("\n--- Checking Users with 'akubrecah' in name/email ---");
        const potentialAdmins = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: 'akubrecah', mode: 'insensitive' } },
                    { name: { contains: 'akubrecah', mode: 'insensitive' } }
                ]
            }
        });

        potentialAdmins.forEach(u => {
            console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
        });
    } catch (err) {
        console.error("Prisma error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
