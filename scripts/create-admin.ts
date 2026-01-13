/**
 * Script to create an admin user
 * Run with: npx tsx scripts/create-admin.ts
 */

import { prisma } from "../lib/db"
import { hashPassword } from "../lib/auth"

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com"
  const password = process.env.ADMIN_PASSWORD || "admin123"
  const name = process.env.ADMIN_NAME || "Admin User"

  console.log(`Creating admin user: ${email}`)

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      console.log(`User ${email} already exists. Skipping creation.`)
      return
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "ADMIN",
      },
    })

    console.log(`✓ Admin user created successfully!`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Name: ${user.name}`)
    console.log(`  Role: ${user.role}`)
    console.log(`\n⚠️  Default password: ${password}`)
    console.log(`   Please change this password after first login!`)
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
