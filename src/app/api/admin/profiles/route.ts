import { NextResponse } from 'next/server'
import { getAllUsers } from '@/lib/db'

export async function GET() {
  const users = await getAllUsers()
  return NextResponse.json({ profiles: users })
}
