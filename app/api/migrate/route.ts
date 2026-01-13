import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { readFileSync } from "fs"
import { join } from "path"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Setting up database schema...")
    
    // Check if tables already exist
    try {
      await prisma.device.count()
      console.log("✅ Database tables already exist")
      return NextResponse.json({
        success: true,
        message: "Database schema already exists",
      })
    } catch (checkError: any) {
      if (!checkError?.message?.includes("does not exist")) {
        throw checkError
      }
      console.log("⚠️  Tables don't exist, need to create them")
    }
    
    // Try to read and execute SQL file
    try {
      const sqlPath = join(process.cwd(), "supabase-schema.sql")
      const sql = readFileSync(sqlPath, "utf-8")
      
      // Execute SQL using Prisma's $executeRawUnsafe
      // Split by semicolons and execute each statement
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"))
      
      console.log(`📊 Executing ${statements.length} SQL statements...`)
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await prisma.$executeRawUnsafe(statement)
          } catch (stmtError: any) {
            // Ignore "already exists" errors
            if (!stmtError?.message?.includes("already exists")) {
              console.warn(`⚠️  Statement warning: ${stmtError.message}`)
            }
          }
        }
      }
      
      // Verify tables exist
      await prisma.device.count()
      console.log("✅ Database tables created successfully")
      
      return NextResponse.json({
        success: true,
        message: "Database schema created successfully",
      })
    } catch (sqlError: any) {
      console.error("❌ SQL execution failed:", sqlError.message)
      
      // Return instructions for manual setup
      return NextResponse.json(
        {
          error: "Automatic table creation failed",
          message: "Please run the SQL manually in Supabase",
          instructions: [
            "1. Go to your Supabase Dashboard",
            "2. Click 'SQL Editor' in the left sidebar",
            "3. Click 'New Query'",
            "4. Copy the contents of supabase-schema.sql from your repo",
            "5. Paste and click 'Run'",
            "6. Then refresh this page or try syncing devices",
          ],
          alternative: "Or run locally: npx prisma db push",
          errorDetails: sqlError.message,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("❌ Database setup error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Database setup failed",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    )
  }
}
