// Reset (or create) an admin user's password directly against the database.
// Usage (in a Render Shell or locally with DATABASE_URL set):
//   npx tsx scripts/reset-admin.ts <email> <newPassword>
// If no email is given, resets every existing ADMIN user's password.
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // `tsx reset-admin.ts <password>` → reset all admins
  // `tsx reset-admin.ts <email> <password>` → reset/create that admin
  const args = process.argv.slice(2);
  const email = args.length > 1 ? args[0] : undefined;
  const newPassword = args.length > 1 ? args[1] : args[0];

  if (!newPassword) {
    console.error('Usage: npx tsx scripts/reset-admin.ts <email> <newPassword>');
    console.error('   or: npx tsx scripts/reset-admin.ts <newPassword>  (resets all ADMIN users)');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  if (email?.includes('@')) {
    const updated = await prisma.user.updateMany({
      where: { email, role: 'ADMIN' },
      data: { passwordHash },
    });
    if (updated.count === 0) {
      console.log(`No ADMIN user found with email ${email} — creating one.`);
      await prisma.user.create({
        data: { email, passwordHash, firstName: 'Admin', lastName: 'User', role: 'ADMIN' },
      });
    }
    console.log(`Password reset for ${email}`);
    return;
  }

  const updated = await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { passwordHash },
  });
  console.log(`Password reset for ${updated.count} admin user(s).`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
